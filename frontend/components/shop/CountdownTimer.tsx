'use client'
import { useEffect, useState } from 'react'

interface Props {
  endsAt: string
}

export function CountdownTimer({ endsAt }: Props) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    function update() {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setExpired(true); return }

      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (expired) return null

  return (
    <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-sm font-mono font-semibold px-3 py-1.5 rounded-lg">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
      </svg>
      Endet in {timeLeft}
    </div>
  )
}
