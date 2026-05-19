interface Props {
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
}

const steps = [
  { key: 'PENDING',   label: 'Bestellt',  icon: '📋' },
  { key: 'PAID',      label: 'Bezahlt',   icon: '💳' },
  { key: 'SHIPPED',   label: 'Versendet', icon: '🚚' },
  { key: 'DELIVERED', label: 'Geliefert', icon: '📦' },
]

const ORDER = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']

export function OrderTimeline({ status }: Props) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-semibold">
        ❌ Bestellung storniert
      </div>
    )
  }

  const currentIdx = ORDER.indexOf(status)

  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        const future = i > currentIdx

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-colors ${
                done    ? 'bg-green-500 border-green-500 text-white' :
                active  ? 'bg-primary-600 border-primary-600 text-white' :
                          'bg-white border-gray-200 text-gray-300'
              }`}>
                {done ? '✓' : step.icon}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                active ? 'text-primary-600' : done ? 'text-green-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
