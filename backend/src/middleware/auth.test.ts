import { describe, it, expect, vi, beforeAll } from 'vitest'
import jwt from 'jsonwebtoken'
import { authenticate, softAuthenticate, AuthRequest } from './auth'
import { Request, Response, NextFunction } from 'express'

const SECRET = 'test-secret'

beforeAll(() => {
  process.env.JWT_SECRET = SECRET
})

function makeReq(authHeader?: string): AuthRequest {
  return { headers: { authorization: authHeader } } as AuthRequest
}

function makeRes() {
  const json = vi.fn()
  const status = vi.fn().mockReturnValue({ json })
  return { status, json } as unknown as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> }
}

function makeNext(): NextFunction {
  return vi.fn() as NextFunction
}

function validToken(expiresIn: string | number = '15m') {
  return jwt.sign({ userId: 'user-1', role: 'USER' }, SECRET, { expiresIn })
}

describe('authenticate', () => {
  it('setzt userId bei gültigem Token und ruft next() auf', () => {
    const req = makeReq(`Bearer ${validToken()}`)
    const res = makeRes()
    const next = makeNext()

    authenticate(req, res, next)

    expect(req.userId).toBe('user-1')
    expect(req.userRole).toBe('USER')
    expect(next).toHaveBeenCalledOnce()
  })

  it('gibt 401 zurück wenn kein Authorization-Header vorhanden', () => {
    const req = makeReq()
    const res = makeRes()
    const next = makeNext()

    authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('gibt 401 zurück bei abgelaufenem Token', () => {
    const expiredToken = validToken(-1)
    const req = makeReq(`Bearer ${expiredToken}`)
    const res = makeRes()
    const next = makeNext()

    authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('gibt 401 zurück bei ungültigem Token', () => {
    const req = makeReq('Bearer ungueltig.token.hier')
    const res = makeRes()
    const next = makeNext()

    authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})

describe('softAuthenticate', () => {
  it('setzt userId bei gültigem Token und ruft next() auf', () => {
    const req = makeReq(`Bearer ${validToken()}`)
    const res = makeRes()
    const next = makeNext()

    softAuthenticate(req, res, next)

    expect(req.userId).toBe('user-1')
    expect(req.userRole).toBe('USER')
    expect(next).toHaveBeenCalledOnce()
  })

  it('ruft next() auf ohne Fehler wenn kein Token vorhanden', () => {
    const req = makeReq()
    const res = makeRes()
    const next = makeNext()

    softAuthenticate(req, res, next)

    expect(req.userId).toBeUndefined()
    expect(next).toHaveBeenCalledOnce()
  })

  it('ruft next() auf ohne Fehler bei ungültigem Token', () => {
    const req = makeReq('Bearer ungueltig.token.hier')
    const res = makeRes()
    const next = makeNext()

    softAuthenticate(req, res, next)

    expect(req.userId).toBeUndefined()
    expect(next).toHaveBeenCalledOnce()
  })

  it('ruft next() auf ohne Fehler bei abgelaufenem Token', () => {
    const expiredToken = validToken(-1)
    const req = makeReq(`Bearer ${expiredToken}`)
    const res = makeRes()
    const next = makeNext()

    softAuthenticate(req, res, next)

    expect(req.userId).toBeUndefined()
    expect(next).toHaveBeenCalledOnce()
  })
})
