import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateGameRequest, gameApiError } from '../middleware'
import { createSuccessResponse } from '@/lib/game/api'
import { verifyNFTOwnership } from '@/lib/game/verify'

const verifyOwnershipSchema = z.object({
  wallet: z
    .string()
    .min(32, 'Wallet address must be at least 32 characters')
    .max(44, 'Wallet address must be at most 44 characters'),
  nft_id: z.string().uuid('NFT ID must be a valid UUID'),
})

export async function POST(request: NextRequest) {
  try {
    // Validate API key and rate limit
    const validationError = validateGameRequest(request)
    if (validationError) return validationError

    // Parse and validate request body
    const body = await request.json().catch(() => null)

    if (!body) {
      return gameApiError('INVALID_BODY', 'Request body must be valid JSON', 400)
    }

    const parsed = verifyOwnershipSchema.safeParse(body)

    if (!parsed.success) {
      const errorMessages = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')

      return gameApiError('VALIDATION_ERROR', errorMessages, 400)
    }

    const { wallet, nft_id } = parsed.data
    const result = await verifyNFTOwnership(wallet, nft_id)

    return NextResponse.json(
      createSuccessResponse({
        owns: result.owns,
        nft_id: result.nft_id,
        wallet: result.wallet,
      })
    )
  } catch (error) {
    console.error('Game API - Verify ownership error:', error)
    return gameApiError('INTERNAL_ERROR', 'An unexpected error occurred while verifying ownership')
  }
}
