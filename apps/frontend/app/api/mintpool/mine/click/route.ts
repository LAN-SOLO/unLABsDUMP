import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { CLICK_COOLDOWN_MS, CLICK_REWARD_CHANCE } from '@/lib/mintpool/config'

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

    const supabase = await createClient()

    // Get active round
    const { data: activeRound } = await supabase
      .from('mint_pool_rounds')
      .select('*')
      .eq('status', 'active')
      .limit(1)
      .single()

    if (!activeRound) {
      return NextResponse.json({ error: 'No active round' }, { status: 404 })
    }

    // Get participant record
    const { data: participant } = await supabase
      .from('mint_pool_participants')
      .select('*')
      .eq('round_id', activeRound.id)
      .eq('player_id', session.playerId)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Not joined to round' }, { status: 400 })
    }

    // Rate limit: check last activity
    const now = Date.now()
    const lastActivity = participant.last_activity_at
      ? new Date(participant.last_activity_at).getTime()
      : 0

    if (now - lastActivity < CLICK_COOLDOWN_MS) {
      const remaining = CLICK_COOLDOWN_MS - (now - lastActivity)
      return NextResponse.json(
        { error: 'Cooldown active', cooldown_remaining_ms: remaining },
        { status: 429 }
      )
    }

    // Roll for reward
    const multiplier = parseFloat(participant.hash_rate_multiplier || '1')
    const effectiveChance = Math.min(CLICK_REWARD_CHANCE * multiplier, 0.95)
    const roll = Math.random()
    const rewarded = roll < effectiveChance

    // Update participant
    await supabase
      .from('mint_pool_participants')
      .update({
        click_mine_count: participant.click_mine_count + 1,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', participant.id)

    return NextResponse.json({
      success: true,
      rewarded,
      click_count: participant.click_mine_count + 1,
      effective_chance: effectiveChance,
    })
  } catch (error) {
    console.error('Click mine error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
