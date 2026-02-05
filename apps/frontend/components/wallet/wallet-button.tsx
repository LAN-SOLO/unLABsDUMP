'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/components/providers/auth-provider'

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function WalletButton() {
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const { connection } = useConnection()
  const { isAuthenticated, signIn, signOut } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const autoSignInAttempted = useRef(false)

  useEffect(() => {
    if (!publicKey || !connection) {
      setBalance(null)
      return
    }

    let cancelled = false

    async function fetchBalance() {
      try {
        const lamports = await connection.getBalance(publicKey!)
        if (!cancelled) {
          setBalance(lamports / LAMPORTS_PER_SOL)
        }
      } catch {
        if (!cancelled) setBalance(null)
      }
    }

    fetchBalance()

    // Re-fetch every 30 seconds while connected
    const interval = setInterval(fetchBalance, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [publicKey, connection])

  const handleConnect = useCallback(() => {
    setVisible(true)
  }, [setVisible])

  const handleSignIn = useCallback(async () => {
    setIsSigningIn(true)
    try {
      await signIn()
      toast.success('Signed in successfully')
    } catch (err) {
      // Handle wallet disconnection during signing gracefully
      const message = err instanceof Error ? err.message : 'Sign in failed'
      if (message.includes('disconnected') || message.includes('Disconnected')) {
        // User disconnected wallet - don't show error, just reset state
        autoSignInAttempted.current = false
      } else {
        toast.error(message)
      }
    } finally {
      setIsSigningIn(false)
    }
  }, [signIn])

  // Auto sign-in once when wallet connects and not yet authenticated
  useEffect(() => {
    if (
      connected &&
      publicKey &&
      !isAuthenticated &&
      !isSigningIn &&
      !autoSignInAttempted.current
    ) {
      autoSignInAttempted.current = true
      handleSignIn()
    }
    // Reset when wallet disconnects
    if (!connected) {
      autoSignInAttempted.current = false
    }
  }, [connected, publicKey, isAuthenticated, isSigningIn, handleSignIn])

  const handleDisconnect = useCallback(async () => {
    await signOut()
    toast.success('Wallet disconnected')
  }, [signOut])

  const handleCopyAddress = useCallback(() => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      toast.success('Address copied to clipboard')
    }
  }, [publicKey])

  const handleViewExplorer = useCallback(() => {
    if (publicKey) {
      window.open(`https://solscan.io/account/${publicKey.toBase58()}`, '_blank')
    }
  }, [publicKey])

  if (!connected || !publicKey) {
    return (
      <Button
        onClick={handleConnect}
        className="bg-[#00FF41] text-black hover:bg-[#00CC33] glow-button"
        size="sm"
      >
        <Wallet className="size-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-[#0D3B1E]/30 bg-[#0D3B1E]/20 hover:bg-[#0D3B1E]/30 text-[#00FF41]"
        >
          <div className="size-2 rounded-full bg-[#00FF41] animate-pulse" />
          <span className="font-mono text-xs">{truncateAddress(publicKey.toBase58())}</span>
          {balance !== null && (
            <span className="text-xs text-muted-foreground">{balance.toFixed(2)} SOL</span>
          )}
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {!isAuthenticated && (
          <>
            <DropdownMenuItem onClick={handleSignIn} disabled={isSigningIn}>
              <Wallet className="size-4" />
              {isSigningIn ? 'Signing in...' : 'Sign In'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleCopyAddress}>
          <Copy className="size-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewExplorer}>
          <ExternalLink className="size-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} variant="destructive">
          <LogOut className="size-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
