'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Product } from '@/types'
import { Button } from '@/components/ui/Button'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Product[]>('/api/admin/products')
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggleActive(product: Product) {
    await api.put(`/api/products/${product.id}`, { isActive: !product.isActive })
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isActive: !p.isActive } : p))
  }

  async function deleteProduct(id: string) {
    if (!confirm('Produkt wirklich deaktivieren?')) return
    await api.delete(`/api/products/${id}`)
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: false } : p))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produkte</h1>
        <Link href="/admin/products/new">
          <Button>+ Neues Produkt</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="card p-4 h-16 bg-gray-100" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Produkt</th>
                <th className="px-4 py-3">Kategorie</th>
                <th className="px-4 py-3">Preis</th>
                <th className="px-4 py-3">Lager</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className={!p.isActive ? 'opacity-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {p.images[0] && (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{Number(p.price).toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock < 5 ? 'text-orange-600' : 'text-gray-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${p.id}/edit`}>
                        <Button variant="outline" size="sm">Bearbeiten</Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => deleteProduct(p.id)}>
                        🗑️
                      </Button>
                    </div>
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
