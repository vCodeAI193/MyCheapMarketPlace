'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { Category, Product } from '@/types'

interface Props {
  product?: Product
}

export function ProductForm({ product }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price ? String(product.price) : '',
    stock: product?.stock ? String(product.stock) : '0',
    categoryId: product?.categoryId ?? '',
    isActive: product?.isActive ?? true,
  })

  useEffect(() => {
    api.get<Category[]>('/api/categories/all').then(setCategories).catch(() => {})
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function generateSlug() {
    setForm((f) => ({
      ...f,
      slug: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (product) {
        await api.put(`/api/products/${product.id}`, form)
      } else {
        await api.post('/api/products', form)
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5">
      <Input label="Name" value={form.name} onChange={set('name')} required />

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input label="Slug (URL)" value={form.slug} onChange={set('slug')} required
            placeholder="mein-produkt" />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={generateSlug}>
          Auto
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
        <textarea
          className="input min-h-[100px] resize-y"
          value={form.description}
          onChange={set('description')}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Preis (€)" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
        <Input label="Lagerbestand" type="number" min="0" value={form.stock} onChange={set('stock')} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
        <select className="input" value={form.categoryId} onChange={set('categoryId')} required>
          <option value="">Kategorie wählen…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-300"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Produkt aktiv (im Shop sichtbar)</label>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {product ? 'Änderungen speichern' : 'Produkt erstellen'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Abbrechen</Button>
      </div>
    </form>
  )
}
