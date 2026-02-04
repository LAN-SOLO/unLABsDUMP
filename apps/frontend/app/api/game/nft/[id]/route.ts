import { NextRequest, NextResponse } from 'next/server'
import { validateGameRequest, gameApiError } from '../../middleware'
import { createSuccessResponse } from '@/lib/game/api'
import { getNFTById } from '@/lib/game/verify'
import { formatNFTForGame } from '@/lib/game/format'

export const revalidate = 60

function generateETag(data: unknown): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return `"${Math.abs(hash).toString(36)}"`
}

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

    const responseData = createSuccessResponse({
      nft: formatNFTForGame(nft as Record<string, unknown>),
    })

    const etag = generateETag(responseData)

    // Check If-None-Match for conditional requests
    const ifNoneMatch = request.headers.get('If-None-Match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        ETag: etag,
      },
    })
  } catch (error) {
    console.error('Game API - Get NFT error:', error)
    return gameApiError('INTERNAL_ERROR', 'An unexpected error occurred while fetching the NFT')
  }
}
