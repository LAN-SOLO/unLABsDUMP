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

    // Fetch all NFTs for counting
    const { data: nfts, error } = await supabase
      .from('player_nfts')
      .select('id, rarity, listing_price')
      .eq('player_id', session.playerId)

    if (error) {
      console.error('Failed to fetch inventory stats:', error)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    const allNfts = nfts || []

    // Calculate rarity breakdown
    const rarityBreakdown = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }

    let estimatedValue = 0

    for (const nft of allNfts) {
      const rarity = (nft.rarity || 'common') as keyof typeof rarityBreakdown
      if (rarity in rarityBreakdown) {
        rarityBreakdown[rarity]++
      }

      // Rough value estimation based on rarity
      const rarityValues: Record<string, number> = {
        common: 0.1,
        uncommon: 0.5,
        rare: 2,
        epic: 10,
        legendary: 50,
      }
      estimatedValue += nft.listing_price || rarityValues[rarity] || 0.1
    }

    return NextResponse.json({
      totalNfts: allNfts.length,
      rarityBreakdown,
      estimatedValue: Math.round(estimatedValue * 100) / 100,
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
