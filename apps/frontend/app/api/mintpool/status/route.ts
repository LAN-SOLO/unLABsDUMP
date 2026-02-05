import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

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

    const supabase = await createClient()

    // Get current/latest round
    const { data: currentRound } = await supabase
      .from('mint_pool_rounds')
      .select('*')
      .in('status', ['active', 'pending'])
      .order('round_number', { ascending: false })
      .limit(1)
      .single()

    // Get player's participation in current round
    let playerStats = null
    if (currentRound) {
      const { data } = await supabase
        .from('mint_pool_participants')
        .select('*')
        .eq('round_id', currentRound.id)
        .eq('player_id', session.playerId)
        .single()
      playerStats = data
    }

    // Count hidden NFTs in pool
    const { count: poolNftCount } = await supabase
      .from('nfts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'hidden')

    // Count active miners in current round
    let minersOnline = 0
    if (currentRound) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('mint_pool_participants')
        .select('*', { count: 'exact', head: true })
        .eq('round_id', currentRound.id)
        .gte('last_activity_at', fiveMinutesAgo)
      minersOnline = count || 0
    }

    // Count completed rounds
    const { count: totalRoundsCompleted } = await supabase
      .from('mint_pool_rounds')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Count player's total slices
    const { count: playerTotalSlices } = await supabase
      .from('mint_pool_slices')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', session.playerId)

    // Count player's assemblies
    const { count: playerAssemblies } = await supabase
      .from('mint_pool_assemblies')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', session.playerId)
      .eq('status', 'completed')

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
