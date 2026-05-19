import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validate } from '../middleware/validate'
import { authenticate, AuthRequest } from '../middleware/auth'

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
    expiresIn: '15m',
  })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

export default router
