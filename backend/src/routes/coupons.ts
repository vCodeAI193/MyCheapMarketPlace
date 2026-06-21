import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validate'
import { calculateCouponDiscount } from '../lib/couponUtils'

const router = Router()

const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().positive().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.coerce.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
})

// Validate a coupon code (public — called from checkout)
router.post('/validate', authenticate, async (req: AuthRequest, res) => {
  const { code, orderTotal } = req.body
  if (!code) return res.status(400).json({ error: 'Code erforderlich' })

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon || !coupon.isActive) return res.status(404).json({ error: 'Ungültiger Gutscheincode' })
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: 'Gutschein abgelaufen' })
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Gutschein nicht mehr verfügbar' })
  if (coupon.minOrderAmount && orderTotal < Number(coupon.minOrderAmount)) {
    return res.status(400).json({ error: `Mindestbestellwert: ${Number(coupon.minOrderAmount).toFixed(2)} €` })
  }

  const discount = calculateCouponDiscount(coupon, orderTotal)

  res.json({ coupon, discount })
})

// Admin CRUD
router.get('/', authenticate, requireAdmin, async (_req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(coupons)
})

router.post('/', authenticate, requireAdmin, validate(couponSchema), async (req, res) => {
  const coupon = await prisma.coupon.create({ data: req.body })
  res.status(201).json(coupon)
})

router.put('/:id', authenticate, requireAdmin, validate(couponSchema.partial()), async (req, res) => {
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body })
  res.json(coupon)
})

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.coupon.delete({ where: { id: req.params.id } })
  res.json({ message: 'Gutschein gelöscht' })
})

export default router
