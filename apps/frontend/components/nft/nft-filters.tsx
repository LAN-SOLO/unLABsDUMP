'use client'

import React from 'react'
import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  type NFTFilters,
  type NFTColor,
  type NFTTier,
  type NFTEra,
  type NFTRotation,
  type NFTStatus,
  NFT_COLORS,
  NFT_TIERS,
  NFT_ERAS,
  NFT_ROTATIONS,
  COLOR_HEX_MAP,
  TIER_LABELS,
  ROTATION_LABELS,
  DEFAULT_FILTERS,
} from '@/lib/nft/types'

interface NFTFiltersProps {
  filters: NFTFilters
  onChange: (filters: Partial<NFTFilters>) => void
  className?: string
}

const STATUS_OPTIONS: { value: NFTStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ready', label: 'Ready' },
  { value: 'minted', label: 'Minted' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'hidden', label: 'Hidden' },
]

export function NFTFiltersPanel({ filters, onChange, className }: NFTFiltersProps) {
  const activeFilterCount = getActiveFilterCount(filters)

  function handleColorToggle(color: NFTColor) {
    const colors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color]
    onChange({ colors, page: 1 })
  }

  function handleTierToggle(tier: NFTTier) {
    const tiers = filters.tiers.includes(tier)
      ? filters.tiers.filter((t) => t !== tier)
      : [...filters.tiers, tier]
    onChange({ tiers, page: 1 })
  }

  function handleEraToggle(era: NFTEra) {
    const eras = filters.eras.includes(era)
      ? filters.eras.filter((e) => e !== era)
      : [...filters.eras, era]
    onChange({ eras, page: 1 })
  }

  function handleRotationToggle(rotation: NFTRotation) {
    const rotations = filters.rotations.includes(rotation)
      ? filters.rotations.filter((r) => r !== rotation)
      : [...filters.rotations, rotation]
    onChange({ rotations, page: 1 })
  }

  function handleClearFilters() {
    onChange({
      status: DEFAULT_FILTERS.status,
      colors: [],
      tiers: [],
      eras: [],
      rotations: [],
      page: 1,
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-[#00AA2A]" />
          <h3 className="text-sm font-semibold text-[#00FF41]">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="bg-[#00FF41] text-black text-xs px-1.5 py-0">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            className="text-[#00AA2A] hover:text-[#00FF41]"
            onClick={handleClearFilters}
          >
            <X className="size-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <Separator className="bg-[#0D3B1E]" />

      {/* Status Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#00AA2A] uppercase tracking-wider">Status</h4>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors',
                  filters.status === option.value
                    ? 'border-[#00FF41]'
                    : 'border-[#1A3A2A] group-hover:border-[#1A3A2A]'
                )}
              >
                {filters.status === option.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
                )}
              </div>
              <span
                className={cn(
                  'text-sm transition-colors',
                  filters.status === option.value
                    ? 'text-[#00FF41]'
                    : 'text-[#00AA2A] group-hover:text-[#00FF41]'
                )}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-[#0D3B1E]" />

      {/* Color Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#00AA2A] uppercase tracking-wider">
          Wavelength
        </h4>
        <div className="space-y-2">
          {NFT_COLORS.map((color) => (
            <label key={color} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.colors.includes(color)}
                onCheckedChange={() => handleColorToggle(color)}
                className="border-[#1A3A2A] data-[state=checked]:bg-[#00FF41] data-[state=checked]:border-[#00FF41]"
              />
              <div
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: COLOR_HEX_MAP[color] }}
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  filters.colors.includes(color)
                    ? 'text-[#00FF41]'
                    : 'text-[#00AA2A] group-hover:text-[#00FF41]'
                )}
              >
                {color}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-[#0D3B1E]" />

      {/* Tier Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#00AA2A] uppercase tracking-wider">Tier</h4>
        <div className="space-y-2">
          {NFT_TIERS.map((tier) => (
            <label key={tier} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.tiers.includes(tier)}
                onCheckedChange={() => handleTierToggle(tier)}
                className="border-[#1A3A2A] data-[state=checked]:bg-[#00FF41] data-[state=checked]:border-[#00FF41]"
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  filters.tiers.includes(tier)
                    ? 'text-[#00FF41]'
                    : 'text-[#00AA2A] group-hover:text-[#00FF41]'
                )}
              >
                T{tier} - {TIER_LABELS[tier]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-[#0D3B1E]" />

      {/* Era Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#00AA2A] uppercase tracking-wider">Era</h4>
        <div className="space-y-2">
          {NFT_ERAS.map((era) => (
            <label key={era} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.eras.includes(era)}
                onCheckedChange={() => handleEraToggle(era)}
                className="border-[#1A3A2A] data-[state=checked]:bg-[#00FF41] data-[state=checked]:border-[#00FF41]"
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  filters.eras.includes(era)
                    ? 'text-[#00FF41]'
                    : 'text-[#00AA2A] group-hover:text-[#00FF41]'
                )}
              >
                {era}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-[#0D3B1E]" />

      {/* Rotation Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#00AA2A] uppercase tracking-wider">
          Rotation (_I/O)
        </h4>
        <div className="space-y-2">
          {NFT_ROTATIONS.map((rotation) => (
            <label key={rotation} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.rotations.includes(rotation)}
                onCheckedChange={() => handleRotationToggle(rotation)}
                className="border-[#1A3A2A] data-[state=checked]:bg-[#00FF41] data-[state=checked]:border-[#00FF41]"
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  filters.rotations.includes(rotation)
                    ? 'text-[#00FF41]'
                    : 'text-[#00AA2A] group-hover:text-[#00FF41]'
                )}
              >
                {rotation} ({ROTATION_LABELS[rotation]})
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function getActiveFilterCount(filters: NFTFilters): number {
  let count = 0
  if (filters.status !== 'all') count++
  count += filters.colors.length
  count += filters.tiers.length
  count += filters.eras.length
  count += filters.rotations.length
  return count
}
