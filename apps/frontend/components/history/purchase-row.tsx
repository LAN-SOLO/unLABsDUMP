'use client'

import Link from 'next/link'
import { ExternalLink, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge, DeliveryStatus } from './delivery-status'
import { formatSol } from '@/lib/purchase/transaction'
import { getExplorerUrl } from '@/lib/purchase/submit'

interface PurchaseRowData {
  id: string
  package_name: string
  package_price_sol: string
  unsc_amount: string
  nft_ids: string[]
  payment_transaction: string | null
  status: string
  created_at: string
  deliveries: Array<{
    id: string
    item_type: string
    status: string
  }>
}

interface PurchaseRowProps {
  purchase: PurchaseRowData
}

export function PurchaseRow({ purchase }: PurchaseRowProps) {
  const priceNum = parseFloat(purchase.package_price_sol)
  const date = new Date(purchase.created_at)
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const nftCount = purchase.nft_ids?.length || 0

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-sm bg-[#0D1117] border border-[#0D3B1E] hover:border-[#1A3A2A] transition-colors">
      {/* Package info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-[#00FF41] truncate">{purchase.package_name}</h4>
          <StatusBadge status={purchase.status} />
        </div>
        <div className="flex items-center gap-3 text-sm text-[#00AA2A]">
          <span>{dateStr}</span>
          <span className="text-[#1A6B35]">&middot;</span>
          <span>{timeStr}</span>
          {nftCount > 0 && (
            <>
              <span className="text-[#1A6B35]">&middot;</span>
              <span className="flex items-center gap-1">
                <ImageIcon className="size-3" />
                {nftCount} NFT{nftCount !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Delivery progress (desktop) */}
      <div className="hidden md:block">
        <DeliveryStatus status={purchase.status} />
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-[#00FF41]">
          {formatSol(priceNum)} <span className="text-sm font-normal text-[#00AA2A]">SOL</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {purchase.payment_transaction && (
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="text-[#00AA2A] hover:text-[#00FF41]"
            title="View on Explorer"
          >
            <a
              href={getExplorerUrl(purchase.payment_transaction)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" />
            </a>
          </Button>
        )}

        {purchase.status === 'completed' && nftCount > 0 && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-[#1A3A2A] text-[#00CC33] hover:text-[#00FF41] hover:border-[#00FF41]/50"
          >
            <Link href={`/profile?tab=nfts`}>View NFTs</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
