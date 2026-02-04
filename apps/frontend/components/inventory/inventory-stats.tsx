'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Gem, TrendingUp, Star } from 'lucide-react'

export interface InventoryStatsData {
  totalNfts: number
  rarityBreakdown: {
    common: number
    uncommon: number
    rare: number
    epic: number
    legendary: number
  }
  estimatedValue: number
}

interface InventoryStatsProps {
  stats: InventoryStatsData | null
  isLoading: boolean
}

const rarityColors: Record<string, string> = {
  common: 'text-slate-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
}

export function InventoryStats({ stats, isLoading }: InventoryStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-slate-800 bg-slate-900">
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      label: 'Total NFTs',
      value: stats.totalNfts,
      icon: Package,
      color: 'text-cyan-500',
    },
    {
      label: 'Rarest',
      value:
        stats.rarityBreakdown.legendary > 0
          ? `${stats.rarityBreakdown.legendary} Legendary`
          : stats.rarityBreakdown.epic > 0
            ? `${stats.rarityBreakdown.epic} Epic`
            : stats.rarityBreakdown.rare > 0
              ? `${stats.rarityBreakdown.rare} Rare`
              : 'None',
      icon: Gem,
      color: 'text-purple-400',
    },
    {
      label: 'Collection Value',
      value: `${stats.estimatedValue.toFixed(2)} SOL`,
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      label: 'Rarity Breakdown',
      value: null,
      icon: Star,
      color: 'text-amber-400',
      breakdown: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statItems.map((item) => (
        <Card
          key={item.label}
          className="border-slate-800 bg-slate-900 transition-colors hover:border-slate-700"
        >
          <CardContent className="p-4">
            <div className="mb-1 flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
            {item.breakdown ? (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                {Object.entries(stats.rarityBreakdown).map(
                  ([rarity, count]) =>
                    count > 0 && (
                      <span key={rarity} className={rarityColors[rarity] || 'text-slate-400'}>
                        {count} {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                      </span>
                    )
                )}
                {Object.values(stats.rarityBreakdown).every((c) => c === 0) && (
                  <span className="text-slate-500">--</span>
                )}
              </div>
            ) : (
              <p className="text-lg font-semibold text-white">{item.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
