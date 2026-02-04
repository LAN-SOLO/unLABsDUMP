'use client'

import { useEffect, useState, useCallback } from 'react'
import { subscribeToNFTs, subscribeToPurchases } from '@/lib/realtime/subscriptions'
import { handleNFTEvent, handlePurchaseEvent } from '@/lib/realtime/handlers'
import { getRealtimeClient, type RealtimePayload } from '@/lib/realtime/client'
import type { Notification } from '@/lib/notifications/types'

export interface InventoryUpdate {
  id: string
  nftId: string
  nftName: string
  action: 'added' | 'removed' | 'updated'
  timestamp: string
}

interface UseRealtimeInventoryOptions {
  walletAddress: string | null
  playerId: string | null
  onNotification?: (notification: Notification) => void
  onInventoryChange?: () => void
}

export function useRealtimeInventory({
  walletAddress,
  playerId,
  onNotification,
  onInventoryChange,
}: UseRealtimeInventoryOptions) {
  const [updates, setUpdates] = useState<InventoryUpdate[]>([])
  const [totalChanges, setTotalChanges] = useState(0)
  const [lastInventoryUpdate, setLastInventoryUpdate] = useState<string | null>(null)

  const handleNFTPayload = useCallback(
    (payload: RealtimePayload) => {
      const record = payload.new

      const action =
        payload.eventType === 'INSERT'
          ? 'added'
          : payload.eventType === 'DELETE'
            ? 'removed'
            : 'updated'

      const update: InventoryUpdate = {
        id: crypto.randomUUID(),
        nftId: record.id as string,
        nftName: (record.name as string) || 'Unknown NFT',
        action,
        timestamp: new Date().toISOString(),
      }

      setUpdates((prev) => [update, ...prev].slice(0, 100))
      setTotalChanges((prev) => prev + 1)
      setLastInventoryUpdate(update.timestamp)

      if (onNotification) {
        handleNFTEvent(payload, onNotification)
      }

      onInventoryChange?.()
    },
    [onNotification, onInventoryChange]
  )

  const handlePurchasePayload = useCallback(
    (payload: RealtimePayload) => {
      const record = payload.new

      if (payload.eventType === 'INSERT') {
        const update: InventoryUpdate = {
          id: crypto.randomUUID(),
          nftId: record.nft_id as string,
          nftName: (record.nft_name as string) || 'Purchased NFT',
          action: 'added',
          timestamp: new Date().toISOString(),
        }

        setUpdates((prev) => [update, ...prev].slice(0, 100))
        setTotalChanges((prev) => prev + 1)
        setLastInventoryUpdate(update.timestamp)

        if (onNotification) {
          handlePurchaseEvent(payload, onNotification)
        }

        onInventoryChange?.()
      }
    },
    [onNotification, onInventoryChange]
  )

  useEffect(() => {
    if (!walletAddress || !playerId) return

    subscribeToNFTs({ walletAddress, playerId }, handleNFTPayload)

    subscribeToPurchases({ walletAddress, playerId }, handlePurchasePayload)

    return () => {
      const client = getRealtimeClient()
      client.unsubscribe(`nfts:${playerId}`)
      client.unsubscribe(`purchases:${walletAddress}`)
    }
  }, [walletAddress, playerId, handleNFTPayload, handlePurchasePayload])

  const clearUpdates = useCallback(() => {
    setUpdates([])
    setTotalChanges(0)
  }, [])

  return {
    updates,
    totalChanges,
    lastInventoryUpdate,
    clearUpdates,
  }
}
