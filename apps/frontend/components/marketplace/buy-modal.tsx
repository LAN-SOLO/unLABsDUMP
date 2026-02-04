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
      <DialogContent className="border-slate-700 bg-slate-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === 'confirm' && 'Confirm Purchase'}
            {step === 'signing' && 'Signing Transaction'}
            {step === 'result' && (purchaseSuccess ? 'Purchase Complete' : 'Purchase Failed')}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
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
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-700">
                <img
                  src={listing.nftImage || '/placeholder-nft.png'}
                  alt={listing.nftName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">{listing.nftName}</h3>
                <Badge variant="outline" className="mt-1 text-[10px] capitalize text-slate-300">
                  {listing.nftRarity}
                </Badge>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.values(listing.traits).map((trait) => (
                    <span
                      key={trait}
                      className="rounded bg-slate-700 px-1 py-0.5 text-[9px] text-slate-400"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 rounded-lg bg-slate-800/30 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">NFT Price</span>
                <span className="text-white">{formatSol(listing.priceInSol)} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Marketplace Fee ({MARKETPLACE_FEE_PERCENT}%)</span>
                <span className="text-slate-300">{formatSol(fee)} SOL</span>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-200">Total Cost</span>
                <span className="text-purple-400">{formatSol(total)} SOL</span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-800/50 bg-amber-950/30 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-300/80">
                Purchases are final. Ensure you have sufficient SOL balance before confirming.
              </p>
            </div>
          </div>
        )}

        {/* Signing step */}
        {step === 'signing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-purple-500" />
            <p className="text-sm text-slate-300">Waiting for wallet approval...</p>
            <p className="mt-1 text-xs text-slate-500">
              Confirm the transaction of {formatSol(total)} SOL
            </p>
          </div>
        )}

        {/* Result step */}
        {step === 'result' && (
          <div className="flex flex-col items-center justify-center py-8">
            {purchaseSuccess ? (
              <>
                <div className="mb-4 rounded-full bg-green-900/30 p-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-sm font-medium text-white">Purchase Successful</p>
                <p className="mt-1 text-center text-xs text-slate-400">
                  {listing.nftName} has been added to your inventory
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 rounded-full bg-red-900/30 p-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-sm font-medium text-white">Purchase Failed</p>
                <p className="mt-1 text-center text-xs text-red-400">
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
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button onClick={handleBuy} className="bg-purple-600 hover:bg-purple-700">
                <ShoppingCart className="mr-1 h-4 w-4" />
                Buy for {formatSol(total)} SOL
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button
              onClick={() => handleOpenChange(false)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {purchaseSuccess ? 'View Inventory' : 'Close'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
