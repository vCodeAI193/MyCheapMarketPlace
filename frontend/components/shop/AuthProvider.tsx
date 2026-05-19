'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { getMe } from '@/lib/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    getMe().then((user) => {
      setUser(user)
      setLoading(false)
    })
  }, [setUser, setLoading])

  return <>{children}</>
}
