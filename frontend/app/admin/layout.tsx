'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useEffect } from 'react'

const navItems = [
  { href: '/admin', label: '📊 Übersicht' },
  { href: '/admin/products', label: '📦 Produkte' },
  { href: '/admin/categories', label: '🏷️ Kategorien' },
  { href: '/admin/orders', label: '🛒 Bestellungen' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading || user?.role !== 'ADMIN') return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-200 flex flex-col py-6 flex-shrink-0">
        <Link href="/" className="px-5 mb-8 text-white font-bold text-lg">
          ← Shop
        </Link>
        <p className="px-5 text-xs font-semibold text-gray-500 uppercase mb-2">Admin</p>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-primary-600 text-white font-medium'
                  : 'hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 pt-4 border-t border-gray-700 text-xs text-gray-500">
          {user.email}
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  )
}
