/**
 * Dev Area Session Status API
 *
 * Checks the current session validity and returns session info.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { isDevAreaEnabled, DEV_CONFIG } from '@/lib/dev/config'
import { hashFingerprint, type BrowserFingerprint } from '@/lib/dev/crypto'
import { validateSession, getSessionTimeRemaining, isSessionExpiringSoon } from '@/lib/dev/session'
import { logSessionValidated, logSessionExpired } from '@/lib/dev/audit'

export async function GET(request: NextRequest) {
  // Get client info
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const userAgent = headersList.get('user-agent') || undefined

  try {
    // Check if dev area is enabled
    if (!isDevAreaEnabled()) {
      return NextResponse.json({ error: 'Dev area is not enabled' }, { status: 403 })
    }

    // Get session cookie
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(DEV_CONFIG.COOKIE_NAME)?.value

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false, reason: 'no_session' })
    }

    // Get fingerprint from query params (for validation)
    const { searchParams } = new URL(request.url)
    const fingerprintStr = searchParams.get('fingerprint')

    let fingerprintHash = 'no-fingerprint'
    if (fingerprintStr) {
      try {
        const fingerprint: BrowserFingerprint = JSON.parse(
          Buffer.from(fingerprintStr, 'base64').toString('utf8')
        )
        fingerprintHash = hashFingerprint(fingerprint)
      } catch {
        // Invalid fingerprint format, use default
      }
    }

    // Validate session
    console.log(
      '[DevSession] GET - validating session, ip:',
      ip,
      'fingerprintHash:',
      fingerprintHash.substring(0, 20)
    )
    const result = validateSession(sessionToken, ip, fingerprintHash)
    console.log('[DevSession] GET - result:', result.valid, result.error || 'ok')

    if (!result.valid || !result.session) {
      // Log session expiration/invalidation
      if (result.error) {
        await logSessionExpired(result.session?.wallet || 'unknown', ip, result.error, userAgent)
      }

      // Clear invalid session cookie
      cookieStore.delete(DEV_CONFIG.COOKIE_NAME)

      return NextResponse.json({
        authenticated: false,
        reason: result.error || 'invalid_session',
      })
    }

    // Log successful validation (rate-limited to avoid spam)
    // Only log every 5 minutes
    const shouldLog = Date.now() % (5 * 60 * 1000) < 10000 // Within first 10 seconds of each 5-min window
    if (shouldLog) {
      await logSessionValidated(result.session.wallet, ip, userAgent)
    }

    return NextResponse.json({
      authenticated: true,
      wallet: result.session.wallet,
      issuedAt: result.session.issuedAt,
      expiresAt: result.session.expiresAt,
      timeRemaining: getSessionTimeRemaining(result.session),
      expiringSoon: isSessionExpiringSoon(result.session),
    })
  } catch (error) {
    console.error('[DevSession] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST endpoint for session validation with fingerprint in body.
 * More secure than GET with query params for sensitive data.
 */
export async function POST(request: NextRequest) {
  // Get client info
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const userAgent = headersList.get('user-agent') || undefined

  try {
    // Check if dev area is enabled
    if (!isDevAreaEnabled()) {
      return NextResponse.json({ error: 'Dev area is not enabled' }, { status: 403 })
    }

    // Get session cookie
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(DEV_CONFIG.COOKIE_NAME)?.value

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false, reason: 'no_session' })
    }

    // Parse request body for fingerprint
    const body = await request.json().catch(() => ({}))
    const { fingerprint } = body as { fingerprint?: BrowserFingerprint }

    const fingerprintHash = fingerprint ? hashFingerprint(fingerprint) : 'no-fingerprint'

    // Validate session
    const result = validateSession(sessionToken, ip, fingerprintHash)

    if (!result.valid || !result.session) {
      // Log session expiration/invalidation
      if (result.error) {
        await logSessionExpired(result.session?.wallet || 'unknown', ip, result.error, userAgent)
      }

      // Clear invalid session cookie
      cookieStore.delete(DEV_CONFIG.COOKIE_NAME)

      return NextResponse.json({
        authenticated: false,
        reason: result.error || 'invalid_session',
      })
    }

    return NextResponse.json({
      authenticated: true,
      wallet: result.session.wallet,
      issuedAt: result.session.issuedAt,
      expiresAt: result.session.expiresAt,
      timeRemaining: getSessionTimeRemaining(result.session),
      expiringSoon: isSessionExpiringSoon(result.session),
    })
  } catch (error) {
    console.error('[DevSession] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
