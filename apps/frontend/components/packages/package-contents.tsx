'use client'

import { Coins, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface NftItem {
  id: string
  name: string
  description?: string | null
  image_url?: string | null
  thumbnail_url?: string | null
  metadata: Record<string, unknown>
  rarity_score?: string | null
}

interface PackageContentsProps {
  unscAmount: string
  nfts: NftItem[]
}

function getTierLabel(metadata: Record<string, unknown>): string | null {
  const tier = metadata?.tier
  if (tier == null) return null
  const labels: Record<number, string> = {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary',
  }
  return labels[tier as number] || `Tier ${tier}`
}

function getTierColor(metadata: Record<string, unknown>): string {
  const tier = metadata?.tier
  switch (tier) {
    case 1:
      return 'bg-[#1A3A2A] text-[#00FF41]'
    case 2:
      return 'bg-[#0D3B1E]/30 text-[#00FF41] border-[#00FF41]/30'
    case 3:
      return 'bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30'
    case 4:
      return 'bg-[#0D3B1E]/30 text-[#00FF41] border-[#00FF41]/30'
    case 5:
      return 'bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30'
    default:
      return 'bg-[#1A3A2A] text-[#00FF41]'
  }
}

export function PackageContents({ unscAmount, nfts }: PackageContentsProps) {
  const unscNum = parseFloat(unscAmount || '0')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#00FF41]">Package Contents</h3>

      {/* _unSC tokens line */}
      {unscNum > 0 && (
        <>
          <div className="flex items-center gap-3 p-3 rounded-sm bg-[#0D3B1E]/20 border border-[#1A3A2A]">
            <div className="w-10 h-10 rounded-full bg-[#00FFFF]/20 flex items-center justify-center shrink-0">
              <Coins className="size-5 text-[#00FFFF]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#00FF41] font-medium">_unSC Tokens</p>
              <p className="text-sm text-[#00AA2A]">In-platform utility token</p>
            </div>
            <p className="text-lg font-bold text-[#00FFFF]">{Number(unscNum).toLocaleString()}</p>
          </div>
          {nfts.length > 0 && <Separator className="bg-[#1A3A2A]" />}
        </>
      )}

      {/* _unITM items */}
      {nfts.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[#00AA2A] font-medium">_unITM ({nfts.length})</p>
          {nfts.map((nft) => {
            const tierLabel = getTierLabel(nft.metadata)
            const tierColor = getTierColor(nft.metadata)

            return (
              <div
                key={nft.id}
                className="flex items-center gap-3 p-3 rounded-sm bg-[#0D3B1E]/20 border border-[#1A3A2A] hover:border-[#0D3B1E] transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-sm overflow-hidden border border-[#1A3A2A] shrink-0">
                  {nft.thumbnail_url || nft.image_url ? (
                    <img
                      src={nft.thumbnail_url || nft.image_url || ''}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1A3A2A] flex items-center justify-center">
                      <ImageIcon className="size-5 text-[#1A6B35]" />
                    </div>
                  )}
                </div>

                {/* NFT info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#00FF41] font-medium truncate">{nft.name}</p>
                  {nft.description && (
                    <p className="text-xs text-[#00AA2A] truncate">{nft.description}</p>
                  )}
                </div>

                {/* Tier badge */}
                {tierLabel && (
                  <Badge variant="outline" className={`${tierColor} text-xs shrink-0`}>
                    {tierLabel}
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      )}

      {nfts.length === 0 && unscNum <= 0 && (
        <p className="text-[#1A6B35] text-sm">No contents listed.</p>
      )}
    </div>
  )
}
