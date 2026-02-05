import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  pgEnum,
  jsonb,
  decimal,
  index,
} from 'drizzle-orm/pg-core'

// ============================================================================
// ENUMS
// ============================================================================

export const adminRoleEnum = pgEnum('admin_role', ['super_admin', 'admin', 'viewer'])
export const nftStatusEnum = pgEnum('nft_status', [
  'draft',
  'ready',
  'minted',
  'delivered',
  'hidden',
])
export const packageStatusEnum = pgEnum('package_status', ['active', 'inactive', 'archived'])
export const purchaseStatusEnum = pgEnum('purchase_status', [
  'pending',
  'confirmed',
  'delivering',
  'completed',
  'failed',
  'refunded',
])
export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending',
  'processing',
  'delivered',
  'failed',
])
export const burnStatusEnum = pgEnum('burn_status', [
  'pending_confirmation',
  'confirmed',
  'executed',
  'failed',
])
export const tradeStatusEnum = pgEnum('trade_status', ['active', 'sold', 'cancelled', 'expired'])
export const mintPoolRoundStatusEnum = pgEnum('mint_pool_round_status', [
  'pending',
  'active',
  'computing',
  'completed',
])
export const mintPoolStakeStatusEnum = pgEnum('mint_pool_stake_status', ['active', 'withdrawn'])
export const mintPoolAssemblyStatusEnum = pgEnum('mint_pool_assembly_status', [
  'pending',
  'processing',
  'completed',
  'failed',
])
export const sliceEarnedViaEnum = pgEnum('slice_earned_via', ['hash', 'click', 'stake_bonus'])

export const notificationTypeEnum = pgEnum('notification_type', [
  'delivery_complete',
  'trade_sold',
  'trade_offer',
  'purchase_confirmed',
  'price_drop',
  'new_nft_available',
  'system',
])

// ============================================================================
// 1. ADMINS TABLE
// ============================================================================

export const admins = pgTable(
  'admins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    walletAddress: text('wallet_address').unique(),
    email: text('email').unique(),
    passwordHash: text('password_hash'),
    totpSecret: text('totp_secret'),
    totpEnabled: boolean('totp_enabled').notNull().default(false),
    backupCodes: text('backup_codes').array(),
    role: text('role').notNull().default('viewer'),
    lastLogin: timestamp('last_login', { withTimezone: true }),
    failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_admins_wallet').on(table.walletAddress),
    index('idx_admins_email').on(table.email),
  ]
)

// ============================================================================
// 2. PLAYERS TABLE
// ============================================================================

export const players = pgTable(
  'players',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    walletAddress: text('wallet_address').notNull().unique(),
    displayName: text('display_name'),
    email: text('email'),
    avatarUrl: text('avatar_url'),
    totalPurchases: integer('total_purchases').notNull().default(0),
    totalSpentSol: decimal('total_spent_sol', { precision: 20, scale: 9 }).notNull().default('0'),
    totalNftsOwned: integer('total_nfts_owned').notNull().default(0),
    totalTradesCompleted: integer('total_trades_completed').notNull().default(0),
    firstPurchaseAt: timestamp('first_purchase_at', { withTimezone: true }),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_players_wallet').on(table.walletAddress),
    index('idx_players_activity').on(table.lastActivityAt),
  ]
)

// ============================================================================
// 3. NFTS TABLE
// ============================================================================

export const nfts = pgTable(
  'nfts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    mintAddress: text('mint_address').unique(),
    mintTransaction: text('mint_transaction'),
    mintedAt: timestamp('minted_at', { withTimezone: true }),
    ownerId: uuid('owner_id').references(() => players.id),
    ownerWallet: text('owner_wallet'),
    status: nftStatusEnum('status').notNull().default('draft'),
    imageUrl: text('image_url'),
    thumbnailUrl: text('thumbnail_url'),
    metadataUri: text('metadata_uri'),
    metadata: jsonb('metadata').notNull().default({}),
    rarityScore: decimal('rarity_score', { precision: 10, scale: 4 }).default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_nfts_status').on(table.status),
    index('idx_nfts_owner').on(table.ownerId),
    index('idx_nfts_owner_wallet').on(table.ownerWallet),
    index('idx_nfts_mint').on(table.mintAddress),
  ]
)

