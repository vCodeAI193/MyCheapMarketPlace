'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

interface Props {
  productId: string
}

export function WishlistButton({ productId }: Props) {
  const user = useAuthStore((s) => s.user)
  const [wished, setWished] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    api.get<{ productId: string }[]>('/api/wishlist').then((items) => {
      setWished(items.some((i) => i.productId === productId))
    }).catch(() => {})
  }, [user, productId])

  async function toggle() {
    if (!user) { window.location.href = '/auth/login'; return }
    setLoading(true)
    try {
      if (wished) {
        await api.delete(`/api/wishlist/${productId}`)
        setWished(false)
      } else {
        await api.post(`/api/wishlist/${productId}`, {})
        setWished(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
        wished
          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
          : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'
      }`}
      title={wished ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
    >
      <span className="text-lg">{wished ? '♥' : '♡'}</span>
      {wished ? 'Gemerkt' : 'Merken'}
    </button>
  )
}
