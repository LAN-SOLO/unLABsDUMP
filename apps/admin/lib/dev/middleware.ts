/**
 * Dev Area Middleware Helpers
 *
 * Utilities for protecting dev area routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { DEV_CONFIG, isDevAreaEnabled } from './config'

/**
 * Check if a path is a dev area route.
 */
export function isDevAreaPath(pathname: string): boolean {
  return pathname.startsWith('/dev')
}

/**
 * Check if a path is a dev area API route.
 */
export function isDevApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/dev')
}

/**
 * Check if a path is a dev auth route (public within dev area).
 */
export function isDevAuthPath(pathname: string): boolean {
  // Dev auth page and auth API routes don't require session
  return (
    pathname === '/dev/auth' ||
    pathname.startsWith('/api/dev/challenge') ||
    pathname.startsWith('/api/dev/verify') ||
    pathname.startsWith('/api/dev/passphrase')
  )
}

/**
 * Handle dev area middleware logic.
 * Returns a response if the request should be blocked, or null to continue.
 */
export function handleDevAreaMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Skip non-dev routes
  if (!isDevAreaPath(pathname) && !isDevApiPath(pathname)) {
    return null
  }

  // Check if dev area is enabled
  if (!isDevAreaEnabled()) {
    // Dev area disabled - return 404 for pages, 403 for API
    if (isDevApiPath(pathname)) {
      return NextResponse.json({ error: 'Dev area is not enabled' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/404', request.url))
  }

  // Allow dev auth routes without session
  if (isDevAuthPath(pathname)) {
    return null // Continue to route handler
  }

  // For protected dev routes, check for session cookie
  const sessionToken = request.cookies.get(DEV_CONFIG.COOKIE_NAME)?.value

  if (!sessionToken) {
    // No session - redirect to dev auth page for pages, return 401 for API
    if (isDevApiPath(pathname)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/dev/auth', request.url))
  }

  // Session exists - let route handlers do full validation
  // (Middleware runs in Edge Runtime with limited crypto support)
  return null
}

/**
 * Get client IP from request headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

/**
 * Get user agent from request headers.
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined
}
