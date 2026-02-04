'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins, Image, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BalanceData {
  walletAddress: string
  solBalance: number
  tokenBalance: number
  nftCount: number
}

export function BalanceDisplay() {
  const [balance, setBalance] = useState<BalanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/player/balance')
      if (res.ok) {
        const data = await res.json()
        setBalance(data)
      }
    } catch {
      // Silently handle balance fetch errors
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchBalance()
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20 bg-slate-800" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Balances</h3>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SOL Balance */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">S</span>
              </div>
              SOL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {balance?.solBalance?.toFixed(4) ?? '0.0000'}
            </p>
          </CardContent>
        </Card>

        {/* _unSC Token Balance */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-cyan-500" />
              _unSC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {balance?.tokenBalance?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) ?? '0.00'}
            </p>
          </CardContent>
        </Card>

        {/* NFT Count */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Image className="h-4 w-4 text-purple-500" />
              NFTs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{balance?.nftCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
