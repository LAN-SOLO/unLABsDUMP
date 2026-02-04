import type { RealtimePayload } from './client'
import type { Notification, NotificationType } from '@/lib/notifications/types'

export type RealtimeEventHandler = (notification: Notification) => void

function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Notification {
  return {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
    data,
  }
}

export function handlePurchaseEvent(
  payload: RealtimePayload,
  onNotification: RealtimeEventHandler
): void {
  const { eventType, new: newRecord } = payload

  if (eventType === 'INSERT') {
    const notification = createNotification(
      'purchase_confirmed',
      'Purchase Confirmed',
      `Your purchase of "${newRecord.nft_name || 'NFT'}" has been confirmed.`,
      { purchaseId: newRecord.id, nftId: newRecord.nft_id }
    )
    onNotification(notification)
  }
}

export function handleNFTEvent(
  payload: RealtimePayload,
  onNotification: RealtimeEventHandler
): void {
  const { eventType, new: newRecord } = payload

  if (eventType === 'INSERT') {
    const notification = createNotification(
      'new_nft_available',
      'New NFT Received',
      `You received "${newRecord.name || 'a new NFT'}" in your inventory.`,
      { nftId: newRecord.id }
    )
    onNotification(notification)
  } else if (eventType === 'UPDATE') {
    const notification = createNotification(
      'new_nft_available',
      'NFT Updated',
      `Your NFT "${newRecord.name || 'NFT'}" has been updated.`,
      { nftId: newRecord.id }
    )
    onNotification(notification)
  }
}

export function handleTradeEvent(
  payload: RealtimePayload,
  onNotification: RealtimeEventHandler
): void {
  const { eventType, new: newRecord } = payload

  if (eventType === 'INSERT') {
    const notification = createNotification(
      'trade_offer',
      'New Trade Offer',
      `You received a trade offer for "${newRecord.nft_name || 'an NFT'}".`,
      { tradeId: newRecord.id, nftId: newRecord.nft_id }
    )
    onNotification(notification)
  } else if (eventType === 'UPDATE' && newRecord.status === 'completed') {
    const notification = createNotification(
      'trade_sold',
      'Trade Completed',
      `Your NFT "${newRecord.nft_name || 'NFT'}" has been sold!`,
      { tradeId: newRecord.id, nftId: newRecord.nft_id }
    )
    onNotification(notification)
  }
}

export function handleDeliveryEvent(
  payload: RealtimePayload,
  onNotification: RealtimeEventHandler
): void {
  const { eventType, new: newRecord } = payload

  if (eventType === 'UPDATE' && newRecord.status === 'delivered') {
    const notification = createNotification(
      'delivery_complete',
      'Delivery Complete',
      `Your NFT "${newRecord.nft_name || 'NFT'}" has been delivered to your wallet.`,
      { deliveryId: newRecord.id, nftId: newRecord.nft_id }
    )
    onNotification(notification)
  }
}

export function handlePriceDropEvent(
  payload: RealtimePayload,
  onNotification: RealtimeEventHandler
): void {
  const { eventType, new: newRecord, old: oldRecord } = payload

  if (eventType === 'UPDATE') {
    const oldPrice = oldRecord.price as number | undefined
    const newPrice = newRecord.price as number | undefined

    if (oldPrice && newPrice && newPrice < oldPrice) {
      const notification = createNotification(
        'price_drop',
        'Price Drop Alert',
        `"${newRecord.name || 'An NFT'}" dropped from ${oldPrice} to ${newPrice} SOL.`,
        { nftId: newRecord.id, oldPrice, newPrice }
      )
      onNotification(notification)
    }
  }
}
