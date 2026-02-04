/**
 * Marketplace fee configuration.
 */
export const MARKETPLACE_FEE_PERCENT = 2.5
export const MARKETPLACE_FEE_RATE = MARKETPLACE_FEE_PERCENT / 100

/**
 * Calculate the marketplace fee for a given price in SOL.
 */
export function calculateMarketplaceFee(priceInSol: number): number {
  return Math.round(priceInSol * MARKETPLACE_FEE_RATE * 1e9) / 1e9
}

/**
 * Calculate the total cost a buyer pays (price + fee).
 */
export function calculateTotalCost(priceInSol: number): number {
  return priceInSol + calculateMarketplaceFee(priceInSol)
}

/**
 * Calculate the seller proceeds after fee deduction.
 */
export function calculateSellerProceeds(priceInSol: number): number {
  return priceInSol - calculateMarketplaceFee(priceInSol)
}

/**
 * Format SOL amount with proper precision.
 */
export function formatSol(amount: number): string {
  if (amount === 0) return '0'
  if (amount < 0.001) return '<0.001'
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}
