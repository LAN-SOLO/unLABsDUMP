'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Wallet, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatSol } from '@/lib/purchase/transaction'

type PurchaseState = 'idle' | 'processing' | 'success' | 'error'

interface PackagePurchaseButtonProps {
  priceInSol: number
  isSoldOut: boolean
  onPurchase: () => void
  purchaseState?: PurchaseState
  className?: string
}

export function PackagePurchaseButton({
  priceInSol,
  isSoldOut,
  onPurchase,
  purchaseState = 'idle',
  className = '',
}: PackagePurchaseButtonProps) {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const { setVisible } = useWalletModal()
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  // Fetch balance on demand
  const checkBalance = async () => {
    if (!publicKey) return
    setBalanceLoading(true)
    try {
      const lamports = await connection.getBalance(publicKey)
      setBalance(lamports / LAMPORTS_PER_SOL)
    } catch {
      setBalance(null)
    }
    setBalanceLoading(false)
  }

  // If balance hasn't been fetched yet and wallet is connected, fetch it
  if (connected && publicKey && balance === null && !balanceLoading) {
    checkBalance()
  }

  const insufficientBalance = balance !== null && balance < priceInSol

  // Sold out state
  if (isSoldOut) {
    return (
      <Button
        disabled
        size="lg"
        className={`w-full bg-[#1A3A2A] text-[#00AA2A] cursor-not-allowed ${className}`}
      >
        Sold Out
      </Button>
    )
  }

  // Success state
  if (purchaseState === 'success') {
    return (
      <Button disabled size="lg" className={`w-full bg-[#00FF41] text-black ${className}`}>
        <Check className="size-5 mr-2" />
        Purchase Complete!
      </Button>
    )
  }

  // Processing state
  if (purchaseState === 'processing') {
    return (
      <Button disabled size="lg" className={`w-full bg-[#00FF41] text-black ${className}`}>
        <Loader2 className="size-5 mr-2 animate-spin" />
        Processing...
      </Button>
    )
  }

  // No wallet connected
  if (!connected) {
    return (
      <Button
        size="lg"
        onClick={() => setVisible(true)}
        className={`w-full bg-[#00FF41] hover:bg-[#00CC33] text-black glow-button ${className}`}
      >
        <Wallet className="size-5 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  // Balance loading
  if (balanceLoading) {
    return (
      <Button disabled size="lg" className={`w-full bg-[#1A3A2A] text-[#00CC33] ${className}`}>
        <Loader2 className="size-5 mr-2 animate-spin" />
        Checking balance...
      </Button>
    )
  }

  // Insufficient balance
  if (insufficientBalance) {
    return (
      <div className={className}>
        <Button
          disabled
          size="lg"
          className="w-full bg-[#1A3A2A] text-[#00AA2A] cursor-not-allowed"
        >
          <AlertCircle className="size-5 mr-2" />
          Insufficient Balance
        </Button>
        <p className="text-xs text-[#1A6B35] mt-1.5 text-center">
          Need {formatSol(priceInSol)} SOL &middot; You have {formatSol(balance ?? 0)} SOL
        </p>
      </div>
    )
  }

  // Ready to purchase
  return (
    <Button
      size="lg"
      onClick={onPurchase}
      className={`w-full bg-[#00FF41] hover:bg-[#00CC33] text-black font-semibold glow-button ${className}`}
    >
      Purchase for {formatSol(priceInSol)} SOL
    </Button>
  )
}
