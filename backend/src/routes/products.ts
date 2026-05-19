import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validate'

const router = Router()

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string(),
  isActive: z.coerce.boolean().optional(),
})

router.get('/', async (req, res) => {
  const { q, categoryId, minPrice, maxPrice, page = '1', limit = '12', sort = 'createdAt' } = req.query

  const where: Record<string, unknown> = { isActive: true }
  if (q) where.name = { contains: q as string, mode: 'insensitive' }
  if (categoryId) where.categoryId = categoryId as string
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) (where.price as Record<string, unknown>).gte = Number(minPrice)
    if (maxPrice) (where.price as Record<string, unknown>).lte = Number(maxPrice)
  }

  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(50, Math.max(1, Number(limit)))
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

  res.json({
    items,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  })
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
  upload.array('images', 5),
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
  upload.array('images', 5),
  async (req, res) => {
    const parsed = productSchema.partial().safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

    const files = req.files as Express.Multer.File[]
    const data: Record<string, unknown> = { ...parsed.data }
    if (files.length > 0) {
      data.images = files.map((f) => `/uploads/${f.filename}`)
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
  await prisma.product.update({
    where: { id: req.params.id },
    data: { isActive: false },
  })
  res.json({ message: 'Produkt deaktiviert' })
})

export default router
