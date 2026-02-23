/**
 * Dev Area Logout API
 *
 * Destroys the dev session and clears the cookie.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { DEV_CONFIG } from '@/lib/dev/config'
import { extractSession } from '@/lib/dev/session'
import { logLogout } from '@/lib/dev/audit'

export async function POST(_request: NextRequest) {
  // Get client info
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const userAgent = headersList.get('user-agent') || undefined

  try {
    // Get session cookie
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(DEV_CONFIG.COOKIE_NAME)?.value

    // Extract session info for logging (even if expired)
    let walletAddress = 'unknown'
    if (sessionToken) {
      const session = extractSession(sessionToken)
      if (session) {
        walletAddress = session.wallet
      }
    }

    // Log logout
    await logLogout(walletAddress, ip, userAgent)

    // Clear session cookie
    cookieStore.delete(DEV_CONFIG.COOKIE_NAME)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DevLogout] Error:', error)

    // Still try to clear the cookie even on error
    try {
      const cookieStore = await cookies()
      cookieStore.delete(DEV_CONFIG.COOKIE_NAME)
    } catch {
      // Ignore cookie deletion errors
    }

    return NextResponse.json({ success: true })
  }
}