// ============================================================================
// 4. NFT OWNERSHIP HISTORY
// ============================================================================

export const nftOwnershipHistory = pgTable(
  'nft_ownership_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nftId: uuid('nft_id')
      .notNull()
      .references(() => nfts.id, { onDelete: 'cascade' }),
    fromWallet: text('from_wallet'),
    toWallet: text('to_wallet').notNull(),
    transferType: text('transfer_type').notNull(),
    transactionSignature: text('transaction_signature'),
    priceSol: decimal('price_sol', { precision: 20, scale: 9 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_ownership_nft').on(table.nftId),
    index('idx_ownership_to').on(table.toWallet),
    index('idx_ownership_time').on(table.createdAt),
  ]
)

// ============================================================================
// 5. PACKAGES TABLE
// ============================================================================

export const packages = pgTable(
  'packages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').default('standard'),
    priceSol: decimal('price_sol', { precision: 20, scale: 9 }).notNull(),
    unscAmount: numeric('unsc_amount', { precision: 78, scale: 0 }).notNull().default('0'),
    nftIds: uuid('nft_ids').array().notNull().default([]),
    totalSupply: integer('total_supply'),
    soldCount: integer('sold_count').notNull().default(0),
    reservedCount: integer('reserved_count').notNull().default(0),
    status: packageStatusEnum('status').notNull().default('inactive'),
    featured: boolean('featured').notNull().default(false),
    saleStartsAt: timestamp('sale_starts_at', { withTimezone: true }),
    saleEndsAt: timestamp('sale_ends_at', { withTimezone: true }),
    totalRevenueSol: decimal('total_revenue_sol', { precision: 20, scale: 9 })
      .notNull()
      .default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_packages_status').on(table.status),
    index('idx_packages_category').on(table.category),
  ]
)

// ============================================================================
// 6. PURCHASES TABLE
// ============================================================================

export const purchases = pgTable(
  'purchases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    playerId: uuid('player_id').references(() => players.id),
    buyerWallet: text('buyer_wallet').notNull(),
    packageId: uuid('package_id').references(() => packages.id),
    packageName: text('package_name').notNull(),
    packagePriceSol: decimal('package_price_sol', { precision: 20, scale: 9 }).notNull(),
    unscAmount: numeric('unsc_amount', { precision: 78, scale: 0 }).notNull().default('0'),
    nftIds: uuid('nft_ids').array().notNull().default([]),
    paymentTransaction: text('payment_transaction'),
    paymentConfirmedAt: timestamp('payment_confirmed_at', { withTimezone: true }),
    status: purchaseStatusEnum('status').notNull().default('pending'),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_purchases_player').on(table.playerId),
    index('idx_purchases_wallet').on(table.buyerWallet),
    index('idx_purchases_package').on(table.packageId),
    index('idx_purchases_status').on(table.status),
    index('idx_purchases_time').on(table.createdAt),
  ]
)

// ============================================================================
// 7. DELIVERIES TABLE
// ============================================================================

export const deliveries = pgTable(
  'deliveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    purchaseId: uuid('purchase_id')
      .notNull()
      .references(() => purchases.id, { onDelete: 'cascade' }),
    nftId: uuid('nft_id').references(() => nfts.id),
    itemType: text('item_type').notNull(),
    tokenAmount: numeric('token_amount', { precision: 78, scale: 0 }),
    recipientWallet: text('recipient_wallet').notNull(),
    status: deliveryStatusEnum('status').notNull().default('pending'),
    transferTransaction: text('transfer_transaction'),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').notNull().default(0),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_deliveries_purchase').on(table.purchaseId),
    index('idx_deliveries_status').on(table.status),
  ]
)

// ============================================================================
// 8. BURN EVENTS TABLE
// ============================================================================

