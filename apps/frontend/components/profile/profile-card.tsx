'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletAddress } from './wallet-address'
import { BalanceDisplay } from './balance-display'
import { useAuth } from '@/components/providers/auth-provider'
import { User, Calendar, Clock, ShoppingBag, ExternalLink } from 'lucide-react'

interface PlayerProfile {
  id: string
  wallet_address: string
  created_at: string
  last_login: string
  nft_count: number | null
  total_purchases: number | null
}

export function ProfileCard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/player/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.player)
        }
      } catch {
        // Silently handle profile fetch errors
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-slate-800" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-64 bg-slate-800" />
            <Skeleton className="h-5 w-48 bg-slate-800" />
            <Skeleton className="h-5 w-56 bg-slate-800" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="py-8 text-center">
          <p className="text-slate-400">Unable to load profile data.</p>
        </CardContent>
      </Card>
    )
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const lastLogin = profile.last_login
    ? new Date(profile.last_login).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'

  return (
    <div className="space-y-6">
      {/* Player Info Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              Player Profile
            </CardTitle>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Wallet Address */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Wallet Address
            </label>
            <WalletAddress address={profile.wallet_address} showFull />
          </div>

          {/* Player ID */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Player ID
            </label>
            <p className="font-mono text-sm text-slate-300">{profile.id}</p>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Member Since
              </label>
              <p className="text-sm text-slate-200">{memberSince}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Login
              </label>
              <p className="text-sm text-slate-200">{lastLogin}</p>
            </div>
          </div>

          {/* Purchase History Summary */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3" />
                  Total Purchases
                </label>
                <p className="text-lg font-semibold text-white">{profile.total_purchases ?? 0}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  NFTs Owned (on-chain)
                </label>
                <p className="text-lg font-semibold text-white">{profile.nft_count ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Solana Explorer Link */}
          <div className="pt-3 border-t border-slate-800">
            <a
              href={`https://explorer.solana.com/address/${profile.wallet_address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on Solana Explorer
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Balance Display */}
      <BalanceDisplay />
    </div>
  )
}
