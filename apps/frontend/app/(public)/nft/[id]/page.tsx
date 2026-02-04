import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { NFTDetailView } from '@/components/nft/nft-detail-view'
import { TIER_LABELS, type NFTTier } from '@/lib/nft/types'

interface NFTDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: NFTDetailPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: nft } = await supabase
      .from('nfts')
      .select('name, description, color, tier, image_url')
      .eq('id', id)
      .single()

    if (!nft) {
      return {
        title: 'NFT Not Found | UnstableLabs',
        description: 'The requested NFT could not be found.',
      }
    }

    const tierLabel = TIER_LABELS[nft.tier as NFTTier] || `Tier ${nft.tier}`

    return {
      title: `${nft.name} | UnstableLabs NFT`,
      description:
        nft.description ||
        `${nft.name} - ${nft.color} wavelength, ${tierLabel} tier NFT from the UnstableLabs collection.`,
      openGraph: {
        title: `${nft.name} | UnstableLabs NFT`,
        description:
          nft.description ||
          `${nft.color} wavelength, ${tierLabel} tier NFT from the UnstableLabs collection.`,
        images: nft.image_url ? [{ url: nft.image_url }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${nft.name} | UnstableLabs NFT`,
        description: nft.description || `${nft.color} wavelength, ${tierLabel} tier NFT.`,
        images: nft.image_url ? [nft.image_url] : [],
      },
    }
  } catch {
    return {
      title: 'NFT | UnstableLabs',
      description: 'View NFT details on UnstableLabs.',
    }
  }
}

export default async function NFTDetailPage({ params }: NFTDetailPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NFTDetailView id={id} />
      </div>
    </div>
  )
}
