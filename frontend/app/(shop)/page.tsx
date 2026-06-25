import Link from 'next/link'
import { ProductCard } from '@/components/shop/ProductCard'
import { Product, Category } from '@/types'
import { API_BASE_URL } from '@/lib/api'

const API = API_BASE_URL

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/api/products?limit=8`, { next: { revalidate: 60 } })
    const data = await res.json()
    return data.items ?? []
  } catch {
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/api/categories`, { next: { revalidate: 300 } })
    return res.json()
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([getFeaturedProducts(), getCategories()])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Günstig. Schnell. Alles da.
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-xl mx-auto">
            Entdecke tausende Produkte zu unschlagbaren Preisen — täglich neue Angebote.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-primary-700 font-bold px-8 py-3 rounded-full hover:bg-primary-50 transition-colors text-lg shadow"
          >
            Jetzt shoppen
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">Kategorien</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="card p-6 text-center hover:shadow-md transition-shadow hover:border-primary-200"
              >
                <div className="text-3xl mb-2">🛍️</div>
                <p className="font-semibold text-gray-800">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Neue Produkte</h2>
          <Link href="/products" className="text-primary-600 hover:underline font-medium text-sm">
            Alle anzeigen →
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-500">Noch keine Produkte vorhanden.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Trust bar */}
      <section className="bg-primary-50 border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🚚', title: 'Schnelle Lieferung', sub: 'Versand in 1–3 Tagen' },
            { icon: '🔒', title: 'Sicher bezahlen', sub: 'SSL & Stripe verschlüsselt' },
            { icon: '↩️', title: '30 Tage Rückgabe', sub: 'Kein Risiko' },
            { icon: '💬', title: 'Kundensupport', sub: 'Mo–Fr 9–17 Uhr' },
          ].map((item) => (
            <div key={item.title}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="font-semibold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
