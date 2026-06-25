'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { logout } from '@/lib/auth'
import { AccountTabs } from '@/components/shop/AccountTabs'
import { SUCCESS_TIMEOUT_MS } from '@/lib/constants'

export default function AccountPage() {
  const { user, setUser, logout: storeLogout } = useAuthStore()
  const router = useRouter()
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user) return null

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await api.put<typeof user>('/api/auth/me', { name })
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), SUCCESS_TIMEOUT_MS)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await logout()
    storeLogout()
    router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Mein Konto</h1>

      <AccountTabs active="profile" />

      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Profildetails</h2>
        <form onSubmit={save} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="E-Mail" value={user.email} disabled />
          <div className="flex items-center gap-4">
            <Button type="submit" loading={loading}>Speichern</Button>
            {saved && <span className="text-green-600 text-sm font-medium">Gespeichert ✓</span>}
          </div>
        </form>
      </div>

      <div className="mt-6">
        <Button variant="danger" onClick={handleLogout}>Abmelden</Button>
      </div>
    </div>
  )
}
