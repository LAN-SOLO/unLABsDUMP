import { type GameEvent, serializeSSE } from './events'

// Track connected clients per wallet
const connections = new Map<string, Set<ReadableStreamDefaultController>>()
const MAX_CONNECTIONS_PER_WALLET = 3
const HEARTBEAT_INTERVAL_MS = 30000

export function addConnection(
  wallet: string,
  controller: ReadableStreamDefaultController
): boolean {
  const existing = connections.get(wallet) || new Set()
  if (existing.size >= MAX_CONNECTIONS_PER_WALLET) {
    return false
  }
  existing.add(controller)
  connections.set(wallet, existing)
  return true
}

export function removeConnection(
  wallet: string,
  controller: ReadableStreamDefaultController
): void {
  const existing = connections.get(wallet)
  if (existing) {
    existing.delete(controller)
    if (existing.size === 0) {
      connections.delete(wallet)
    }
  }
}

export function broadcastToWallet(wallet: string, message: string): void {
  const controllers = connections.get(wallet)
  if (controllers) {
    const encoder = new TextEncoder()
    Array.from(controllers).forEach((controller) => {
      try {
        controller.enqueue(encoder.encode(message))
      } catch {
        // Controller closed, will be cleaned up
      }
    })
  }
}

export function getConnectionCount(wallet: string): number {
  return connections.get(wallet)?.size ?? 0
}

/**
 * Publish a game event to all SSE connections for a given wallet.
 *
 * This function is designed to bridge Supabase Realtime events to connected
 * game clients. When a Supabase subscription (see lib/realtime/subscriptions.ts)
 * receives a database change (e.g. NFT delivered, trade completed, balance updated),
 * call this function with the relevant wallet address and a GameEvent to forward
 * the event to all active SSE streams for that wallet.
 *
 * Example integration with Supabase Realtime:
 *
 *   subscribeToDeliveries(config, (payload) => {
 *     const event = createGameEvent('nft_delivered', {
 *       nft_id: payload.new.nft_id,
 *       name: payload.new.name,
 *       tier: payload.new.tier,
 *       color: payload.new.color,
 *       owner: payload.new.owner,
 *     })
 *     publishGameEvent(config.walletAddress, event)
 *   })
 */
export function publishGameEvent(wallet: string, event: GameEvent): void {
  broadcastToWallet(wallet, serializeSSE(event))
}

export { HEARTBEAT_INTERVAL_MS }
