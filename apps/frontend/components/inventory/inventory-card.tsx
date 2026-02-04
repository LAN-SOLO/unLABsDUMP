'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Eye, Tag, Send, ExternalLink } from 'lucide-react'

export interface NftItem {
  id: string
  name: string
  image: string
  mintAddress: string
  traits: {
    color: string
    tier: string
    era: string
  }
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  acquiredAt: string
  isListed: boolean
  listingPrice?: number
}

interface InventoryCardProps {
  nft: NftItem
  selectMode: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  onViewDetails: (nft: NftItem) => void
  onListForSale: (nft: NftItem) => void
  onTransfer: (nft: NftItem) => void
}

const rarityColors: Record<string, string> = {
  common: 'bg-slate-600 text-slate-200',
  uncommon: 'bg-green-900/60 text-green-300 border-green-700/50',
  rare: 'bg-blue-900/60 text-blue-300 border-blue-700/50',
  epic: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  legendary: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
}

const rarityGlow: Record<string, string> = {
  legendary: 'shadow-amber-500/20 shadow-lg',
  epic: 'shadow-purple-500/15 shadow-md',
  rare: 'shadow-blue-500/10 shadow-md',
  uncommon: '',
  common: '',
}

function isRecentlyAcquired(acquiredAt: string): boolean {
  const acquired = new Date(acquiredAt)
  const now = new Date()
  const diffMs = now.getTime() - acquired.getTime()
  return diffMs < 24 * 60 * 60 * 1000
}

export function InventoryCard({
  nft,
  selectMode,
  isSelected,
  onSelect,
  onViewDetails,
  onListForSale,
  onTransfer,
}: InventoryCardProps) {
  const isNew = isRecentlyAcquired(nft.acquiredAt)
  const explorerUrl = `https://explorer.solana.com/address/${nft.mintAddress}`

  return (
    <Card
      className={`group relative border-slate-800 bg-slate-900 transition-all hover:border-slate-700 ${
        rarityGlow[nft.rarity] || ''
      } ${isSelected ? 'ring-2 ring-purple-500 border-purple-500' : ''}`}
    >
      {/* Selection checkbox */}
      {selectMode && (
        <div className="absolute left-3 top-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(nft.id)}
            className="border-slate-500 bg-slate-800/80 backdrop-blur-sm data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
        </div>
      )}

      {/* Badges */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
        {isNew && <Badge className="bg-cyan-500 text-white text-[10px] px-1.5 py-0">NEW</Badge>}
        {nft.isListed && (
          <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0">LISTED</Badge>
        )}
      </div>

      {/* NFT Image */}
      <div
        className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-xl bg-slate-800"
        onClick={() => !selectMode && onViewDetails(nft)}
      >
        <Image
          src={nft.image || '/placeholder-nft.png'}
          alt={nft.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      <CardContent className="space-y-2 p-3">
        {/* Name and Actions */}
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-white">{nft.name}</h3>
            <Badge
              variant="outline"
              className={`mt-1 text-[10px] capitalize ${rarityColors[nft.rarity] || ''}`}
            >
              {nft.rarity}
            </Badge>
          </div>

          {!selectMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-slate-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-slate-700 bg-slate-800">
                <DropdownMenuItem
                  onClick={() => onViewDetails(nft)}
                  className="text-slate-200 hover:text-white focus:text-white"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {!nft.isListed && (
                  <DropdownMenuItem
                    onClick={() => onListForSale(nft)}
                    className="text-slate-200 hover:text-white focus:text-white"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    List for Sale
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onTransfer(nft)}
                  className="text-slate-200 hover:text-white focus:text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Transfer
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-white focus:text-white"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Explorer
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Traits */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(nft.traits).map(([key, value]) => (
            <span
              key={key}
              className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
            >
              {value}
            </span>
          ))}
        </div>

        {/* Listed price */}
        {nft.isListed && nft.listingPrice && (
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <Tag className="h-3 w-3" />
            {nft.listingPrice} SOL
          </div>
        )}
      </CardContent>
    </Card>
  )
}
