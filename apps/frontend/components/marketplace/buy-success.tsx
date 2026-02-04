'use client'

import { CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BuySuccessProps {
  transactionSignature: string
  onViewInventory: () => void
  onBackToMarketplace: () => void
}

function truncateSignature(sig: string): string {
  if (sig.length <= 16) return sig
  return `${sig.slice(0, 8)}...${sig.slice(-8)}`
}

export function BuySuccess({
  transactionSignature,
  onViewInventory,
  onBackToMarketplace,
}: BuySuccessProps) {
  const explorerUrl = `https://explorer.solana.com/tx/${transactionSignature}`

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 flex flex-col items-center text-center space-y-4">
      {/* Success icon */}
      <div className="rounded-full bg-green-900/30 p-4">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>

      {/* Heading */}
      <div>
        <h3 className="text-xl font-bold text-white">Purchase Complete!</h3>
        <p className="mt-1 text-sm text-slate-400">Your NFT has been added to your inventory.</p>
      </div>

      {/* Transaction signature */}
      {transactionSignature && (
        <div className="w-full rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-500 mb-1">Transaction</p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {truncateSignature(transactionSignature)}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full pt-2">
        <Button
          onClick={onViewInventory}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          View in Inventory
        </Button>
        <Button
          variant="outline"
          onClick={onBackToMarketplace}
          className="w-full border-slate-700 text-slate-300 hover:text-white"
        >
          Back to Marketplace
        </Button>
      </div>
    </div>
  )
}
