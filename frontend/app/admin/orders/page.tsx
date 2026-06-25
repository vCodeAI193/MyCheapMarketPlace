'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Order } from '@/types'
import { ORDER_STATUS, ORDER_STATUSES } from '@/lib/order-status'

type AdminOrder = Order & { user: { email: string; name?: string } }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AdminOrder[]>('/api/orders/admin/all')
      .then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: string) {
    await api.put(`/api/orders/admin/${id}/status`, { status })
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'] } : o))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bestellungen</h1>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="card p-4 h-16 bg-gray-100" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Noch keine Bestellungen vorhanden.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Bestellnr.</th>
                <th className="px-4 py-3">Kunde</th>
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Betrag</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-mono text-gray-500">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">{order.user?.name ?? order.user?.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-4 py-3 font-medium">{Number(order.total).toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS[s]?.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
