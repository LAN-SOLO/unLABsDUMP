import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { transferRequestSchema } from '@/lib/transfer/validate'
import { validateRecipientAddress } from '@/lib/transfer/validate'

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

    const { id: nftId } = await params
    const body = await request.json()

    // Validate request body
    const parsed = transferRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { recipientAddress } = parsed.data

    // Validate recipient address
    const validation = validateRecipientAddress(recipientAddress, session.walletAddress)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify the NFT belongs to the player
    const { data: nft, error: nftError } = await supabase
      .from('player_nfts')
      .select('id, name, mint_address, is_listed')
      .eq('id', nftId)
      .eq('player_id', session.playerId)
      .single()

    if (nftError || !nft) {
      return NextResponse.json({ error: 'NFT not found in your inventory' }, { status: 404 })
    }

    if (nft.is_listed) {
      return NextResponse.json(
        { error: 'Cannot transfer a listed NFT. Cancel the listing first.' },
        { status: 400 }
      )
    }

    // Record the transfer
    const { error: transferError } = await supabase.from('nft_transfers').insert({
      nft_id: nftId,
      from_player_id: session.playerId,
      from_address: session.walletAddress,
      to_address: recipientAddress,
      mint_address: nft.mint_address,
      status: 'pending',
    })

    if (transferError) {
      console.error('Failed to record transfer:', transferError)
      return NextResponse.json({ error: 'Failed to initiate transfer' }, { status: 500 })
    }

    // Update NFT ownership status (mark as transferred)
    await supabase
      .from('player_nfts')
      .update({
        player_id: null,
        transferred_at: new Date().toISOString(),
        transferred_to: recipientAddress,
      })
      .eq('id', nftId)

    return NextResponse.json({
      success: true,
      message: `${nft.name} transfer initiated to ${recipientAddress}`,
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
