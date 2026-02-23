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

    // Get current/latest round (only needed columns)
    const { data: currentRound } = await supabase
      .from('mint_pool_rounds')
      .select(
        'id, round_number, status, difficulty, duration_seconds, total_hashes_submitted, total_participants, total_slices_awarded, nft_pool_ids, starts_at, ends_at'
      )
      .in('status', ['active', 'pending'])
      .order('round_number', { ascending: false })
      .limit(1)
      .single()

    // Run independent count queries in parallel
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const [
      playerStatsResult,
      poolNftCountResult,
      minersOnlineResult,
      totalRoundsResult,
      playerSlicesResult,
      playerAssembliesResult,
    ] = await Promise.all([
      // Player's participation in current round
      currentRound
        ? supabase
            .from('mint_pool_participants')
            .select(
              'id, hashes_submitted, valid_hashes_submitted, click_mine_count, staked_unsc, hash_rate_multiplier, effective_shares, slices_earned, last_activity_at'
            )
            .eq('round_id', currentRound.id)
            .eq('player_id', session.playerId)
            .single()
        : Promise.resolve({ data: null }),
      // Count hidden NFTs in pool
      supabase.from('nfts').select('id', { count: 'exact', head: true }).eq('status', 'hidden'),
      // Count active miners
      currentRound
        ? supabase
            .from('mint_pool_participants')
            .select('id', { count: 'exact', head: true })
            .eq('round_id', currentRound.id)
            .gte('last_activity_at', fiveMinutesAgo)
        : Promise.resolve({ count: 0 }),
      // Count completed rounds
      supabase
        .from('mint_pool_rounds')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed'),
      // Count player's total slices
      supabase
        .from('mint_pool_slices')
        .select('id', { count: 'exact', head: true })
        .eq('player_id', session.playerId),
      // Count player's assemblies
      supabase
        .from('mint_pool_assemblies')
        .select('id', { count: 'exact', head: true })
        .eq('player_id', session.playerId)
        .eq('status', 'completed'),
    ])

    const playerStats = playerStatsResult.data
    const poolNftCount = poolNftCountResult.count
    const minersOnline = minersOnlineResult.count || 0
    const totalRoundsCompleted = totalRoundsResult.count
    const playerTotalSlices = playerSlicesResult.count
    const playerAssemblies = playerAssembliesResult.count

    return NextResponse.json({
      current_round: currentRound || null,
      player_stats: playerStats,
      pool_nft_count: poolNftCount || 0,
      miners_online: minersOnline,
      total_rounds_completed: totalRoundsCompleted || 0,
      player_total_slices: playerTotalSlices || 0,
      player_assemblies: playerAssemblies || 0,
    })
  } catch (error) {
    console.error('Mint pool status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
