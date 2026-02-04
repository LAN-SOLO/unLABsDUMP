import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { verifyPayment } from '@/lib/purchase/verify'

const purchaseSchema = z.object({
  transactionSignature: z.string().min(1),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify session
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: packageId } = await params

    // Validate package ID
    const idParsed = z.string().uuid().safeParse(packageId)
    if (!idParsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid package ID' }, { status: 400 })
    }

    // Validate request body
    const body = await request.json()
    const parsed = purchaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Transaction signature is required' },
        { status: 400 }
      )
    }

    const { transactionSignature } = parsed.data
    const supabase = await createSupabaseAdminClient()

    // Fetch the package
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('status', 'active')
      .single()

    if (pkgError || !pkg) {
      return NextResponse.json(
        { success: false, error: 'Package not found or not available' },
        { status: 404 }
      )
    }

    // Check stock availability
    if (pkg.total_supply != null) {
      const available = pkg.total_supply - (pkg.sold_count || 0) - (pkg.reserved_count || 0)
      if (available <= 0) {
        return NextResponse.json({ success: false, error: 'Package is sold out' }, { status: 409 })
      }
    }

    // Check for sale window
    const now = new Date()
    if (pkg.sale_starts_at && new Date(pkg.sale_starts_at) > now) {
      return NextResponse.json(
        { success: false, error: 'Sale has not started yet' },
        { status: 409 }
      )
    }
    if (pkg.sale_ends_at && new Date(pkg.sale_ends_at) < now) {
      return NextResponse.json({ success: false, error: 'Sale has ended' }, { status: 409 })
    }

    // Check for duplicate transaction signature
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('payment_transaction', transactionSignature)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Transaction signature already used' },
        { status: 409 }
      )
    }

    // Verify the transaction on-chain
    const priceInSol = parseFloat(pkg.price_sol)
    const verification = await verifyPayment(
      transactionSignature,
      priceInSol,
      session.walletAddress
    )

    if (!verification.verified) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || 'Payment verification failed',
        },
        { status: 400 }
      )
    }

    // Reserve stock (increment reserved_count)
    const { error: reserveError } = await supabase.rpc('increment_field', {
      table_name: 'packages',
      row_id: packageId,
      field_name: 'reserved_count',
      amount: 1,
    })

    // If RPC not available, fallback to manual update
    if (reserveError) {
      await supabase
        .from('packages')
        .update({ reserved_count: (pkg.reserved_count || 0) + 1 })
        .eq('id', packageId)
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        player_id: session.playerId,
        buyer_wallet: session.walletAddress,
        package_id: packageId,
        package_name: pkg.name,
        package_price_sol: pkg.price_sol,
        unsc_amount: pkg.unsc_amount || '0',
        nft_ids: pkg.nft_ids || [],
        payment_transaction: transactionSignature,
        payment_confirmed_at: new Date().toISOString(),
        status: 'confirmed',
      })
      .select()
      .single()

    if (purchaseError || !purchase) {
      console.error('Failed to create purchase record:', purchaseError)
      return NextResponse.json(
        { success: false, error: 'Failed to record purchase' },
        { status: 500 }
      )
    }

    // Update package sold_count and revenue
    await supabase
      .from('packages')
      .update({
        sold_count: (pkg.sold_count || 0) + 1,
        reserved_count: Math.max((pkg.reserved_count || 0) - 1 + 1, 0),
        total_revenue_sol: (parseFloat(pkg.total_revenue_sol || '0') + priceInSol).toString(),
      })
      .eq('id', packageId)

    // Update player stats (best-effort)
    try {
      await supabase.rpc('increment_field', {
        table_name: 'players',
        row_id: session.playerId,
        field_name: 'total_purchases',
        amount: 1,
      })
    } catch {
      // Ignore if RPC not available
    }

    return NextResponse.json({
      success: true,
      data: {
        purchaseId: purchase.id,
        status: purchase.status,
        transactionSignature,
        packageName: pkg.name,
      },
    })
  } catch (error) {
    console.error('Purchase API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
