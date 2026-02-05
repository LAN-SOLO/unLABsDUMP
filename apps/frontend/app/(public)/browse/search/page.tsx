'use client'

import React, { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  AdvancedSearchForm,
  type AdvancedSearchValues,
} from '@/components/search/advanced-search-form'
import { SearchResults } from '@/components/search/search-results'
import type { NFT, NFTListResponse, NFTColor, NFTTier, NFTEra } from '@/lib/nft/types'

export default function AdvancedSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-pulse text-[#00AA2A]">Loading search...</div>
        </div>
      }
    >
      <AdvancedSearchContent />
    </Suspense>
  )
}

function AdvancedSearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [results, setResults] = useState<NFT[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  // Parse initial values from URL
  const initialValues: Partial<AdvancedSearchValues> = {
    query: searchParams.get('q') || '',
    colors: (searchParams.get('color')?.split(',').filter(Boolean) || []) as NFTColor[],
    tiers: (searchParams.get('tier')?.split(',').filter(Boolean).map(Number) || []) as NFTTier[],
    eras: (searchParams.get('era')?.split(',').filter(Boolean) || []) as NFTEra[],
    ownerWallet: searchParams.get('owner') || '',
    rarityMin: searchParams.get('rarityMin') || '',
    rarityMax: searchParams.get('rarityMax') || '',
  }

  // Check if there are initial search params to trigger search on load
  useEffect(() => {
    const hasParams =
      searchParams.get('q') ||
      searchParams.get('color') ||
      searchParams.get('tier') ||
      searchParams.get('era') ||
      searchParams.get('owner') ||
      searchParams.get('rarityMin') ||
      searchParams.get('rarityMax')

    if (hasParams) {
      performSearch(initialValues as AdvancedSearchValues)
    }
    // Only run on mount
  }, [])

  async function performSearch(values: AdvancedSearchValues) {
    setLoading(true)
    setSearchPerformed(true)

    // Update URL with search params
    const params = new URLSearchParams()
    if (values.query) params.set('q', values.query)
    if (values.colors.length > 0) params.set('color', values.colors.join(','))
    if (values.tiers.length > 0) params.set('tier', values.tiers.join(','))
    if (values.eras.length > 0) params.set('era', values.eras.join(','))
    if (values.ownerWallet) params.set('owner', values.ownerWallet)
    if (values.rarityMin) params.set('rarityMin', values.rarityMin)
    if (values.rarityMax) params.set('rarityMax', values.rarityMax)

    // Update URL without full navigation
    const newUrl = params.toString() ? `/browse/search?${params.toString()}` : '/browse/search'
    router.replace(newUrl, { scroll: false })

    try {
      const res = await fetch(`/api/nfts/search?${params.toString()}`)
      if (res.ok) {
        const data: NFTListResponse = await res.json()
        setResults(data.data)
        setTotalCount(data.count)
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-[#00AA2A] hover:text-[#00FF41] transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to Browse
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00FF41] mb-2">Advanced Search</h1>
          <p className="text-[#00AA2A]">
            Search across multiple fields and filter by specific traits to find exactly what you are
            looking for.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-[#0D1117] rounded-sm border border-[#0D3B1E] p-6 mb-8">
          <AdvancedSearchForm
            initialValues={initialValues}
            onSearch={performSearch}
            loading={loading}
          />
        </div>

        <Separator className="bg-[#111318] mb-8" />

        {/* Results */}
        <SearchResults
          results={results}
          totalCount={totalCount}
          loading={loading}
          searchPerformed={searchPerformed}
        />
      </div>
    </div>
  )
}
