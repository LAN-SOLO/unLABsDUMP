import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
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

    // Get player's past round participations
    const { data: participations, error } = await supabase
      .from('mint_pool_participants')
      .select(
        `
        id,
        round_id,
        hashes_submitted,
        valid_hashes_submitted,
        click_mine_count,
        effective_shares,
        slices_earned,
        joined_at,
        created_at
      `
      )
      .eq('player_id', session.playerId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('History fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    // Get round details for each participation
    const roundIds = (participations || []).map((p) => p.round_id)
    const rounds: Record<string, { round_number: number; status: string; difficulty: number }> = {}

    if (roundIds.length > 0) {
      const { data: roundData } = await supabase
        .from('mint_pool_rounds')
        .select('id, round_number, status, difficulty')
        .in('id', roundIds)

      for (const r of roundData || []) {
        rounds[r.id] = { round_number: r.round_number, status: r.status, difficulty: r.difficulty }
      }
    }

    const history = (participations || []).map((p) => ({
      ...p,
      round: rounds[p.round_id] || null,
    }))

    return NextResponse.json({ history })
  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
