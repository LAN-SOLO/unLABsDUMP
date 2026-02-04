import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify session
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const parsed = z.string().uuid().safeParse(id)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid purchase ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch purchase (must belong to the current player)
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', parsed.data)
      .eq('player_id', session.playerId)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ success: false, error: 'Purchase not found' }, { status: 404 })
    }

    // Fetch deliveries for this purchase
    const { data: deliveries } = await supabase
      .from('deliveries')
      .select('*')
      .eq('purchase_id', purchase.id)
      .order('created_at', { ascending: true })

    // Calculate overall delivery progress
    const allDeliveries = deliveries || []
    const totalItems = allDeliveries.length
    const deliveredItems = allDeliveries.filter((d) => d.status === 'delivered').length
    const failedItems = allDeliveries.filter((d) => d.status === 'failed').length
    const processingItems = allDeliveries.filter((d) => d.status === 'processing').length

    return NextResponse.json({
      success: true,
      data: {
        purchase: {
          id: purchase.id,
          package_name: purchase.package_name,
          package_price_sol: purchase.package_price_sol,
          status: purchase.status,
          payment_transaction: purchase.payment_transaction,
          payment_confirmed_at: purchase.payment_confirmed_at,
          error_message: purchase.error_message,
          created_at: purchase.created_at,
          updated_at: purchase.updated_at,
        },
        deliveries: allDeliveries.map((d) => ({
          id: d.id,
          item_type: d.item_type,
          nft_id: d.nft_id,
          token_amount: d.token_amount,
          status: d.status,
          transfer_transaction: d.transfer_transaction,
          delivered_at: d.delivered_at,
          error_message: d.error_message,
        })),
        progress: {
          total: totalItems,
          delivered: deliveredItems,
          processing: processingItems,
          failed: failedItems,
          percentage: totalItems > 0 ? Math.round((deliveredItems / totalItems) * 100) : 0,
        },
      },
    })
  } catch (error) {
    console.error('Purchase status API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
