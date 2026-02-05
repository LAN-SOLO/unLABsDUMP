'use client'

import React from 'react'
import { ArrowRight, Wallet, ShoppingCart, Send, Coins } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { OwnershipRecord } from '@/lib/nft/types'

interface NFTHistoryProps {
  history: OwnershipRecord[]
  loading?: boolean
  className?: string
}

const EVENT_CONFIG: Record<
  OwnershipRecord['event_type'],
  { icon: React.ElementType; label: string; color: string; dotColor: string }
> = {
  mint: {
    icon: Coins,
    label: 'Minted',
    color: 'text-[#00FFFF]',
    dotColor: 'bg-[#00FFFF]',
  },
  transfer: {
    icon: ArrowRight,
    label: 'Transferred',
    color: 'text-[#00FFFF]',
    dotColor: 'bg-[#00FFFF]',
  },
  sale: {
    icon: ShoppingCart,
    label: 'Sold',
    color: 'text-[#00FF41]',
    dotColor: 'bg-[#00FF41]',
  },
  deliver: {
    icon: Send,
    label: 'Delivered',
    color: 'text-[#00FF41]',
    dotColor: 'bg-[#00FF41]',
  },
}

function formatWallet(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NFTHistory({ history, loading, className }: NFTHistoryProps) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="text-sm font-semibold text-[#00FF41]">Ownership History</h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        <h3 className="text-sm font-semibold text-[#00FF41]">Ownership History</h3>
        <p className="text-[#1A6B35] text-sm">No ownership history available yet.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-[#00FF41]">Ownership History</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-6 bottom-2 w-px bg-[#0D3B1E]" />

        <div className="space-y-0">
          {history.map((record, index) => {
            const config = EVENT_CONFIG[record.event_type]
            const Icon = config.icon
            const isLatest = index === 0

            return (
              <div
                key={record.id}
                className={cn('relative flex gap-3 py-3 pl-0', isLatest && 'pb-4')}
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex items-center justify-center w-8 h-8 shrink-0">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      isLatest ? 'bg-[#111318] ring-2 ring-[#00FF41]/50' : 'bg-[#111318]'
                    )}
                  >
                    <Icon className={cn('size-3.5', config.color)} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
                    {record.price !== undefined && record.price > 0 && (
                      <span className="text-xs text-[#00AA2A]">for {record.price} SOL</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <Wallet className="size-3 text-[#1A6B35]" />
                    <span className="text-xs text-[#00AA2A] font-mono">
                      {record.display_name || formatWallet(record.wallet_address)}
                    </span>
                  </div>

                  {record.transaction_hash && (
                    <a
                      href={`https://solscan.io/tx/${record.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#00FF41] hover:text-[#00CC33] mt-1 inline-block"
                    >
                      View Transaction
                    </a>
                  )}

                  <div className="text-xs text-[#1A6B35] mt-1">{formatDate(record.timestamp)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
