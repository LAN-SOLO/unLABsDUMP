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

    // Find active stake
    const { data: stake } = await supabase
      .from('mint_pool_stakes')
      .select('*')
      .eq('player_id', session.playerId)
      .eq('status', 'active')
      .single()

    if (!stake) {
      return NextResponse.json({ error: 'No active stake found' }, { status: 404 })
    }

    // Withdraw stake
    const { error } = await supabase
      .from('mint_pool_stakes')
      .update({
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', stake.id)

    if (error) {
      console.error('Stake withdrawal error:', error)
      return NextResponse.json({ error: 'Failed to withdraw stake' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Withdraw error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
