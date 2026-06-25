import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate, softAuthenticate, AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
})

async function getOrCreateCart(userId?: string, sessionId?: string) {
  const where = userId ? { userId } : { sessionId }
  let cart = await prisma.cart.findFirst({ where, include: { items: { include: { product: true } } } })
  if (!cart) {
    cart = await prisma.cart.create({
      data: userId ? { userId } : { sessionId },
      include: { items: { include: { product: true } } },
    })
  }
  return cart
}

router.get('/', async (req: AuthRequest, res) => {
  const sessionId = req.headers['x-session-id'] as string | undefined
  const cart = await getOrCreateCart(req.userId, sessionId)
  res.json(cart)
})

router.use(softAuthenticate)

router.post('/items', validate(cartItemSchema), async (req: AuthRequest, res) => {
  const { productId, quantity } = req.body
  const sessionId = req.headers['x-session-id'] as string | undefined

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.isActive) return res.status(404).json({ error: 'Produkt nicht gefunden' })
  if (product.stock < quantity) return res.status(400).json({ error: 'Nicht genug Lagerbestand' })

  const cart = await getOrCreateCart(req.userId, sessionId)

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  })

  if (existing) {
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity: existing.quantity + quantity },
    })
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } })
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  })
  res.json(updated)
})

router.put('/items/:productId', async (req: AuthRequest, res) => {
  const { quantity } = req.body
  const sessionId = req.headers['x-session-id'] as string | undefined
  const cart = await getOrCreateCart(req.userId, sessionId)

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: req.params.productId },
    })
  } else {
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId: req.params.productId } },
      data: { quantity },
    })
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  })
  res.json(updated)
})

router.delete('/items/:productId', async (req: AuthRequest, res) => {
  const sessionId = req.headers['x-session-id'] as string | undefined
  const cart = await getOrCreateCart(req.userId, sessionId)

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId: req.params.productId },
  })

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  })
  res.json(updated)
})

router.delete('/', async (req: AuthRequest, res) => {
  const sessionId = req.headers['x-session-id'] as string | undefined
  const cart = await getOrCreateCart(req.userId, sessionId)
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  res.json({ message: 'Warenkorb geleert' })
})

export default router
