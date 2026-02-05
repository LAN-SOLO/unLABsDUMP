'use client'

import { useState, useCallback } from 'react'
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
import { AddressInput } from './address-input'
import type { NftItem } from './inventory-card'
import { AlertTriangle, ArrowRight, CheckCircle, XCircle, Loader2, Send } from 'lucide-react'

type TransferStep = 'address' | 'confirm' | 'signing' | 'result'

interface TransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nft: NftItem | null
  senderAddress: string
  onTransfer: (nftId: string, recipientAddress: string) => Promise<boolean>
}

export function TransferModal({
  open,
  onOpenChange,
  nft,
  senderAddress,
  onTransfer,
}: TransferModalProps) {
  const [step, setStep] = useState<TransferStep>('address')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isAddressValid, setIsAddressValid] = useState(false)
  const [, setIsTransferring] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStep('address')
    setRecipientAddress('')
    setIsAddressValid(false)
    setIsTransferring(false)
    setTransferSuccess(false)
    setTransferError(null)
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset()
    }
    onOpenChange(nextOpen)
  }

  const handleConfirm = () => {
    if (!isAddressValid) return
    setStep('confirm')
  }

  const handleSign = async () => {
    if (!nft) return

    setStep('signing')
    setIsTransferring(true)
    setTransferError(null)

    try {
      const success = await onTransfer(nft.id, recipientAddress)
      setTransferSuccess(success)
      setStep('result')
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Transfer failed')
      setStep('result')
      setTransferSuccess(false)
    } finally {
      setIsTransferring(false)
    }
  }

  if (!nft) return null

  const truncatedRecipient = recipientAddress
    ? `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-6)}`
    : ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-[#1A3A2A] bg-[#0D1117] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#00FF41]">
            {step === 'address' && 'Transfer NFT'}
            {step === 'confirm' && 'Confirm Transfer'}
            {step === 'signing' && 'Signing Transaction'}
            {step === 'result' && (transferSuccess ? 'Transfer Complete' : 'Transfer Failed')}
          </DialogTitle>
          <DialogDescription className="text-[#00AA2A]">
            {step === 'address' && 'Enter the recipient wallet address'}
            {step === 'confirm' && 'Review the transfer details carefully'}
            {step === 'signing' && 'Please approve the transaction in your wallet'}
            {step === 'result' &&
              (transferSuccess
                ? 'Your NFT has been transferred successfully'
                : 'Something went wrong')}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Address Input */}
        {step === 'address' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-sm bg-[#0D3B1E]/20 p-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-[#1A3A2A]">
                <img
                  src={nft.image || '/placeholder-nft.png'}
                  alt={nft.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#00FF41]">{nft.name}</p>
                <Badge variant="outline" className="mt-0.5 text-[10px] capitalize text-[#00CC33]">
                  {nft.rarity}
                </Badge>
              </div>
            </div>

            <AddressInput
              value={recipientAddress}
              onChange={setRecipientAddress}
              senderAddress={senderAddress}
              onValidation={setIsAddressValid}
            />

            <div className="flex items-start gap-2 rounded-sm border border-[#FFB000]/30 bg-[#FFB000]/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB000]" />
              <p className="text-xs text-[#FFB000]/80">
                Transfers cannot be undone. Make sure the recipient address is correct before
                proceeding.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-sm bg-[#0D3B1E]/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-[#00AA2A]">From (You)</p>
                  <p className="mt-1 font-mono text-xs text-[#00FF41]">
                    {senderAddress.slice(0, 6)}...{senderAddress.slice(-4)}
                  </p>
                </div>
                <ArrowRight className="mx-3 h-5 w-5 text-[#00FF41]" />
                <div className="text-center">
                  <p className="text-xs text-[#00AA2A]">To</p>
                  <p className="mt-1 font-mono text-xs text-[#00FF41]">{truncatedRecipient}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-[#1A3A2A]" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#00AA2A]">NFT</span>
                <span className="font-medium text-[#00FF41]">{nft.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#00AA2A]">Rarity</span>
                <span className="capitalize text-[#00FF41]">{nft.rarity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#00AA2A]">Mint</span>
                <span className="font-mono text-xs text-[#00CC33]">
                  {nft.mintAddress.slice(0, 8)}...{nft.mintAddress.slice(-4)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-sm border border-[#FF3333]/30 bg-[#FF3333]/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3333]" />
              <p className="text-xs text-[#FF3333]/80">
                This action is irreversible. Once confirmed, the NFT will be permanently transferred
                to the recipient.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Signing */}
        {step === 'signing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#00FF41]" />
            <p className="text-sm text-[#00CC33]">Waiting for wallet approval...</p>
            <p className="mt-1 text-xs text-[#1A6B35]">
              Please confirm the transaction in your wallet
            </p>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && (
          <div className="flex flex-col items-center justify-center py-8">
            {transferSuccess ? (
              <>
                <div className="mb-4 rounded-full bg-[#0D3B1E]/30 p-3">
                  <CheckCircle className="h-8 w-8 text-[#00FF41]" />
                </div>
                <p className="text-sm font-medium text-[#00FF41]">Transfer Successful</p>
                <p className="mt-1 text-center text-xs text-[#00AA2A]">
                  {nft.name} has been transferred to {truncatedRecipient}
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 rounded-full bg-[#FF3333]/10 p-3">
                  <XCircle className="h-8 w-8 text-[#FF3333]" />
                </div>
                <p className="text-sm font-medium text-[#00FF41]">Transfer Failed</p>
                <p className="mt-1 text-center text-xs text-[#FF3333]">
                  {transferError || 'An error occurred during the transfer'}
                </p>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'address' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="border-[#1A3A2A] text-[#00CC33]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!isAddressValid}
                className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
              >
                <ArrowRight className="mr-1 h-4 w-4" />
                Continue
              </Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('address')}
                className="border-[#1A3A2A] text-[#00CC33]"
              >
                Back
              </Button>
              <Button onClick={handleSign} className="bg-[#FF3333] hover:bg-[#FF3333]/80">
                <Send className="mr-1 h-4 w-4" />
                Confirm Transfer
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button
              onClick={() => handleOpenChange(false)}
              className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
            >
              {transferSuccess ? 'Done' : 'Close'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
