import { NextRequest, NextResponse } from 'next/server'

const protectedPaths = ['/account', '/checkout']
const adminPaths = ['/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('accessToken')?.value

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p))

  if ((isProtected || isAdmin) && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/admin/:path*'],
}
