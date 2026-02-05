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
  common: 'bg-[#0D3B1E]/40 text-[#00FF41]',
  uncommon: 'bg-[#0D3B1E]/40 text-[#00CC33] border-[#00FF41]/30',
  rare: 'bg-[#00FFFF]/15 text-[#00FFFF] border-[#00FFFF]/30',
  epic: 'bg-[#0D3B1E]/60 text-[#00CC33] border-[#1A3A2A]',
  legendary: 'bg-[#FFB000]/15 text-[#FFB000] border-[#FFB000]/30',
}

const rarityGlow: Record<string, string> = {
  legendary: 'shadow-[#FFB000]/20 shadow-lg',
  epic: 'shadow-[#00FF41]/15 shadow-md',
  rare: 'shadow-[#00FFFF]/10 shadow-md',
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
      className={`group relative border-[#0D3B1E] bg-[#0D1117] transition-all hover:border-[#1A3A2A] ${
        rarityGlow[nft.rarity] || ''
      } ${isSelected ? 'ring-2 ring-[#00FF41] border-[#00FF41]' : ''}`}
    >
      {/* Selection checkbox */}
      {selectMode && (
        <div className="absolute left-3 top-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(nft.id)}
            className="border-[#1A6B35] bg-[#111318]/80 backdrop-blur-sm data-[state=checked]:bg-[#00FF41] data-[state=checked]:border-[#00FF41]"
          />
        </div>
      )}

      {/* Badges */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
        {isNew && <Badge className="bg-[#00FFFF] text-black text-[10px] px-1.5 py-0">NEW</Badge>}
        {nft.isListed && (
          <Badge className="bg-[#FFB000] text-black text-[10px] px-1.5 py-0">LISTED</Badge>
        )}
      </div>

      {/* NFT Image */}
      <div
        className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-sm bg-[#111318]"
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
            <h3 className="truncate text-sm font-semibold text-[#00FF41]">{nft.name}</h3>
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
                  className="shrink-0 text-[#00AA2A] hover:text-[#00FF41]"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-[#1A3A2A] bg-[#111318]">
                <DropdownMenuItem
                  onClick={() => onViewDetails(nft)}
                  className="text-[#00FF41] hover:text-[#00FF41] focus:text-[#00FF41]"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {!nft.isListed && (
                  <DropdownMenuItem
                    onClick={() => onListForSale(nft)}
                    className="text-[#00FF41] hover:text-[#00FF41] focus:text-[#00FF41]"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    List for Sale
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onTransfer(nft)}
                  className="text-[#00FF41] hover:text-[#00FF41] focus:text-[#00FF41]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Transfer
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#1A3A2A]" />
                <DropdownMenuItem asChild>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00FF41] hover:text-[#00FF41] focus:text-[#00FF41]"
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
              className="rounded bg-[#111318] px-1.5 py-0.5 text-[10px] text-[#00AA2A]"
            >
              {value}
            </span>
          ))}
        </div>

        {/* Listed price */}
        {nft.isListed && nft.listingPrice && (
          <div className="flex items-center gap-1 text-xs text-[#FFB000]">
            <Tag className="h-3 w-3" />
            {nft.listingPrice} SOL
          </div>
        )}
      </CardContent>
    </Card>
  )
}
