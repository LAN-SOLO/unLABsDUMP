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

    // Get the admin's pending 2FA secret
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('two_factor_enabled, two_factor_secret')
      .eq('id', session.adminId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
    }

    if (admin.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
    }

    if (!admin.two_factor_secret) {
      return NextResponse.json({ error: '2FA setup not initiated' }, { status: 400 })
    }

    // Decrypt the secret before verifying
    const decryptedSecret = decryptTOTPSecret(admin.two_factor_secret)

    // Verify the token
    const isValid = verifyTOTP(token, decryptedSecret)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('admins')
      .update({
        two_factor_enabled: true,
      })
      .eq('id', session.adminId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '2FA has been enabled successfully',
    })
  } catch (error) {
    console.error('2FA enable error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