export const burnEvents = pgTable(
  'burn_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    purchaseId: uuid('purchase_id').references(() => purchases.id),
    triggeredBy: text('triggered_by').notNull(),
    amount: numeric('amount', { precision: 78, scale: 0 }).notNull(),
    tokenAddress: text('token_address')
      .notNull()
      .default('7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT'),
    status: burnStatusEnum('status').notNull().default('pending_confirmation'),
    initiatedBy: uuid('initiated_by').references(() => admins.id),
    confirmedBy: uuid('confirmed_by').references(() => admins.id),
    initiatedAt: timestamp('initiated_at', { withTimezone: true }),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    burnTransaction: text('burn_transaction'),
    executedAt: timestamp('executed_at', { withTimezone: true }),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_burns_status').on(table.status),
    index('idx_burns_purchase').on(table.purchaseId),
    index('idx_burns_time').on(table.createdAt),
  ]
)

// ============================================================================
// 9. TRADES TABLE
// ============================================================================

export const trades = pgTable(
  'trades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nftId: uuid('nft_id')
      .notNull()
      .references(() => nfts.id),
    sellerId: uuid('seller_id').references(() => players.id),
    sellerWallet: text('seller_wallet').notNull(),
    priceSol: decimal('price_sol', { precision: 20, scale: 9 }).notNull(),
    description: text('description'),
    status: tradeStatusEnum('status').notNull().default('active'),
    listedAt: timestamp('listed_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    buyerId: uuid('buyer_id').references(() => players.id),
    buyerWallet: text('buyer_wallet'),
    soldAt: timestamp('sold_at', { withTimezone: true }),
    tradeTransaction: text('trade_transaction'),
    platformFeeSol: decimal('platform_fee_sol', { precision: 20, scale: 9 }).default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_trades_nft').on(table.nftId),
    index('idx_trades_seller').on(table.sellerWallet),
    index('idx_trades_status').on(table.status),
  ]
)

// ============================================================================
// 10. NOTIFICATIONS TABLE
// ============================================================================

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    data: jsonb('data').default({}),
    read: boolean('read').notNull().default(false),
    readAt: timestamp('read_at', { withTimezone: true }),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_notifications_player').on(table.playerId),
    index('idx_notifications_time').on(table.createdAt),
  ]
)

// ============================================================================
// 11. AUDIT LOGS TABLE
// ============================================================================

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').references(() => admins.id),
    adminWallet: text('admin_wallet'),
    adminEmail: text('admin_email'),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id'),
    details: jsonb('details').notNull().default({}),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    requestId: text('request_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_admin').on(table.adminId),
    index('idx_audit_action').on(table.action),
    index('idx_audit_time').on(table.createdAt),
  ]
)

// ============================================================================
// 12. ADMIN SESSIONS TABLE
// ============================================================================

export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id')
      .notNull()
      .references(() => admins.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revoked: boolean('revoked').notNull().default(false),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_sessions_admin').on(table.adminId),
    index('idx_sessions_token').on(table.tokenHash),
  ]
)

// ============================================================================
// 13. MINT POOL ROUNDS TABLE
// ============================================================================

export const mintPoolRounds = pgTable(
  'mint_pool_rounds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roundNumber: integer('round_number').notNull().unique(),
    status: mintPoolRoundStatusEnum('status').notNull().default('pending'),
    difficulty: integer('difficulty').notNull().default(4),
    durationSeconds: integer('duration_seconds').notNull().default(60),
    totalHashesSubmitted: integer('total_hashes_submitted').notNull().default(0),
    totalParticipants: integer('total_participants').notNull().default(0),
    totalSlicesAwarded: integer('total_slices_awarded').notNull().default(0),
    nftPoolIds: uuid('nft_pool_ids')
      .array()
      .notNull()
      .$defaultFn(() => []),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_pool_rounds_status').on(table.status),
    index('idx_pool_rounds_number').on(table.roundNumber),
  ]
)

// ============================================================================
// 14. MINT POOL PARTICIPANTS TABLE
// ============================================================================

