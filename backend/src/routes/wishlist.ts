import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.userId },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(items)
}))

router.post('/:productId', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  try {
    await prisma.wishlistItem.create({
      data: { userId: req.userId!, productId: req.params.productId },
    })
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr?.code !== 'P2002') throw err
  }
  res.json({ message: 'Zur Wunschliste hinzugefügt' })
}))

router.delete('/:productId', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.userId, productId: req.params.productId },
  })
  res.json({ message: 'Von Wunschliste entfernt' })
}))

export default router
