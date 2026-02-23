import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createNFTSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  collection: z.string().optional(),
  mint_address: z.string().optional(),
  status: z.enum(['draft', 'active', 'burned', 'transferred']).default('draft'),
})

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['draft', 'active', 'burned', 'transferred']).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  collection: z.string().optional(),
  sortBy: z.enum(['created_at', 'name', 'rarity']).default('created_at'),
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
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      rarity: searchParams.get('rarity'),
      collection: searchParams.get('collection'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, search, status, rarity, collection, sortBy, sortOrder } = queryResult.data
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('nfts')
      .select(
        'id, name, description, mint_address, status, image_url, thumbnail_url, metadata, rarity_score, collection, rarity, created_at, updated_at',
        { count: 'exact' }
      )

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (rarity) {
      query = query.eq('rarity', rarity)
    }

    if (collection) {
      query = query.eq('collection', collection)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: nfts, error, count } = await query

    if (error) {
      console.error('NFT fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 })
    }

    return NextResponse.json({
      nfts: nfts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('NFT list error:', error)
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
    const result = createNFTSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: nft, error } = await supabase
      .from('nfts')
      .insert({
        ...result.data,
        created_by: session.adminId,
      })
      .select()
      .single()

    if (error) {
      console.error('NFT create error:', error)
      return NextResponse.json({ error: 'Failed to create NFT' }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'nft_created',
      entity_type: 'nft',
      entity_id: nft.id,
      details: { name: nft.name },
    })

    return NextResponse.json({ nft }, { status: 201 })
  } catch (error) {
    console.error('NFT create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
