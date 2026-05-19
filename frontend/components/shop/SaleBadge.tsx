interface Props {
  originalPrice: number
  salePrice: number
}

export function SaleBadge({ originalPrice, salePrice }: Props) {
  const pct = Math.round((1 - salePrice / originalPrice) * 100)
  return (
    <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      -{pct}%
    </span>
  )
}
