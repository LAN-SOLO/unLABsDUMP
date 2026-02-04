import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createBurnSchema = z.object({
  player_id: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  token_type: z.enum(['_unSC']).default('_unSC'),
  reason: z.string().optional(),
  transaction_signature: z.string().optional(),
})

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  player_id: z.string().uuid().optional(),
  token_type: z.string().optional(),
  sortBy: z.enum(['created_at', 'amount']).default('created_at'),
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
      player_id: searchParams.get('player_id'),
      token_type: searchParams.get('token_type'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, player_id, token_type, sortBy, sortOrder } = queryResult.data
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from('burn_events')
      .select('*, player:players(id, wallet_address, username)', { count: 'exact' })

    if (player_id) {
      query = query.eq('player_id', player_id)
    }

    if (token_type) {
      query = query.eq('token_type', token_type)
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    query = query.range(offset, offset + limit - 1)

    const { data: burns, error, count } = await query

    if (error) {
      console.error('Burns fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch burn events' }, { status: 500 })
    }

    return NextResponse.json({
      burns: burns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Burns list error:', error)
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
    const result = createBurnSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create burn event
    const { data: burn, error } = await supabase
      .from('burn_events')
      .insert({
        ...result.data,
        status: result.data.transaction_signature ? 'completed' : 'pending',
        created_by: session.adminId,
      })
      .select()
      .single()

    if (error) {
      console.error('Burn create error:', error)
      return NextResponse.json({ error: 'Failed to create burn event' }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'burn_created',
      entity_type: 'burn_event',
      entity_id: burn.id,
      details: { amount: burn.amount, player_id: burn.player_id },
    })

    return NextResponse.json({ burn }, { status: 201 })
  } catch (error) {
    console.error('Burn create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
