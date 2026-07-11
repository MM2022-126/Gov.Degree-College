import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/admin']
const PUBLIC_ADMIN = '/admin/login'
const PUBLIC_FORGOT = '/admin/forgot-password'
const PUBLIC_RESET = '/admin/reset-password'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('admin_token')?.value
  const isLoggedIn = !!token

  const isProtectedAdmin =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) &&
    pathname !== PUBLIC_ADMIN &&
    !pathname.startsWith(PUBLIC_FORGOT) &&
    !pathname.startsWith(PUBLIC_RESET)

  if (isProtectedAdmin && !isLoggedIn) {
    const url = new URL(PUBLIC_ADMIN, request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if ((pathname === PUBLIC_ADMIN || pathname.startsWith(PUBLIC_FORGOT)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)'],
}
