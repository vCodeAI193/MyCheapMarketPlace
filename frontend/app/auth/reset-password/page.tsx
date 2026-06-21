'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwörter stimmen nicht überein.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 2000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <p className="text-gray-500">Ungültiger oder fehlender Token.</p>
    </div>
  )

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Neues Passwort setzen</h1>

          {done ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700">
              <p className="font-semibold">Passwort erfolgreich geändert!</p>
              <p className="text-sm mt-1">Du wirst zur Anmeldung weitergeleitet…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Input label="Neues Passwort (min. 8 Zeichen)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Input label="Passwort bestätigen" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>Passwort ändern</Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/auth/login" className="text-primary-600 hover:underline">← Zurück zur Anmeldung</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
