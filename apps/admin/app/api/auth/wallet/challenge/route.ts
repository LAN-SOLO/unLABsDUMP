import { NextRequest, NextResponse } from 'next/server'
import { generateChallenge } from '@/lib/auth/wallet-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    // Check if wallet is registered as admin
    const supabase = await createSupabaseAdminClient()
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, wallet_address, role')
      .eq('wallet_address', walletAddress)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Wallet not registered as admin' },
        { status: 401 }
      )
    }

    const message = generateChallenge(walletAddress)

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Challenge generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
