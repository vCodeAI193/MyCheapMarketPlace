import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validate'

const router = Router()

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  parentId: z.string().optional().nullable(),
})

router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { children: true },
    where: { parentId: null },
  })
  res.json(categories)
})

router.get('/all', async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { children: true, parent: true },
    orderBy: { name: 'asc' },
  })
  res.json(categories)
})

router.post('/', authenticate, requireAdmin, validate(categorySchema), async (req, res) => {
  const category = await prisma.category.create({ data: req.body })
  res.status(201).json(category)
})

router.put('/:id', authenticate, requireAdmin, validate(categorySchema), async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(category)
})

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ message: 'Kategorie gelöscht' })
})

export default router
