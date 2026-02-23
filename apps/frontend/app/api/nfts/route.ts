import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const color = searchParams.get('color') || ''
    const tier = searchParams.get('tier') || ''
    const era = searchParams.get('era') || ''
    const rotation = searchParams.get('rotation') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    const exclude = searchParams.get('exclude') || ''

    const offset = (page - 1) * limit

    // Build query (explicit columns to avoid over-fetching)
    let query = supabase
      .from('nfts')
      .select(
        'id, name, description, status, image_url, thumbnail_url, metadata, rarity_score, owner_id, owner_wallet, mint_address, created_at, updated_at',
        { count: 'exact' }
      )

    // Search filter (name, description, capture)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,capture.ilike.%${search}%`
      )
    }

    // Status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Color filter (supports multiple comma-separated values)
    if (color) {
      const colors = color.split(',').filter(Boolean)
      if (colors.length === 1) {
        query = query.eq('color', colors[0])
      } else if (colors.length > 1) {
        query = query.in('color', colors)
      }
    }

    // Tier filter (supports multiple comma-separated values)
    if (tier) {
      const tiers = tier.split(',').filter(Boolean).map(Number)
      if (tiers.length === 1) {
        query = query.eq('tier', tiers[0])
      } else if (tiers.length > 1) {
        query = query.in('tier', tiers)
      }
    }

    // Era filter
    if (era) {
      const eras = era.split(',').filter(Boolean)
      if (eras.length === 1) {
        query = query.eq('era', eras[0])
      } else if (eras.length > 1) {
        query = query.in('era', eras)
      }
    }

    // Rotation filter
    if (rotation) {
      const rotations = rotation.split(',').filter(Boolean)
      if (rotations.length === 1) {
        query = query.eq('rotation', rotations[0])
      } else if (rotations.length > 1) {
        query = query.in('rotation', rotations)
      }
    }

    // Exclude specific NFT (used for related NFTs)
    if (exclude) {
      query = query.neq('id', exclude)
    }

    // Sorting
    switch (sortBy) {
      case 'rarity':
        query = query.order('rarity_score', { ascending: sortOrder === 'asc', nullsFirst: false })
        break
      case 'name':
        query = query.order('name', { ascending: sortOrder === 'asc' })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: sortOrder === 'asc' })
        break
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 })
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      data: data || [],
      count: totalCount,
      page,
      limit,
      totalPages,
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
