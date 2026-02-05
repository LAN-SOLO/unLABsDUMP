import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { verifyHash } from '@/lib/mintpool/hash-utils'

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
    const { round_id, nonce, hash } = body

    if (!round_id || !nonce || !hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get active round
    const { data: round } = await supabase
      .from('mint_pool_rounds')
      .select('*')
      .eq('id', round_id)
      .eq('status', 'active')
      .single()

    if (!round) {
      return NextResponse.json({ error: 'Round not active' }, { status: 400 })
    }

    // Verify participant
    const { data: participant } = await supabase
      .from('mint_pool_participants')
      .select('*')
      .eq('round_id', round_id)
      .eq('player_id', session.playerId)
      .single()

    if (!participant) {
      return NextResponse.json({ error: 'Not joined to round' }, { status: 400 })
    }

    // Server-side hash verification (anti-cheat)
    const result = await verifyHash(round_id, session.playerId, nonce, hash, round.difficulty)

    // Record the submission
    await supabase.from('mint_pool_hash_submissions').insert({
      round_id,
      player_id: session.playerId,
      nonce,
      hash,
      leading_zeros: result.leadingZeros,
      is_valid: result.valid,
    })

    // Update participant stats
    await supabase
      .from('mint_pool_participants')
      .update({
        hashes_submitted: participant.hashes_submitted + 1,
        valid_hashes_submitted: participant.valid_hashes_submitted + (result.valid ? 1 : 0),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', participant.id)

    // Update round total
    await supabase
      .from('mint_pool_rounds')
      .update({
        total_hashes_submitted: round.total_hashes_submitted + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', round_id)

    return NextResponse.json({
      success: true,
      valid: result.valid,
      leading_zeros: result.leadingZeros,
    })
  } catch (error) {
    console.error('Hash submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
