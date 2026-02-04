import { NextRequest, NextResponse } from 'next/server'
import { validateGameRequest, gameApiError } from '../../middleware'
import { createSuccessResponse } from '@/lib/game/api'
import { getPlayerNFTs } from '@/lib/game/verify'
import { formatNFTsForGame } from '@/lib/game/format'

export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    // Validate API key and rate limit
    const validationError = validateGameRequest(request)
    if (validationError) return validationError

    const { wallet } = await params

    if (!wallet || wallet.length < 32) {
      return gameApiError('INVALID_WALLET', 'A valid Solana wallet address is required', 400)
    }

    const result = await getPlayerNFTs(wallet)

    return NextResponse.json(
      createSuccessResponse({
        nfts: formatNFTsForGame(result.nfts as Record<string, unknown>[]),
        total: result.total,
        wallet: result.wallet,
      }),
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Game API - Get NFTs error:', error)
    return gameApiError('INTERNAL_ERROR', 'An unexpected error occurred while fetching NFTs')
  }
}
