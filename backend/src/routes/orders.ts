import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { stripe } from '../lib/stripe'
import { sendMail } from '../lib/mailer'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validate } from '../middleware/validate'
import { calculateCouponDiscount } from '../lib/couponUtils'

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
  couponCode: z.string().optional(),
})

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
})

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } },
      coupon: true,
    },
  })
  if (!order) return res.status(404).json({ error: 'Bestellung nicht gefunden' })
  res.json(order)
})

router.post('/', authenticate, validate(createOrderSchema), async (req: AuthRequest, res) => {
  const { shippingAddress, cartId, couponCode } = req.body

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  })
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Warenkorb ist leer' })
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({ error: `Nicht genug Lagerbestand für "${item.product.name}"` })
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  // Apply coupon
  let discount = 0
  let coupon = null
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
    if (coupon && coupon.isActive) {
      discount = calculateCouponDiscount(coupon, subtotal)
    }
  }

  const total = Math.max(0, subtotal - discount)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: 'eur',
    metadata: { userId: req.userId! },
  })

  // Create order + decrement stock + increment coupon usage atomically
  const [order] = await prisma.$transaction(async (tx) => {
    if (coupon) {
      await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
    }

    const created = await tx.order.create({
      data: {
        userId: req.userId!,
        shippingAddress,
        total,
        discount: discount > 0 ? discount : null,
        couponId: coupon?.id,
        stripePaymentId: paymentIntent.id,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: { select: { name: true } } } } },
    })

    await Promise.all(
      cart.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    )

    return [created]
  })

  // Send confirmation email
  const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { email: true, name: true } })
  if (user) {
    const itemLines = order.items.map((i) => `<li>${i.product.name} × ${i.quantity} — ${(Number(i.price) * i.quantity).toFixed(2)} €</li>`).join('')
    await sendMail(
      user.email,
      `Bestellbestätigung #${order.id.slice(-8).toUpperCase()} — MyCheapMarketPlace`,
      `<p>Hallo ${user.name ?? ''},</p>
       <p>vielen Dank für deine Bestellung! Wir haben sie erhalten und bearbeiten sie in Kürze.</p>
       <h3>Bestellübersicht</h3>
       <ul>${itemLines}</ul>
       ${discount > 0 ? `<p>Rabatt: -${discount.toFixed(2)} €</p>` : ''}
       <p><strong>Gesamt: ${total.toFixed(2)} €</strong></p>
       <p>Lieferadresse: ${shippingAddress.firstName} ${shippingAddress.lastName}, ${shippingAddress.street}, ${shippingAddress.postalCode} ${shippingAddress.city}</p>
       <p><a href="${process.env.FRONTEND_URL}/account/orders/${order.id}">Bestellung verfolgen</a></p>`
    )
  }

  res.status(201).json({ order, clientSecret: paymentIntent.client_secret })
})

// Admin: all orders
router.get('/admin/all', authenticate, requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
      coupon: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
})

// Admin: CSV export
router.get('/admin/export-csv', authenticate, requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const rows = [
    ['Bestellnr.', 'Datum', 'Kunde', 'E-Mail', 'Artikel', 'Gesamt (€)', 'Status'],
    ...orders.map((o) => [
      o.id.slice(-8).toUpperCase(),
      new Date(o.createdAt).toLocaleDateString('de-DE'),
      o.user?.name ?? '',
      o.user?.email ?? '',
      o.items.map((i) => `${i.product.name} x${i.quantity}`).join('; '),
      Number(o.total).toFixed(2),
      o.status,
    ]),
  ]

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="bestellungen-${Date.now()}.csv"`)
  res.send('﻿' + csv) // BOM for Excel UTF-8
})

router.put('/admin/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } })
  res.json(order)
})

export default router
