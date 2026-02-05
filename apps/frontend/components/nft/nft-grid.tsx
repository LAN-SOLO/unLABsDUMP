'use client'

import React from 'react'
import { NFTCard, NFTCardSkeleton } from '@/components/nft/nft-card'
import type { NFT } from '@/lib/nft/types'
import { PackageOpen } from 'lucide-react'

interface NFTGridProps {
  nfts: NFT[]
  loading?: boolean
  skeletonCount?: number
  onQuickView?: (nft: NFT) => void
  emptyMessage?: string
}

export function NFTGrid({
  nfts,
  loading = false,
  skeletonCount = 12,
  onQuickView,
  emptyMessage = 'No NFTs found matching your criteria.',
}: NFTGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <PackageOpen className="size-16 text-[#1A6B35] mb-4" />
        <h3 className="text-lg font-medium text-[#00CC33] mb-2">No NFTs Found</h3>
        <p className="text-[#1A6B35] text-sm text-center max-w-md">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} onQuickView={onQuickView} />
      ))}
    </div>
  )
}
