import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST() {
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

    const supabase = await createSupabaseAdminClient()

    // Get the current active round
    const { data: activeRound } = await supabase
      .from('mint_pool_rounds')
      .select('*')
      .eq('status', 'active')
      .order('round_number', { ascending: false })
      .limit(1)
      .single()

    if (!activeRound) {
      return NextResponse.json({ error: 'No active round' }, { status: 404 })
    }

    // Check if already joined (idempotent)
    const { data: existing } = await supabase
      .from('mint_pool_participants')
      .select('id')
      .eq('round_id', activeRound.id)
      .eq('player_id', session.playerId)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already joined' })
    }

    // Get player's active stake for multiplier
    const { data: stake } = await supabase
      .from('mint_pool_stakes')
      .select('multiplier')
      .eq('player_id', session.playerId)
      .eq('status', 'active')
      .single()

    const multiplier = stake?.multiplier || '1.0'

    // Join the round
    const { error } = await supabase.from('mint_pool_participants').insert({
      round_id: activeRound.id,
      player_id: session.playerId,
      wallet_address: session.walletAddress,
      hash_rate_multiplier: multiplier,
    })

    if (error) {
      console.error('Failed to join round:', error)
      return NextResponse.json({ error: 'Failed to join round' }, { status: 500 })
    }

    // Increment total participants
    await supabase
      .from('mint_pool_rounds')
      .update({
        total_participants: activeRound.total_participants + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeRound.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Join round error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
