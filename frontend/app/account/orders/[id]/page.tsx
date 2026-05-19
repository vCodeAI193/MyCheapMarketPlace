'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Order } from '@/types'
import { CheckIcon } from '@/components/shop/Icons'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ausstehend', PAID: 'Bezahlt', SHIPPED: 'Versendet',
  DELIVERED: 'Geliefert', CANCELLED: 'Storniert',
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === '1'
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Order>(`/api/orders/${params.id}`)
      .then(setOrder).catch(() => {}).finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /></div>
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-10 text-gray-500">Bestellung nicht gefunden.</div>

  const addr = order.shippingAddress

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-green-800 text-lg">Bestellung eingegangen!</h2>
            <p className="text-green-700 text-sm mt-1">Vielen Dank für deinen Einkauf. Wir bearbeiten deine Bestellung in Kürze.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bestellung #{order.id.slice(-8).toUpperCase()}</h1>
        <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="card p-6 mb-4">
        <h3 className="font-semibold mb-3">Artikel</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.product?.name ?? 'Produkt'} × {item.quantity}</span>
              <span className="font-medium">{(Number(item.price) * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-3 border-t">
            <span>Gesamt</span>
            <span>{Number(order.total).toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-3">Lieferadresse</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {addr.firstName} {addr.lastName}<br />
          {addr.street}<br />
          {addr.postalCode} {addr.city}<br />
          {addr.country}
        </p>
      </div>

      <Link href="/account/orders" className="text-primary-600 hover:underline text-sm">
        ← Alle Bestellungen
      </Link>
    </div>
  )
}
