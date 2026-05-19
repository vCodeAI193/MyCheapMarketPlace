import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Product } from '@/types'
import { AddToCartButton } from '@/components/shop/AddToCartButton'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/api/products/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const inStock = product.stock > 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100 shadow">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">📦</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <div key={i} className="w-16 h-16 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-primary-600 font-medium mb-1">{product.category?.name}</p>
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
          </div>

          <p className="text-4xl font-bold text-primary-600">
            {Number(product.price).toFixed(2)} €
          </p>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {inStock ? `${product.stock} auf Lager` : 'Ausverkauft'}
            </span>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <AddToCartButton product={product} disabled={!inStock} />

          <div className="border-t pt-4 grid grid-cols-2 gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">🚚 Versand in 1–3 Tagen</div>
            <div className="flex items-center gap-2">↩️ 30 Tage Rückgabe</div>
            <div className="flex items-center gap-2">🔒 Sichere Zahlung</div>
            <div className="flex items-center gap-2">✅ Geprüfte Qualität</div>
          </div>
        </div>
      </div>
    </div>
  )
}
