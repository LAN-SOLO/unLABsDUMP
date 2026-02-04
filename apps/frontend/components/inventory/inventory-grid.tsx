'use client'

import { InventoryCard, type NftItem } from './inventory-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface InventoryGridProps {
  nfts: NftItem[]
  isLoading: boolean
  selectMode: boolean
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onViewDetails: (nft: NftItem) => void
  onListForSale: (nft: NftItem) => void
  onTransfer: (nft: NftItem) => void
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-12">
      <div className="mb-4 rounded-full bg-slate-800 p-4">
        <Package className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">No NFTs yet</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-slate-400">
        Your inventory is empty. Open packages to start your collection or browse the marketplace
        for available NFTs.
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/packages">Open Packages</Link>
        </Button>
        <Button asChild variant="outline" className="border-slate-700 text-slate-200">
          <Link href="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    </div>
  )
}

export function InventoryGrid({
  nfts,
  isLoading,
  selectMode,
  selectedIds,
  onSelect,
  onViewDetails,
  onListForSale,
  onTransfer,
}: InventoryGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (nfts.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {nfts.map((nft) => (
        <InventoryCard
          key={nft.id}
          nft={nft}
          selectMode={selectMode}
          isSelected={selectedIds.has(nft.id)}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
          onListForSale={onListForSale}
          onTransfer={onTransfer}
        />
      ))}
    </div>
  )
}
