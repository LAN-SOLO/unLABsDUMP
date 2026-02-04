import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { calculateMarketplaceFee } from '@/lib/trading/fees'

const buyRequestSchema = z.object({
  transactionSignature: z.string().min(1, 'Transaction signature required'),
})

/**
 * POST /api/trades/[id]/buy - Execute a purchase (authenticated)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: listingId } = await params
    const body = await request.json()

    const parsed = buyRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { transactionSignature } = parsed.data

    const supabase = await createClient()

    // Fetch the listing
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('id, nft_id, price_in_sol, seller_id, seller_address, status, expires_at')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is no longer active' }, { status: 400 })
    }

    // Check expiry
    if (listing.expires_at && new Date(listing.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Listing has expired' }, { status: 400 })
    }

    // Prevent self-purchase
    if (listing.seller_id === session.playerId) {
      return NextResponse.json({ error: 'You cannot buy your own listing' }, { status: 400 })
    }

    const fee = calculateMarketplaceFee(listing.price_in_sol)

    // Record the trade
    const { error: tradeError } = await supabase.from('completed_trades').insert({
      listing_id: listingId,
      nft_id: listing.nft_id,
      buyer_id: session.playerId,
      buyer_address: session.walletAddress,
      seller_id: listing.seller_id,
      seller_address: listing.seller_address,
      price_in_sol: listing.price_in_sol,
      marketplace_fee: fee,
      transaction_signature: transactionSignature,
      completed_at: new Date().toISOString(),
    })

    if (tradeError) {
      console.error('Failed to record trade:', tradeError)
      return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
    }

    // Update listing status
    await supabase
      .from('marketplace_listings')
      .update({
        status: 'sold',
        sold_at: new Date().toISOString(),
        buyer_id: session.playerId,
        buyer_address: session.walletAddress,
      })
      .eq('id', listingId)

    // Transfer NFT ownership
    await supabase
      .from('player_nfts')
      .update({
        player_id: session.playerId,
        is_listed: false,
        listing_price: null,
        acquired_at: new Date().toISOString(),
      })
      .eq('id', listing.nft_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
