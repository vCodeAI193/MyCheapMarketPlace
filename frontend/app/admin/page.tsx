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

interface RevenueDay {
  date: string
  revenue: number
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  PAID:      'bg-blue-100 text-blue-700',
  SHIPPED:   'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

function RevenueChart({ data }: { data: RevenueDay[] }) {
  if (!data.length) return <p className="text-gray-400 text-sm">Keine Daten verfügbar.</p>

  const max = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="w-full">
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => {
          const height = Math.round((d.revenue / max) * 100)
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center group relative">
              <div
                className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                {new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}: {Number(d.revenue).toFixed(2)} €
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{new Date(data[0].date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
        <span>{new Date(data[data.length - 1].date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [revenue, setRevenue] = useState<RevenueDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Stats>('/api/admin/stats'),
      api.get<RevenueDay[]>('/api/admin/revenue-chart').catch(() => []),
    ]).then(([s, r]) => {
      setStats(s)
      setRevenue(r)
    }).catch(() => {}).finally(() => setLoading(false))
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Umsatz — letzte 30 Tage</h2>
        <RevenueChart data={revenue} />
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
