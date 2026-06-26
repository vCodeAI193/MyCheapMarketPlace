'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { SaleBadge } from './SaleBadge'
import { StarRating } from './StarRating'
import { CountdownTimer } from './CountdownTimer'
import { LOW_STOCK_THRESHOLD } from '@/lib/constants'
import { useCurrencyStore } from '@/store/currency'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const format = useCurrencyStore((s) => s.format)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    openCart()
  }

  const onSale = product.salePrice != null && product.saleEndsAt != null && new Date(product.saleEndsAt) > new Date()
  const displayPrice = onSale ? product.salePrice! : product.price

  return (
    <Link href={`/products/${product.slug}`} className="group card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square relative bg-gray-100 overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
        )}
        {onSale && (
          <div className="absolute top-2 left-2">
            <SaleBadge originalPrice={Number(product.price)} salePrice={Number(product.salePrice)} />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>

        {product.reviewCount != null && product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <StarRating rating={Math.round(product.avgRating ?? 0)} size="sm" />
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary-600">
              {format(Number(displayPrice))}
            </span>
            {onSale && (
              <span className="text-xs text-gray-400 line-through ml-1">
                {format(Number(product.price))}
              </span>
            )}
          </div>
          <Button size="sm" onClick={handleAdd} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Ausverkauft' : 'Kaufen'}
          </Button>
        </div>
        {product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD && (
          <p className="text-xs text-orange-600 mt-1">Nur noch {product.stock} verfügbar</p>
        )}
        {onSale && product.saleEndsAt && (
          <div className="mt-2 scale-90 origin-left">
            <CountdownTimer endsAt={product.saleEndsAt} />
          </div>
        )}
      </div>
    </Link>
  )
}
