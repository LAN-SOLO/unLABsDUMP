import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { SLICES_PER_NFT } from '@/lib/mintpool/config'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('player_session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseAdminClient()

    // Get all slices for this player
    const { data: slices, error } = await supabase
      .from('mint_pool_slices')
      .select('*')
      .eq('player_id', session.playerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch slices:', error)
      return NextResponse.json({ error: 'Failed to fetch slices' }, { status: 500 })
    }

    // Group slices by NFT
    const nftSliceMap = new Map<
      string,
      { nft_id: string; slices: typeof slices; count: number; total_required: number }
    >()

    for (const slice of slices || []) {
      const existing = nftSliceMap.get(slice.nft_id)
      if (existing) {
        existing.slices.push(slice)
        existing.count++
      } else {
        nftSliceMap.set(slice.nft_id, {
          nft_id: slice.nft_id,
          slices: [slice],
          count: 1,
          total_required: slice.total_slices_required || SLICES_PER_NFT,
        })
      }
    }

    // Get NFT details for each
    const nftIds = Array.from(nftSliceMap.keys())
    const nftDetails: Record<string, { id: string; name: string; image_url: string | null }> = {}

    if (nftIds.length > 0) {
      const { data: nfts } = await supabase
        .from('nfts')
        .select('id, name, image_url, thumbnail_url')
        .in('id', nftIds)

      for (const nft of nfts || []) {
        nftDetails[nft.id] = {
          id: nft.id,
          name: nft.name,
          image_url: nft.thumbnail_url || nft.image_url,
        }
      }
    }

    const grouped = Array.from(nftSliceMap.values()).map((entry) => ({
      nft_id: entry.nft_id,
      nft_name: nftDetails[entry.nft_id]?.name || 'Unknown',
      nft_image: nftDetails[entry.nft_id]?.image_url || null,
      slices_owned: entry.count,
      slices_required: entry.total_required,
      can_assemble: entry.count >= entry.total_required,
      slice_ids: entry.slices.map((s) => s.id),
    }))

    return NextResponse.json({ slices: grouped })
  } catch (error) {
    console.error('Slices fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
