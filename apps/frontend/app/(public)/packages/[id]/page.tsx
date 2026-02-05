import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PackageDetail } from '@/components/packages/package-detail'

interface PackageDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { id } = await params

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch the package
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (pkgError || !pkg) {
    notFound()
  }

  // Fetch NFTs for this package
  const nftIds = (pkg.nft_ids as string[]) || []
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

  if (nftIds.length > 0) {
    const { data: nftData } = await supabase
      .from('nfts')
      .select('id, name, description, image_url, thumbnail_url, metadata, status, rarity_score')
      .in('id', nftIds)

    nfts = (nftData || []).map((nft) => ({
      ...nft,
      metadata: nft.metadata as Record<string, unknown>,
    }))
  }

  // Fetch related packages
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
    nft_count: ((rp.nft_ids as string[]) || []).length,
  }))

  // Calculate availability
  const remaining =
    pkg.total_supply != null
      ? pkg.total_supply - (pkg.sold_count || 0) - (pkg.reserved_count || 0)
      : null
  const isSoldOut = remaining !== null && remaining <= 0

  const packageData = {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    category: pkg.category,
    price_sol: pkg.price_sol,
    unsc_amount: pkg.unsc_amount || '0',
    nft_ids: nftIds,
    total_supply: pkg.total_supply,
    sold_count: pkg.sold_count || 0,
    reserved_count: pkg.reserved_count || 0,
    featured: pkg.featured || false,
    sale_starts_at: pkg.sale_starts_at,
    sale_ends_at: pkg.sale_ends_at,
    nfts,
    nft_count: nftIds.length,
    remaining,
    is_sold_out: isSoldOut,
    related_packages: relatedWithCounts,
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PackageDetail packageData={packageData} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PackageDetailPageProps) {
  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return { title: 'Package Not Found' }
  }

  const supabase = await createClient()
  const { data: pkg } = await supabase
    .from('packages')
    .select('name, description')
    .eq('id', id)
    .single()

  if (!pkg) {
    return { title: 'Package Not Found' }
  }

  return {
    title: `${pkg.name} | UnstableLabs`,
    description: pkg.description || `Purchase the ${pkg.name} package on UnstableLabs.`,
  }
}
