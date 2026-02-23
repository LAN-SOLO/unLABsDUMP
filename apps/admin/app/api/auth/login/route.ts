import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/auth/email-auth'
import { createSession, setSessionCookie } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Get admin from database
    const supabase = await createSupabaseAdminClient()
    const { data: admin, error } = await supabase
      .from('admins')
      .select(
        'id, email, password_hash, wallet_address, role, totp_enabled, failed_login_attempts, locked_until'
      )
      .eq('email', email)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if account is locked
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return NextResponse.json(
        { error: 'Account is locked. Please try again later.' },
        { status: 423 }
      )
    }

    // Verify password
    if (!admin.password_hash) {
      return NextResponse.json(
        { error: 'Password login not configured for this account' },
        { status: 400 }
      )
    }

    const isValidPassword = await verifyPassword(password, admin.password_hash)
    if (!isValidPassword) {
      // Increment failed attempts
      const newAttempts = (admin.failed_login_attempts || 0) + 1
      const updates: Record<string, unknown> = { failed_login_attempts: newAttempts }

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        updates.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      }

      await supabase.from('admins').update(updates).eq('id', admin.id)

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if 2FA is enabled — reset attempts but defer last_login until 2FA passes
    if (admin.totp_enabled) {
      await supabase
        .from('admins')
        .update({ failed_login_attempts: 0, locked_until: null })
        .eq('id', admin.id)

      return NextResponse.json({
        requires2FA: true,
        adminId: admin.id,
      })
    }

    // Reset failed attempts + update last login in single query
    await supabase
      .from('admins')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq('id', admin.id)

    // Create session
    const token = await createSession({
      adminId: admin.id,
      walletAddress: admin.wallet_address,
      email: admin.email,
      role: admin.role,
    })

    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        walletAddress: admin.wallet_address,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
