'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-gray-200 mb-4">500</h1>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Etwas ist schiefgelaufen</h2>
      <p className="text-gray-500 mb-6">Ein unerwarteter Fehler ist aufgetreten.</p>
      <button onClick={reset} className="btn-primary">Erneut versuchen</button>
    </div>
  )
}
