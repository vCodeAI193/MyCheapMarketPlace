import { describe, it, expect } from 'vitest'
import { calculateCouponDiscount } from './couponUtils'

describe('calculateCouponDiscount', () => {
  it('berechnet prozentualen Rabatt', () => {
    expect(calculateCouponDiscount({ type: 'PERCENT', value: 10 }, 100)).toBe(10)
  })

  it('rundet Prozentrabatt auf 2 Dezimalstellen', () => {
    expect(calculateCouponDiscount({ type: 'PERCENT', value: 33.33 }, 10)).toBe(3.33)
  })

  it('berechnet Festbetrag-Rabatt', () => {
    expect(calculateCouponDiscount({ type: 'FIXED', value: 15 }, 100)).toBe(15)
  })

  it('begrenzt Festbetrag auf den Gesamtbetrag', () => {
    expect(calculateCouponDiscount({ type: 'FIXED', value: 200 }, 100)).toBe(100)
  })

  it('gibt 0 zurück bei Festbetrag 0', () => {
    expect(calculateCouponDiscount({ type: 'FIXED', value: 0 }, 100)).toBe(0)
  })

  it('gibt 0 zurück bei 0% Rabatt', () => {
    expect(calculateCouponDiscount({ type: 'PERCENT', value: 0 }, 100)).toBe(0)
  })

  it('100% Rabatt entspricht dem Gesamtbetrag', () => {
    expect(calculateCouponDiscount({ type: 'PERCENT', value: 100 }, 49.99)).toBe(49.99)
  })
})
