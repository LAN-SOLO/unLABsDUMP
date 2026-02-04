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
import { Search, X, SlidersHorizontal } from 'lucide-react'

export interface InventoryFilterValues {
  search: string
  color: string
  tier: string
  era: string
  sort: string
}

interface InventoryFiltersProps {
  filters: InventoryFilterValues
  onFilterChange: (filters: InventoryFilterValues) => void
  onReset: () => void
}

const COLOR_OPTIONS = ['All', 'Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver', 'Black']
const TIER_OPTIONS = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
const ERA_OPTIONS = ['All', 'Genesis', 'Expansion', 'Convergence', 'Singularity']
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'acquired-desc' },
  { label: 'Oldest First', value: 'acquired-asc' },
  { label: 'Rarity: High to Low', value: 'rarity-desc' },
  { label: 'Rarity: Low to High', value: 'rarity-asc' },
  { label: 'Name: A-Z', value: 'name-asc' },
  { label: 'Name: Z-A', value: 'name-desc' },
]

export const defaultFilters: InventoryFilterValues = {
  search: '',
  color: 'All',
  tier: 'All',
  era: 'All',
  sort: 'acquired-desc',
}

export function InventoryFilters({ filters, onFilterChange, onReset }: InventoryFiltersProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.color !== 'All' ||
    filters.tier !== 'All' ||
    filters.era !== 'All'

  const updateFilter = (key: keyof InventoryFilterValues, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-3">
      {/* Search and Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search NFTs..."
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

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-slate-400" />

        <Select value={filters.color} onValueChange={(value) => updateFilter('color', value)}>
          <SelectTrigger className="h-8 w-28 border-slate-700 bg-slate-800 text-xs text-slate-200">
            <SelectValue placeholder="Color" />
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

        <Select value={filters.tier} onValueChange={(value) => updateFilter('tier', value)}>
          <SelectTrigger className="h-8 w-28 border-slate-700 bg-slate-800 text-xs text-slate-200">
            <SelectValue placeholder="Tier" />
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

        <Select value={filters.era} onValueChange={(value) => updateFilter('era', value)}>
          <SelectTrigger className="h-8 w-28 border-slate-700 bg-slate-800 text-xs text-slate-200">
            <SelectValue placeholder="Era" />
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

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1 text-xs text-slate-400 hover:text-white"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
