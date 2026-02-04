import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { createListingSchema, calculateExpiryDate } from '@/lib/trading/listing'

/**
 * GET /api/trades - Fetch active marketplace listings (public)
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: listings, error } = await supabase
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
        created_at
      `
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch listings:', error)
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
    }

    // Filter out expired listings
    const now = new Date()
    const activeListings = (listings || [])
      .filter((l) => !l.expires_at || new Date(l.expires_at) > now)
      .map((l) => ({
        id: l.id,
        nftId: l.nft_id,
        nftName: l.nft_name,
        nftImage: l.nft_image,
        nftRarity: l.nft_rarity || 'common',
        traits: l.traits || { color: 'Unknown', tier: 'Unknown', era: 'Unknown' },
        priceInSol: l.price_in_sol,
        sellerAddress: l.seller_address,
        expiresAt: l.expires_at,
        createdAt: l.created_at,
      }))

    return NextResponse.json({ listings: activeListings })
  } catch (error) {
    console.error('Trades fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/trades - Create a new listing (authenticated)
 */
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
    const parsed = createListingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { nftId, priceInSol, durationDays } = parsed.data

    const supabase = await createClient()

    // Verify the player owns this NFT
    const { data: nft, error: nftError } = await supabase
      .from('player_nfts')
      .select('id, name, image, rarity, traits, is_listed')
      .eq('id', nftId)
      .eq('player_id', session.playerId)
      .single()

    if (nftError || !nft) {
      return NextResponse.json({ error: 'NFT not found in your inventory' }, { status: 404 })
    }

    if (nft.is_listed) {
      return NextResponse.json({ error: 'NFT is already listed' }, { status: 400 })
    }

    const expiryDate = calculateExpiryDate(durationDays)

    // Create the listing
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .insert({
        nft_id: nftId,
        nft_name: nft.name,
        nft_image: nft.image,
        nft_rarity: nft.rarity,
        traits: nft.traits,
        price_in_sol: priceInSol,
        seller_id: session.playerId,
        seller_address: session.walletAddress,
        expires_at: expiryDate?.toISOString() || null,
        status: 'active',
      })
      .select('id')
      .single()

    if (listingError) {
      console.error('Failed to create listing:', listingError)
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
    }

    // Mark NFT as listed
    await supabase
      .from('player_nfts')
      .update({
        is_listed: true,
        listing_price: priceInSol,
      })
      .eq('id', nftId)

    return NextResponse.json({ id: listing.id }, { status: 201 })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
