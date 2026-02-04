import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createDeliverySchema = z.object({
  purchase_id: z.string().uuid(),
  player_id: z.string().uuid(),
  nft_ids: z.array(z.string().uuid()).min(1),
  delivery_type: z.enum(['automatic', 'manual']).default('automatic'),
  notes: z.string().optional(),
})

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  player_id: z.string().uuid().optional(),
  sortBy: z.enum(['created_at', 'status', 'completed_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryResult = querySchema.safeParse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      status: searchParams.get('status'),
      player_id: searchParams.get('player_id'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, status, player_id, sortBy, sortOrder } = queryResult.data
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from('deliveries')
      .select(
        '*, player:players(id, wallet_address, username), nfts:delivery_nfts(nft:nfts(id, name, image_url))',
        { count: 'exact' }
      )

    if (status) {
      query = query.eq('status', status)
    }

    if (player_id) {
      query = query.eq('player_id', player_id)
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    query = query.range(offset, offset + limit - 1)

    const { data: deliveries, error, count } = await query

    if (error) {
      console.error('Deliveries fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 })
    }

    return NextResponse.json({
      deliveries: deliveries || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Deliveries list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = createDeliverySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { purchase_id, player_id, nft_ids, delivery_type, notes } = result.data
    const supabase = await createClient()

    // Create delivery record
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .insert({
        purchase_id,
        player_id,
        status: 'pending',
        delivery_type,
        notes,
        created_by: session.adminId,
      })
      .select()
      .single()

    if (error) {
      console.error('Delivery create error:', error)
      return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 })
    }

    // Create delivery-NFT associations
    const deliveryNfts = nft_ids.map((nft_id) => ({
      delivery_id: delivery.id,
      nft_id,
    }))

    await supabase.from('delivery_nfts').insert(deliveryNfts)

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'delivery_created',
      entity_type: 'delivery',
      entity_id: delivery.id,
      details: { player_id, nft_count: nft_ids.length },
    })

    return NextResponse.json({ delivery }, { status: 201 })
  } catch (error) {
    console.error('Delivery create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
