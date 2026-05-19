'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Review } from '@/types'
import { Button } from '@/components/ui/Button'
import { StarRating } from './StarRating'

interface Props {
  productId: string
  onReviewAdded: (review: Review) => void
}

export function ReviewForm({ productId, onReviewAdded }: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Bitte wähle eine Bewertung.'); return }
    setError('')
    setLoading(true)
    try {
      const review = await api.post<Review>(`/api/products/${productId}/reviews`, { rating, comment })
      onReviewAdded(review)
      setRating(0)
      setComment('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <h3 className="font-semibold">Produkt bewerten</h3>
      <div>
        <p className="text-sm text-gray-600 mb-1">Deine Bewertung</p>
        <StarRating rating={rating} interactive onChange={setRating} size="lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kommentar (optional)</label>
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="Was hat dir gefallen oder nicht gefallen?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" loading={loading}>Bewertung abschicken</Button>
    </form>
  )
}
