'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSol } from '@/lib/trading/fees'
import { formatTimeRemaining } from '@/lib/trading/listing'
import { Clock, ShoppingCart } from 'lucide-react'

export interface MarketplaceListing {
  id: string
  nftId: string
  nftName: string
  nftImage: string
  nftRarity: string
  traits: {
    color: string
    tier: string
    era: string
  }
  priceInSol: number
  sellerAddress: string
  expiresAt: string | null
  createdAt: string
}

interface ListingCardProps {
  listing: MarketplaceListing
  onBuy: (listing: MarketplaceListing) => void
}

const rarityColors: Record<string, string> = {
  common: 'text-[#00AA2A]',
  uncommon: 'text-[#00FF41]',
  rare: 'text-[#00FFFF]',
  epic: 'text-[#00FF41]',
  legendary: 'text-[#FFB000]',
}

export function ListingCard({ listing, onBuy }: ListingCardProps) {
  const timeRemaining = formatTimeRemaining(listing.expiresAt)
  const truncatedSeller = `${listing.sellerAddress.slice(0, 4)}...${listing.sellerAddress.slice(-4)}`

  return (
    <Card className="group border-[#0D3B1E] bg-[#0D1117] transition-all hover:border-[#1A3A2A] hover:shadow-lg hover:shadow-[#00FF41]/5">
      {/* NFT Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-sm bg-[#111318]">
        <img
          src={listing.nftImage || '/placeholder-nft.png'}
          alt={listing.nftName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Price overlay */}
        <div className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-1 backdrop-blur-sm">
          <p className="text-sm font-bold text-[#00FF41]">{formatSol(listing.priceInSol)} SOL</p>
        </div>
      </div>

      <CardContent className="space-y-3 p-3">
        {/* Name and Rarity */}
        <div>
          <h3 className="truncate text-sm font-semibold text-[#00FF41]">{listing.nftName}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] capitalize ${rarityColors[listing.nftRarity] || 'text-[#00AA2A]'}`}
            >
              {listing.nftRarity}
            </Badge>
          </div>
        </div>

        {/* Traits */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(listing.traits).map(([key, value]) => (
            <span
              key={key}
              className="rounded bg-[#111318] px-1.5 py-0.5 text-[10px] text-[#00AA2A]"
            >
              {value}
            </span>
          ))}
        </div>

        {/* Seller */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#1A6B35]">Seller</span>
          <span className="font-mono text-[#00AA2A]">{truncatedSeller}</span>
        </div>

        {/* Time remaining */}
        {listing.expiresAt && (
          <div className="flex items-center gap-1 text-xs text-[#00AA2A]">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </div>
        )}

        {/* Buy button */}
        <Button
          onClick={() => onBuy(listing)}
          className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33]"
          size="sm"
        >
          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
          Buy Now
        </Button>
      </CardContent>
    </Card>
  )
}
