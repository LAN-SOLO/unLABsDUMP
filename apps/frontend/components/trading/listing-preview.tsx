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
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-400" />
          <CardTitle className="text-sm text-slate-300">Listing Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* NFT Preview Card */}
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
          <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
            <img
              src={nft.image || '/placeholder-nft.png'}
              alt={nft.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{nft.name}</h4>
                <Badge variant="outline" className="mt-1 text-[10px] capitalize text-slate-300">
                  {nft.rarity}
                </Badge>
              </div>
              {price > 0 && (
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatSol(price)}</p>
                  <p className="text-[10px] text-slate-500">SOL</p>
                </div>
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

            {/* Duration */}
            {expiry && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                Expires in {formatTimeRemaining(expiry.toISOString())}
              </div>
            )}
            {!expiry && durationDays === 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                No expiry
              </div>
            )}

            {/* Buy button preview */}
            <Button disabled className="w-full bg-purple-600/50 text-white/50" size="sm">
              <Tag className="mr-1 h-3 w-3" />
              Buy Now
            </Button>
          </div>
        </div>

        {/* Fee breakdown */}
        {price > 0 && (
          <>
            <Separator className="bg-slate-700" />
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Listing Price</span>
                <span className="text-slate-200">{formatSol(price)} SOL</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Marketplace Fee (2.5%)</span>
                <span className="text-red-400">-{formatSol(fee)} SOL</span>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex justify-between font-medium">
                <span className="text-slate-300">You Receive</span>
                <span className="text-green-400">{formatSol(proceeds)} SOL</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
