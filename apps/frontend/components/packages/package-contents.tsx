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
      return 'bg-slate-600 text-slate-200'
    case 2:
      return 'bg-green-600/30 text-green-400 border-green-500/30'
    case 3:
      return 'bg-blue-600/30 text-blue-400 border-blue-500/30'
    case 4:
      return 'bg-purple-600/30 text-purple-400 border-purple-500/30'
    case 5:
      return 'bg-amber-600/30 text-amber-400 border-amber-500/30'
    default:
      return 'bg-slate-600 text-slate-200'
  }
}

export function PackageContents({ unscAmount, nfts }: PackageContentsProps) {
  const unscNum = parseFloat(unscAmount || '0')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Package Contents</h3>

      {/* _unSC tokens line */}
      {unscNum > 0 && (
        <>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Coins className="size-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium">_unSC Tokens</p>
              <p className="text-sm text-slate-400">In-platform utility token</p>
            </div>
            <p className="text-lg font-bold text-cyan-400">{Number(unscNum).toLocaleString()}</p>
          </div>
          {nfts.length > 0 && <Separator className="bg-slate-700" />}
        </>
      )}

      {/* NFT items */}
      {nfts.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400 font-medium">NFTs ({nfts.length})</p>
          {nfts.map((nft) => {
            const tierLabel = getTierLabel(nft.metadata)
            const tierColor = getTierColor(nft.metadata)

            return (
              <div
                key={nft.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                  {nft.thumbnail_url || nft.image_url ? (
                    <img
                      src={nft.thumbnail_url || nft.image_url || ''}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <ImageIcon className="size-5 text-slate-500" />
                    </div>
                  )}
                </div>

                {/* NFT info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{nft.name}</p>
                  {nft.description && (
                    <p className="text-xs text-slate-400 truncate">{nft.description}</p>
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
        <p className="text-slate-500 text-sm">No contents listed.</p>
      )}
    </div>
  )
}
