'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Review, ReviewsResponse } from '@/types'
import { StarRating } from './StarRating'
import { useAuthStore } from '@/store/auth'
import { ReviewForm } from './ReviewForm'

interface Props {
  productId: string
}

export function ReviewList({ productId }: Props) {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<ReviewsResponse>({ reviews: [], avgRating: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ReviewsResponse>(`/api/products/${productId}/reviews`)
      .then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [productId])

  const hasReviewed = user ? data.reviews.some((r) => r.userId === user.id) : false

  function addReview(review: Review) {
    setData((d) => {
      const reviews = [review, ...d.reviews]
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      return { reviews, avgRating: Math.round(avg * 10) / 10, count: reviews.length }
    })
  }

  async function deleteReview(id: string) {
    await api.delete(`/api/reviews/${id}`)
    setData((d) => {
      const reviews = d.reviews.filter((r) => r.id !== id)
      const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
      return { reviews, avgRating: Math.round(avg * 10) / 10, count: reviews.length }
    })
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <h2 className="text-xl font-bold">Bewertungen</h2>
        {data.count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(data.avgRating)} />
            <span className="text-sm font-medium text-gray-600">
              {data.avgRating.toFixed(1)} / 5 ({data.count} {data.count === 1 ? 'Bewertung' : 'Bewertungen'})
            </span>
          </div>
        )}
      </div>

      {user && !hasReviewed && <ReviewForm productId={productId} onReviewAdded={addReview} />}
      {user && hasReviewed && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">Du hast dieses Produkt bereits bewertet.</p>
      )}
      {!user && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          <a href="/auth/login" className="text-primary-600 hover:underline font-medium">Anmelden</a> um eine Bewertung zu schreiben.
        </p>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : data.reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">Noch keine Bewertungen. Sei der Erste!</p>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                    {(review.user?.name ?? 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.user?.name ?? 'Anonym'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  {(user?.id === review.userId || user?.role === 'ADMIN') && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="text-xs text-red-400 hover:text-red-600 ml-2"
                    >
                      Löschen
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-gray-700 ml-10">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
