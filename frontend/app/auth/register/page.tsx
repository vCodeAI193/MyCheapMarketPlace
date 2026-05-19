'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { register } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'

export default function RegisterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/'
  const setUser = useAuthStore((s) => s.setUser)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }
    setLoading(true)
    try {
      const user = await register(form.email, form.password, form.name)
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
          <h1 className="text-2xl font-bold text-center mb-6">Registrieren</h1>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Name" value={form.name} onChange={set('name')} />
            <Input label="E-Mail" type="email" value={form.email} onChange={set('email')} required />
            <Input label="Passwort (min. 8 Zeichen)" type="password" value={form.password} onChange={set('password')} required />
            <Input label="Passwort bestätigen" type="password" value={form.confirm} onChange={set('confirm')} required />
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>Konto erstellen</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Bereits ein Konto?{' '}
            <Link href={`/auth/login?redirect=${redirect}`} className="text-primary-600 hover:underline font-medium">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
