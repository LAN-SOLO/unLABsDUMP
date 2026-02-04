'use client'

import { useEffect, useState, useCallback } from 'react'
import { subscribeToDeliveries } from '@/lib/realtime/subscriptions'
import { handleDeliveryEvent } from '@/lib/realtime/handlers'
import { getRealtimeClient, type RealtimePayload } from '@/lib/realtime/client'
import type { Notification } from '@/lib/notifications/types'

export interface DeliveryStatus {
  id: string
  nftId: string
  status: 'pending' | 'processing' | 'delivered' | 'failed'
  updatedAt: string
}

interface UseRealtimeDeliveryOptions {
  walletAddress: string | null
  playerId: string | null
  onNotification?: (notification: Notification) => void
}

export function useRealtimeDelivery({
  walletAddress,
  playerId,
  onNotification,
}: UseRealtimeDeliveryOptions) {
  const [deliveries, setDeliveries] = useState<DeliveryStatus[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const handleEvent = useCallback(
    (payload: RealtimePayload) => {
      const record = payload.new

      setDeliveries((prev) => {
        const existing = prev.findIndex((d) => d.id === record.id)
        const updated: DeliveryStatus = {
          id: record.id as string,
          nftId: record.nft_id as string,
          status: record.status as DeliveryStatus['status'],
          updatedAt: record.updated_at as string,
        }

        if (existing >= 0) {
          const next = [...prev]
          next[existing] = updated
          return next
        }
        return [...prev, updated]
      })

      setLastUpdate(new Date().toISOString())

      if (onNotification) {
        handleDeliveryEvent(payload, onNotification)
      }
    },
    [onNotification]
  )

  useEffect(() => {
    if (!walletAddress || !playerId) return

    subscribeToDeliveries({ walletAddress, playerId }, handleEvent)

    return () => {
      const client = getRealtimeClient()
      client.unsubscribe(`deliveries:${walletAddress}`)
    }
  }, [walletAddress, playerId, handleEvent])

  const getDeliveryStatus = useCallback(
    (nftId: string): DeliveryStatus | undefined => {
      return deliveries.find((d) => d.nftId === nftId)
    },
    [deliveries]
  )

  return {
    deliveries,
    lastUpdate,
    getDeliveryStatus,
  }
}
