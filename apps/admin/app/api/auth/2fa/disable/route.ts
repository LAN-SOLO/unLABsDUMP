import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { verifyTOTP, decryptTOTPSecret } from '@/lib/auth/totp'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the admin's 2FA data
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('two_factor_enabled, two_factor_secret')
      .eq('id', session.adminId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
    }

    if (!admin.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 })
    }

    // Decrypt and verify the token before disabling
    const decryptedSecret = decryptTOTPSecret(admin.two_factor_secret)
    const isValid = verifyTOTP(token, decryptedSecret)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Disable 2FA and clear all related fields
    const { error: updateError } = await supabase
      .from('admins')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
        failed_2fa_attempts: 0,
        locked_until_2fa: null,
      })
      .eq('id', session.adminId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled',
    })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
