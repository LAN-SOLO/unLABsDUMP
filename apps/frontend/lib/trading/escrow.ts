// Escrow placeholder - trades on UnstableLabs are currently direct transfers
// This module exists for future escrow-based trading support

export interface EscrowState {
  id: string
  nft_id: string
  seller: string
  buyer: string | null
  price_sol: number
  status: 'active' | 'completed' | 'cancelled' | 'expired'
  created_at: string
  expires_at: string | null
}

export function isEscrowActive(escrow: EscrowState): boolean {
  if (escrow.status !== 'active') return false
  if (escrow.expires_at && new Date(escrow.expires_at) < new Date()) return false
  return true
}

export function calculateEscrowFee(priceSol: number): number {
  return priceSol * 0.025 // 2.5% marketplace fee
}
