'use client'
import Link from 'next/link'

type ActiveTab = 'profile' | 'orders' | 'wishlist'

const TABS: { key: ActiveTab; label: string; href: string }[] = [
  { key: 'profile',  label: 'Profil',      href: '/account' },
  { key: 'orders',   label: 'Bestellungen', href: '/account/orders' },
  { key: 'wishlist', label: 'Wunschliste',  href: '/account/wishlist' },
]

export function AccountTabs({ active }: { active: ActiveTab }) {
  return (
    <div className="flex gap-4 mb-8">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            tab.key === active
              ? 'px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium'
              : 'px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-primary-400'
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
