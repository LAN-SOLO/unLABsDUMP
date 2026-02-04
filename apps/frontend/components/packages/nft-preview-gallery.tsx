'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NftPreviewItem {
  id: string
  name: string
  thumbnail_url: string | null
  image_url?: string | null
  tier?: number | null
}

const TIER_LABELS: Record<number, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',
  5: 'Legendary',
}

const TIER_COLORS: Record<number, string> = {
  1: 'bg-slate-600 text-slate-200',
  2: 'bg-green-600/30 text-green-400 border-green-500/30',
  3: 'bg-blue-600/30 text-blue-400 border-blue-500/30',
  4: 'bg-purple-600/30 text-purple-400 border-purple-500/30',
  5: 'bg-amber-600/30 text-amber-400 border-amber-500/30',
}

interface NftPreviewGalleryProps {
  nfts: NftPreviewItem[]
  totalCount?: number
  className?: string
}

export function NftPreviewGallery({ nfts, totalCount, className }: NftPreviewGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const displayCount = totalCount ?? nfts.length

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm font-medium text-slate-400">
        {displayCount} NFT{displayCount !== 1 ? 's' : ''} included
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {nfts.map((nft) => {
          const src = nft.thumbnail_url || nft.image_url || null
          const tierLabel = nft.tier ? TIER_LABELS[nft.tier] : null
          const tierColor = nft.tier ? TIER_COLORS[nft.tier] || '' : ''
          const isHovered = hoveredId === nft.id

          return (
            <div
              key={nft.id}
              className="relative group"
              onMouseEnter={() => setHoveredId(nft.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Thumbnail */}
              <div
                className={cn(
                  'aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer',
                  'bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-lg hover:shadow-purple-500/10'
                )}
              >
                {src ? (
                  <img
                    src={src}
                    alt={nft.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="size-5 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Tier badge */}
              {tierLabel && (
                <div className="absolute top-1 right-1">
                  <Badge
                    variant="outline"
                    className={cn('text-[8px] px-1 py-0 leading-tight', tierColor)}
                  >
                    T{nft.tier}
                  </Badge>
                </div>
              )}

              {/* Hover tooltip - enlarged */}
              {isHovered && (
                <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
                  <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-xl shadow-black/40 w-40">
                    <div className="aspect-square w-full overflow-hidden">
                      {src ? (
                        <img src={src} alt={nft.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <ImageIcon className="size-8 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-white truncate">{nft.name}</p>
                      {tierLabel && (
                        <Badge
                          variant="outline"
                          className={cn('mt-1 text-[9px] px-1.5 py-0', tierColor)}
                        >
                          {tierLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
