'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { WishlistItem } from '@/types'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem, openCart } = useCartStore()

  useEffect(() => {
    api.get<WishlistItem[]>('/api/wishlist').then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function remove(productId: string) {
    await api.delete(`/api/wishlist/${productId}`)
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function moveToCart(item: WishlistItem) {
    addItem(item.product)
    openCart()
    remove(item.productId)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Meine Wunschliste</h1>

      <div className="flex gap-4 mb-8">
        <Link href="/account" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-primary-400">Profil</Link>
        <Link href="/account/orders" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-primary-400">Bestellungen</Link>
        <Link href="/account/wishlist" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Wunschliste</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
          {[1,2,3].map((i) => <div key={i} className="card h-56 bg-gray-100" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">♡</p>
          <p className="mb-4">Deine Wunschliste ist leer.</p>
          <Link href="/products"><Button variant="outline">Produkte entdecken</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <Link href={`/products/${item.product.slug}`}>
                <div className="aspect-square relative bg-gray-100">
                  {item.product.images[0] && (
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                  )}
                </div>
              </Link>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{item.product.name}</p>
                <p className="text-primary-600 font-bold mb-3">{Number(item.product.price).toFixed(2)} €</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => moveToCart(item)} disabled={item.product.stock === 0}>
                    {item.product.stock === 0 ? 'Ausverkauft' : 'In Warenkorb'}
                  </Button>
                  <button onClick={() => remove(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors text-lg" title="Entfernen">
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
