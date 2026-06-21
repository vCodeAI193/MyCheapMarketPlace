'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { login } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/'
  const setUser = useAuthStore((s) => s.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      setUser(user)
      router.push(redirect)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Anmelden</h1>
          <form onSubmit={submit} className="space-y-4">
            <Input label="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div>
              <Input label="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <div className="text-right mt-1">
                <Link href="/auth/forgot-password" className="text-xs text-primary-600 hover:underline">Passwort vergessen?</Link>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>Anmelden</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Noch kein Konto?{' '}
            <Link href={`/auth/register?redirect=${redirect}`} className="text-primary-600 hover:underline font-medium">
              Registrieren
            </Link>
          </p>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Demo: admin@test.com / admin123 oder user@test.com / user123
        </p>
      </div>
    </div>
  )
}
