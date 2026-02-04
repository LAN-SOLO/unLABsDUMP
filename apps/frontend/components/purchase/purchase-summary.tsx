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
    <div className="rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 bg-slate-800/80">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Package className="size-5 text-purple-400" />
        </div>
        <div>
          <p className="font-semibold text-white">{packageName}</p>
          <p className="text-xs text-slate-400">Order Summary</p>
        </div>
      </div>

      <Separator className="bg-slate-700" />

      {/* Contents */}
      <div className="p-4 space-y-3">
        {nftCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <ImageIcon className="size-4 text-purple-400" />
              <span>NFTs</span>
            </div>
            <span className="text-white">
              {nftCount} item{nftCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {unscNum > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Coins className="size-4 text-cyan-400" />
              <span>_unSC Tokens</span>
            </div>
            <span className="text-cyan-400 font-medium">{Number(unscNum).toLocaleString()}</span>
          </div>
        )}
      </div>

      <Separator className="bg-slate-700" />

      {/* Total */}
      <div className="p-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-slate-400">Total</span>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatSol(priceInSol)} SOL</p>
            <p className="text-xs text-slate-500">~${usdEstimate} USD</p>
          </div>
        </div>
      </div>
    </div>
  )
}
