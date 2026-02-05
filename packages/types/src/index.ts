import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export const AdminRoleSchema = z.enum(['super_admin', 'admin', 'viewer'])
export type AdminRole = z.infer<typeof AdminRoleSchema>

export const NftStatusSchema = z.enum(['draft', 'ready', 'minted', 'delivered', 'hidden'])
export type NftStatus = z.infer<typeof NftStatusSchema>

export const PackageStatusSchema = z.enum(['active', 'inactive', 'archived'])
export type PackageStatus = z.infer<typeof PackageStatusSchema>

export const PurchaseStatusSchema = z.enum([
  'pending',
  'confirmed',
  'delivering',
  'completed',
  'failed',
  'refunded',
])
export type PurchaseStatus = z.infer<typeof PurchaseStatusSchema>

export const DeliveryStatusSchema = z.enum(['pending', 'processing', 'delivered', 'failed'])
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>

export const BurnStatusSchema = z.enum(['pending_confirmation', 'confirmed', 'executed', 'failed'])
export type BurnStatus = z.infer<typeof BurnStatusSchema>

export const TradeStatusSchema = z.enum(['active', 'sold', 'cancelled', 'expired'])
export type TradeStatus = z.infer<typeof TradeStatusSchema>

export const NotificationTypeSchema = z.enum([
  'delivery_complete',
  'trade_sold',
  'trade_offer',
  'purchase_confirmed',
  'price_drop',
  'new_nft_available',
  'system',
])
export type NotificationType = z.infer<typeof NotificationTypeSchema>

// ============================================================================
// ENTITY SCHEMAS
// ============================================================================

