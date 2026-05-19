import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'

const router = Router()

router.use(authenticate, requireAdmin)

router.get('/stats', async (_req, res) => {
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
    take: 5,
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
})

router.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(products)
})

router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(users)
})

export default router