export const mintPoolParticipants = pgTable(
  'mint_pool_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roundId: uuid('round_id')
      .notNull()
      .references(() => mintPoolRounds.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    walletAddress: text('wallet_address').notNull(),
    hashesSubmitted: integer('hashes_submitted').notNull().default(0),
    validHashesSubmitted: integer('valid_hashes_submitted').notNull().default(0),
    clickMineCount: integer('click_mine_count').notNull().default(0),
    stakedUnsc: numeric('staked_unsc', { precision: 78, scale: 0 }).notNull().default('0'),
    hashRateMultiplier: decimal('hash_rate_multiplier', { precision: 10, scale: 4 })
      .notNull()
      .default('1.0'),
    effectiveShares: decimal('effective_shares', { precision: 20, scale: 4 })
      .notNull()
      .default('0'),
    slicesEarned: integer('slices_earned').notNull().default(0),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_pool_participants_round').on(table.roundId),
    index('idx_pool_participants_player').on(table.playerId),
  ]
)

// ============================================================================
// 15. MINT POOL SLICES TABLE
// ============================================================================

export const mintPoolSlices = pgTable(
  'mint_pool_slices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    roundId: uuid('round_id')
      .notNull()
      .references(() => mintPoolRounds.id, { onDelete: 'cascade' }),
    nftId: uuid('nft_id')
      .notNull()
      .references(() => nfts.id),
    sliceIndex: integer('slice_index').notNull(),
    totalSlicesRequired: integer('total_slices_required').notNull().default(10),
    earnedVia: sliceEarnedViaEnum('earned_via').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_pool_slices_player').on(table.playerId),
    index('idx_pool_slices_nft').on(table.nftId),
    index('idx_pool_slices_round').on(table.roundId),
  ]
)

// ============================================================================
// 16. MINT POOL HASH SUBMISSIONS TABLE
// ============================================================================

export const mintPoolHashSubmissions = pgTable(
  'mint_pool_hash_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roundId: uuid('round_id')
      .notNull()
      .references(() => mintPoolRounds.id, { onDelete: 'cascade' }),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    nonce: text('nonce').notNull(),
    hash: text('hash').notNull(),
    leadingZeros: integer('leading_zeros').notNull(),
    isValid: boolean('is_valid').notNull().default(false),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_pool_hashes_round').on(table.roundId),
    index('idx_pool_hashes_player').on(table.playerId),
  ]
)

// ============================================================================
// 17. MINT POOL STAKES TABLE
// ============================================================================

export const mintPoolStakes = pgTable(
  'mint_pool_stakes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    walletAddress: text('wallet_address').notNull(),
    amount: numeric('amount', { precision: 78, scale: 0 }).notNull(),
    multiplier: decimal('multiplier', { precision: 10, scale: 4 }).notNull().default('1.0'),
    status: mintPoolStakeStatusEnum('status').notNull().default('active'),
    stakeTransaction: text('stake_transaction'),
    withdrawTransaction: text('withdraw_transaction'),
    stakedAt: timestamp('staked_at', { withTimezone: true }).notNull().defaultNow(),
    withdrawnAt: timestamp('withdrawn_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_pool_stakes_player').on(table.playerId),
    index('idx_pool_stakes_status').on(table.status),
  ]
)

// ============================================================================
// 18. MINT POOL ASSEMBLIES TABLE
// ============================================================================

export const mintPoolAssemblies = pgTable(
  'mint_pool_assemblies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    playerId: uuid('player_id')
      .notNull()
      .references(() => players.id),
    nftId: uuid('nft_id')
      .notNull()
      .references(() => nfts.id),
    sliceIds: uuid('slice_ids').array().notNull(),
    status: mintPoolAssemblyStatusEnum('status').notNull().default('pending'),
    transferTransaction: text('transfer_transaction'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_pool_assemblies_player').on(table.playerId),
    index('idx_pool_assemblies_nft').on(table.nftId),
    index('idx_pool_assemblies_status').on(table.status),
  ]
)
