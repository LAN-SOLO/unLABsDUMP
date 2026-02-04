import { NextRequest, NextResponse } from 'next/server'
import { getSession, clearSessionCookie } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get active sessions for the admin
    const { data: sessions, error } = await supabase
      .from('admin_sessions')
      .select('id, ip_address, user_agent, created_at, last_active')
      .eq('admin_id', session.adminId)
      .order('last_active', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json({ sessions: sessions || [] })
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const revokeAll = searchParams.get('revokeAll') === 'true'

    const supabase = await createClient()

    if (revokeAll) {
      // Revoke all sessions for this admin
      const { error } = await supabase
        .from('admin_sessions')
        .delete()
        .eq('admin_id', session.adminId)

      if (error) {
        return NextResponse.json({ error: 'Failed to revoke sessions' }, { status: 500 })
      }

      // Clear the current session cookie
      const response = NextResponse.json({
        success: true,
        message: 'All sessions revoked',
      })

      await clearSessionCookie()

      return response
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Revoke specific session
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('admin_id', session.adminId)

    if (error) {
      return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Session revoked',
    })
  } catch (error) {
    console.error('Session revoke error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
