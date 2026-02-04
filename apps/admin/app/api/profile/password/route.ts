import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import {
  hashPassword,
  validatePassword,
  verifyPassword,
  checkPasswordHistory,
  updatePasswordHistory,
} from '@/lib/auth/email-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('. ') }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current password hash and history
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('password_hash, password_history')
      .eq('id', session.adminId)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
    }

    if (!admin.password_hash) {
      return NextResponse.json(
        { error: 'Password authentication not set up for this account' },
        { status: 400 }
      )
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, admin.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Check password history to prevent reuse
    const passwordHistory: string[] = admin.password_history || []
    const allHistory = [admin.password_hash, ...passwordHistory]
    const wasUsedBefore = await checkPasswordHistory(newPassword, allHistory)
    if (wasUsedBefore) {
      return NextResponse.json(
        { error: 'Cannot reuse a recent password. Please choose a different password.' },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password and history
    const newHistory = updatePasswordHistory(admin.password_hash, passwordHistory)

    const { error: updateError } = await supabase
      .from('admins')
      .update({
        password_hash: newPasswordHash,
        password_history: newHistory,
      })
      .eq('id', session.adminId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