export const AdminSchema = z.object({
  id: z.string().uuid(),
  wallet_address: z.string().nullable(),
  email: z.string().email().nullable(),
  role: AdminRoleSchema,
  totp_enabled: z.boolean(),
  last_login: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Admin = z.infer<typeof AdminSchema>

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  wallet_address: z.string(),
  display_name: z.string().nullable(),
  email: z.string().email().nullable(),
  avatar_url: z.string().url().nullable(),
  total_purchases: z.number().int(),
  total_spent_sol: z.string(), // Decimal as string
  total_nfts_owned: z.number().int(),
  total_trades_completed: z.number().int(),
  first_purchase_at: z.string().datetime().nullable(),
  last_activity_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Player = z.infer<typeof PlayerSchema>

export const NftMetadataSchema = z.object({
  _capture: z.string().optional(),
  _color: z.string().optional(),
  '_I/O': z.string().optional(),
  tier: z.number().int().optional(),
  bit: z.string().optional(),
  custom_spec: z.record(z.unknown()).optional(),
})
export type NftMetadata = z.infer<typeof NftMetadataSchema>

export const NftSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  mint_address: z.string().nullable(),
  mint_transaction: z.string().nullable(),
  minted_at: z.string().datetime().nullable(),
  owner_id: z.string().uuid().nullable(),
  owner_wallet: z.string().nullable(),
  status: NftStatusSchema,
  image_url: z.string().url().nullable(),
  thumbnail_url: z.string().url().nullable(),
  metadata_uri: z.string().nullable(),
  metadata: NftMetadataSchema,
  rarity_score: z.string().nullable(), // Decimal as string
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Nft = z.infer<typeof NftSchema>

export const PackageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  price_sol: z.string(), // Decimal as string
  unsc_amount: z.string(), // BigInt as string
  nft_ids: z.array(z.string().uuid()),
  total_supply: z.number().int().nullable(),
  sold_count: z.number().int(),
  reserved_count: z.number().int(),
  status: PackageStatusSchema,
  featured: z.boolean(),
  sale_starts_at: z.string().datetime().nullable(),
  sale_ends_at: z.string().datetime().nullable(),
  total_revenue_sol: z.string(), // Decimal as string
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Package = z.infer<typeof PackageSchema>

export const PurchaseSchema = z.object({
  id: z.string().uuid(),
  player_id: z.string().uuid().nullable(),
  buyer_wallet: z.string(),
  package_id: z.string().uuid().nullable(),
  package_name: z.string(),
  package_price_sol: z.string(), // Decimal as string
  unsc_amount: z.string(), // BigInt as string
  nft_ids: z.array(z.string().uuid()),
  payment_transaction: z.string().nullable(),
  payment_confirmed_at: z.string().datetime().nullable(),
  status: PurchaseStatusSchema,
  error_message: z.string().nullable(),
  retry_count: z.number().int(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Purchase = z.infer<typeof PurchaseSchema>

export const DeliverySchema = z.object({
  id: z.string().uuid(),
  purchase_id: z.string().uuid(),
  nft_id: z.string().uuid().nullable(),
  item_type: z.enum(['nft', 'token']),
  token_amount: z.string().nullable(), // BigInt as string
  recipient_wallet: z.string(),
  status: DeliveryStatusSchema,
  transfer_transaction: z.string().nullable(),
  delivered_at: z.string().datetime().nullable(),
  error_message: z.string().nullable(),
  retry_count: z.number().int(),
  last_attempt_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Delivery = z.infer<typeof DeliverySchema>

export const BurnEventSchema = z.object({
  id: z.string().uuid(),
  purchase_id: z.string().uuid().nullable(),
  triggered_by: z.string(),
  amount: z.string(), // BigInt as string
  token_address: z.string(),
  status: BurnStatusSchema,
  initiated_by: z.string().uuid().nullable(),
  confirmed_by: z.string().uuid().nullable(),
  initiated_at: z.string().datetime().nullable(),
  confirmed_at: z.string().datetime().nullable(),
  burn_transaction: z.string().nullable(),
  executed_at: z.string().datetime().nullable(),
  error_message: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type BurnEvent = z.infer<typeof BurnEventSchema>

export const TradeSchema = z.object({
  id: z.string().uuid(),
  nft_id: z.string().uuid(),
  seller_id: z.string().uuid().nullable(),
  seller_wallet: z.string(),
  price_sol: z.string(), // Decimal as string
  description: z.string().nullable(),
  status: TradeStatusSchema,
  listed_at: z.string().datetime(),
  expires_at: z.string().datetime().nullable(),
  buyer_id: z.string().uuid().nullable(),
  buyer_wallet: z.string().nullable(),
  sold_at: z.string().datetime().nullable(),
  trade_transaction: z.string().nullable(),
  platform_fee_sol: z.string().nullable(), // Decimal as string
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type Trade = z.infer<typeof TradeSchema>

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  player_id: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  data: z.record(z.unknown()),
  read: z.boolean(),
  read_at: z.string().datetime().nullable(),
  entity_type: z.string().nullable(),
  entity_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
})
export type Notification = z.infer<typeof NotificationSchema>

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// BURN STATISTICS
// ============================================================================

export const BurnStatisticsSchema = z.object({
  total_burns: z.number().int(),
  total_burned: z.string(), // BigInt as string
  burned_30d: z.string(),
  burned_7d: z.string(),
  burned_24h: z.string(),
  pending_burns: z.number().int(),
})
export type BurnStatistics = z.infer<typeof BurnStatisticsSchema>

// ============================================================================
// MINT POOL ENUMS
// ============================================================================

export const MintPoolRoundStatusSchema = z.enum(['pending', 'active', 'computing', 'completed'])
export type MintPoolRoundStatus = z.infer<typeof MintPoolRoundStatusSchema>

export const SliceEarnedViaSchema = z.enum(['hash', 'click', 'stake_bonus'])
export type SliceEarnedVia = z.infer<typeof SliceEarnedViaSchema>

export const MintPoolStakeStatusSchema = z.enum(['active', 'withdrawn'])
export type MintPoolStakeStatus = z.infer<typeof MintPoolStakeStatusSchema>

export const MintPoolAssemblyStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed'])
export type MintPoolAssemblyStatus = z.infer<typeof MintPoolAssemblyStatusSchema>

// ============================================================================
// MINT POOL ENTITY SCHEMAS
// ============================================================================

export const MintPoolRoundSchema = z.object({
  id: z.string().uuid(),
  round_number: z.number().int(),
  status: MintPoolRoundStatusSchema,
  difficulty: z.number().int(),
  duration_seconds: z.number().int(),
  total_hashes_submitted: z.number().int(),
  total_participants: z.number().int(),
  total_slices_awarded: z.number().int(),
  nft_pool_ids: z.array(z.string().uuid()),
  starts_at: z.string().datetime().nullable(),
  ends_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})
export type MintPoolRound = z.infer<typeof MintPoolRoundSchema>

export const MintPoolParticipantSchema = z.object({
  id: z.string().uuid(),
  round_id: z.string().uuid(),
  player_id: z.string().uuid(),
  wallet_address: z.string(),
  hashes_submitted: z.number().int(),
  valid_hashes_submitted: z.number().int(),
  click_mine_count: z.number().int(),
  staked_unsc: z.string(),
  hash_rate_multiplier: z.string(),
  effective_shares: z.string(),
  slices_earned: z.number().int(),
  joined_at: z.string().datetime(),
  last_activity_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
})
export type MintPoolParticipant = z.infer<typeof MintPoolParticipantSchema>

export const MintPoolSliceSchema = z.object({
  id: z.string().uuid(),
  player_id: z.string().uuid(),
  round_id: z.string().uuid(),
  nft_id: z.string().uuid(),
  slice_index: z.number().int(),
  total_slices_required: z.number().int(),
  earned_via: SliceEarnedViaSchema,
  created_at: z.string().datetime(),
})
export type MintPoolSlice = z.infer<typeof MintPoolSliceSchema>

export const HashSubmissionSchema = z.object({
  round_id: z.string().uuid(),
  nonce: z.string().min(1),
  hash: z.string().min(1),
})
export type HashSubmission = z.infer<typeof HashSubmissionSchema>

export const MintPoolStatsSchema = z.object({
  current_round: MintPoolRoundSchema.nullable(),
  player_stats: MintPoolParticipantSchema.nullable(),
  pool_nft_count: z.number().int(),
  miners_online: z.number().int(),
  total_rounds_completed: z.number().int(),
  player_total_slices: z.number().int(),
  player_assemblies: z.number().int(),
})
export type MintPoolStats = z.infer<typeof MintPoolStatsSchema>
