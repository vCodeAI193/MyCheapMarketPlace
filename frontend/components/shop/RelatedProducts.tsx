import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { API_BASE_URL } from '@/lib/api'

async function getRelated(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${slug}/related`, { next: { revalidate: 120 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function RelatedProducts({ slug }: { slug: string }) {
  const products = await getRelated(slug)
  if (products.length === 0) return null

  return (
    <section className="mt-14">
      <h2 className="text-xl font-bold mb-5">Ähnliche Produkte</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
