import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-extrabold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Seite nicht gefunden</h2>
      <p className="text-gray-500 mb-8">Die gesuchte Seite existiert nicht oder wurde verschoben.</p>
      <Link
        href="/"
        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Zur Startseite
      </Link>
    </div>
  )
}
