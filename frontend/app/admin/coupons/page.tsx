'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Coupon } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const emptyForm = {
  code: '', type: 'PERCENT' as 'PERCENT' | 'FIXED', value: '', minOrder: '',
  maxUses: '', expiresAt: '', isActive: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Coupon[]>('/api/coupons').then(setCoupons).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      }
      const created = await api.post<Coupon>('/api/coupons', body)
      setCoupons((prev) => [created, ...prev])
      setForm({ ...emptyForm })
      setShowForm(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function toggle(coupon: Coupon) {
    const updated = await api.put<Coupon>(`/api/coupons/${coupon.id}`, { isActive: !coupon.isActive })
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? updated : c)))
  }

  async function remove(id: string) {
    if (!confirm('Gutschein wirklich löschen?')) return
    await api.delete(`/api/coupons/${id}`)
    setCoupons((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gutscheine</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Abbrechen' : '+ Neu erstellen'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-lg">Neuer Gutschein</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Code (z.B. SOMMER10)" value={form.code} onChange={set('code')} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select value={form.type} onChange={set('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="PERCENT">Prozent (%)</option>
                <option value="FIXED">Festbetrag (€)</option>
              </select>
            </div>
            <Input label={form.type === 'PERCENT' ? 'Rabatt in %' : 'Rabatt in €'} type="number" min="0" value={form.value} onChange={set('value')} required />
            <Input label="Mindestbestellwert (€, optional)" type="number" min="0" value={form.minOrder} onChange={set('minOrder')} />
            <Input label="Max. Verwendungen (optional)" type="number" min="1" value={form.maxUses} onChange={set('maxUses')} />
            <Input label="Gültig bis (optional)" type="date" value={form.expiresAt} onChange={set('expiresAt')} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={saving}>Gutschein erstellen</Button>
        </form>
      )}

      {loading ? (
        <div className="card p-6 h-40 animate-pulse bg-gray-100" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Typ</th>
                <th className="px-5 py-3">Wert</th>
                <th className="px-5 py-3">Mindestbestellwert</th>
                <th className="px-5 py-3">Verwendet</th>
                <th className="px-5 py-3">Gültig bis</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c.id} className={!c.isActive ? 'opacity-50' : ''}>
                  <td className="px-5 py-4 font-mono font-semibold text-primary-700">{c.code}</td>
                  <td className="px-5 py-4">{c.type === 'PERCENT' ? 'Prozent' : 'Festbetrag'}</td>
                  <td className="px-5 py-4">
                    {c.type === 'PERCENT' ? `${c.value}%` : `${Number(c.value).toFixed(2)} €`}
                  </td>
                  <td className="px-5 py-4">{c.minOrderAmount ? `${Number(c.minOrderAmount).toFixed(2)} €` : '—'}</td>
                  <td className="px-5 py-4">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                  <td className="px-5 py-4">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('de-DE') : '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => toggle(c)} className="text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">
                        {c.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                      <button onClick={() => remove(c.id)} className="text-xs text-red-500 hover:text-red-700">
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <p className="text-center py-10 text-gray-400">Noch keine Gutscheine erstellt.</p>
          )}
        </div>
      )}
    </div>
  )
}
