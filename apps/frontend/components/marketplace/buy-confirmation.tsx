'use client'

import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ShoppingCart } from 'lucide-react'
import {
  formatSol,
  calculateMarketplaceFee,
  calculateTotalCost,
  MARKETPLACE_FEE_PERCENT,
} from '@/lib/trading/fees'

interface BuyConfirmationProps {
  nftName: string
  nftImage: string | null
  nftRarity?: string
  priceInSol: number
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function BuyConfirmation({
  nftName,
  nftImage,
  nftRarity,
  priceInSol,
  onConfirm,
  onCancel,
  loading = false,
}: BuyConfirmationProps) {
  const fee = calculateMarketplaceFee(priceInSol)
  const total = calculateTotalCost(priceInSol)

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-4">
      <h3 className="text-lg font-semibold text-white">Confirm Purchase</h3>

      {/* NFT preview */}
      <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-700">
          <img
            src={nftImage || '/placeholder-nft.png'}
            alt={nftName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-white">{nftName}</h4>
          {nftRarity && (
            <Badge variant="outline" className="mt-1 text-[10px] capitalize text-slate-300">
              {nftRarity}
            </Badge>
          )}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 rounded-lg bg-slate-800/30 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">NFT Price</span>
          <span className="text-white">{formatSol(priceInSol)} SOL</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Marketplace Fee ({MARKETPLACE_FEE_PERCENT}%)</span>
          <span className="text-slate-300">{formatSol(fee)} SOL</span>
        </div>
        <Separator className="bg-slate-700" />
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-slate-200">Total Cost</span>
          <span className="text-purple-400">{formatSol(total)} SOL</span>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-800/50 bg-amber-950/30 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-300/80">
          Purchases are final. Ensure you have sufficient SOL balance before confirming.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-slate-700 text-slate-300 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <ShoppingCart className="mr-1 h-4 w-4" />
          {loading ? 'Processing...' : `Buy for ${formatSol(total)} SOL`}
        </Button>
      </div>
    </div>
  )
}
