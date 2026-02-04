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
        <TabsList className="bg-slate-800/60 border border-slate-700 h-auto flex-wrap">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 hover:text-white text-sm px-3 py-1.5"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Sort by:</span>
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
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
