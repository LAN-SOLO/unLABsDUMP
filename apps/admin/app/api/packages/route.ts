import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createPackageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.enum(['SOL', 'USDC', '_unSC']).default('SOL'),
  nft_ids: z.array(z.string().uuid()).optional(),
  max_supply: z.number().int().min(1).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  is_active: z.enum(['true', 'false']).optional(),
  is_featured: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['created_at', 'name', 'price', 'sold_count']).default('created_at'),
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
      is_active: searchParams.get('is_active'),
      is_featured: searchParams.get('is_featured'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      )
    }

    const { page, limit, search, is_active, is_featured, sortBy, sortOrder } = queryResult.data
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from('packages')
      .select('*, package_nfts:nfts(id, name, image_url, rarity)', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true')
    }

    if (is_featured !== undefined) {
      query = query.eq('is_featured', is_featured === 'true')
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: packages, error, count } = await query

    if (error) {
      console.error('Package fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
    }

    return NextResponse.json({
      packages: packages || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Package list error:', error)
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
    const result = createPackageSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { nft_ids, ...packageData } = result.data
    const supabase = await createClient()

    // Create package
    const { data: pkg, error } = await supabase
      .from('packages')
      .insert({
        ...packageData,
        created_by: session.adminId,
      })
      .select()
      .single()

    if (error) {
      console.error('Package create error:', error)
      return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
    }

    // If NFT IDs provided, create package-NFT associations
    if (nft_ids && nft_ids.length > 0) {
      const packageNfts = nft_ids.map((nft_id) => ({
        package_id: pkg.id,
        nft_id,
      }))

      await supabase.from('package_nfts').insert(packageNfts)
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'package_created',
      entity_type: 'package',
      entity_id: pkg.id,
      details: { name: pkg.name, price: pkg.price },
    })

    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (error) {
    console.error('Package create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
