import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const paramsSchema = z.object({
  id: z.string().uuid(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const parsed = paramsSchema.safeParse({ id })

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid package ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch the package
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', parsed.data.id)
      .eq('status', 'active')
      .single()

    if (pkgError || !pkg) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 })
    }

    // Fetch full NFT list for this package
    const nftIds = pkg.nft_ids as string[]
    let nfts: Array<{
      id: string
      name: string
      description: string | null
      image_url: string | null
      thumbnail_url: string | null
      metadata: Record<string, unknown>
      status: string
      rarity_score: string | null
    }> = []

    if (nftIds && nftIds.length > 0) {
      const { data: nftData } = await supabase
        .from('nfts')
        .select('id, name, description, image_url, thumbnail_url, metadata, status, rarity_score')
        .in('id', nftIds)

      nfts = (nftData || []).map((nft) => ({
        ...nft,
        metadata: nft.metadata as Record<string, unknown>,
      }))
    }

    // Fetch related packages (same category, excluding current)
    const { data: relatedPackages } = await supabase
      .from('packages')
      .select(
        'id, name, description, price_sol, unsc_amount, nft_ids, total_supply, sold_count, featured, category'
      )
      .eq('status', 'active')
      .eq('category', pkg.category || 'standard')
      .neq('id', pkg.id)
      .limit(4)

    const relatedWithCounts = (relatedPackages || []).map((rp) => ({
      ...rp,
      nft_count: (rp.nft_ids as string[])?.length || 0,
    }))

    // Calculate availability
    const remaining =
      pkg.total_supply != null
        ? pkg.total_supply - (pkg.sold_count || 0) - (pkg.reserved_count || 0)
        : null
    const isSoldOut = remaining !== null && remaining <= 0

    return NextResponse.json({
      success: true,
      data: {
        ...pkg,
        nfts,
        nft_count: nftIds ? nftIds.length : 0,
        remaining,
        is_sold_out: isSoldOut,
        related_packages: relatedWithCounts,
      },
    })
  } catch (error) {
    console.error('Package detail API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
