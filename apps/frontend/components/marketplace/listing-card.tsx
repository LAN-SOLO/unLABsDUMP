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
  common: 'text-slate-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
}

export function ListingCard({ listing, onBuy }: ListingCardProps) {
  const timeRemaining = formatTimeRemaining(listing.expiresAt)
  const truncatedSeller = `${listing.sellerAddress.slice(0, 4)}...${listing.sellerAddress.slice(-4)}`

  return (
    <Card className="group border-slate-800 bg-slate-900 transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-purple-500/5">
      {/* NFT Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-slate-800">
        <img
          src={listing.nftImage || '/placeholder-nft.png'}
          alt={listing.nftName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Price overlay */}
        <div className="absolute bottom-2 left-2 rounded-md bg-slate-950/80 px-2 py-1 backdrop-blur-sm">
          <p className="text-sm font-bold text-white">{formatSol(listing.priceInSol)} SOL</p>
        </div>
      </div>

      <CardContent className="space-y-3 p-3">
        {/* Name and Rarity */}
        <div>
          <h3 className="truncate text-sm font-semibold text-white">{listing.nftName}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] capitalize ${rarityColors[listing.nftRarity] || 'text-slate-400'}`}
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
              className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
            >
              {value}
            </span>
          ))}
        </div>

        {/* Seller */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Seller</span>
          <span className="font-mono text-slate-400">{truncatedSeller}</span>
        </div>

        {/* Time remaining */}
        {listing.expiresAt && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </div>
        )}

        {/* Buy button */}
        <Button
          onClick={() => onBuy(listing)}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
          Buy Now
        </Button>
      </CardContent>
    </Card>
  )
}
