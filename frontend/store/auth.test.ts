import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth'
import { User } from '@/types'

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Max Muster',
  role: 'USER',
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ user: null, isLoading: false })
})

describe('AuthStore — setUser', () => {
  it('setzt den User', () => {
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('setzt User auf null', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().setUser(null)
    expect(useAuthStore.getState().user).toBeNull()
  })
})

describe('AuthStore — logout()', () => {
  it('setzt user auf null', () => {
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('löscht accessToken aus localStorage', () => {
    localStorage.setItem('accessToken', 'abc123')
    useAuthStore.getState().logout()
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('löscht refreshToken aus localStorage', () => {
    localStorage.setItem('refreshToken', 'def456')
    useAuthStore.getState().logout()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('löscht Tokens auch wenn kein User gesetzt ist', () => {
    localStorage.setItem('accessToken', 'abc123')
    localStorage.setItem('refreshToken', 'def456')
    useAuthStore.getState().logout()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })
})
