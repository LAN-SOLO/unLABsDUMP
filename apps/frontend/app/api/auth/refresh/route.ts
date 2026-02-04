import { NextResponse } from 'next/server'
import { getSession, createSession, setSessionCookie } from '@/lib/auth/session'
import { AUTH_CONFIG } from '@/lib/auth/config'

export async function POST() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 })
    }

    // Check if token needs refresh (less than 1 day remaining)
    const now = Math.floor(Date.now() / 1000)
    const exp = session.exp ?? 0
    const timeRemaining = exp - now

    if (timeRemaining > AUTH_CONFIG.REFRESH_THRESHOLD) {
      return NextResponse.json({
        refreshed: false,
        message: 'Token still has sufficient time remaining',
        expiresIn: timeRemaining,
      })
    }

    // Issue new token
    const newToken = await createSession({
      playerId: session.playerId,
      walletAddress: session.walletAddress,
    })

    await setSessionCookie(newToken)

    return NextResponse.json({
      refreshed: true,
      message: 'Session refreshed successfully',
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
