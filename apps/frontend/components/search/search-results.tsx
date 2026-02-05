'use client'

import React from 'react'
import { NFTGrid } from '@/components/nft/nft-grid'
import type { NFT } from '@/lib/nft/types'

interface SearchResultsProps {
  results: NFT[]
  totalCount: number
  loading?: boolean
  searchPerformed?: boolean
}

export function SearchResults({
  results,
  totalCount,
  loading = false,
  searchPerformed = false,
}: SearchResultsProps) {
  return (
    <div className="space-y-4">
      {/* Results count */}
      {searchPerformed && !loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#00AA2A]">
            {totalCount === 0 ? (
              'No results found'
            ) : (
              <>
                Found <span className="text-[#00FF41] font-medium">{totalCount}</span>{' '}
                {totalCount === 1 ? 'result' : 'results'}
              </>
            )}
          </p>
        </div>
      )}

      {/* Grid */}
      <NFTGrid
        nfts={results}
        loading={loading}
        skeletonCount={8}
        emptyMessage={
          searchPerformed
            ? 'No NFTs match your search criteria. Try adjusting your filters.'
            : 'Use the search form above to find NFTs.'
        }
      />
    </div>
  )
}
