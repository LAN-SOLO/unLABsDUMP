import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateChallenge } from '@/lib/auth/player-auth'

const ChallengeSchema = z.object({
  walletAddress: z.string().min(32).max(44),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ChallengeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid wallet address', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { walletAddress } = parsed.data
    const { nonce, message, timestamp } = generateChallenge(walletAddress)

    return NextResponse.json({ nonce, message, timestamp })
  } catch (error) {
    console.error('Challenge generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
