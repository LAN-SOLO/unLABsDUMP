'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, Sparkles, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PackageContents } from './package-contents'
import { PackagePurchaseButton } from './package-purchase-button'
import { PurchaseModal } from '@/components/purchase/purchase-modal'
import { PackageCard } from './package-card'
import { formatSol } from '@/lib/purchase/transaction'

interface NftItem {
  id: string
  name: string
  description: string | null
  image_url: string | null
  thumbnail_url: string | null
  metadata: Record<string, unknown>
  status: string
  rarity_score: string | null
}

interface RelatedPackage {
  id: string
  name: string
  description: string | null
  price_sol: string
  unsc_amount: string
  nft_ids: string[]
  total_supply: number | null
  sold_count: number
  featured: boolean
  category: string | null
  nft_count: number
}

interface PackageDetailData {
  id: string
  name: string
  description: string | null
  category: string | null
  price_sol: string
  unsc_amount: string
  nft_ids: string[]
  total_supply: number | null
  sold_count: number
  reserved_count: number
  featured: boolean
  sale_starts_at: string | null
  sale_ends_at: string | null
  nfts: NftItem[]
  nft_count: number
  remaining: number | null
  is_sold_out: boolean
  related_packages: RelatedPackage[]
}

interface PackageDetailProps {
  packageData: PackageDetailData
}

export function PackageDetail({ packageData }: PackageDetailProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseState, setPurchaseState] = useState<'idle' | 'processing' | 'success' | 'error'>(
    'idle'
  )

  const priceNum = parseFloat(packageData.price_sol)
  const usdEstimate = (priceNum * 150).toFixed(2)
  const isLowStock =
    packageData.remaining !== null && packageData.remaining > 0 && packageData.remaining <= 10

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back link */}
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 text-[#00AA2A] hover:text-[#00FF41] transition-colors text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to Packages
        </Link>

        {/* Hero section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image / Visual */}
          <div className="relative">
            {packageData.featured && (
              <div className="absolute -inset-0.5 bg-[#00FF41] rounded-sm opacity-30 blur-sm" />
            )}
            <div
              className={`relative rounded-sm overflow-hidden bg-[#0D1117] border ${
                packageData.featured ? 'border-[#00FF41]/50' : 'border-[#0D3B1E]'
              }`}
            >
              <div className="aspect-square bg-gradient-to-br from-[#111318] to-[#0D1117] flex items-center justify-center">
                {packageData.nfts.length > 0 && packageData.nfts[0].image_url ? (
                  <img
                    src={packageData.nfts[0].image_url}
                    alt={packageData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="size-32 text-[#1A6B35]" />
                )}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {packageData.featured && (
                  <Badge className="bg-[#00FF41] text-black border-0 gap-1">
                    <Sparkles className="size-3" />
                    Best Value
                  </Badge>
                )}
                {packageData.category && (
                  <Badge
                    variant="secondary"
                    className="bg-[#111318]/80 text-[#00CC33] backdrop-blur-sm"
                  >
                    {packageData.category.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#00FF41] mb-2">
                {packageData.name}
              </h1>
              {packageData.description && (
                <p className="text-[#00AA2A] leading-relaxed">{packageData.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="p-4 rounded-sm bg-[#0D3B1E]/20 border border-[#1A3A2A]">
              <p className="text-sm text-[#00AA2A] mb-1">Price</p>
              <p className="text-3xl sm:text-4xl font-bold text-[#00FF41]">
                {formatSol(priceNum)}{' '}
                <span className="text-lg sm:text-xl font-normal text-[#00AA2A]">SOL</span>
              </p>
              <p className="text-sm text-[#1A6B35] mt-1">~${usdEstimate} USD</p>
            </div>

            {/* Availability */}
            <div className="flex flex-wrap gap-3">
              {packageData.is_sold_out && (
                <Badge
                  variant="destructive"
                  className="bg-[#FF3333]/20 text-[#FF3333] border-[#FF3333]/30 text-sm px-3 py-1"
                >
                  Sold Out
                </Badge>
              )}
              {isLowStock && (
                <Badge
                  variant="outline"
                  className="border-[#FFB000]/30 text-[#FFB000] gap-1 text-sm px-3 py-1"
                >
                  <AlertTriangle className="size-3.5" />
                  {packageData.remaining} remaining
                </Badge>
              )}
              {packageData.total_supply != null && !packageData.is_sold_out && !isLowStock && (
                <Badge
                  variant="outline"
                  className="border-[#1A3A2A] text-[#00CC33] gap-1 text-sm px-3 py-1"
                >
                  <TrendingUp className="size-3.5" />
                  {packageData.remaining} of {packageData.total_supply} available
                </Badge>
              )}
              {packageData.sale_ends_at && (
                <Badge
                  variant="outline"
                  className="border-[#1A3A2A] text-[#00CC33] gap-1 text-sm px-3 py-1"
                >
                  <Clock className="size-3.5" />
                  Sale ends {new Date(packageData.sale_ends_at).toLocaleDateString()}
                </Badge>
              )}
              {packageData.sold_count > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-[#111318] text-[#00AA2A] text-sm px-3 py-1"
                >
                  {packageData.sold_count} sold
                </Badge>
              )}
            </div>

            {/* Purchase button */}
            <PackagePurchaseButton
              priceInSol={priceNum}
              isSoldOut={packageData.is_sold_out}
              onPurchase={() => setShowPurchaseModal(true)}
              purchaseState={purchaseState}
            />
          </div>
        </div>

        <Separator className="bg-[#0D3B1E]" />

        {/* Contents breakdown */}
        <PackageContents unscAmount={packageData.unsc_amount} nfts={packageData.nfts} />

        {/* Related packages */}
        {packageData.related_packages.length > 0 && (
          <>
            <Separator className="bg-[#0D3B1E]" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#00FF41]">Related Packages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {packageData.related_packages.map((rp) => (
                  <PackageCard
                    key={rp.id}
                    id={rp.id}
                    name={rp.name}
                    description={rp.description}
                    price_sol={rp.price_sol}
                    unsc_amount={rp.unsc_amount}
                    nft_count={rp.nft_count}
                    nft_previews={[]}
                    total_supply={rp.total_supply}
                    sold_count={rp.sold_count}
                    featured={rp.featured}
                    category={rp.category}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Purchase modal */}
      <PurchaseModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        packageId={packageData.id}
        packageName={packageData.name}
        priceInSol={priceNum}
        unscAmount={packageData.unsc_amount}
        nftCount={packageData.nft_count}
        onPurchaseStateChange={setPurchaseState}
      />
    </>
  )
}
