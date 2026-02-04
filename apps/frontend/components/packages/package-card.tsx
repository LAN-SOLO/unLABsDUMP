'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Coins, ImageIcon, Sparkles, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSol } from '@/lib/purchase/transaction'

interface NftPreview {
  id: string
  name: string
  thumbnail_url: string | null
}

export interface PackageCardProps {
  id: string
  name: string
  description: string | null
  price_sol: string
  unsc_amount: string
  nft_count: number
  nft_previews: NftPreview[]
  total_supply: number | null
  sold_count: number
  featured: boolean
  category: string | null
  bestValue?: boolean
  is_featured?: boolean
  stock?: number
  sale_ends_at?: string | null
}

function useCountdown(targetDate: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!targetDate) return

    function calc() {
      const diff = new Date(targetDate!).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Ended')
        return
      }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      if (d > 0) {
        setTimeLeft(`${d}d ${h}h ${m}m`)
      } else {
        setTimeLeft(`${h}h ${m}m ${s}s`)
      }
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

export function PackageCard({
  id,
  name,
  description,
  price_sol,
  unsc_amount,
  nft_count,
  nft_previews,
  total_supply,
  sold_count,
  featured,
  bestValue,
  is_featured,
  stock,
  sale_ends_at,
}: PackageCardProps) {
  const remaining = total_supply != null ? total_supply - sold_count : null
  const computedStock = stock ?? remaining
  const isSoldOut = computedStock !== null && computedStock !== undefined && computedStock <= 0
  const isLowStock =
    computedStock !== null &&
    computedStock !== undefined &&
    computedStock > 0 &&
    computedStock <= 10
  const showBestValue = bestValue || is_featured || featured
  const priceNum = parseFloat(price_sol)
  const unscNum = parseFloat(unsc_amount || '0')
  // Rough USD estimate placeholder: 1 SOL ~ $150
  const usdEstimate = (priceNum * 150).toFixed(2)
  const countdown = useCountdown(sale_ends_at)

  return (
    <Card
      className={`group relative overflow-hidden border transition-all duration-300 py-0 gap-0 ${
        showBestValue
          ? 'border-amber-500/50 glow-purple'
          : 'border-slate-800 hover:border-purple-500/50'
      } bg-slate-900 ${isSoldOut ? 'opacity-75 pointer-events-none' : 'hover:shadow-lg hover:shadow-purple-500/10'}`}
    >
      {/* Best Value badge */}
      {showBestValue && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-amber-500 text-black border-0 gap-1 font-semibold shadow-lg">
            <Sparkles className="size-3" />
            Best Value
          </Badge>
        </div>
      )}

      {/* Sold Out overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 z-20 bg-slate-900/70 flex items-center justify-center rounded-lg">
          <span className="text-xl font-bold text-red-400 tracking-wider uppercase">Sold Out</span>
        </div>
      )}

      {/* Image / Icon area */}
      <div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        {/* NFT Thumbnails */}
        {nft_previews.length > 0 ? (
          <div className="flex items-center justify-center gap-2 p-4">
            {nft_previews.map((nft, i) => (
              <div
                key={nft.id}
                className={`relative rounded-lg overflow-hidden border border-slate-700 ${
                  i === 0 ? 'w-20 h-20' : 'w-16 h-16 opacity-75'
                } transition-transform group-hover:scale-105`}
              >
                {nft.thumbnail_url ? (
                  <img
                    src={nft.thumbnail_url}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <ImageIcon className="size-6 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
            {nft_count > 3 && (
              <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="text-sm text-slate-400">+{nft_count - 3}</span>
              </div>
            )}
          </div>
        ) : (
          <Package className="size-16 text-slate-600 group-hover:text-purple-500/50 transition-colors" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
      </div>

      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Package name */}
        <h3 className="text-lg font-semibold text-white truncate">{name}</h3>

        {/* Description */}
        {description && <p className="text-sm text-slate-400 line-clamp-2">{description}</p>}

        {/* Contents summary */}
        <div className="flex items-center gap-3 text-sm">
          {nft_count > 0 && (
            <div className="flex items-center gap-1 text-slate-300">
              <ImageIcon className="size-4 text-purple-400" />
              <span>
                {nft_count} NFT{nft_count !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {unscNum > 0 && (
            <div className="flex items-center gap-1 text-slate-300">
              <Coins className="size-4 text-cyan-400" />
              <span>{Number(unscNum).toLocaleString()} _unSC</span>
            </div>
          )}
        </div>

        {/* Stock indicator */}
        {isSoldOut && (
          <Badge
            variant="destructive"
            className="w-fit bg-red-500/20 text-red-400 border-red-500/30"
          >
            Sold Out
          </Badge>
        )}
        {isLowStock && (
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            <AlertTriangle className="size-3.5" />
            <span>{computedStock} remaining</span>
          </div>
        )}

        {/* Sale countdown */}
        {sale_ends_at && countdown && countdown !== 'Ended' && (
          <div className="flex items-center gap-1.5 text-sm text-cyan-400">
            <Clock className="size-3.5" />
            <span>Sale ends in {countdown}</span>
          </div>
        )}
        {sale_ends_at && countdown === 'Ended' && (
          <Badge variant="secondary" className="w-fit bg-slate-800 text-slate-500 border-slate-700">
            Sale Ended
          </Badge>
        )}

        {/* Price section */}
        <div className="mt-auto pt-3 border-t border-slate-800">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {formatSol(priceNum)}{' '}
                <span className="text-base font-normal text-slate-400">SOL</span>
              </p>
              <p className="text-xs text-slate-500">~${usdEstimate} USD</p>
            </div>

            <Button
              asChild
              size="sm"
              disabled={isSoldOut}
              className={
                isSoldOut
                  ? 'opacity-50 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }
            >
              <Link href={`/packages/${id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
