import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendMail } from '../lib/mailer'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validate'
import { PAGINATION, UPLOAD } from '../lib/constants'

const router = Router()

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  },
})
const upload = multer({ storage, limits: { fileSize: UPLOAD.MAX_FILE_SIZE } })

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  salePrice: z.coerce.number().positive().optional().nullable(),
  saleEndsAt: z.string().datetime().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string(),
  isActive: z.coerce.boolean().optional(),
})

// Autocomplete — must be before /:slug
router.get('/autocomplete', async (req, res) => {
  const q = (req.query.q as string ?? '').trim()
  if (!q) return res.json([])
  const results = await prisma.product.findMany({
    where: { isActive: true, name: { contains: q, mode: 'insensitive' } },
    select: { id: true, name: true, slug: true, images: true, price: true, salePrice: true },
    take: PAGINATION.AUTOCOMPLETE_LIMIT,
    orderBy: { name: 'asc' },
  })
  res.json(results)
})

router.get('/', async (req, res) => {
  const { q, categoryId, minPrice, maxPrice, onSale, page = '1', limit = String(PAGINATION.DEFAULT_LIMIT), sort = 'createdAt' } = req.query

  const where: Record<string, unknown> = { isActive: true }
  if (q) where.name = { contains: q as string, mode: 'insensitive' }
  if (categoryId) where.categoryId = categoryId as string
  if (onSale === 'true') {
    where.salePrice = { not: null }
    where.saleEndsAt = { gt: new Date() }
  }
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) (where.price as Record<string, unknown>).gte = Number(minPrice)
    if (maxPrice) (where.price as Record<string, unknown>).lte = Number(maxPrice)
  }

  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, Number(limit)))
  const skip = (pageNum - 1) * limitNum

  const validSorts: Record<string, unknown> = {
    createdAt: { createdAt: 'desc' },
    priceAsc: { price: 'asc' },
    priceDesc: { price: 'desc' },
    name: { name: 'asc' },
  }
  const orderBy = validSorts[sort as string] ?? validSorts.createdAt

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: orderBy as Parameters<typeof prisma.product.findMany>[0]['orderBy'],
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ])

  res.json({ items, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
})

router.get('/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true },
  })
  if (!product) return res.status(404).json({ error: 'Produkt nicht gefunden' })
  res.json(product)
})

router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.array('images', UPLOAD.MAX_FILES),
  async (req, res) => {
    const parsed = productSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

    const files = req.files as Express.Multer.File[]
    const images = files.map((f) => `/uploads/${f.filename}`)

    const product = await prisma.product.create({
      data: { ...parsed.data, images },
      include: { category: true },
    })
    res.status(201).json(product)
  }
)

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.array('images', UPLOAD.MAX_FILES),
  async (req, res) => {
    const parsed = productSchema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

    const files = req.files as Express.Multer.File[]
    const data: Record<string, unknown> = { ...parsed.data }
    if (files.length > 0) {
      data.images = files.map((f) => `/uploads/${f.filename}`)
    }

    // Check stock-alert trigger: was 0, now > 0
    if (typeof data.stock === 'number' && data.stock > 0) {
      const current = await prisma.product.findUnique({ where: { id: req.params.id }, select: { stock: true, name: true } })
      if (current && current.stock === 0) {
        const alerts = await prisma.stockAlert.findMany({ where: { productId: req.params.id } })
        for (const alert of alerts) {
          await sendMail(
            alert.email,
            `"${current.name}" ist wieder verfügbar!`,
            `<p>Gute Neuigkeiten! Das Produkt <strong>${current.name}</strong> ist wieder auf Lager.</p><p><a href="${process.env.FRONTEND_URL}/products/${req.params.id}">Jetzt kaufen</a></p>`
          )
        }
        await prisma.stockAlert.deleteMany({ where: { productId: req.params.id } })
      }
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    })
    res.json(product)
  }
)

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } })
  res.json({ message: 'Produkt deaktiviert' })
})

// Stock alert registration
router.post('/:id/stock-alert', async (req, res) => {
  const { email } = req.body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' })
  }
  try {
    await prisma.stockAlert.create({ data: { email, productId: req.params.id } })
  } catch {
    // unique constraint — already registered
  }
  res.json({ message: 'Wir benachrichtigen dich, sobald das Produkt wieder verfügbar ist.' })
})

export default router
