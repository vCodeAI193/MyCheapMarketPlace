export function calculateCouponDiscount(
  coupon: { type: string; value: unknown },
  orderTotal: number
): number {
  const value = Number(coupon.value)
  const raw =
    coupon.type === 'PERCENT'
      ? (orderTotal * value) / 100
      : Math.min(value, orderTotal)
  return Math.round(raw * 100) / 100
}
