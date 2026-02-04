import { Connection, PublicKey, clusterApiUrl, Cluster } from '@solana/web3.js'

export { Connection, PublicKey, clusterApiUrl }
export type { Cluster }

// Token addresses
export const SOL_ADDRESS = 'So11111111111111111111111111111111111111112'
export const UNSC_ADDRESS = '7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT'

export interface SolanaConfig {
  rpcUrl: string
  network: Cluster
}

export function createConnection(config: SolanaConfig): Connection {
  return new Connection(config.rpcUrl, 'confirmed')
}

export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

// Module exports
export { transferNFT, transferBatch, type TransferResult } from './transfer'
export {
  loadEscrowKeypair,
  getEscrowInfo,
  getEscrowTokenBalance,
  getEscrowNFTs,
  type EscrowWallet,
  type EscrowTokenBalance,
} from './escrow'
export { burnUnSC, burnToken, getUnSCBalance, UNSC_MINT, type BurnResult } from './burn'
