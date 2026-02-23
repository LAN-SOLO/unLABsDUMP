/**
 * Dev Area Access Logs API
 *
 * Fetches audit logs for the log viewer.
 * Requires active dev session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { isDevAreaEnabled, DEV_CONFIG, type DevAccessEventType } from '@/lib/dev/config'
import { hashFingerprint, type BrowserFingerprint } from '@/lib/dev/crypto'
import { validateSession } from '@/lib/dev/session'
import { fetchAccessLogs } from '@/lib/dev/audit'

export async function GET(request: NextRequest) {
  // Get client info
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  try {
    // Check if dev area is enabled
    if (!isDevAreaEnabled()) {
      return NextResponse.json({ error: 'Dev area is not enabled' }, { status: 403 })
    }

    // Get and validate session
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(DEV_CONFIG.COOKIE_NAME)?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For logs API, we use a simplified fingerprint check
    // The full fingerprint validation happens in the main session check
    const result = validateSession(sessionToken, ip, 'no-fingerprint')

    if (!result.valid) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const eventType = searchParams.get('eventType') as DevAccessEventType | null
    const success = searchParams.get('success')
    const walletAddress = searchParams.get('wallet')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Fetch logs
    const { logs, total } = await fetchAccessLogs(limit, offset, {
      eventType: eventType || undefined,
      success: success === 'true' ? true : success === 'false' ? false : undefined,
      walletAddress: walletAddress || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
    })
  } catch (error) {
    console.error('[DevLogs] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST endpoint with filters in body (for complex queries).
 */
export async function POST(request: NextRequest) {
  // Get client info
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  try {
    // Check if dev area is enabled
    if (!isDevAreaEnabled()) {
      return NextResponse.json({ error: 'Dev area is not enabled' }, { status: 403 })
    }

    // Get and validate session
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(DEV_CONFIG.COOKIE_NAME)?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse body for fingerprint
    const body = await request.json()
    const { fingerprint, filters } = body as {
      fingerprint?: BrowserFingerprint
      filters?: {
        limit?: number
        offset?: number
        eventType?: DevAccessEventType
        success?: boolean
        walletAddress?: string
        startDate?: string
        endDate?: string
      }
    }

    const fingerprintHash = fingerprint ? hashFingerprint(fingerprint) : 'no-fingerprint'

    const result = validateSession(sessionToken, ip, fingerprintHash)

    if (!result.valid) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 })
    }

    // Fetch logs with filters
    const limit = Math.min(filters?.limit || 100, 500)
    const offset = filters?.offset || 0

    const { logs, total } = await fetchAccessLogs(limit, offset, {
      eventType: filters?.eventType,
      success: filters?.success,
      walletAddress: filters?.walletAddress,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
    })

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
      hasMore: offset + logs.length < total,
    })
  } catch (error) {
    console.error('[DevLogs] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
