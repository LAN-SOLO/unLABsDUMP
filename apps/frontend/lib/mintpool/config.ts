// Mint Pool configuration constants

export const ROUND_DURATION_SECONDS = 60
export const SLICES_PER_NFT = 10
export const CLICK_COOLDOWN_MS = 2000
export const CLICK_REWARD_CHANCE = 0.15
export const HASH_SHARE_WEIGHT = 10
export const CLICK_SHARE_WEIGHT = 1
export const DEFAULT_DIFFICULTY = 4
export const POOL_STATUS_POLL_INTERVAL_MS = 30000

export const STAKE_TIERS = [
  { min: 0, max: 999, multiplier: 1.0, label: 'Base' },
  { min: 1_000, max: 9_999, multiplier: 1.25, label: 'Bronze' },
  { min: 10_000, max: 49_999, multiplier: 1.5, label: 'Silver' },
  { min: 50_000, max: 99_999, multiplier: 2.0, label: 'Gold' },
  { min: 100_000, max: Infinity, multiplier: 3.0, label: 'Diamond' },
] as const

export function getStakeMultiplier(amount: number): number {
  for (let i = STAKE_TIERS.length - 1; i >= 0; i--) {
    if (amount >= STAKE_TIERS[i].min) {
      return STAKE_TIERS[i].multiplier
    }
  }
  return 1.0
}

export function getStakeTierLabel(amount: number): string {
  for (let i = STAKE_TIERS.length - 1; i >= 0; i--) {
    if (amount >= STAKE_TIERS[i].min) {
      return STAKE_TIERS[i].label
    }
  }
  return 'Base'
}
