'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch { /* backend always responds 200 — ignore network errors */ }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Passwort vergessen?</h1>
          <p className="text-gray-500 text-sm text-center mb-6">
            Gib deine E-Mail-Adresse ein. Falls ein Konto existiert, senden wir dir einen Reset-Link.
          </p>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700">
              <p className="font-semibold mb-1">E-Mail gesendet!</p>
              <p className="text-sm">Prüfe dein Postfach und klicke auf den Link in der E-Mail.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Input label="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full" loading={loading}>Reset-Link senden</Button>
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
