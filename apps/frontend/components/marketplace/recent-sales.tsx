'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatSol } from '@/lib/trading/fees'
import { ArrowRight, History } from 'lucide-react'

export interface RecentSale {
  id: string
  nftName: string
  nftImage: string
  nftRarity: string
  priceInSol: number
  buyerAddress: string
  sellerAddress: string
  completedAt: string
}

interface RecentSalesProps {
  sales: RecentSale[]
  isLoading: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RecentSales({ sales, isLoading }: RecentSalesProps) {
  if (isLoading) {
    return (
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
            <History className="h-4 w-4" />
            Recent Sales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (sales.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
            <History className="h-4 w-4" />
            Recent Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-slate-500">No recent sales</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-slate-300">
          <History className="h-4 w-4" />
          Recent Sales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {sales.map((sale, index) => (
          <div key={sale.id}>
            <div className="flex items-center gap-3 py-2.5">
              {/* NFT thumbnail */}
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                <img
                  src={sale.nftImage || '/placeholder-nft.png'}
                  alt={sale.nftName}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{sale.nftName}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="font-mono">{sale.sellerAddress.slice(0, 4)}...</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                  <span className="font-mono">{sale.buyerAddress.slice(0, 4)}...</span>
                </div>
              </div>

              {/* Price and time */}
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{formatSol(sale.priceInSol)} SOL</p>
                <p className="text-[10px] text-slate-500">{timeAgo(sale.completedAt)}</p>
              </div>
            </div>
            {index < sales.length - 1 && <Separator className="bg-slate-800" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
