import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseAdminClient()

    const { data: player, error } = await supabase
      .from('players')
      .select('id, wallet_address, created_at, last_activity_at, total_nfts_owned, total_purchases')
      .eq('id', session.playerId)
      .single()

    if (error || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json({ player })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
