import { getRealtimeClient, type RealtimePayload } from './client'

export interface SubscriptionConfig {
  walletAddress: string
  playerId: string
}

export function subscribeToPurchases(
  config: SubscriptionConfig,
  onEvent: (payload: RealtimePayload) => void
) {
  const client = getRealtimeClient()

  return client.subscribe(`purchases:${config.walletAddress}`, {
    event: '*',
    table: 'purchases',
    filter: `buyer_wallet=eq.${config.walletAddress}`,
    callback: onEvent,
  })
}

export function subscribeToNFTs(
  config: SubscriptionConfig,
  onEvent: (payload: RealtimePayload) => void
) {
  const client = getRealtimeClient()

  return client.subscribe(`nfts:${config.playerId}`, {
    event: '*',
    table: 'nfts',
    filter: `owner_id=eq.${config.playerId}`,
    callback: onEvent,
  })
}

export function subscribeToTrades(
  config: SubscriptionConfig,
  onEvent: (payload: RealtimePayload) => void
) {
  const client = getRealtimeClient()

  return client.subscribe(`trades:${config.playerId}`, {
    event: '*',
    table: 'trades',
    filter: `seller_id=eq.${config.playerId}`,
    callback: onEvent,
  })
}

export function subscribeToDeliveries(
  config: SubscriptionConfig,
  onEvent: (payload: RealtimePayload) => void
) {
  const client = getRealtimeClient()

  return client.subscribe(`deliveries:${config.walletAddress}`, {
    event: 'UPDATE',
    table: 'deliveries',
    filter: `wallet_address=eq.${config.walletAddress}`,
    callback: onEvent,
  })
}

export function unsubscribeAll() {
  const client = getRealtimeClient()
  client.unsubscribeAll()
}
