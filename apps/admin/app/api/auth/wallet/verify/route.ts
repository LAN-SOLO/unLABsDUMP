import { NextRequest, NextResponse } from 'next/server'
import { getChallenge, verifySignature } from '@/lib/auth/wallet-auth'
import { createSession, setSessionCookie } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature } = await request.json()

    if (!walletAddress || !signature) {
      return NextResponse.json(
        { error: 'Wallet address and signature are required' },
        { status: 400 }
      )
    }

    // Get the challenge message
    const message = getChallenge(walletAddress)
    if (!message) {
      return NextResponse.json(
        { error: 'Challenge expired or not found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify signature
    const isValid = verifySignature(walletAddress, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Get admin from database
    const supabase = await createSupabaseAdminClient()
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, wallet_address, email, role, totp_enabled')
      .eq('wallet_address', walletAddress)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 401 })
    }

    // Check if 2FA is enabled
    if (admin.totp_enabled) {
      // Return partial auth - requires 2FA
      return NextResponse.json({
        requires2FA: true,
        adminId: admin.id,
      })
    }

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
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
    console.error('Wallet verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
