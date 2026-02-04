import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/trades/recent - Fetch recently completed trades (public)
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: trades, error } = await supabase
      .from('completed_trades')
      .select(
        `
        id,
        nft_id,
        price_in_sol,
        buyer_address,
        seller_address,
        completed_at
      `
      )
      .order('completed_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Failed to fetch recent trades:', error)
      return NextResponse.json({ error: 'Failed to fetch recent trades' }, { status: 500 })
    }

    // Enrich with NFT details
    const nftIds = (trades || []).map((t) => t.nft_id).filter(Boolean)

    let nftMap: Record<string, { name: string; image: string; rarity: string }> = {}

    if (nftIds.length > 0) {
      const { data: nfts } = await supabase
        .from('player_nfts')
        .select('id, name, image, rarity')
        .in('id', nftIds)

      if (nfts) {
        nftMap = Object.fromEntries(
          nfts.map((n) => [n.id, { name: n.name, image: n.image, rarity: n.rarity }])
        )
      }
    }

    const sales = (trades || []).map((trade) => {
      const nft = nftMap[trade.nft_id] || {
        name: 'Unknown NFT',
        image: '',
        rarity: 'common',
      }

      return {
        id: trade.id,
        nftName: nft.name,
        nftImage: nft.image,
        nftRarity: nft.rarity,
        priceInSol: trade.price_in_sol,
        buyerAddress: trade.buyer_address,
        sellerAddress: trade.seller_address,
        completedAt: trade.completed_at,
      }
    })

    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Recent trades error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
