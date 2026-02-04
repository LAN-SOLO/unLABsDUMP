'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type NFT, COLOR_HEX_MAP, TIER_LABELS, TIER_COLORS, type NFTTier } from '@/lib/nft/types'

interface NFTCardProps {
  nft: NFT
  onQuickView?: (nft: NFT) => void
}

function StatusIndicator({ status, owner }: { status: NFT['status']; owner?: string }) {
  switch (status) {
    case 'ready':
      return (
        <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
          Not Minted
        </Badge>
      )
    case 'minted':
      return (
        <Badge
          variant="secondary"
          className="bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 text-xs"
        >
          Available
        </Badge>
      )
    case 'delivered':
      return (
        <Badge
          variant="secondary"
          className="bg-purple-900/50 text-purple-400 border border-purple-500/30 text-xs"
        >
          {owner ? `Owned` : 'Delivered'}
        </Badge>
      )
    default:
      return null
  }
}

export function NFTCard({ nft, onQuickView }: NFTCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const tierColor = TIER_COLORS[nft.tier as NFTTier]
  const tierLabel = TIER_LABELS[nft.tier as NFTTier]
  const colorHex = COLOR_HEX_MAP[nft.color]

  return (
    <Link href={`/nft/${nft.id}`} className="group block">
      <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden py-0 gap-0">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-slate-800">
          {/* Ready status blur overlay */}
          {nft.status === 'ready' && (
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-slate-900/40 flex items-center justify-center">
              <span className="text-slate-400 text-sm font-medium">Not Minted</span>
            </div>
          )}

          {!imageError && nft.thumbnail_url ? (
            <>
              {!imageLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
              <Image
                src={nft.thumbnail_url}
                alt={nft.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={cn(
                  'object-cover transition-transform duration-300 group-hover:scale-105',
                  !imageLoaded && 'opacity-0'
                )}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-2 opacity-40"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="text-slate-500 text-xs">No Image</span>
              </div>
            </div>
          )}

          {/* Quick view button - appears on hover */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="sm"
              className="bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onQuickView?.(nft)
              }}
            >
              <Eye className="size-4 mr-1" />
              Quick View
            </Button>
          </div>

          {/* Color wavelength dot */}
          <div className="absolute top-2 right-2 z-20">
            <div
              className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: colorHex }}
              title={`${nft.color} wavelength`}
            />
          </div>
        </div>

        {/* Card info */}
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-medium text-sm truncate flex-1">{nft.name}</h3>
            <Badge className={cn('text-[10px] px-1.5 py-0 shrink-0', tierColor)}>T{nft.tier}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <StatusIndicator status={nft.status} owner={nft.owner_display_name} />
            <span className="text-slate-500 text-xs">{tierLabel}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function NFTCardSkeleton() {
  return (
    <Card className="bg-slate-900 border-slate-800 overflow-hidden py-0 gap-0">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </Card>
  )
}
