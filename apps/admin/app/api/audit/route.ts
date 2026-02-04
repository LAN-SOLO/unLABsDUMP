import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  admin_id: z.string().uuid().optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
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
      limit: searchParams.get('limit') || 50,
      admin_id: searchParams.get('admin_id'),
      action: searchParams.get('action'),
      entity_type: searchParams.get('entity_type'),
      entity_id: searchParams.get('entity_id'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      )
    }

    const {
      page,
      limit,
      admin_id,
      action,
      entity_type,
      entity_id,
      start_date,
      end_date,
      sortOrder,
    } = queryResult.data
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from('audit_logs')
      .select('*, admin:admins(id, email, wallet_address)', { count: 'exact' })

    if (admin_id) {
      query = query.eq('admin_id', admin_id)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (entity_type) {
      query = query.eq('entity_type', entity_type)
    }

    if (entity_id) {
      query = query.eq('entity_id', entity_id)
    }

    if (start_date) {
      query = query.gte('created_at', start_date)
    }

    if (end_date) {
      query = query.lte('created_at', end_date)
    }

    query = query.order('created_at', { ascending: sortOrder === 'asc' })
    query = query.range(offset, offset + limit - 1)

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Audit logs fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
    }

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Audit logs list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
