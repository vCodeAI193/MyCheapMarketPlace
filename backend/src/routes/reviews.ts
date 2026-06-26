import { Router } from 'express'
import { z } from 'zod'
import asyncHandler from 'express-async-handler'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router({ mergeParams: true })

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// GET /api/products/:id/reviews
router.get('/', asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

  res.json({ reviews, avgRating: Math.round(avg * 10) / 10, count: reviews.length })
}))

// POST /api/products/:id/reviews
router.post('/', authenticate, validate(reviewSchema), asyncHandler(async (req: AuthRequest, res) => {
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.userId!, productId: req.params.id } },
  })
  if (existing) return res.status(409).json({ error: 'Du hast dieses Produkt bereits bewertet.' })

  const review = await prisma.review.create({
    data: { userId: req.userId!, productId: req.params.id, ...req.body },
    include: { user: { select: { id: true, name: true } } },
  })
  res.status(201).json(review)
}))

// DELETE /api/reviews/:reviewId  (eigenes oder admin)
router.delete('/:reviewId', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.reviewId } })
  if (!review) return res.status(404).json({ error: 'Bewertung nicht gefunden' })
  if (review.userId !== req.userId && req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Kein Zugriff' })
  }
  await prisma.review.delete({ where: { id: req.params.reviewId } })
  res.json({ message: 'Bewertung gelöscht' })
}))

export default router
