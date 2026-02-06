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
  common: 'text-[#00AA2A]',
  uncommon: 'text-[#00FF41]',
  rare: 'text-[#00FFFF]',
  epic: 'text-[#00FF41]',
  legendary: 'text-[#FFB000]',
}

export function InventoryStats({ stats, isLoading }: InventoryStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-[#0D3B1E] bg-[#0D1117]">
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
      label: 'Total _unITM',
      value: stats.totalNfts,
      icon: Package,
      color: 'text-[#00FFFF]',
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
      color: 'text-[#00FF41]',
    },
    {
      label: 'Collection Value',
      value: `${stats.estimatedValue.toFixed(2)} SOL`,
      icon: TrendingUp,
      color: 'text-[#00FF41]',
    },
    {
      label: 'Rarity Breakdown',
      value: null,
      icon: Star,
      color: 'text-[#FFB000]',
      breakdown: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statItems.map((item) => (
        <Card
          key={item.label}
          className="border-[#0D3B1E] bg-[#0D1117] transition-colors hover:border-[#1A3A2A]"
        >
          <CardContent className="p-4">
            <div className="mb-1 flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-xs text-[#00AA2A]">{item.label}</span>
            </div>
            {item.breakdown ? (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                {Object.entries(stats.rarityBreakdown).map(
                  ([rarity, count]) =>
                    count > 0 && (
                      <span key={rarity} className={rarityColors[rarity] || 'text-[#00AA2A]'}>
                        {count} {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                      </span>
                    )
                )}
                {Object.values(stats.rarityBreakdown).every((c) => c === 0) && (
                  <span className="text-[#1A6B35]">--</span>
                )}
              </div>
            ) : (
              <p className="text-lg font-semibold text-[#00FF41]">{item.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
