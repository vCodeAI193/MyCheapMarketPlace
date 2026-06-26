'use client'
import { useCurrencyStore } from '@/store/currency'

const CURRENCIES = ['EUR', 'USD', 'GBP'] as const

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrencyStore()

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as typeof currency)}
      className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
      aria-label="Währung auswählen"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  )
}
