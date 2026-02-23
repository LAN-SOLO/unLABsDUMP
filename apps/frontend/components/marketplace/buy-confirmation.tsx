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
    <div className="rounded-sm border border-[#0D3B1E] bg-[#0D1117] p-5 space-y-4">
      <h3 className="text-lg font-semibold text-[#00FF41]">Confirm Purchase</h3>

      {/* NFT preview */}
      <div className="flex items-center gap-3 rounded-sm bg-[#0D3B1E]/20 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#1A3A2A]">
          <img
            src={nftImage || '/placeholder-nft.png'}
            alt={nftName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-[#00FF41]">{nftName}</h4>
          {nftRarity && (
            <Badge variant="outline" className="mt-1 text-[10px] capitalize text-[#00CC33]">
              {nftRarity}
            </Badge>
          )}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 rounded-sm bg-[#0D3B1E]/10 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#00AA2A]">_unITM Price</span>
          <span className="text-[#00FF41]">{formatSol(priceInSol)} SOL</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#00AA2A]">Marketplace Fee ({MARKETPLACE_FEE_PERCENT}%)</span>
          <span className="text-[#00CC33]">{formatSol(fee)} SOL</span>
        </div>
        <Separator className="bg-[#1A3A2A]" />
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-[#00FF41]">Total Cost</span>
          <span className="text-[#00FF41]">{formatSol(total)} SOL</span>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-sm border border-[#FFB000]/30 bg-[#FFB000]/10 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB000]" />
        <p className="text-xs text-[#FFB000]/80">
          Purchases are final. Ensure you have sufficient SOL balance before confirming.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[#1A3A2A] text-[#00CC33] hover:text-[#00FF41]"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-[#00FF41] text-black hover:bg-[#00CC33] text-[#00FF41]"
        >
          <ShoppingCart className="mr-1 h-4 w-4" />
          {loading ? 'Processing...' : `Buy for ${formatSol(total)} SOL`}
        </Button>
      </div>
    </div>
  )
}
