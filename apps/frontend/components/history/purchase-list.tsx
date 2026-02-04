'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, ShoppingBag, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { PurchaseRow } from './purchase-row'

interface PurchaseData {
  id: string
  package_name: string
  package_price_sol: string
  unsc_amount: string
  nft_ids: string[]
  payment_transaction: string | null
  status: string
  created_at: string
  deliveries: Array<{
    id: string
    item_type: string
    status: string
  }>
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'delivering', label: 'Delivering' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const

function PurchaseRowSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-40 bg-slate-800" />
          <Skeleton className="h-5 w-20 rounded-full bg-slate-800" />
        </div>
        <Skeleton className="h-4 w-48 bg-slate-800" />
      </div>
      <Skeleton className="h-6 w-24 bg-slate-800" />
      <Skeleton className="h-8 w-20 rounded-md bg-slate-800" />
    </div>
  )
}

export function PurchaseList() {
  const [purchases, setPurchases] = useState<PurchaseData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchPurchases = useCallback(
    async (reset = false) => {
      setIsLoading(true)
      const currentPage = reset ? 1 : page

      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (search) params.set('search', search)
        params.set('sort', sortOrder)
        params.set('page', currentPage.toString())
        params.set('limit', '20')

        const res = await fetch(`/api/purchases?${params.toString()}`)
        const data = await res.json()

        if (data.success) {
          if (reset) {
            setPurchases(data.data.items)
          } else {
            setPurchases((prev) =>
              currentPage === 1 ? data.data.items : [...prev, ...data.data.items]
            )
          }
          setHasMore(data.data.hasMore)
          setTotal(data.data.total)
        }
      } catch (error) {
        console.error('Failed to fetch purchases:', error)
      }

      setIsLoading(false)
    },
    [statusFilter, search, sortOrder, page]
  )

  // Reset page on filter/sort/search change
  useEffect(() => {
    setPage(1)
    fetchPurchases(true)
  }, [statusFilter, search, sortOrder])

  useEffect(() => {
    if (page > 1) {
      fetchPurchases()
    }
  }, [page])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status filter tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-slate-800/60 border border-slate-700 h-auto flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <TabsTrigger
                key={f.value}
                value={f.value}
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400 hover:text-white text-sm px-3 py-1.5"
              >
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search and sort */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input
              placeholder="Search packages..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 w-56 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
            className="border-slate-700 text-slate-300 hover:text-white gap-1.5"
          >
            <SlidersHorizontal className="size-4" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </Button>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-slate-400">
          {total} purchase{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Purchase list */}
      <div className="space-y-3">
        {isLoading && purchases.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => <PurchaseRowSkeleton key={i} />)
        ) : purchases.length > 0 ? (
          <>
            {purchases.map((purchase) => (
              <PurchaseRow key={purchase.id} purchase={purchase} />
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading}
                  className="border-slate-700 text-slate-300 hover:text-white"
                >
                  {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <ShoppingBag className="size-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No purchases found</h3>
            <p className="text-slate-400 text-sm max-w-md">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Your purchase history will appear here once you buy a package.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
