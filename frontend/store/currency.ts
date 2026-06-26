import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Currency = 'EUR' | 'USD' | 'GBP'

const RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
}

const SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}

interface CurrencyState {
  currency: Currency
  setCurrency: (c: Currency) => void
  format: (amount: number) => string
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'EUR',
      setCurrency: (currency) => set({ currency }),
      format: (amount) => {
        const { currency } = get()
        const converted = amount * RATES[currency]
        return `${converted.toFixed(2)} ${SYMBOLS[currency]}`
      },
    }),
    { name: 'currency' }
  )
)
