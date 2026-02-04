'use client'

import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Loader2, Wallet, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PurchaseSummary } from './purchase-summary'
import { PurchaseConfirmation } from './purchase-confirmation'
import { PurchaseError } from './purchase-error'
import { buildPurchaseTransaction } from '@/lib/purchase/transaction'
import { submitTransaction } from '@/lib/purchase/submit'

type PurchaseStep = 'review' | 'signing' | 'processing' | 'confirmed' | 'error'

interface PurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  packageName: string
  priceInSol: number
  unscAmount: string
  nftCount: number
  onPurchaseStateChange: (state: 'idle' | 'processing' | 'success' | 'error') => void
}

const STEP_LABELS: Record<PurchaseStep, string> = {
  review: 'Review Order',
  signing: 'Confirm in Wallet',
  processing: 'Processing',
  confirmed: 'Confirmed',
  error: 'Error',
}

export function PurchaseModal({
  open,
  onOpenChange,
  packageId,
  packageName,
  priceInSol,
  unscAmount,
  nftCount,
  onPurchaseStateChange,
}: PurchaseModalProps) {
  const { publicKey, signTransaction } = useWallet()
  const [step, setStep] = useState<PurchaseStep>('review')
  const [error, setError] = useState<string>('')
  const [txSignature, setTxSignature] = useState<string>('')

  const resetState = useCallback(() => {
    setStep('review')
    setError('')
    setTxSignature('')
    onPurchaseStateChange('idle')
  }, [onPurchaseStateChange])

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        // Only allow close in review, confirmed, or error states
        if (step === 'signing' || step === 'processing') return
        resetState()
      }
      onOpenChange(isOpen)
    },
    [step, onOpenChange, resetState]
  )

  const handlePurchase = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setError('Wallet not connected or does not support signing.')
      setStep('error')
      onPurchaseStateChange('error')
      return
    }

    try {
      // Step 1 -> 2: Build and sign transaction
      setStep('signing')
      onPurchaseStateChange('processing')

      const transaction = await buildPurchaseTransaction(packageId, publicKey, priceInSol)

      const signedTransaction = await signTransaction(transaction)

      // Step 2 -> 3: Submit transaction
      setStep('processing')

      const result = await submitTransaction(signedTransaction)

      if (!result.confirmed || !result.signature) {
        throw new Error(result.error || 'Transaction was not confirmed')
      }

      setTxSignature(result.signature)

      // Step 3 -> 4: Verify with backend
      const response = await fetch(`/api/packages/${packageId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionSignature: result.signature,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to record purchase')
      }

      // Success
      setStep('confirmed')
      onPurchaseStateChange('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'

      // Check for user rejection
      if (message.includes('User rejected') || message.includes('rejected the request')) {
        setError('Transaction was cancelled by user.')
      } else {
        setError(message)
      }

      setStep('error')
      onPurchaseStateChange('error')
    }
  }, [publicKey, signTransaction, packageId, priceInSol, onPurchaseStateChange])

  const handleRetry = useCallback(() => {
    setStep('review')
    setError('')
    onPurchaseStateChange('idle')
  }, [onPurchaseStateChange])

  // Step progress indicator
  const stepIndex = ['review', 'signing', 'processing', 'confirmed'].indexOf(
    step === 'error' ? 'review' : step
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="bg-slate-900 border-slate-800 sm:max-w-md"
        showCloseButton={step !== 'signing' && step !== 'processing'}
      >
        <DialogHeader>
          <DialogTitle className="text-white">{STEP_LABELS[step]}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === 'review' && 'Review your order before purchasing.'}
            {step === 'signing' && 'Please confirm the transaction in your wallet.'}
            {step === 'processing' && 'Your transaction is being processed.'}
            {step === 'confirmed' && 'Your purchase has been confirmed!'}
            {step === 'error' && 'There was an issue with your purchase.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step progress dots */}
        {step !== 'error' && (
          <div className="flex items-center justify-center gap-2 py-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i <= stepIndex
                      ? i === stepIndex
                        ? 'bg-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-purple-500'
                      : 'bg-slate-700'
                  }`}
                />
                {i < 3 && (
                  <div
                    className={`w-8 h-0.5 ${i < stepIndex ? 'bg-purple-500' : 'bg-slate-700'}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <Separator className="bg-slate-800" />

        {/* Step content */}
        {step === 'review' && (
          <div className="space-y-4">
            <PurchaseSummary
              packageName={packageName}
              priceInSol={priceInSol}
              unscAmount={unscAmount}
              nftCount={nftCount}
            />
            <Button
              onClick={handlePurchase}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold h-11 glow-button"
            >
              Confirm Purchase
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'signing' && (
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Wallet className="size-8 text-purple-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Waiting for Wallet Confirmation</p>
              <p className="text-sm text-slate-400">
                Please approve the transaction in your wallet extension.
              </p>
            </div>
            <Loader2 className="size-5 text-purple-400 animate-spin mx-auto" />
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <Loader2 className="size-8 text-cyan-400 animate-spin" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Transaction Submitted</p>
              <p className="text-sm text-slate-400">
                Waiting for on-chain confirmation. This may take a few seconds.
              </p>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {step === 'confirmed' && (
          <PurchaseConfirmation
            transactionSignature={txSignature}
            packageName={packageName}
            onClose={() => handleClose(false)}
          />
        )}

        {step === 'error' && (
          <PurchaseError error={error} onRetry={handleRetry} onClose={() => handleClose(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
