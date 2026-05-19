'use client'
import { useRouter } from 'next/navigation'
import { Category } from '@/types'

interface Props {
  categories: Category[]
  searchParams: Record<string, string>
}

export function ProductFilters({ categories, searchParams }: Props) {
  const router = useRouter()

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/products?${params}`)
  }

  function reset() {
    router.push('/products')
  }

  const sortOptions = [
    { label: 'Neueste zuerst', value: 'createdAt' },
    { label: 'Preis aufsteigend', value: 'priceAsc' },
    { label: 'Preis absteigend', value: 'priceDesc' },
    { label: 'Name A–Z', value: 'name' },
  ]

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Suche</label>
        <input
          type="text"
          className="input"
          placeholder="Produktname..."
          defaultValue={searchParams.q ?? ''}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Sortierung</label>
        <select
          className="input"
          value={searchParams.sort ?? 'createdAt'}
          onChange={(e) => update('sort', e.target.value)}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kategorie</label>
          <div className="space-y-1">
            <button
              onClick={() => update('categoryId', '')}
              className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                !searchParams.categoryId ? 'bg-primary-100 text-primary-700 font-medium' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              Alle
            </button>
            {categories
              .filter((c) => !c.parentId)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => update('categoryId', cat.id)}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    searchParams.categoryId === cat.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Preis (€)</label>
        <div className="flex gap-2">
          <input
            type="number"
            className="input"
            placeholder="Min"
            defaultValue={searchParams.minPrice ?? ''}
            onBlur={(e) => update('minPrice', e.target.value)}
          />
          <input
            type="number"
            className="input"
            placeholder="Max"
            defaultValue={searchParams.maxPrice ?? ''}
            onBlur={(e) => update('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <button onClick={reset} className="w-full btn-outline text-sm">
        Filter zurücksetzen
      </button>
    </div>
  )
}
