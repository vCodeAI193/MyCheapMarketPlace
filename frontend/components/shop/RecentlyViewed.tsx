'use client'
import { useEffect, useState } from 'react'
import { Product } from '@/types'
import { ProductCard } from './ProductCard'

const KEY = 'recently-viewed'
const MAX = 6

export function useRecentlyViewed() {
  function add(product: Product) {
    if (typeof window === 'undefined') return
    const current: Product[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    const filtered = current.filter((p) => p.id !== product.id)
    localStorage.setItem(KEY, JSON.stringify([product, ...filtered].slice(0, MAX)))
  }
  function get(): Product[] {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  }
  return { add, get }
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const { get } = useRecentlyViewed()

  useEffect(() => {
    const viewed = get().filter((p) => p.id !== excludeId)
    setProducts(viewed.slice(0, 4))
  }, [excludeId])

  if (products.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-xl font-bold mb-4">Zuletzt angesehen</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
