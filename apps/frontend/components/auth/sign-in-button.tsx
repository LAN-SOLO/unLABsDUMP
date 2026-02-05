'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Loader2, Wallet, LogOut } from 'lucide-react'

export function SignInButton() {
  const { connected } = useWallet()
  const { setVisible } = useWalletModal()
  const { isAuthenticated, user, signIn, signOut, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setError(null)

    if (isAuthenticated) {
      try {
        await signOut()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign out failed')
      }
      return
    }

    if (!connected) {
      setVisible(true)
      return
    }

    try {
      await signIn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    }
  }

  if (isLoading) {
    return (
      <Button disabled className="bg-[#00FF41] text-black hover:bg-[#00CC33]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (isAuthenticated && user) {
    const shortAddress = `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#00AA2A] font-mono">{shortAddress}</span>
        <Button
          onClick={handleClick}
          variant="outline"
          className="border-[#1A3A2A] text-[#00CC33] hover:bg-[#0D3B1E]/20 hover:text-[#00FF41]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleClick}
        className="bg-[#00FF41] text-black hover:bg-[#00CC33] font-medium px-6"
      >
        <Wallet className="h-4 w-4" />
        {connected ? 'Sign In with Wallet' : 'Connect Wallet'}
      </Button>
      {error && <p className="text-sm text-[#FF3333]">{error}</p>}
    </div>
  )
}
