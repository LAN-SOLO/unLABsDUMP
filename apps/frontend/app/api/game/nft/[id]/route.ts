import { NextRequest, NextResponse } from 'next/server'
import { validateGameRequest, gameApiError } from '../../middleware'
import { createSuccessResponse } from '@/lib/game/api'
import { getNFTById } from '@/lib/game/verify'
import { formatNFTForGame } from '@/lib/game/format'

export const revalidate = 60

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Validate API key and rate limit
    const validationError = validateGameRequest(request)
    if (validationError) return validationError

    const { id } = await params

    if (!id) {
      return gameApiError('INVALID_ID', 'NFT ID is required', 400)
    }

    const nft = await getNFTById(id)

    if (!nft) {
      return gameApiError('NFT_NOT_FOUND', 'NFT not found', 404)
    }

    return NextResponse.json(
      createSuccessResponse({
        nft: formatNFTForGame(nft as Record<string, unknown>),
      }),
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Game API - Get NFT error:', error)
    return gameApiError('INTERNAL_ERROR', 'An unexpected error occurred while fetching the NFT')
  }
}
