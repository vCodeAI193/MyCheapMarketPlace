'use client'
import { useState } from 'react'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { CheckIcon } from './Icons'

interface Props {
  product: Product
  disabled?: boolean
}

export function AddToCartButton({ product, disabled }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCartStore()

  function handle() {
    addItem(product, quantity)
    openCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Menge</label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
          >−</button>
          <span className="px-4 py-1.5 text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
          >+</button>
        </div>
      </div>
      <Button
        size="lg"
        onClick={handle}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2"
      >
        {added ? (
          <><CheckIcon className="w-5 h-5" /> Hinzugefügt!</>
        ) : (
          'In den Warenkorb'
        )}
      </Button>
    </div>
  )
}
