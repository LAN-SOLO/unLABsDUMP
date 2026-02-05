'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatSol, calculateMarketplaceFee, calculateSellerProceeds } from '@/lib/trading/fees'
import { formatTimeRemaining, calculateExpiryDate } from '@/lib/trading/listing'
import { Clock, Tag, Eye } from 'lucide-react'
import type { NftItem } from '@/components/inventory/inventory-card'

interface ListingPreviewProps {
  nft: NftItem
  priceInSol: number | null
  durationDays: number
}

export function ListingPreview({ nft, priceInSol, durationDays }: ListingPreviewProps) {
  const price = priceInSol ?? 0
  const fee = calculateMarketplaceFee(price)
  const proceeds = calculateSellerProceeds(price)
  const expiry = calculateExpiryDate(durationDays)

  return (
    <Card className="border-[#1A3A2A] bg-[#0D3B1E]/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#00AA2A]" />
          <CardTitle className="text-sm text-[#00CC33]">Listing Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* NFT Preview Card */}
        <div className="overflow-hidden rounded-sm border border-[#1A3A2A] bg-[#0D1117]">
          <div className="relative aspect-video w-full overflow-hidden bg-[#111318]">
            <img
              src={nft.image || '/placeholder-nft.png'}
              alt={nft.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#00FF41]">{nft.name}</h4>
                <Badge variant="outline" className="mt-1 text-[10px] capitalize text-[#00CC33]">
                  {nft.rarity}
                </Badge>
              </div>
              {price > 0 && (
                <div className="text-right">
                  <p className="text-lg font-bold text-[#00FF41]">{formatSol(price)}</p>
                  <p className="text-[10px] text-[#1A6B35]">SOL</p>
                </div>
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

            {/* Duration */}
            {expiry && (
              <div className="flex items-center gap-1 text-xs text-[#00AA2A]">
                <Clock className="h-3 w-3" />
                Expires in {formatTimeRemaining(expiry.toISOString())}
              </div>
            )}
            {!expiry && durationDays === 0 && (
              <div className="flex items-center gap-1 text-xs text-[#00AA2A]">
                <Clock className="h-3 w-3" />
                No expiry
              </div>
            )}

            {/* Buy button preview */}
            <Button disabled className="w-full bg-[#00FF41]/50 text-black/50" size="sm">
              <Tag className="mr-1 h-3 w-3" />
              Buy Now
            </Button>
          </div>
        </div>

        {/* Fee breakdown */}
        {price > 0 && (
          <>
            <Separator className="bg-[#1A3A2A]" />
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#00AA2A]">
                <span>Listing Price</span>
                <span className="text-[#00FF41]">{formatSol(price)} SOL</span>
              </div>
              <div className="flex justify-between text-[#00AA2A]">
                <span>Marketplace Fee (2.5%)</span>
                <span className="text-[#FF3333]">-{formatSol(fee)} SOL</span>
              </div>
              <Separator className="bg-[#1A3A2A]" />
              <div className="flex justify-between font-medium">
                <span className="text-[#00CC33]">You Receive</span>
                <span className="text-[#00FF41]">{formatSol(proceeds)} SOL</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
