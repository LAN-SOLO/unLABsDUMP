import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getStakeMultiplier } from '@/lib/mintpool/config'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('player_session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if player already has an active stake
    const { data: existingStake } = await supabase
      .from('mint_pool_stakes')
      .select('*')
      .eq('player_id', session.playerId)
      .eq('status', 'active')
      .single()

    if (existingStake) {
      return NextResponse.json(
        { error: 'Already have an active stake. Withdraw first.' },
        { status: 400 }
      )
    }

    const multiplier = getStakeMultiplier(Number(amount))

    // Create soft-stake record (MVP: DB recorded, balance verified via RPC later)
    const { data: stake, error } = await supabase
      .from('mint_pool_stakes')
      .insert({
        player_id: session.playerId,
        wallet_address: session.walletAddress,
        amount: amount.toString(),
        multiplier: multiplier.toString(),
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Stake creation error:', error)
      return NextResponse.json({ error: 'Failed to create stake' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      stake: {
        id: stake.id,
        amount: stake.amount,
        multiplier: stake.multiplier,
        status: stake.status,
      },
    })
  } catch (error) {
    console.error('Stake error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
