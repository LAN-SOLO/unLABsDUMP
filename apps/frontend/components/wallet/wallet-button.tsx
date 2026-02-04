'use client'

import { useCallback, useEffect, useState } from 'react'
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

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)

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

  const handleDisconnect = useCallback(async () => {
    await disconnect()
    toast.success('Wallet disconnected')
  }, [disconnect])

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
        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white glow-button"
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
          className="gap-2 border-purple-600/30 bg-purple-600/10 hover:bg-purple-600/20 text-slate-200"
        >
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-xs">{truncateAddress(publicKey.toBase58())}</span>
          {balance !== null && (
            <span className="text-xs text-muted-foreground">{balance.toFixed(2)} SOL</span>
          )}
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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
