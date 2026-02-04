import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface RealtimeClient {
  subscribe(channelName: string, config: ChannelConfig): RealtimeChannel
  unsubscribe(channelName: string): void
  unsubscribeAll(): void
  getConnectionState(): ConnectionState
  onConnectionChange(callback: (state: ConnectionState) => void): () => void
}

export interface ChannelConfig {
  event: string
  schema?: string
  table: string
  filter?: string
  callback: (payload: RealtimePayload) => void
}

export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Record<string, unknown>
  old: Record<string, unknown>
  table: string
}

class RealtimeClientImpl implements RealtimeClient {
  private supabase = createClient()
  private channels = new Map<string, RealtimeChannel>()
  private connectionState: ConnectionState = 'disconnected'
  private connectionListeners = new Set<(state: ConnectionState) => void>()

  subscribe(channelName: string, config: ChannelConfig): RealtimeChannel {
    // Unsubscribe from existing channel with same name
    this.unsubscribe(channelName)

    this.setConnectionState('connecting')

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes' as 'system',
        {
          event: config.event,
          schema: config.schema ?? 'public',
          table: config.table,
          filter: config.filter,
        } as unknown as { event: 'system' },
        (payload: unknown) => {
          const p = payload as RealtimePayload
          config.callback(p)
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          this.setConnectionState('connected')
        } else if (status === 'CLOSED') {
          this.setConnectionState('disconnected')
        } else if (status === 'CHANNEL_ERROR') {
          this.setConnectionState('error')
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  unsubscribeAll(): void {
    for (const [name] of this.channels) {
      this.unsubscribe(name)
    }
    this.setConnectionState('disconnected')
  }

  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionListeners.add(callback)
    return () => {
      this.connectionListeners.delete(callback)
    }
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state
    this.connectionListeners.forEach((cb) => cb(state))
  }
}

let realtimeClientInstance: RealtimeClient | null = null

export function getRealtimeClient(): RealtimeClient {
  if (!realtimeClientInstance) {
    realtimeClientInstance = new RealtimeClientImpl()
  }
  return realtimeClientInstance
}

export function resetRealtimeClient(): void {
  if (realtimeClientInstance) {
    realtimeClientInstance.unsubscribeAll()
    realtimeClientInstance = null
  }
}
