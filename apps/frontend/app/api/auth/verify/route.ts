import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { consumeChallenge, verifySignature } from '@/lib/auth/player-auth'
import { createSession, setSessionCookie } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

const VerifySchema = z.object({
  walletAddress: z.string().min(32).max(44),
  signature: z.string().min(1),
  message: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = VerifySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { walletAddress, signature, message } = parsed.data

    // Retrieve and consume the challenge (prevents replay)
    const challenge = consumeChallenge(walletAddress)
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge expired or not found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify the message matches the stored challenge
    if (message !== challenge.message) {
      return NextResponse.json({ error: 'Message does not match challenge' }, { status: 400 })
    }

    // Verify the cryptographic signature
    const isValid = verifySignature(message, signature, walletAddress)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Upsert player record in Supabase (create on first auth)
    const supabase = await createSupabaseAdminClient()

    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id, wallet_address, created_at')
      .eq('wallet_address', walletAddress)
      .single()

    let playerId: string

    if (existingPlayer) {
      playerId = existingPlayer.id

      // Update last login
      await supabase
        .from('players')
        .update({ last_login: new Date().toISOString() })
        .eq('id', playerId)
    } else {
      // Create new player
      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert({
          wallet_address: walletAddress,
          last_login: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError || !newPlayer) {
        console.error('Player creation error:', insertError)
        return NextResponse.json({ error: 'Failed to create player record' }, { status: 500 })
      }

      playerId = newPlayer.id
    }

    // Create JWT session
    const token = await createSession({
      playerId,
      walletAddress,
    })

    // Set httpOnly cookie
    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      player: {
        id: playerId,
        walletAddress,
      },
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
