import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendMail } from '../lib/mailer'
import { validate } from '../middleware/validate'
import { authenticate, AuthRequest } from '../middleware/auth'
import { TOKEN_EXPIRY } from '../lib/constants'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

function signTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: TOKEN_EXPIRY.ACCESS,
  })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: TOKEN_EXPIRY.REFRESH,
  })
  return { accessToken, refreshToken }
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, name } = req.body
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'E-Mail bereits vergeben' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, role: true },
  })

  const { accessToken, refreshToken } = signTokens(user.id, user.role)
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY.REFRESH_MS),
    },
  })

  res.status(201).json({ user, accessToken, refreshToken })
})

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Ungültige Anmeldedaten' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Ungültige Anmeldedaten' })

  const { accessToken, refreshToken } = signTokens(user.id, user.role)
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY.REFRESH_MS),
    },
  })

  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  })
})

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).json({ error: 'Kein Refresh-Token' })

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: string
    }
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Refresh-Token abgelaufen' })
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return res.status(401).json({ error: 'Nutzer nicht gefunden' })

    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    const tokens = signTokens(user.id, user.role)
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY.REFRESH_MS),
      },
    })

    res.json(tokens)
  } catch {
    return res.status(401).json({ error: 'Ungültiger Refresh-Token' })
  }
})

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ error: 'Nutzer nicht gefunden' })
  res.json(user)
})

router.put('/me', authenticate, async (req: AuthRequest, res) => {
  const { name } = req.body
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name },
    select: { id: true, email: true, name: true, role: true },
  })
  res.json(user)
})

router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  const { refreshToken } = req.body
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken, userId: req.userId } })
  }
  res.json({ message: 'Abgemeldet' })
})

// Passwort vergessen
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'E-Mail erforderlich' })

  const user = await prisma.user.findUnique({ where: { email } })
  // Always return 200 to avoid user enumeration
  if (!user) return res.json({ message: 'Falls ein Konto existiert, wurde eine E-Mail gesendet.' })

  const token = crypto.randomBytes(32).toString('hex')
  await prisma.passwordReset.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET_MS),
    },
  })

  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`
  await sendMail(
    email,
    'Passwort zurücksetzen — MyCheapMarketPlace',
    `<p>Hallo ${user.name ?? ''},</p>
     <p>Klicke auf den folgenden Link um dein Passwort zurückzusetzen (gültig für 1 Stunde):</p>
     <p><a href="${resetUrl}">${resetUrl}</a></p>
     <p>Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.</p>`
  )

  res.json({ message: 'Falls ein Konto existiert, wurde eine E-Mail gesendet.' })
})

// Passwort zurücksetzen
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Token und Passwort (min. 8 Zeichen) erforderlich' })
  }

  const reset = await prisma.passwordReset.findUnique({ where: { token } })
  if (!reset || reset.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Token ungültig oder abgelaufen' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } })
  await prisma.passwordReset.delete({ where: { token } })
  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({ where: { userId: reset.userId } })

  res.json({ message: 'Passwort erfolgreich zurückgesetzt.' })
})

export default router
