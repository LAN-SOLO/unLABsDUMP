import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/trades/[id] - Get a single listing's details (public)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .select(
        `
        id,
        nft_id,
        nft_name,
        nft_image,
        nft_rarity,
        traits,
        price_in_sol,
        seller_address,
        expires_at,
        created_at,
        status
      `
      )
      .eq('id', id)
      .single()

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: listing.id,
      nftId: listing.nft_id,
      nftName: listing.nft_name,
      nftImage: listing.nft_image,
      nftRarity: listing.nft_rarity,
      traits: listing.traits,
      priceInSol: listing.price_in_sol,
      sellerAddress: listing.seller_address,
      expiresAt: listing.expires_at,
      createdAt: listing.created_at,
      status: listing.status,
    })
  } catch (error) {
    console.error('Fetch listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/trades/[id] - Cancel a listing (authenticated, seller only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const supabase = await createClient()

    // Verify listing exists and belongs to the seller
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('id, nft_id, seller_id, status')
      .eq('id', id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.seller_id !== session.playerId) {
      return NextResponse.json({ error: 'You can only cancel your own listings' }, { status: 403 })
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is not active' }, { status: 400 })
    }

    // Cancel the listing
    const { error: updateError } = await supabase
      .from('marketplace_listings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to cancel listing:', updateError)
      return NextResponse.json({ error: 'Failed to cancel listing' }, { status: 500 })
    }

    // Unmark NFT as listed
    await supabase
      .from('player_nfts')
      .update({
        is_listed: false,
        listing_price: null,
      })
      .eq('id', listing.nft_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
