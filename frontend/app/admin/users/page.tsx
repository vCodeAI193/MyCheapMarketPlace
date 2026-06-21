'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { User } from '@/types'

interface AdminUser extends User {
  _count: { orders: number }
  isActive: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    api.get<AdminUser[]>('/api/admin/users').then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function updateUser(id: string, patch: { role?: string; isActive?: boolean }) {
    setSaving(id)
    try {
      const updated = await api.put<AdminUser>(`/api/admin/users/${id}`, patch)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Benutzer</h1>

      {loading ? (
        <div className="card p-6 animate-pulse h-40 bg-gray-100" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3">Name / E-Mail</th>
                <th className="px-5 py-3">Rolle</th>
                <th className="px-5 py-3">Bestellungen</th>
                <th className="px-5 py-3">Registriert</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                  <td className="px-5 py-4">
                    <p className="font-medium">{user.name ?? '—'}</p>
                    <p className="text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      disabled={saving === user.id}
                      onChange={(e) => updateUser(user.id, { role: e.target.value })}
                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{user._count.orders}</td>
                  <td className="px-5 py-4 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Aktiv' : 'Gesperrt'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      disabled={saving === user.id}
                      onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                      className="text-xs border border-gray-200 rounded px-3 py-1 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {user.isActive ? 'Sperren' : 'Entsperren'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center py-10 text-gray-400">Keine Benutzer gefunden.</p>
          )}
        </div>
      )}
    </div>
  )
}
