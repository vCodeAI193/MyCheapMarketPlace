import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// api.ts wird nach jedem Test frisch importiert damit localStorage-Änderungen greifen
// Wir testen über dynamische Imports mit Cache-Busting

function mockFetch(responses: Array<{ ok: boolean; status: number; body: unknown }>) {
  let call = 0
  return vi.fn().mockImplementation(() => {
    const r = responses[call] ?? responses[responses.length - 1]
    call++
    return Promise.resolve({
      ok: r.ok,
      status: r.status,
      json: () => Promise.resolve(r.body),
    })
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api — GET-Anfragen', () => {
  it('gibt geparste JSON-Daten zurück bei erfolgreicher Anfrage', async () => {
    const fetchMock = mockFetch([{ ok: true, status: 200, body: { name: 'Produkt' } }])
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('./api')
    const data = await api.get<{ name: string }>('/api/products/test')
    expect(data.name).toBe('Produkt')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('setzt Authorization-Header wenn accessToken in localStorage vorhanden', async () => {
    localStorage.setItem('accessToken', 'mein-token-123')
    const fetchMock = mockFetch([{ ok: true, status: 200, body: {} }])
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('./api')
    await api.get('/api/test')

    const calledHeaders = fetchMock.mock.calls[0][1].headers
    expect(calledHeaders['Authorization']).toBe('Bearer mein-token-123')
  })

  it('wirft einen Fehler bei nicht-OK-Response', async () => {
    const fetchMock = mockFetch([{ ok: false, status: 400, body: { error: 'Ungültige Anfrage' } }])
    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('./api')
    await expect(api.get('/api/test')).rejects.toThrow('Ungültige Anfrage')
  })
})

describe('api — Token-Refresh-Interceptor', () => {
  it('ruft /api/auth/refresh bei 401-Antwort auf', async () => {
    localStorage.setItem('refreshToken', 'alter-refresh-token')

    const fetchMock = vi.fn()
      // Erster Aufruf: 401
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Token abgelaufen' }) })
      // Refresh-Aufruf: schlägt fehl
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Ungültig' }) })

    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('./api')
    await expect(api.get('/api/protected')).rejects.toThrow()

    // Prüfe ob /api/auth/refresh aufgerufen wurde
    const urls = fetchMock.mock.calls.map((c: [string, ...unknown[]]) => c[0])
    expect(urls.some((url: string) => url.includes('/api/auth/refresh'))).toBe(true)
  })

  it('wiederholt die Originalanfrage nach erfolgreichem Token-Refresh', async () => {
    localStorage.setItem('refreshToken', 'gültiger-refresh-token')

    const fetchMock = vi.fn()
      // Erster Aufruf: 401
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Abgelaufen' }) })
      // Refresh erfolgreich
      .mockResolvedValueOnce({
        ok: true, status: 200,
        json: () => Promise.resolve({ accessToken: 'neuer-token', refreshToken: 'neuer-refresh' }),
      })
      // Wiederholter Aufruf: erfolgreich
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ data: 'ok' }) })

    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('./api')
    const result = await api.get<{ data: string }>('/api/protected')
    expect(result.data).toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('speichert neue Tokens nach erfolgreichem Refresh', async () => {
    localStorage.setItem('refreshToken', 'alter-refresh-token')

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Abgelaufen' }) })
      .mockResolvedValueOnce({
        ok: true, status: 200,
        json: () => Promise.resolve({ accessToken: 'neuer-access', refreshToken: 'neuer-refresh' }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) })

    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('./api')
    await api.get('/api/protected')
    expect(localStorage.getItem('accessToken')).toBe('neuer-access')
    expect(localStorage.getItem('refreshToken')).toBe('neuer-refresh')
  })

  it('löscht Tokens wenn Refresh fehlschlägt', async () => {
    localStorage.setItem('accessToken', 'alter-access')
    localStorage.setItem('refreshToken', 'alter-refresh')

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Abgelaufen' }) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ error: 'Refresh ungültig' }) })

    vi.stubGlobal('fetch', fetchMock)

    const { api } = await import('./api')
    await expect(api.get('/api/protected')).rejects.toThrow()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })
})
