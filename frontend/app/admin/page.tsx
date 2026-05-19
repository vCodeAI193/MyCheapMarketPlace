'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Order } from '@/types'

interface Stats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  recentOrders: (Order & { user: { email: string; name?: string } })[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  PAID:      'bg-blue-100 text-blue-700',
  SHIPPED:   'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Stats>('/api/admin/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Übersicht</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map((i) => <div key={i} className="card p-6 h-24 bg-gray-100" />)}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Produkte', value: stats?.totalProducts ?? 0, icon: '📦', color: 'text-blue-600' },
    { label: 'Bestellungen', value: stats?.totalOrders ?? 0, icon: '🛒', color: 'text-indigo-600' },
    { label: 'Kunden', value: stats?.totalUsers ?? 0, icon: '👤', color: 'text-violet-600' },
    { label: 'Umsatz', value: `${Number(stats?.totalRevenue ?? 0).toFixed(2)} €`, icon: '💶', color: 'text-green-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Letzte Bestellungen</h2>
        {!stats?.recentOrders?.length ? (
          <p className="text-gray-500 text-sm">Noch keine Bestellungen.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 pr-4">Bestellnr.</th>
                <th className="pb-3 pr-4">Kunde</th>
                <th className="pb-3 pr-4">Betrag</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-4 font-mono text-gray-500">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 pr-4">{order.user?.name ?? order.user?.email}</td>
                  <td className="py-3 pr-4 font-medium">{Number(order.total).toFixed(2)} €</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
