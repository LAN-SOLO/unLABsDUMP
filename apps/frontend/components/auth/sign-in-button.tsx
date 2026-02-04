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
      <Button disabled className="bg-purple-600 hover:bg-purple-700 text-white">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (isAuthenticated && user) {
    const shortAddress = `${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400 font-mono">{shortAddress}</span>
        <Button
          onClick={handleClick}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-medium px-6"
      >
        <Wallet className="h-4 w-4" />
        {connected ? 'Sign In with Wallet' : 'Connect Wallet'}
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
