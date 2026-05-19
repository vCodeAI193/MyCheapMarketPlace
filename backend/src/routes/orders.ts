import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { stripe } from '../lib/stripe'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validate'

const router = Router()

const createOrderSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  cartId: z.string(),
})

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, slug: true, images: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
})

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, slug: true, images: true } } },
      },
    },
  })
  if (!order) return res.status(404).json({ error: 'Bestellung nicht gefunden' })
  res.json(order)
})

router.post('/', authenticate, validate(createOrderSchema), async (req: AuthRequest, res) => {
  const { shippingAddress, cartId } = req.body

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  })
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Warenkorb ist leer' })
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        error: `Nicht genug Lagerbestand für "${item.product.name}"`,
      })
    }
  }

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: 'eur',
    metadata: { userId: req.userId! },
  })

  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      shippingAddress,
      total,
      stripePaymentId: paymentIntent.id,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: { items: true },
  })

  // Reserve stock
  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    })
  }

  res.status(201).json({ order, clientSecret: paymentIntent.client_secret })
})

// Admin: all orders
router.get('/admin/all', authenticate, requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
})

router.put('/admin/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  })
  res.json(order)
})

export default router
