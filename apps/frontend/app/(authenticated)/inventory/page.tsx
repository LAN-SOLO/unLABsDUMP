'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { InventoryGrid } from '@/components/inventory/inventory-grid'
import {
  InventoryFilters,
  defaultFilters,
  type InventoryFilterValues,
} from '@/components/inventory/inventory-filters'
import { InventoryStats, type InventoryStatsData } from '@/components/inventory/inventory-stats'
import { TransferModal } from '@/components/inventory/transfer-modal'
import type { NftItem } from '@/components/inventory/inventory-card'
import { Package, CheckSquare, X, Send, Tag } from 'lucide-react'
import { TerminalFrame } from '@/components/ui/terminal-frame'

const RARITY_ORDER: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
}

export default function InventoryPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [nfts, setNfts] = useState<NftItem[]>([])
  const [stats, setStats] = useState<InventoryStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [filters, setFilters] = useState<InventoryFilterValues>(defaultFilters)

  // Select mode
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Transfer modal
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [transferNft, setTransferNft] = useState<NftItem | null>(null)

  // Fetch inventory
  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch('/api/inventory')
        if (res.ok) {
          const data = await res.json()
          setNfts(data.nfts || [])
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false)
      }
    }

    fetchInventory()
  }, [])

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/inventory/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch {
        // Handle error silently
      } finally {
        setIsStatsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Filter and sort NFTs
  const filteredNfts = useMemo(() => {
    let result = [...nfts]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(
        (nft) =>
          nft.name.toLowerCase().includes(search) ||
          nft.traits.color.toLowerCase().includes(search) ||
          nft.traits.tier.toLowerCase().includes(search) ||
          nft.traits.era.toLowerCase().includes(search)
      )
    }

    // Trait filters
    if (filters.color !== 'All') {
      result = result.filter(
        (nft) => nft.traits.color.toLowerCase() === filters.color.toLowerCase()
      )
    }
    if (filters.tier !== 'All') {
      result = result.filter((nft) => nft.traits.tier.toLowerCase() === filters.tier.toLowerCase())
    }
    if (filters.era !== 'All') {
      result = result.filter((nft) => nft.traits.era.toLowerCase() === filters.era.toLowerCase())
    }

    // Sort
    const [sortField, sortDir] = filters.sort.split('-')
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'acquired':
          cmp = new Date(a.acquiredAt).getTime() - new Date(b.acquiredAt).getTime()
          break
        case 'rarity':
          cmp = (RARITY_ORDER[a.rarity] ?? 0) - (RARITY_ORDER[b.rarity] ?? 0)
          break
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        default:
          cmp = 0
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [nfts, filters])

  // Selection handlers
  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSelectMode = () => {
    if (selectMode) {
      setSelectedIds(new Set())
    }
    setSelectMode(!selectMode)
  }

  // NFT action handlers
  const handleViewDetails = useCallback(
    (nft: NftItem) => {
      // Navigate to NFT detail page or open a detail modal
      router.push(`/inventory/${nft.id}/sell`)
    },
    [router]
  )

  const handleListForSale = useCallback(
    (nft: NftItem) => {
      router.push(`/inventory/${nft.id}/sell`)
    },
    [router]
  )

  const handleTransfer = useCallback((nft: NftItem) => {
    setTransferNft(nft)
    setTransferModalOpen(true)
  }, [])

  const handleTransferExecute = useCallback(async (nftId: string, recipientAddress: string) => {
    const res = await fetch(`/api/inventory/${nftId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientAddress }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Transfer failed')
    }

    // Remove from local state
    setNfts((prev) => prev.filter((n) => n.id !== nftId))
    return true
  }, [])

  // Bulk actions
  const handleBulkTransfer = () => {
    if (selectedIds.size === 0) return
    // For bulk, use the first selected NFT to open modal
    const first = nfts.find((n) => selectedIds.has(n.id))
    if (first) {
      setTransferNft(first)
      setTransferModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <TerminalFrame
            title="INVENTORY.dat"
            pid="040"
            status="WALLET: LINKED"
            statusLabel="SYNCED"
            borderStyle="double"
          >
            <div className="px-4 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-5 w-5 text-[#00FF41]" />
                  <h1 className="text-2xl font-bold text-[#00FF41]">Inventory</h1>
                </div>
                <div className="ml-7 border-l border-dashed border-[#00FF41]/20 pl-4">
                  <p className="text-sm text-[#00AA2A]">Manage your NFT collection</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={selectMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleSelectMode}
                  className={
                    selectMode
                      ? 'bg-[#00FF41] text-black hover:bg-[#00CC33]'
                      : 'border-[#1A3A2A] text-[#00CC33]'
                  }
                >
                  {selectMode ? (
                    <>
                      <X className="mr-1 h-3.5 w-3.5" />
                      Cancel ({selectedIds.size})
                    </>
                  ) : (
                    <>
                      <CheckSquare className="mr-1 h-3.5 w-3.5" />
                      Select
                    </>
                  )}
                </Button>

                {selectMode && selectedIds.size > 0 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkTransfer}
                      className="border-[#1A3A2A] text-[#00CC33]"
                    >
                      <Send className="mr-1 h-3.5 w-3.5" />
                      Transfer ({selectedIds.size})
                    </Button>
                    <Button size="sm" variant="outline" className="border-[#1A3A2A] text-[#00CC33]">
                      <Tag className="mr-1 h-3.5 w-3.5" />
                      List ({selectedIds.size})
                    </Button>
                  </>
                )}
              </div>
            </div>
          </TerminalFrame>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <InventoryStats stats={stats} isLoading={isStatsLoading} />
        </div>

        <Separator className="mb-6 bg-[#111318]" />

        {/* Filters */}
        <div className="mb-6">
          <InventoryFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
        </div>

        {/* Results count */}
        {!isLoading && nfts.length > 0 && (
          <p className="mb-4 text-xs text-[#1A6B35]">
            Showing {filteredNfts.length} of {nfts.length} NFTs
          </p>
        )}

        {/* Grid */}
        <InventoryGrid
          nfts={filteredNfts}
          isLoading={isLoading}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onViewDetails={handleViewDetails}
          onListForSale={handleListForSale}
          onTransfer={handleTransfer}
        />

        {/* Transfer Modal */}
        <TransferModal
          open={transferModalOpen}
          onOpenChange={setTransferModalOpen}
          nft={transferNft}
          senderAddress={user?.walletAddress || ''}
          onTransfer={handleTransferExecute}
        />
      </div>
    </div>
  )
}
