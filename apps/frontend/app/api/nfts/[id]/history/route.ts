import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('nft_ownership_history')
      .select(
        'id, nft_id, from_wallet, to_wallet, transfer_type, transaction_signature, price_sol, created_at'
      )
      .eq('nft_id', id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: 'Failed to fetch ownership history' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
