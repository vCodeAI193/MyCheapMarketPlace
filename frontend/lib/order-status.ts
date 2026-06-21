export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-700' },
  PAID:      { label: 'Bezahlt',    color: 'bg-blue-100 text-blue-700' },
  SHIPPED:   { label: 'Versendet',  color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { label: 'Geliefert',  color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Storniert',  color: 'bg-red-100 text-red-700' },
}

export const ORDER_STATUSES = Object.keys(ORDER_STATUS)
