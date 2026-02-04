'use client'

import { useEffect, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Wallet, Coins } from 'lucide-react'

import { getUnscBalance } from '@/lib/wallet/balance'

interface WalletBalances {
  sol: number
  unsc: number
}

export function WalletStatus() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [balances, setBalances] = useState<WalletBalances | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!publicKey || !connection || !connected) {
      setBalances(null)
      return
    }

    let cancelled = false

    async function fetchBalances() {
      setLoading(true)
      try {
        const [lamports, unsc] = await Promise.all([
          connection.getBalance(publicKey!),
          getUnscBalance(connection, publicKey!),
        ])

        if (!cancelled) {
          setBalances({
            sol: lamports / LAMPORTS_PER_SOL,
            unsc,
          })
        }
      } catch {
        if (!cancelled) setBalances(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBalances()

    const interval = setInterval(fetchBalances, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [publicKey, connection, connected])

  if (!connected || !publicKey) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-muted-foreground">
        <Wallet className="size-4" />
        <span>No wallet connected</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-mono text-xs text-slate-300">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </span>
      </div>

      {loading ? (
        <div className="flex gap-4 text-xs text-muted-foreground animate-pulse">
          <span>Loading balances...</span>
        </div>
      ) : balances ? (
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Coins className="size-3.5 text-purple-400" />
            <span className="text-slate-300">{balances.sol.toFixed(4)} SOL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="size-3.5 text-cyan-400" />
            <span className="text-slate-300">{balances.unsc.toLocaleString()} _unSC</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
