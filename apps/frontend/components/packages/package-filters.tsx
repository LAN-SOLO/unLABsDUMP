'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'starter', label: 'Starter Packs' },
  { value: 'token_bundle', label: 'Token Bundles' },
  { value: 'collector', label: 'Collector Editions' },
  { value: 'limited', label: 'Limited Releases' },
] as const

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low-High' },
  { value: 'price_desc', label: 'Price: High-Low' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
] as const

interface PackageFiltersProps {
  activeCategory: string
  activeSort: string
  onCategoryChange: (category: string) => void
  onSortChange: (sort: string) => void
}

export function PackageFilters({
  activeCategory,
  activeSort,
  onCategoryChange,
  onSortChange,
}: PackageFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Category filter tabs */}
      <Tabs value={activeCategory} onValueChange={onCategoryChange}>
        <TabsList className="bg-[#111318]/60 border border-[#1A3A2A] h-auto flex-wrap">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="data-[state=active]:bg-[#00FF41] data-[state=active]:text-black text-[#00AA2A] hover:text-[#00FF41] text-sm px-3 py-1.5"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#00AA2A]">Sort by:</span>
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-[#111318] border border-[#1A3A2A] rounded-md px-3 py-1.5 text-sm text-[#00FF41] focus:outline-none focus:ring-2 focus:ring-[#00FF41] focus:border-transparent cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
