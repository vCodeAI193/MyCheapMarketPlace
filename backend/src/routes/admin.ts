import { Router } from 'express'
import { z } from 'zod'
import asyncHandler from 'express-async-handler'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validate'
import { PAGINATION } from '../lib/constants'

const router = Router()

const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
})

router.use(authenticate, requireAdmin)

router.get('/stats', asyncHandler(async (_req, res) => {
  const [totalProducts, totalOrders, totalUsers, revenueResult] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
      _sum: { total: true },
    }),
  ])

  const recentOrders = await prisma.order.findMany({
    take: PAGINATION.RECENT_ORDERS,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, name: true } },
    },
  })

  res.json({
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue: revenueResult._sum.total ?? 0,
    recentOrders,
  })
}))

router.get('/products', asyncHandler(async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(products)
}))

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(users)
}))

router.put('/users/:id', validate(updateUserSchema), asyncHandler(async (req, res) => {
  const { role, isActive } = req.body
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { ...(role ? { role } : {}), ...(isActive !== undefined ? { isActive } : {}) },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  })
  res.json(user)
}))

router.get('/revenue-chart', asyncHandler(async (_req, res) => {
  const since = new Date()
  since.setDate(since.getDate() - (PAGINATION.REVENUE_DAYS - 1))
  since.setHours(0, 0, 0, 0)

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
    select: { createdAt: true, total: true },
  })

  const byDay: Record<string, number> = {}
  for (let d = 0; d < PAGINATION.REVENUE_DAYS; d++) {
    const dt = new Date(since)
    dt.setDate(dt.getDate() + d)
    byDay[dt.toISOString().slice(0, 10)] = 0
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    if (key in byDay) byDay[key] += Number(o.total)
  }

  res.json(Object.entries(byDay).map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 })))
}))

export default router
