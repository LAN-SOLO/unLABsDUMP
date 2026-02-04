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

    const { data: nfts, error } = await supabase
      .from('player_nfts')
      .select(
        `
        id,
        name,
        image,
        mint_address,
        traits,
        rarity,
        acquired_at,
        is_listed,
        listing_price
      `
      )
      .eq('player_id', session.playerId)
      .order('acquired_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch inventory:', error)
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
    }

    const formattedNfts = (nfts || []).map((nft) => ({
      id: nft.id,
      name: nft.name,
      image: nft.image,
      mintAddress: nft.mint_address,
      traits: nft.traits || { color: 'Unknown', tier: 'Unknown', era: 'Unknown' },
      rarity: nft.rarity || 'common',
      acquiredAt: nft.acquired_at,
      isListed: nft.is_listed || false,
      listingPrice: nft.listing_price,
    }))

    return NextResponse.json({ nfts: formattedNfts })
  } catch (error) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
