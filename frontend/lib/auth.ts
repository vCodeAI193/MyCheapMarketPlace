import { api } from './api'
import { User } from '@/types'

export async function login(email: string, password: string): Promise<User> {
  const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
    '/api/auth/login',
    { email, password }
  )
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  }
  return data.user
}

export async function register(email: string, password: string, name?: string): Promise<User> {
  const data = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
    '/api/auth/register',
    { email, password, name }
  )
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  }
  return data.user
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken')
  try {
    await api.post('/api/auth/logout', { refreshToken })
  } catch { /* ignore */ }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export async function getMe(): Promise<User | null> {
  try {
    return await api.get<User>('/api/auth/me')
  } catch {
    return null
  }
}
