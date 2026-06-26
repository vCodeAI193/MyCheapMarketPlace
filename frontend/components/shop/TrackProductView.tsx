'use client'
import { useEffect } from 'react'
import { Product } from '@/types'
import { useRecentlyViewed } from './RecentlyViewed'

export function TrackProductView({ product }: { product: Product }) {
  const { add } = useRecentlyViewed()
  useEffect(() => {
    add(product)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, add])
  return null
}
