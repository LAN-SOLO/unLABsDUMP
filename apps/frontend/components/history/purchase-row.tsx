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
    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
      {/* Package info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-white truncate">{purchase.package_name}</h4>
          <StatusBadge status={purchase.status} />
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{dateStr}</span>
          <span className="text-slate-600">&middot;</span>
          <span>{timeStr}</span>
          {nftCount > 0 && (
            <>
              <span className="text-slate-600">&middot;</span>
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
        <p className="text-lg font-bold text-white">
          {formatSol(priceNum)} <span className="text-sm font-normal text-slate-400">SOL</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {purchase.payment_transaction && (
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="text-slate-400 hover:text-purple-400"
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
            className="border-slate-700 text-slate-300 hover:text-white hover:border-purple-500/50"
          >
            <Link href={`/profile?tab=nfts`}>View NFTs</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
