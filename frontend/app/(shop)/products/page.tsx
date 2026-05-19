import { Suspense } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/shop/ProductCard'
import { ProductFilters } from '@/components/shop/ProductFilters'
import { Product, Category, ProductsResponse } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function getProducts(searchParams: Record<string, string>): Promise<ProductsResponse> {
  const params = new URLSearchParams(searchParams)
  if (!params.get('limit')) params.set('limit', '12')
  try {
    const res = await fetch(`${API}/api/products?${params}`, { cache: 'no-store' })
    return res.json()
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 1 }
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/api/categories/all`, { next: { revalidate: 300 } })
    return res.json()
  } catch {
    return []
  }
}

interface Props {
  searchParams: Record<string, string>
}

export default async function ProductsPage({ searchParams }: Props) {
  const [data, categories] = await Promise.all([getProducts(searchParams), getCategories()])
  const { items, total, page, totalPages } = data

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Alle Produkte
        <span className="text-base font-normal text-gray-500 ml-3">{total} Artikel</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ProductFilters categories={categories} searchParams={searchParams} />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">Keine Produkte gefunden.</p>
              <Link href="/products" className="text-primary-600 hover:underline mt-2 inline-block">
                Filter zurücksetzen
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {items.map((p: Product) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const params = new URLSearchParams(searchParams)
                    params.set('page', String(p))
                    return (
                      <Link
                        key={p}
                        href={`/products?${params}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-300 hover:border-primary-400 text-gray-700'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
