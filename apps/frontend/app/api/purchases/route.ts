import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

const querySchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'delivering', 'completed', 'failed', 'refunded'])
    .optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'oldest']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
})

export async function GET(request: NextRequest) {
  try {
    // Verify session
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      )
    }

    const { status, search, sort, page, limit } = parsed.data
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Build query for player's purchases
    let query = supabase
      .from('purchases')
      .select('*', { count: 'exact' })
      .eq('player_id', session.playerId)

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply search filter
    if (search) {
      query = query.ilike('package_name', `%${search}%`)
    }

    // Apply sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: purchases, error, count } = await query

    if (error) {
      console.error('Failed to fetch purchases:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch purchase history' },
        { status: 500 }
      )
    }

    // Fetch delivery status for each purchase
    const purchaseIds = (purchases || []).map((p) => p.id)
    let deliveriesMap: Record<string, Array<{ id: string; item_type: string; status: string }>> = {}

    if (purchaseIds.length > 0) {
      const { data: deliveries } = await supabase
        .from('deliveries')
        .select('id, purchase_id, item_type, status')
        .in('purchase_id', purchaseIds)

      if (deliveries) {
        deliveriesMap = deliveries.reduce(
          (acc, d) => {
            if (!acc[d.purchase_id]) acc[d.purchase_id] = []
            acc[d.purchase_id].push({
              id: d.id,
              item_type: d.item_type,
              status: d.status,
            })
            return acc
          },
          {} as typeof deliveriesMap
        )
      }
    }

    const purchasesWithDeliveries = (purchases || []).map((p) => ({
      ...p,
      deliveries: deliveriesMap[p.id] || [],
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: purchasesWithDeliveries,
        total: count || 0,
        page,
        pageSize: limit,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Purchases API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
