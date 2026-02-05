'use client'

import { Package, Coins, ImageIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { formatSol } from '@/lib/purchase/transaction'

interface PurchaseSummaryProps {
  packageName: string
  priceInSol: number
  unscAmount: string
  nftCount: number
}

export function PurchaseSummary({
  packageName,
  priceInSol,
  unscAmount,
  nftCount,
}: PurchaseSummaryProps) {
  const unscNum = parseFloat(unscAmount || '0')
  const usdEstimate = (priceInSol * 150).toFixed(2)

  return (
    <div className="rounded-sm bg-[#0D3B1E]/20 border border-[#1A3A2A] overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 bg-[#111318]/80">
        <div className="w-10 h-10 rounded-sm bg-[#00FF41]/20 flex items-center justify-center">
          <Package className="size-5 text-[#00FF41]" />
        </div>
        <div>
          <p className="font-semibold text-[#00FF41]">{packageName}</p>
          <p className="text-xs text-[#00AA2A]">Order Summary</p>
        </div>
      </div>

      <Separator className="bg-[#1A3A2A]" />

      {/* Contents */}
      <div className="p-4 space-y-3">
        {nftCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[#00CC33]">
              <ImageIcon className="size-4 text-[#00FF41]" />
              <span>NFTs</span>
            </div>
            <span className="text-[#00FF41]">
              {nftCount} item{nftCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {unscNum > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[#00CC33]">
              <Coins className="size-4 text-[#00FFFF]" />
              <span>_unSC Tokens</span>
            </div>
            <span className="text-[#00FFFF] font-medium">{Number(unscNum).toLocaleString()}</span>
          </div>
        )}
      </div>

      <Separator className="bg-[#1A3A2A]" />

      {/* Total */}
      <div className="p-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-[#00AA2A]">Total</span>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#00FF41]">{formatSol(priceInSol)} SOL</p>
            <p className="text-xs text-[#1A6B35]">~${usdEstimate} USD</p>
          </div>
        </div>
      </div>
    </div>
  )
}
