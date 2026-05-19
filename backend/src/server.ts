import express from 'express'
import cors from 'cors'
import path from 'path'

import authRouter from './routes/auth'
import categoriesRouter from './routes/categories'
import productsRouter from './routes/products'
import cartRouter from './routes/cart'
import ordersRouter from './routes/orders'
import paymentsRouter from './routes/payments'
import adminRouter from './routes/admin'

const app = express()

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/auth', authRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/admin', adminRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

const PORT = Number(process.env.PORT) || 4000
app.listen(PORT, () => console.log(`Backend läuft auf Port ${PORT}`))

export default app
