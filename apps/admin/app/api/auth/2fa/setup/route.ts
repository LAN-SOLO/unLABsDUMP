import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import {
  generateTOTPSecret,
  generateTOTPUri,
  generateBackupCodes,
  hashBackupCodes,
  encryptTOTPSecret,
} from '@/lib/auth/totp'

export async function POST(_request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Check if 2FA is already enabled
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

    // Generate new secret and backup codes
    const secret = generateTOTPSecret()
    const accountName = session.email || session.walletAddress || session.adminId
    const uri = generateTOTPUri(secret, accountName)
    const backupCodes = generateBackupCodes(10)
    const hashedBackupCodes = await hashBackupCodes(backupCodes)

    // Encrypt the TOTP secret before storing
    const encryptedSecret = encryptTOTPSecret(secret)

    // Store the encrypted secret (not enabled yet)
    const { error: updateError } = await supabase
      .from('admins')
      .update({
        two_factor_secret: encryptedSecret,
        two_factor_backup_codes: hashedBackupCodes,
      })
      .eq('id', session.adminId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save 2FA setup' }, { status: 500 })
    }

    return NextResponse.json({
      secret,
      uri,
      backupCodes, // Show these once to the user
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
