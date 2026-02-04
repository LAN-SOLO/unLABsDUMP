'use client'

/**
 * Re-export the canonical wallet provider from components/providers.
 * This module exists so that wallet-related imports can live under
 * the @/components/wallet/ barrel when needed.
 */
export { WalletProvider as SolanaWalletProvider } from '@/components/providers/wallet-provider'
