'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Package } from 'lucide-react'
import { PackageGrid } from '@/components/packages/package-grid'
import { PackageFilters } from '@/components/packages/package-filters'
import type { PackageCardProps } from '@/components/packages/package-card'
import { TerminalFrame } from '@/components/ui/terminal-frame'

interface PackageApiItem extends PackageCardProps {
  featured: boolean
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageApiItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')

  const abortRef = useRef<AbortController | null>(null)

  const fetchPackages = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (category !== 'all') params.set('category', category)
        params.set('sort', sort)
        params.set('limit', '50')

        const res = await fetch(`/api/packages?${params.toString()}`, { signal })
        const data = await res.json()

        if (data.success) {
          setPackages(
            data.data.items.map((item: Record<string, unknown>) => ({
              id: item.id as string,
              name: item.name as string,
              description: item.description as string | null,
              price_sol: item.price_sol as string,
              unsc_amount: item.unsc_amount as string,
              nft_count: (item.nft_count ?? 0) as number,
              nft_previews: (item.nft_previews ?? []) as PackageCardProps['nft_previews'],
              total_supply: item.total_supply as number | null,
              sold_count: (item.sold_count ?? 0) as number,
              featured: (item.featured ?? false) as boolean,
              category: item.category as string | null,
            }))
          )
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to fetch packages:', error)
      }
      setIsLoading(false)
    },
    [category, sort]
  )

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    fetchPackages(controller.signal)

    return () => controller.abort()
  }, [fetchPackages])

  // Separate featured package from the rest
  const featuredPackage = packages.find((p) => p.featured) || null
  const regularPackages = packages.filter((p) => !p.featured || p.id !== featuredPackage?.id)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page header */}
        <TerminalFrame
          title="STORE.pkg"
          pid="030"
          status="INVENTORY: SYNCED"
          statusLabel="ONLINE"
          borderStyle="mixed"
        >
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-2">
              <Package className="size-5 text-[#00FF41]" />
              <h1 className="text-3xl font-bold text-[#00FF41]">Package Store</h1>
            </div>
            <div className="ml-5 border-l border-dashed border-[#00FF41]/20 pl-4">
              <p className="text-sm text-[#00AA2A]">
                Browse and purchase _unITM packages, token bundles, and exclusive collector
                editions.
              </p>
            </div>
          </div>
        </TerminalFrame>

        {/* Filters */}
        <PackageFilters
          activeCategory={category}
          activeSort={sort}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />

        {/* Package grid */}
        <PackageGrid
          packages={regularPackages}
          featuredPackage={featuredPackage}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
