'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { SearchIcon } from './Icons'
import { API_BASE_URL } from '@/lib/api'

interface Suggestion {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  salePrice?: number | null
}

const API = API_BASE_URL

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function onInput(value: string) {
    setQuery(value)
    clearTimeout(timerRef.current)
    if (!value.trim()) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/products/autocomplete?q=${encodeURIComponent(value)}`)
        const data = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }, 300)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false)
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  function goToProduct(slug: string) {
    setOpen(false)
    setQuery('')
    router.push(`/products/${slug}`)
  }

  const effectivePrice = (s: Suggestion) =>
    s.salePrice != null ? s.salePrice : s.price

  return (
    <div ref={containerRef} className="relative hidden md:block w-64">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
          placeholder="Produkte suchen…"
          value={query}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
        />
        {loading && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => goToProduct(s.slug)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {s.images[0] && <Image src={s.images[0]} alt={s.name} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-primary-600 font-semibold">
                  {Number(effectivePrice(s)).toFixed(2)} €
                  {s.salePrice && (
                    <span className="text-gray-400 line-through ml-1 font-normal">
                      {Number(s.price).toFixed(2)} €
                    </span>
                  )}
                </p>
              </div>
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); router.push(`/products?q=${encodeURIComponent(query)}`) }}
            className="w-full px-3 py-2 text-xs text-primary-600 hover:bg-primary-50 transition-colors border-t border-gray-100 font-medium"
          >
            Alle Ergebnisse für „{query}" anzeigen →
          </button>
        </div>
      )}
    </div>
  )
}
