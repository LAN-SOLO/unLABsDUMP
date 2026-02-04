import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Burn ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: burn, error } = await supabase
      .from('burn_events')
      .select('*, player:players(id, wallet_address, username)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Burn event not found' }, { status: 404 })
      }
      console.error('Burn fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch burn event' }, { status: 500 })
    }

    return NextResponse.json({ burn })
  } catch (error) {
    console.error('Burn get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
