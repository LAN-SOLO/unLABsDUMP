// Local mint pool types (mirrors @unstablecoins/types mint pool schemas)

export type MintPoolRoundStatus = 'pending' | 'active' | 'computing' | 'completed'
export type SliceEarnedVia = 'hash' | 'click' | 'stake_bonus'
export type MintPoolStakeStatus = 'active' | 'withdrawn'
export type MintPoolAssemblyStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface MintPoolRound {
  id: string
  round_number: number
  status: MintPoolRoundStatus
  difficulty: number
  duration_seconds: number
  total_hashes_submitted: number
  total_participants: number
  total_slices_awarded: number
  nft_pool_ids: string[]
  starts_at: string | null
  ends_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface MintPoolParticipant {
  id: string
  round_id: string
  player_id: string
  wallet_address: string
  hashes_submitted: number
  valid_hashes_submitted: number
  click_mine_count: number
  staked_unsc: string
  hash_rate_multiplier: string
  effective_shares: string
  slices_earned: number
  joined_at: string
  last_activity_at: string | null
  created_at: string
}

export interface MintPoolSlice {
  id: string
  player_id: string
  round_id: string
  nft_id: string
  slice_index: number
  total_slices_required: number
  earned_via: SliceEarnedVia
  created_at: string
}

export interface MintPoolStats {
  current_round: MintPoolRound | null
  player_stats: MintPoolParticipant | null
  pool_nft_count: number
  miners_online: number
  total_rounds_completed: number
  player_total_slices: number
  player_assemblies: number
}
