'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Order } from '@/types'
import { ORDER_STATUS } from '@/lib/order-status'
import { AccountTabs } from '@/components/shop/AccountTabs'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Order[]>('/api/orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Meine Bestellungen</h1>

      <AccountTabs active="orders" />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">Noch keine Bestellungen.</p>
          <Link href="/products" className="text-primary-600 hover:underline">Jetzt einkaufen</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const s = ORDER_STATUS[order.status] ?? ORDER_STATUS.PENDING
            return (
              <div key={order.id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(order.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="font-mono text-sm text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.product?.name ?? 'Produkt'} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {(Number(item.price) * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between font-bold">
                  <span>Gesamt</span>
                  <span>{Number(order.total).toFixed(2)} €</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
