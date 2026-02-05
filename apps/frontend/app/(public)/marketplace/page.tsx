'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MarketplaceFilters,
  defaultMarketplaceFilters,
  type MarketplaceFilterValues,
} from '@/components/marketplace/marketplace-filters'
import { ListingCard, type MarketplaceListing } from '@/components/marketplace/listing-card'
import { BuyModal } from '@/components/marketplace/buy-modal'
import { ContactSellerModal } from '@/components/marketplace/contact-seller-modal'
import { RecentSales, type RecentSale } from '@/components/marketplace/recent-sales'
import { Store, ShoppingBag } from 'lucide-react'
import { TerminalFrame } from '@/components/ui/terminal-frame'

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSalesLoading, setIsSalesLoading] = useState(true)
  const [filters, setFilters] = useState<MarketplaceFilterValues>(defaultMarketplaceFilters)

  // Modal state
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null)

  // Fetch active listings
  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch('/api/trades')
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch {
        // Handle silently
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [])

  // Fetch recent sales
  useEffect(() => {
    async function fetchRecentSales() {
      try {
        const res = await fetch('/api/trades/recent')
        if (res.ok) {
          const data = await res.json()
          setRecentSales(data.sales || [])
        }
      } catch {
        // Handle silently
      } finally {
        setIsSalesLoading(false)
      }
    }

    fetchRecentSales()
  }, [])

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = [...listings]

    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(
        (l) =>
          l.nftName.toLowerCase().includes(search) || l.sellerAddress.toLowerCase().includes(search)
      )
    }

    // Price range
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice)
      if (!isNaN(min)) {
        result = result.filter((l) => l.priceInSol >= min)
      }
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice)
      if (!isNaN(max)) {
        result = result.filter((l) => l.priceInSol <= max)
      }
    }

    // Trait filters
    if (filters.color !== 'All') {
      result = result.filter((l) => l.traits.color.toLowerCase() === filters.color.toLowerCase())
    }
    if (filters.tier !== 'All') {
      result = result.filter((l) => l.traits.tier.toLowerCase() === filters.tier.toLowerCase())
    }
    if (filters.era !== 'All') {
      result = result.filter((l) => l.traits.era.toLowerCase() === filters.era.toLowerCase())
    }

    // Sort
    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.priceInSol - b.priceInSol)
        break
      case 'price-desc':
        result.sort((a, b) => b.priceInSol - a.priceInSol)
        break
      case 'created-desc':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'expiry-asc':
        result.sort((a, b) => {
          if (!a.expiresAt && !b.expiresAt) return 0
          if (!a.expiresAt) return 1
          if (!b.expiresAt) return -1
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
        })
        break
    }

    return result
  }, [listings, filters])

  // Handlers
  const handleBuy = useCallback((listing: MarketplaceListing) => {
    setSelectedListing(listing)
    setBuyModalOpen(true)
  }, [])

  const handlePurchase = useCallback(async (listingId: string) => {
    const res = await fetch(`/api/trades/${listingId}/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionSignature: 'pending' }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Purchase failed')
    }

    // Remove from listings
    setListings((prev) => prev.filter((l) => l.id !== listingId))
    return true
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <TerminalFrame
            title="MARKET.sys"
            pid="020"
            accent="cyan"
            borderStyle="single"
            status="NET: SOLANA"
            statusLabel="LIVE"
          >
            <div className="px-4 py-5">
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-5 w-5 text-[#00FFFF]" />
                <h1 className="text-2xl font-bold text-[#00FF41]">Marketplace</h1>
              </div>
              <div className="ml-5 border-l border-dashed border-[#00FFFF]/20 pl-4">
                <p className="text-sm text-[#00AA2A]">
                  Browse and purchase _unITM from other players
                </p>
              </div>
            </div>
          </TerminalFrame>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <MarketplaceFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters(defaultMarketplaceFilters)}
          />
        </div>

        <Separator className="mb-6 bg-[#111318]" />

        {/* Results count */}
        {!isLoading && (
          <p className="mb-4 text-xs text-[#1A6B35]">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
          </p>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-sm border border-[#0D3B1E] bg-[#0D1117]"
              >
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-sm border border-dashed border-[#1A3A2A] bg-[#0D1117]/50 px-6 py-12">
            <div className="mb-4 rounded-full bg-[#111318] p-4">
              <ShoppingBag className="h-8 w-8 text-[#1A6B35]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#00FF41]">No Listings Found</h3>
            <p className="max-w-sm text-center text-sm text-[#00AA2A]">
              {listings.length === 0
                ? 'There are currently no _unITM listed for sale. Check back later!'
                : 'No listings match your current filters. Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onBuy={handleBuy} />
            ))}
          </div>
        )}

        {/* Recent Sales */}
        <div className="mt-12">
          <Separator className="mb-6 bg-[#111318]" />
          <RecentSales sales={recentSales} isLoading={isSalesLoading} />
        </div>

        {/* Buy Modal */}
        <BuyModal
          open={buyModalOpen}
          onOpenChange={setBuyModalOpen}
          listing={selectedListing}
          onPurchase={handlePurchase}
        />

        {/* Contact Seller Modal */}
        <ContactSellerModal
          open={contactModalOpen}
          onOpenChange={setContactModalOpen}
          listing={selectedListing}
        />
      </div>
    </div>
  )
}
