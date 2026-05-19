'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  productId: string
}

export function StockAlertForm({ productId }: Props) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/products/${productId}/stock-alert`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }
      )
      if (!res.ok) throw new Error((await res.json()).error)
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
        ✅ Wir benachrichtigen dich unter <strong>{email}</strong>, sobald das Produkt wieder verfügbar ist.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-orange-800">Dieses Produkt ist aktuell ausverkauft.</p>
      <p className="text-sm text-orange-700">Trag deine E-Mail ein — wir melden uns, sobald es wieder verfügbar ist.</p>
      <div className="flex gap-2">
        <input
          type="email"
          className="input flex-1"
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" loading={loading} size="sm">Benachrichtigen</Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  )
}
