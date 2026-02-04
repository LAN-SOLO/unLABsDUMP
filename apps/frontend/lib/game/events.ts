export type GameEventType = 'nft_delivered' | 'trade_complete' | 'balance_updated' | 'heartbeat'

export interface GameEvent {
  type: GameEventType
  timestamp: string
  data: Record<string, unknown>
}

export interface NFTDeliveredEvent extends GameEvent {
  type: 'nft_delivered'
  data: {
    nft_id: string
    name: string
    tier: number
    color: string
    owner: string
  }
}

export interface TradeCompleteEvent extends GameEvent {
  type: 'trade_complete'
  data: {
    trade_id: string
    nft_id: string
    buyer: string
    seller: string
    price_sol: number
  }
}

export interface BalanceUpdatedEvent extends GameEvent {
  type: 'balance_updated'
  data: {
    wallet: string
    sol_balance: number
    unsc_balance: number
  }
}

export function createGameEvent(type: GameEventType, data: Record<string, unknown>): GameEvent {
  return {
    type,
    timestamp: new Date().toISOString(),
    data,
  }
}

export function serializeSSE(event: GameEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
}
