import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const querySchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'popularity', 'newest']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      category: searchParams.get('category') || undefined,
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

    const { category, sort, page, limit } = parsed.data
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Build query for active packages (only needed columns)
    let query = supabase
      .from('packages')
      .select(
        'id, name, description, category, price_sol, unsc_amount, nft_ids, total_supply, sold_count, reserved_count, featured, sale_starts_at, sale_ends_at, created_at',
        { count: 'exact' }
      )
      .eq('status', 'active')

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price_sol', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price_sol', { ascending: false })
        break
      case 'popularity':
        query = query.order('sold_count', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: packages, error, count } = await query

    if (error) {
      console.error('Failed to fetch packages:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch packages' },
        { status: 500 }
      )
    }

    // Batch-fetch NFT previews (single query instead of per-package)
    const allPreviewIds = new Set<string>()
    for (const pkg of packages || []) {
      const nftIds = pkg.nft_ids as string[]
      if (nftIds?.length > 0) {
        for (const id of nftIds.slice(0, 3)) {
          allPreviewIds.add(id)
        }
      }
    }

    const nftMap = new Map<
      string,
      { id: string; name: string; thumbnail_url: string | null; metadata: Record<string, unknown> }
    >()

    if (allPreviewIds.size > 0) {
      const { data: nfts } = await supabase
        .from('nfts')
        .select('id, name, thumbnail_url, image_url, metadata')
        .in('id', Array.from(allPreviewIds))

      for (const nft of nfts || []) {
        nftMap.set(nft.id, {
          id: nft.id,
          name: nft.name,
          thumbnail_url: nft.thumbnail_url || nft.image_url,
          metadata: nft.metadata as Record<string, unknown>,
        })
      }
    }

    const packagesWithPreviews = (packages || []).map((pkg) => {
      const nftIds = pkg.nft_ids as string[]
      const previewIds = nftIds?.slice(0, 3) || []
      return {
        ...pkg,
        nft_previews: previewIds.map((id) => nftMap.get(id)).filter(Boolean),
        nft_count: nftIds ? nftIds.length : 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: packagesWithPreviews,
        total: count || 0,
        page,
        pageSize: limit,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Packages API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
