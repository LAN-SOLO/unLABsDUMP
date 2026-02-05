'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ListingForm } from '@/components/trading/listing-form'
import { ListingPreview } from '@/components/trading/listing-preview'
import type { NftItem } from '@/components/inventory/inventory-card'
import { ArrowLeft, Tag, CheckCircle } from 'lucide-react'
import { TerminalFrame } from '@/components/ui/terminal-frame'

export default function SellNftPage() {
  const params = useParams()
  const router = useRouter()
  const nftId = params.id as string

  const [nft, setNft] = useState<NftItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [listingSuccess, setListingSuccess] = useState(false)
  const [listingError, setListingError] = useState<string | null>(null)

  // Preview state (kept in sync with form)
  const [previewPrice] = useState<number | null>(null)
  const [previewDuration] = useState(7)

  // Fetch NFT details
  useEffect(() => {
    async function fetchNft() {
      try {
        const res = await fetch('/api/inventory')
        if (res.ok) {
          const data = await res.json()
          const found = (data.nfts || []).find((n: NftItem) => n.id === nftId)
          setNft(found || null)
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false)
      }
    }

    fetchNft()
  }, [nftId])

  const handleSuccess = (_listingId: string) => {
    setListingSuccess(true)
    setListingError(null)
  }

  const handleError = (error: string) => {
    setListingError(error)
    setListingSuccess(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-black">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-24">
          <h2 className="mb-2 text-xl font-semibold text-[#00FF41]">_unITM Not Found</h2>
          <p className="mb-6 text-sm text-[#00AA2A]">
            This _unITM does not exist in your inventory.
          </p>
          <Button
            onClick={() => router.push('/inventory')}
            className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
      </div>
    )
  }

  if (listingSuccess) {
    return (
      <div className="min-h-screen bg-black">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-24">
          <div className="mb-6 rounded-full bg-[#0D3B1E]/30 p-4">
            <CheckCircle className="h-12 w-12 text-[#00FF41]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[#00FF41]">_unITM Listed Successfully</h2>
          <p className="mb-6 text-center text-sm text-[#00AA2A]">
            {nft.name} is now listed on the marketplace. You will be notified when someone makes a
            purchase.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/marketplace')}
              className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
            >
              View Marketplace
            </Button>
            <Button
              onClick={() => router.push('/inventory')}
              variant="outline"
              className="border-[#1A3A2A] text-[#00CC33]"
            >
              Back to Inventory
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/inventory')}
            className="mb-4 text-[#00AA2A] hover:text-[#00FF41]"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Inventory
          </Button>
          <TerminalFrame
            title="SELL.trx"
            pid="041"
            status="CHAIN: READY"
            statusLabel="AWAITING"
            borderStyle="single"
          >
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-5 w-5 text-[#00FF41]" />
                <h1 className="text-xl font-bold text-[#00FF41]">List _unITM for Sale</h1>
              </div>
              <div className="ml-7 border-l border-dashed border-[#00FF41]/20 pl-4">
                <p className="text-sm text-[#00AA2A]">
                  Set your price and list {nft.name} on the marketplace
                </p>
              </div>
            </div>
          </TerminalFrame>
        </div>

        {listingError && (
          <div className="mb-6 rounded-sm border border-[#FF3333]/30 bg-[#FF3333]/10 p-3 text-sm text-[#FF3333]">
            {listingError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Form */}
          <Card className="border-[#0D3B1E] bg-[#0D1117]">
            <CardHeader>
              <CardTitle className="text-base text-[#00FF41]">Listing Details</CardTitle>
            </CardHeader>
            <CardContent>
              {/* NFT Preview Card */}
              <div className="mb-6 flex items-center gap-3 rounded-sm bg-[#0D3B1E]/20 p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#1A3A2A]">
                  <img
                    src={nft.image || '/placeholder-nft.png'}
                    alt={nft.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-[#00FF41]">{nft.name}</h3>
                  <Badge variant="outline" className="mt-1 text-[10px] capitalize text-[#00CC33]">
                    {nft.rarity}
                  </Badge>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.values(nft.traits).map((trait) => (
                      <span
                        key={trait}
                        className="rounded bg-[#1A3A2A] px-1 py-0.5 text-[9px] text-[#00AA2A]"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="mb-6 bg-[#111318]" />

              <ListingForm nftId={nftId} onSuccess={handleSuccess} onError={handleError} />
            </CardContent>
          </Card>

          {/* Right: Preview */}
          <div>
            <ListingPreview nft={nft} priceInSol={previewPrice} durationDays={previewDuration} />
          </div>
        </div>
      </div>
    </div>
  )
}
