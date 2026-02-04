import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTOTP, verifyBackupCode, decryptTOTPSecret } from '@/lib/auth/totp'
import { createSession, setSessionCookie } from '@/lib/auth/session'

const MAX_2FA_ATTEMPTS = 3
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const { adminId, token, isBackupCode } = await request.json()

    if (!adminId || !token) {
      return NextResponse.json({ error: 'Admin ID and token are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get admin data
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select(
        'id, email, wallet_address, role, two_factor_enabled, two_factor_secret, two_factor_backup_codes, failed_2fa_attempts, locked_until_2fa'
      )
      .eq('id', adminId)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    if (!admin.two_factor_enabled || !admin.two_factor_secret) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 })
    }

    // Check if 2FA is locked out
    if (admin.locked_until_2fa && new Date(admin.locked_until_2fa) > new Date()) {
      const remainingMs = new Date(admin.locked_until_2fa).getTime() - Date.now()
      const remainingMin = Math.ceil(remainingMs / 60000)
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${remainingMin} minutes.` },
        { status: 423 }
      )
    }

    // Decrypt the TOTP secret
    const decryptedSecret = decryptTOTPSecret(admin.two_factor_secret)

    let isValid = false

    if (isBackupCode) {
      // Verify backup code
      const backupCodes = admin.two_factor_backup_codes || []
      const result = await verifyBackupCode(token, backupCodes)

      if (result.valid) {
        isValid = true
        // Remove the used backup code
        const newBackupCodes = [...backupCodes]
        newBackupCodes.splice(result.index, 1)

        await supabase
          .from('admins')
          .update({ two_factor_backup_codes: newBackupCodes })
          .eq('id', adminId)
      }
    } else {
      // Verify TOTP token
      isValid = verifyTOTP(token, decryptedSecret)
    }

    if (!isValid) {
      // Increment failed 2FA attempts
      const newAttempts = (admin.failed_2fa_attempts || 0) + 1
      const updates: Record<string, unknown> = { failed_2fa_attempts: newAttempts }

      if (newAttempts >= MAX_2FA_ATTEMPTS) {
        updates.locked_until_2fa = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
      }

      await supabase.from('admins').update(updates).eq('id', adminId)

      const remaining = MAX_2FA_ATTEMPTS - newAttempts
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Invalid verification code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
              : 'Too many failed attempts. Account temporarily locked.',
        },
        { status: 400 }
      )
    }

    // Reset failed 2FA attempts on success
    await supabase
      .from('admins')
      .update({ failed_2fa_attempts: 0, locked_until_2fa: null })
      .eq('id', adminId)

    // Create session
    const sessionToken = await createSession({
      adminId: admin.id,
      email: admin.email,
      walletAddress: admin.wallet_address,
      role: admin.role || 'admin',
    })

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)

    // Set cookie
    await setSessionCookie(sessionToken)

    return NextResponse.json({
      success: true,
      message: '2FA verified successfully',
    })
  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
