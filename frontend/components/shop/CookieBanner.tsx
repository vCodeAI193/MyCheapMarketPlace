'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 border-t border-gray-700 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-300">
          <span className="font-semibold text-white">🍪 Cookies & Datenschutz</span>
          <span className="ml-2">
            Wir verwenden Cookies für den Betrieb des Shops und zur Verbesserung deiner Erfahrung.
            Deine Daten werden nicht an Dritte verkauft.{' '}
            <a href="#" className="text-primary-400 hover:underline">Datenschutzerklärung</a>
          </span>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
          >
            Ablehnen
          </button>
          <Button size="sm" onClick={accept}>Alle akzeptieren</Button>
        </div>
      </div>
    </div>
  )
}
