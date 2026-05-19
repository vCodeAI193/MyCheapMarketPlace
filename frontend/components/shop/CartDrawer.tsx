'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { XIcon, PlusIcon, MinusIcon, TrashIcon } from './Icons'

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total } = useCartStore()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Warenkorb ({items.length})</h2>
          <button onClick={closeCart} className="p-1 text-gray-500 hover:text-gray-800">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
            <p>Dein Warenkorb ist leer.</p>
            <Button variant="outline" onClick={closeCart}>
              Weiter einkaufen
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-sm text-primary-600 font-semibold">
                      {Number(item.product.price).toFixed(2)} €
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-0.5 text-gray-500 hover:text-gray-800"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-0.5 text-gray-500 hover:text-gray-800"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-2 p-0.5 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Gesamt</span>
                <span>{total().toFixed(2)} €</span>
              </div>
              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full">Zur Kasse</Button>
              </Link>
              <button
                onClick={closeCart}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Weiter einkaufen
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
