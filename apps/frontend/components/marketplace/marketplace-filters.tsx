'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PriceRangeSlider } from './price-range-slider'
import { Search, X, SlidersHorizontal } from 'lucide-react'

export interface MarketplaceFilterValues {
  search: string
  minPrice: string
  maxPrice: string
  color: string
  tier: string
  era: string
  sort: string
  seller: string
}

interface MarketplaceFiltersProps {
  filters: MarketplaceFilterValues
  onFilterChange: (filters: MarketplaceFilterValues) => void
  onReset: () => void
}

const COLOR_OPTIONS = ['All', 'Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver', 'Black']
const TIER_OPTIONS = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
const ERA_OPTIONS = ['All', 'Genesis', 'Expansion', 'Convergence', 'Singularity']
const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'created-desc' },
  { label: 'Ending Soon', value: 'expiry-asc' },
]

export const defaultMarketplaceFilters: MarketplaceFilterValues = {
  search: '',
  minPrice: '',
  maxPrice: '',
  color: 'All',
  tier: 'All',
  era: 'All',
  sort: 'created-desc',
  seller: '',
}

export function MarketplaceFilters({ filters, onFilterChange, onReset }: MarketplaceFiltersProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.color !== 'All' ||
    filters.tier !== 'All' ||
    filters.era !== 'All' ||
    filters.seller !== ''

  const updateFilter = (key: keyof MarketplaceFilterValues, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-3">
      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search listings..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="border-slate-700 bg-slate-800 pl-9 text-white placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
          />
        </div>
        <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value)}>
          <SelectTrigger className="w-full border-slate-700 bg-slate-800 text-slate-200 sm:w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-800">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-slate-200 focus:bg-slate-700 focus:text-white"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-end gap-3">
        <SlidersHorizontal className="mb-2 h-4 w-4 text-slate-400" />

        {/* Price Range */}
        <div className="w-48">
          <PriceRangeSlider
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onMinChange={(val) => updateFilter('minPrice', val)}
            onMaxChange={(val) => updateFilter('maxPrice', val)}
          />
        </div>

        {/* Trait filters */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Color</label>
          <Select value={filters.color} onValueChange={(value) => updateFilter('color', value)}>
            <SelectTrigger className="h-8 w-28 border-slate-700 bg-slate-800 text-xs text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-800">
              {COLOR_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt}
                  value={opt}
                  className="text-xs text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Tier</label>
          <Select value={filters.tier} onValueChange={(value) => updateFilter('tier', value)}>
            <SelectTrigger className="h-8 w-28 border-slate-700 bg-slate-800 text-xs text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-800">
              {TIER_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt}
                  value={opt}
                  className="text-xs text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Era</label>
          <Select value={filters.era} onValueChange={(value) => updateFilter('era', value)}>
            <SelectTrigger className="h-8 w-28 border-slate-700 bg-slate-800 text-xs text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-800">
              {ERA_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt}
                  value={opt}
                  className="text-xs text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seller address */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Seller</label>
          <Input
            placeholder="Wallet address..."
            value={filters.seller}
            onChange={(e) => updateFilter('seller', e.target.value.trim())}
            className="h-8 w-36 border-slate-700 bg-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="mb-0 h-8 gap-1 text-xs text-slate-400 hover:text-white"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
