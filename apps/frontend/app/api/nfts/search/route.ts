import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse advanced search parameters
    const query = searchParams.get('q') || ''
    const color = searchParams.get('color') || ''
    const tier = searchParams.get('tier') || ''
    const era = searchParams.get('era') || ''
    const ownerWallet = searchParams.get('owner') || ''
    const rarityMin = searchParams.get('rarityMin') || ''
    const rarityMax = searchParams.get('rarityMax') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))

    const offset = (page - 1) * limit

    // Build query
    let dbQuery = supabase.from('nfts').select('*', { count: 'exact' })

    // Text search across name and description
    if (query) {
      dbQuery = dbQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,capture.ilike.%${query}%`
      )
    }

    // Color filter (multiple values comma-separated)
    if (color) {
      const colors = color.split(',').filter(Boolean)
      if (colors.length === 1) {
        dbQuery = dbQuery.eq('color', colors[0])
      } else if (colors.length > 1) {
        dbQuery = dbQuery.in('color', colors)
      }
    }

    // Tier filter
    if (tier) {
      const tiers = tier.split(',').filter(Boolean).map(Number)
      if (tiers.length === 1) {
        dbQuery = dbQuery.eq('tier', tiers[0])
      } else if (tiers.length > 1) {
        dbQuery = dbQuery.in('tier', tiers)
      }
    }

    // Era filter
    if (era) {
      const eras = era.split(',').filter(Boolean)
      if (eras.length === 1) {
        dbQuery = dbQuery.eq('era', eras[0])
      } else if (eras.length > 1) {
        dbQuery = dbQuery.in('era', eras)
      }
    }

    // Owner wallet search
    if (ownerWallet) {
      dbQuery = dbQuery.eq('owner_wallet', ownerWallet)
    }

    // Rarity score range
    if (rarityMin) {
      const min = parseFloat(rarityMin)
      if (!isNaN(min)) {
        dbQuery = dbQuery.gte('rarity_score', min)
      }
    }

    if (rarityMax) {
      const max = parseFloat(rarityMax)
      if (!isNaN(max)) {
        dbQuery = dbQuery.lte('rarity_score', max)
      }
    }

    // Order by rarity for search results, then by created_at
    dbQuery = dbQuery
      .order('rarity_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data, error, count } = await dbQuery

    if (error) {
      console.error('Supabase search query error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
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
    console.error('Search API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
