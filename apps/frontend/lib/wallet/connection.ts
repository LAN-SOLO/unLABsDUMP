import { Connection, clusterApiUrl } from '@solana/web3.js'

/**
 * Returns the RPC endpoint URL.
 * Uses NEXT_PUBLIC_SOLANA_RPC_URL if set, otherwise falls back to mainnet-beta.
 */
export function getRpcEndpoint(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta')
}

/**
 * Create a shared Solana Connection for use in server or client helpers.
 */
export function createConnection(): Connection {
  return new Connection(getRpcEndpoint(), 'confirmed')
}
