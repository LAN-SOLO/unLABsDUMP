import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get delivery with all related data
    const { data: delivery, error: fetchError } = await supabase
      .from('deliveries')
      .select(
        `
        id, status, player_id, updated_at,
        player:players(id, wallet_address),
        nfts:delivery_nfts(nft:nfts(id, name, mint_address))
      `
      )
      .eq('id', id)
      .single()

    if (fetchError || !delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    if (delivery.status === 'completed') {
      return NextResponse.json({ error: 'Delivery already completed' }, { status: 400 })
    }

    if (delivery.status === 'processing') {
      return NextResponse.json({ error: 'Delivery is already processing' }, { status: 400 })
    }

    // Mark as processing
    await supabase
      .from('deliveries')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    try {
      // In a real implementation, this would:
      // 1. Connect to Solana network
      // 2. Transfer NFTs from escrow wallet to player wallet
      // 3. Wait for transaction confirmation
      // 4. Store transaction signature

      // For now, simulate the delivery process
      const playerWallet = delivery.player?.wallet_address
      const nfts = delivery.nfts || []

      if (!playerWallet) {
        throw new Error('Player wallet address not found')
      }

      // Simulate transaction (in production, use actual Solana transfer)
      const mockTransactionSignature = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Mark delivery as completed
      await supabase
        .from('deliveries')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          transaction_signature: mockTransactionSignature,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      // Batch update NFT ownership records (instead of per-NFT queries)
      const now = new Date().toISOString()
      const nftIds = nfts.map((d) => d.nft?.id).filter(Boolean) as string[]

      if (nftIds.length > 0) {
        // Batch insert ownership history
        await supabase.from('nft_ownership_history').insert(
          nftIds.map((nftId) => ({
            nft_id: nftId,
            player_id: delivery.player_id,
            acquisition_type: 'delivery',
            acquired_at: now,
          }))
        )

        // Batch update NFT statuses
        await supabase
          .from('nfts')
          .update({
            status: 'transferred',
            current_owner_id: delivery.player_id,
            updated_at: now,
          })
          .in('id', nftIds)
      }

      // Log audit
      await supabase.from('audit_logs').insert({
        admin_id: session.adminId,
        action: 'delivery_processed',
        entity_type: 'delivery',
        entity_id: id,
        details: {
          player_id: delivery.player_id,
          nft_count: nfts.length,
          transaction_signature: mockTransactionSignature,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Delivery processed successfully',
        transaction_signature: mockTransactionSignature,
      })
    } catch (processError) {
      // Mark as failed
      const errorMessage = processError instanceof Error ? processError.message : 'Unknown error'

      await supabase
        .from('deliveries')
        .update({
          status: 'failed',
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      // Log audit
      await supabase.from('audit_logs').insert({
        admin_id: session.adminId,
        action: 'delivery_failed',
        entity_type: 'delivery',
        entity_id: id,
        details: { error: errorMessage },
      })

      return NextResponse.json(
        { error: 'Delivery processing failed', details: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Delivery process error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
