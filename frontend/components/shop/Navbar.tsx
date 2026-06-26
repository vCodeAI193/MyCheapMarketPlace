'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { ShoppingCartIcon, UserIcon } from './Icons'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'
import { CurrencyToggle } from './CurrencyToggle'
import { CART_BADGE_MAX } from '@/lib/constants'

export function Navbar() {
  const itemCount = useCartStore((s) => s.itemCount())
  const openCart = useCartStore((s) => s.openCart)
  const user = useAuthStore((s) => s.user)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            MyCheapMarketPlace
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
              Alle Produkte
            </Link>
            <SearchBar />
          </div>

          <div className="flex items-center gap-3">
            <CurrencyToggle />
            <ThemeToggle />
            <button
              onClick={openCart}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Warenkorb öffnen"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount > CART_BADGE_MAX ? `${CART_BADGE_MAX}+` : itemCount}
                </span>
              )}
            </button>

            {user ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:block text-sm font-medium">{user.name ?? user.email}</span>
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm">
                Anmelden
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
