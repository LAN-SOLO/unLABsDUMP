import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const roundId = searchParams.get('round_id')

    const supabase = await createClient()

    // If no round specified, get current active round
    let targetRoundId = roundId
    if (!targetRoundId) {
      const { data: activeRound } = await supabase
        .from('mint_pool_rounds')
        .select('id')
        .in('status', ['active', 'computing'])
        .order('round_number', { ascending: false })
        .limit(1)
        .single()

      targetRoundId = activeRound?.id
    }

    if (!targetRoundId) {
      return NextResponse.json({ leaderboard: [] })
    }

    // Get top 20 participants by effective shares
    const { data: participants } = await supabase
      .from('mint_pool_participants')
      .select(
        'player_id, wallet_address, effective_shares, valid_hashes_submitted, click_mine_count, slices_earned'
      )
      .eq('round_id', targetRoundId)
      .order('effective_shares', { ascending: false })
      .limit(20)

    const leaderboard = (participants || []).map((p, i) => ({
      rank: i + 1,
      wallet_address: p.wallet_address,
      effective_shares: p.effective_shares,
      valid_hashes: p.valid_hashes_submitted,
      clicks: p.click_mine_count,
      slices_earned: p.slices_earned,
      is_you: p.player_id === session.playerId,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
