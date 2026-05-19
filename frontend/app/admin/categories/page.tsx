'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Category } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '', parentId: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Category[]>('/api/categories/all')
      .then(setCategories).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const cat = await api.post<Category>('/api/categories', {
        name: form.name,
        slug: form.slug || autoSlug(form.name),
        parentId: form.parentId || null,
      })
      setCategories((prev) => [...prev, cat])
      setForm({ name: '', slug: '', parentId: '' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Kategorie löschen?')) return
    await api.delete(`/api/categories/${id}`)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const roots = categories.filter((c) => !c.parentId)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kategorien</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create form */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Neue Kategorie</h2>
          <form onSubmit={create} className="space-y-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Slug (leer lassen = automatisch)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder={autoSlug(form.name) || 'z.B. elektronik'}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Übergeordnete Kategorie</label>
              <select
                className="input"
                value={form.parentId}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
              >
                <option value="">— Hauptkategorie —</option>
                {roots.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={saving}>Erstellen</Button>
          </form>
        </div>

        {/* List */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Vorhandene Kategorien</h2>
          {loading ? (
            <p className="text-gray-500 text-sm animate-pulse">Lädt…</p>
          ) : (
            <ul className="space-y-2">
              {roots.map((cat) => (
                <li key={cat.id}>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="font-medium">{cat.name}</span>
                    <button onClick={() => remove(cat.id)} className="text-red-400 hover:text-red-600 text-sm">Löschen</button>
                  </div>
                  {categories
                    .filter((c) => c.parentId === cat.id)
                    .map((child) => (
                      <div key={child.id} className="flex items-center justify-between py-1.5 pl-6 text-sm text-gray-600 border-b border-dashed">
                        <span>↳ {child.name}</span>
                        <button onClick={() => remove(child.id)} className="text-red-400 hover:text-red-600">Löschen</button>
                      </div>
                    ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
