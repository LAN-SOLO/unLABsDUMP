'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { NFTGrid } from '@/components/nft/nft-grid'
import { NFTFiltersPanel } from '@/components/nft/nft-filters'
import { NFTSearch } from '@/components/nft/nft-search'
import { NFTImageViewer } from '@/components/nft/nft-image-viewer'
import {
  type NFT,
  type NFTFilters,
  type NFTListResponse,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
} from '@/lib/nft/types'

export default function BrowsePage() {
  const [filters, setFilters] = useState<NFTFilters>(DEFAULT_FILTERS)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Quick view state
  const [quickViewNft, setQuickViewNft] = useState<NFT | null>(null)

  const fetchNfts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(filters.page))
      params.set('limit', String(filters.limit))
      params.set('sortBy', filters.sortBy)
      params.set('sortOrder', filters.sortOrder)

      if (filters.search) params.set('search', filters.search)
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.colors.length > 0) params.set('color', filters.colors.join(','))
      if (filters.tiers.length > 0) params.set('tier', filters.tiers.join(','))
      if (filters.eras.length > 0) params.set('era', filters.eras.join(','))
      if (filters.rotations.length > 0) params.set('rotation', filters.rotations.join(','))

      const res = await fetch(`/api/nfts?${params.toString()}`)
      if (res.ok) {
        const data: NFTListResponse = await res.json()
        setNfts(data.data)
        setTotalCount(data.count)
        setTotalPages(data.totalPages)
      }
    } catch (err) {
      console.error('Failed to fetch NFTs:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchNfts()
  }, [fetchNfts])

  function handleFilterChange(changes: Partial<NFTFilters>) {
    setFilters((prev) => ({ ...prev, ...changes }))
  }

  function handleSortChange(value: string) {
    const sortBy = value as NFTFilters['sortBy']
    // Rarity defaults to desc, name to asc, newest to desc
    const sortOrder = sortBy === 'name' ? 'asc' : 'desc'
    handleFilterChange({ sortBy, sortOrder, page: 1 })
  }

  function handlePageChange(newPage: number) {
    handleFilterChange({ page: newPage })
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleQuickView(nft: NFT) {
    setQuickViewNft(nft)
  }

  // Calculate active filter count for mobile badge
  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) +
    filters.colors.length +
    filters.tiers.length +
    filters.eras.length +
    filters.rotations.length

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse NFTs</h1>
          <p className="text-slate-400">
            Explore the UnstableLabs NFT collection across wavelengths, tiers, and eras.
          </p>
        </div>

        {/* Top bar: Search + Sort + Mobile filter toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <NFTSearch
            value={filters.search}
            onChange={(search) => handleFilterChange({ search, page: 1 })}
            className="flex-1"
          />

          <div className="flex gap-2">
            {/* Sort dropdown */}
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-36 bg-slate-900 border-slate-700 text-slate-300">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-slate-300 focus:bg-slate-800 focus:text-white"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced search link */}
            <Button
              asChild
              variant="outline"
              size="default"
              className="border-slate-700 text-slate-400 hover:text-white hidden sm:inline-flex"
            >
              <Link href="/browse/search">
                <Search className="size-4 mr-1.5" />
                Advanced
              </Link>
            </Button>

            {/* Mobile filter button */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden border-slate-700 text-slate-400 hover:text-white relative"
                >
                  <SlidersHorizontal className="size-4 mr-1.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs size-5 flex items-center justify-center p-0">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-slate-950 border-slate-800 w-80 overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle className="text-white">Filters</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <NFTFiltersPanel
                    filters={filters}
                    onChange={(changes) => {
                      handleFilterChange(changes)
                      // Don't close on filter change, let user apply multiple
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mb-4 text-sm text-slate-500">
            Showing <span className="text-slate-300">{nfts.length}</span> of{' '}
            <span className="text-slate-300">{totalCount}</span> NFTs
          </div>
        )}

        {/* Main content: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-8">
              <NFTFiltersPanel filters={filters} onChange={handleFilterChange} />
            </div>
          </aside>

          {/* NFT Grid */}
          <main className="flex-1 min-w-0">
            <NFTGrid
              nfts={nfts}
              loading={loading}
              skeletonCount={filters.limit}
              onQuickView={handleQuickView}
            />

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={filters.page <= 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                  className="border-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {generatePageNumbers(filters.page, totalPages).map((pageNum, idx) => {
                  if (pageNum === -1) {
                    return (
                      <span key={`ellipsis-${idx}`} className="text-slate-600 px-1">
                        ...
                      </span>
                    )
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === filters.page ? 'default' : 'outline'}
                      size="icon-sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        pageNum === filters.page
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'border-slate-700 text-slate-400 hover:text-white'
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={filters.page >= totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                  className="border-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Quick view image viewer */}
      {quickViewNft && quickViewNft.image_url && (
        <NFTImageViewer
          src={quickViewNft.image_url}
          alt={quickViewNft.name}
          open={!!quickViewNft}
          onOpenChange={(open) => {
            if (!open) setQuickViewNft(null)
          }}
        />
      )}
    </div>
  )
}

/**
 * Generate page numbers with ellipsis for pagination display.
 * Returns an array where -1 represents an ellipsis.
 */
function generatePageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: number[] = []

  // Always show first page
  pages.push(1)

  if (current > 3) {
    pages.push(-1) // ellipsis
  }

  // Show pages around current
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push(-1) // ellipsis
  }

  // Always show last page
  if (!pages.includes(total)) {
    pages.push(total)
  }

  return pages
}
