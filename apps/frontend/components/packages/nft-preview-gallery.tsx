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
  1: 'bg-[#1A3A2A] text-[#00FF41]',
  2: 'bg-[#0D3B1E]/30 text-[#00FF41] border-[#00FF41]/30',
  3: 'bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30',
  4: 'bg-[#0D3B1E]/30 text-[#00FF41] border-[#00FF41]/30',
  5: 'bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30',
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
      <p className="text-sm font-medium text-[#00AA2A]">{displayCount} _unITM included</p>

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
                  'aspect-square rounded-sm overflow-hidden border transition-all cursor-pointer',
                  'bg-[#111318] border-[#1A3A2A] hover:border-[#0D3B1E] hover:shadow-lg hover:shadow-[#00FF41]/10'
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
                    <ImageIcon className="size-5 text-[#1A6B35]" />
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
                  <div className="rounded-sm overflow-hidden border border-[#1A3A2A] bg-[#0D1117] shadow-xl shadow-black/40 w-40">
                    <div className="aspect-square w-full overflow-hidden">
                      {src ? (
                        <img src={src} alt={nft.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#111318] flex items-center justify-center">
                          <ImageIcon className="size-8 text-[#1A6B35]" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-[#00FF41] truncate">{nft.name}</p>
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
