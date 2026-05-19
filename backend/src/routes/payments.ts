import { Router, Request, Response } from 'express'
import { stripe } from '../lib/stripe'
import { prisma } from '../lib/prisma'

const router = Router()

// Stripe webhook — raw body required (mounted before express.json in server.ts)
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return res.status(400).json({ error: `Webhook-Fehler: ${(err as Error).message}` })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as { id: string }
    await prisma.order.updateMany({
      where: { stripePaymentId: pi.id },
      data: { status: 'PAID' },
    })
  }

  res.json({ received: true })
})

export default router
