'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  formatSol,
  calculateMarketplaceFee,
  calculateTotalCost,
  MARKETPLACE_FEE_PERCENT,
} from '@/lib/trading/fees'
import type { MarketplaceListing } from './listing-card'
import { ShoppingCart, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

type BuyStep = 'confirm' | 'signing' | 'result'

interface BuyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: MarketplaceListing | null
  onPurchase: (listingId: string) => Promise<boolean>
}

export function BuyModal({ open, onOpenChange, listing, onPurchase }: BuyModalProps) {
  const [step, setStep] = useState<BuyStep>('confirm')
  const [, setIsPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Reset state on close
      setStep('confirm')
      setIsPurchasing(false)
      setPurchaseSuccess(false)
      setPurchaseError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleBuy = async () => {
    if (!listing) return

    setStep('signing')
    setIsPurchasing(true)
    setPurchaseError(null)

    try {
      const success = await onPurchase(listing.id)
      setPurchaseSuccess(success)
      setStep('result')
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Purchase failed')
      setPurchaseSuccess(false)
      setStep('result')
    } finally {
      setIsPurchasing(false)
    }
  }

  if (!listing) return null

  const fee = calculateMarketplaceFee(listing.priceInSol)
  const total = calculateTotalCost(listing.priceInSol)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#1A3A2A] bg-[#0D1117] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#00FF41]">
            {step === 'confirm' && 'Confirm Purchase'}
            {step === 'signing' && 'Signing Transaction'}
            {step === 'result' && (purchaseSuccess ? 'Purchase Complete' : 'Purchase Failed')}
          </DialogTitle>
          <DialogDescription className="text-[#00AA2A]">
            {step === 'confirm' && 'Review the purchase details'}
            {step === 'signing' && 'Please approve the transaction in your wallet'}
            {step === 'result' &&
              (purchaseSuccess ? 'You now own this NFT' : 'Something went wrong')}
          </DialogDescription>
        </DialogHeader>

        {/* Confirm step */}
        {step === 'confirm' && (
          <div className="space-y-4">
            {/* NFT Info */}
            <div className="flex items-center gap-3 rounded-sm bg-[#0D3B1E]/20 p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#1A3A2A]">
                <img
                  src={listing.nftImage || '/placeholder-nft.png'}
                  alt={listing.nftName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-[#00FF41]">{listing.nftName}</h3>
                <Badge variant="outline" className="mt-1 text-[10px] capitalize text-[#00CC33]">
                  {listing.nftRarity}
                </Badge>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.values(listing.traits).map((trait) => (
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

            {/* Price Breakdown */}
            <div className="space-y-2 rounded-sm bg-[#0D3B1E]/10 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#00AA2A]">NFT Price</span>
                <span className="text-[#00FF41]">{formatSol(listing.priceInSol)} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#00AA2A]">Marketplace Fee ({MARKETPLACE_FEE_PERCENT}%)</span>
                <span className="text-[#00CC33]">{formatSol(fee)} SOL</span>
              </div>
              <Separator className="bg-[#1A3A2A]" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-[#00FF41]">Total Cost</span>
                <span className="text-[#00FF41]">{formatSol(total)} SOL</span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 rounded-sm border border-[#FFB000]/30 bg-[#FFB000]/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB000]" />
              <p className="text-xs text-[#FFB000]/80">
                Purchases are final. Ensure you have sufficient SOL balance before confirming.
              </p>
            </div>
          </div>
        )}

        {/* Signing step */}
        {step === 'signing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#00FF41]" />
            <p className="text-sm text-[#00CC33]">Waiting for wallet approval...</p>
            <p className="mt-1 text-xs text-[#1A6B35]">
              Confirm the transaction of {formatSol(total)} SOL
            </p>
          </div>
        )}

        {/* Result step */}
        {step === 'result' && (
          <div className="flex flex-col items-center justify-center py-8">
            {purchaseSuccess ? (
              <>
                <div className="mb-4 rounded-full bg-[#0D3B1E]/30 p-3">
                  <CheckCircle className="h-8 w-8 text-[#00FF41]" />
                </div>
                <p className="text-sm font-medium text-[#00FF41]">Purchase Successful</p>
                <p className="mt-1 text-center text-xs text-[#00AA2A]">
                  {listing.nftName} has been added to your inventory
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 rounded-full bg-[#FF3333]/10 p-3">
                  <XCircle className="h-8 w-8 text-[#FF3333]" />
                </div>
                <p className="text-sm font-medium text-[#00FF41]">Purchase Failed</p>
                <p className="mt-1 text-center text-xs text-[#FF3333]">
                  {purchaseError || 'An error occurred during the purchase'}
                </p>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'confirm' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="border-[#1A3A2A] text-[#00CC33]"
              >
                Cancel
              </Button>
              <Button onClick={handleBuy} className="bg-[#00FF41] text-black hover:bg-[#00CC33]">
                <ShoppingCart className="mr-1 h-4 w-4" />
                Buy for {formatSol(total)} SOL
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button
              onClick={() => handleOpenChange(false)}
              className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
            >
              {purchaseSuccess ? 'View Inventory' : 'Close'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
