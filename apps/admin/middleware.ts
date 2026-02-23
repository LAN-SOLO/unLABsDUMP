import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth/config'

// Dev area cookie name
const DEV_COOKIE_NAME = 'dev_session'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/wallet/challenge',
  '/api/auth/wallet/verify',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle dev area routes
  if (pathname.startsWith('/dev') || pathname.startsWith('/api/dev')) {
    const devEnabled = process.env.DEV_AREA_ENABLED === 'true'

    // Dev area disabled - 404 for pages, 403 for API
    if (!devEnabled) {
      if (pathname.startsWith('/api/dev')) {
        return NextResponse.json({ error: 'Dev area not enabled' }, { status: 403 })
      }
      return NextResponse.rewrite(new URL('/404', request.url))
    }

    // Allow auth routes without session
    if (
      pathname === '/dev/auth' ||
      pathname.startsWith('/api/dev/challenge') ||
      pathname.startsWith('/api/dev/verify') ||
      pathname.startsWith('/api/dev/passphrase')
    ) {
      return NextResponse.next()
    }

    // Check for dev session
    const devSession = request.cookies.get(DEV_COOKIE_NAME)?.value
    if (!devSession) {
      if (pathname.startsWith('/api/dev')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/dev/auth', request.url))
    }

    return NextResponse.next()
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value

  if (!sessionToken) {
    // Redirect to login for pages, return 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Token exists - let the route handler verify it
  // Note: Full JWT verification happens in the route handlers
  // since Edge Runtime has limited crypto support

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
