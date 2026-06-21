'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

interface CouponResult {
  code: string
  type: 'PERCENT' | 'FIXED'
  value: number
  discount: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', street: '', city: '', postalCode: '', country: 'Deutschland',
  })
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<CouponResult | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg mb-4">Dein Warenkorb ist leer.</p>
        <Link href="/products"><Button>Weiter shoppen</Button></Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-700 text-lg mb-4">Bitte melde dich an, um fortzufahren.</p>
        <Link href="/auth/login?redirect=/checkout"><Button>Jetzt anmelden</Button></Link>
      </div>
    )
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const subtotal = total()
  const discount = coupon?.discount ?? 0
  const finalTotal = Math.max(0, subtotal - discount)

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponError('')
    setCouponLoading(true)
    try {
      const result = await api.post<CouponResult>('/api/coupons/validate', {
        code: couponCode.trim().toUpperCase(),
        orderTotal: subtotal,
      })
      setCoupon(result)
    } catch (err) {
      setCouponError((err as Error).message)
      setCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (Object.values(form).some((v) => !v.trim())) {
      setError('Bitte alle Felder ausfüllen.')
      return
    }
    setLoading(true)
    try {
      const cartId = `local-${user!.id}`
      const { order } = await api.post<{ order: { id: string }; clientSecret: string }>(
        '/api/orders',
        { shippingAddress: form, cartId, couponCode: coupon?.code }
      )
      clearCart()
      router.push(`/account/orders/${order.id}?success=1`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Kasse</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form */}
        <form onSubmit={submit} className="lg:col-span-3 space-y-5">
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Lieferadresse</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vorname" value={form.firstName} onChange={set('firstName')} required />
              <Input label="Nachname" value={form.lastName} onChange={set('lastName')} required />
            </div>
            <div className="mt-4 space-y-4">
              <Input label="Straße & Hausnummer" value={form.street} onChange={set('street')} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Postleitzahl" value={form.postalCode} onChange={set('postalCode')} required />
                <Input label="Stadt" value={form.city} onChange={set('city')} required />
              </div>
              <Input label="Land" value={form.country} onChange={set('country')} required />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Gutscheincode</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="z.B. SOMMER10"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCoupon(null); setCouponError('') }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button type="button" variant="outline" onClick={applyCoupon} loading={couponLoading}>
                Einlösen
              </Button>
            </div>
            {coupon && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                ✓ Gutschein «{coupon.code}» angewendet — {discount.toFixed(2)} € Rabatt
              </p>
            )}
            {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Zahlung</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <strong>Demo-Modus:</strong> Zahlung wird simuliert. In Produktion Stripe Elements hier einbinden.
              <br />Stripe Test-Karte: <code className="bg-yellow-100 px-1 rounded">4242 4242 4242 4242</code>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Jetzt kaufen — {finalTotal.toFixed(2)} €
          </Button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Bestellübersicht</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-start">
                  <div className="w-12 h-12 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.product.images[0] && (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap">
                    {(Number(item.product.price) * item.quantity).toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Zwischensumme</span><span>{subtotal.toFixed(2)} €</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Gutschein ({coupon.code})</span><span>−{discount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Versand</span><span className="text-green-600">Kostenlos</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Gesamt</span><span>{finalTotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
