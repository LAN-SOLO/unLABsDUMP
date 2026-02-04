import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('nfts')
    .select('id, name, color, tier')
    .ilike('name', `%${q}%`)
    .limit(8)

  return NextResponse.json({
    suggestions: (data || []).map((nft) => ({
      id: nft.id,
      label: nft.name,
      sublabel: `Tier ${nft.tier} • ${nft.color}`,
    })),
  })
}
