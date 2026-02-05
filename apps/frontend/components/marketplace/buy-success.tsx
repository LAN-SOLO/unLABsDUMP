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
    <div className="rounded-sm border border-[#0D3B1E] bg-[#0D1117] p-6 flex flex-col items-center text-center space-y-4">
      {/* Success icon */}
      <div className="rounded-full bg-[#0D3B1E]/30 p-4">
        <CheckCircle className="h-10 w-10 text-[#00FF41]" />
      </div>

      {/* Heading */}
      <div>
        <h3 className="text-xl font-bold text-[#00FF41]">Purchase Complete!</h3>
        <p className="mt-1 text-sm text-[#00AA2A]">Your NFT has been added to your inventory.</p>
      </div>

      {/* Transaction signature */}
      {transactionSignature && (
        <div className="w-full rounded-sm bg-[#0D3B1E]/20 p-3">
          <p className="text-xs text-[#1A6B35] mb-1">Transaction</p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-sm text-[#00FF41] hover:text-[#00FF41] transition-colors"
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
          className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33] text-[#00FF41]"
        >
          View in Inventory
        </Button>
        <Button
          variant="outline"
          onClick={onBackToMarketplace}
          className="w-full border-[#1A3A2A] text-[#00CC33] hover:text-[#00FF41]"
        >
          Back to Marketplace
        </Button>
      </div>
    </div>
  )
}
