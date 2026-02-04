'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package } from 'lucide-react'
import { PackageGrid } from '@/components/packages/package-grid'
import { PackageFilters } from '@/components/packages/package-filters'
import type { PackageCardProps } from '@/components/packages/package-card'

interface PackageApiItem extends PackageCardProps {
  featured: boolean
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageApiItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')

  const fetchPackages = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      params.set('sort', sort)
      params.set('limit', '50')

      const res = await fetch(`/api/packages?${params.toString()}`)
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
      console.error('Failed to fetch packages:', error)
    }
    setIsLoading(false)
  }, [category, sort])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  // Separate featured package from the rest
  const featuredPackage = packages.find((p) => p.featured) || null
  const regularPackages = packages.filter((p) => !p.featured || p.id !== featuredPackage?.id)

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Package className="size-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Package Store</h1>
              <p className="text-slate-400 text-sm">
                Browse and purchase NFT packages, token bundles, and exclusive collector editions.
              </p>
            </div>
          </div>
        </div>

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
