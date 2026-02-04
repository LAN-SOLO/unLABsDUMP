import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const contactSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message too long (max 500 characters)'),
})

/**
 * POST /api/trades/[id]/contact - Send a message to the seller (authenticated)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: listingId } = await params
    const body = await request.json()

    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { message } = parsed.data

    const supabase = await createClient()

    // Verify the listing exists
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('id, seller_id, nft_name')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Prevent contacting yourself
    if (listing.seller_id === session.playerId) {
      return NextResponse.json({ error: 'You cannot contact yourself' }, { status: 400 })
    }

    // Store the message
    const { error: messageError } = await supabase.from('trade_messages').insert({
      listing_id: listingId,
      sender_id: session.playerId,
      sender_address: session.walletAddress,
      recipient_id: listing.seller_id,
      message,
      nft_name: listing.nft_name,
      read: false,
    })

    if (messageError) {
      console.error('Failed to send message:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact seller error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
