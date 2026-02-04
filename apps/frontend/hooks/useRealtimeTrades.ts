'use client'

import { useEffect, useState, useCallback } from 'react'
import { subscribeToTrades } from '@/lib/realtime/subscriptions'
import { handleTradeEvent } from '@/lib/realtime/handlers'
import { getRealtimeClient, type RealtimePayload } from '@/lib/realtime/client'
import type { Notification } from '@/lib/notifications/types'

export interface TradeActivity {
  id: string
  nftId: string
  nftName: string
  buyerWallet: string
  sellerWallet: string
  price: number
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  timestamp: string
}

interface UseRealtimeTradesOptions {
  walletAddress: string | null
  playerId: string | null
  onNotification?: (notification: Notification) => void
}

export function useRealtimeTrades({
  walletAddress,
  playerId,
  onNotification,
}: UseRealtimeTradesOptions) {
  const [trades, setTrades] = useState<TradeActivity[]>([])
  const [lastTradeUpdate, setLastTradeUpdate] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  const handleEvent = useCallback(
    (payload: RealtimePayload) => {
      const record = payload.new

      const activity: TradeActivity = {
        id: record.id as string,
        nftId: record.nft_id as string,
        nftName: (record.nft_name as string) || 'Unknown NFT',
        buyerWallet: record.buyer_wallet as string,
        sellerWallet: record.seller_wallet as string,
        price: record.price as number,
        status: record.status as TradeActivity['status'],
        eventType: payload.eventType,
        timestamp: new Date().toISOString(),
      }

      setTrades((prev) => [activity, ...prev].slice(0, 50))
      setLastTradeUpdate(activity.timestamp)

      setPendingCount((prev) => {
        if (payload.eventType === 'INSERT' && activity.status === 'pending') {
          return prev + 1
        }
        if (
          payload.eventType === 'UPDATE' &&
          (activity.status === 'completed' || activity.status === 'cancelled')
        ) {
          return Math.max(0, prev - 1)
        }
        return prev
      })

      if (onNotification) {
        handleTradeEvent(payload, onNotification)
      }
    },
    [onNotification]
  )

  useEffect(() => {
    if (!walletAddress || !playerId) return

    subscribeToTrades({ walletAddress, playerId }, handleEvent)

    return () => {
      const client = getRealtimeClient()
      client.unsubscribe(`trades:${playerId}`)
    }
  }, [walletAddress, playerId, handleEvent])

  const clearTrades = useCallback(() => {
    setTrades([])
    setPendingCount(0)
  }, [])

  return {
    trades,
    lastTradeUpdate,
    pendingCount,
    clearTrades,
  }
}
