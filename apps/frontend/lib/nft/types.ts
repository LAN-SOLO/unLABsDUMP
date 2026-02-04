// ── UnstableLabs NFT Types & Constants ──

export const UNSC_TOKEN_MINT = '7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT'

// NFT status enum
export type NFTStatus = 'ready' | 'minted' | 'delivered'

// Color wavelengths
export const NFT_COLORS = [
  'Infrared',
  'Red',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Indigo',
  'Violet',
  'Gamma',
] as const

export type NFTColor = (typeof NFT_COLORS)[number]

// Color hex map for display
export const COLOR_HEX_MAP: Record<NFTColor, string> = {
  Infrared: '#FF1744',
  Red: '#F44336',
  Orange: '#FF9800',
  Yellow: '#FFEB3B',
  Green: '#4CAF50',
  Blue: '#2196F3',
  Indigo: '#3F51B5',
  Violet: '#9C27B0',
  Gamma: '#00E676',
}

// Tier levels
export const NFT_TIERS = [1, 2, 3, 4, 5] as const
export type NFTTier = (typeof NFT_TIERS)[number]

// Tier labels
export const TIER_LABELS: Record<NFTTier, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',
  5: 'Legendary',
}

// Tier color classes (Tailwind)
export const TIER_COLORS: Record<NFTTier, string> = {
  1: 'bg-slate-600 text-slate-100',
  2: 'bg-green-600 text-green-100',
  3: 'bg-blue-600 text-blue-100',
  4: 'bg-purple-600 text-purple-100',
  5: 'bg-yellow-500 text-yellow-950',
}

// Era/bit values
export const NFT_ERAS = ['8-bit', '16-bit', '32-bit', '64-bit'] as const
export type NFTEra = (typeof NFT_ERAS)[number]

// Rotation
export const NFT_ROTATIONS = ['CW', 'CCW'] as const
export type NFTRotation = (typeof NFT_ROTATIONS)[number]

export const ROTATION_LABELS: Record<NFTRotation, string> = {
  CW: 'Clockwise',
  CCW: 'Counter-Clockwise',
}

// Sort options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'name', label: 'Name' },
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]['value']

// Main NFT type
export interface NFT {
  id: string
  name: string
  description?: string
  image_url?: string
  thumbnail_url?: string
  status: NFTStatus
  capture: string // _capture: Solana block hash reference
  color: NFTColor // _color wavelength
  rotation: NFTRotation // _I/O rotation
  tier: NFTTier
  era: NFTEra // bit era
  rarity_score?: number
  owner_wallet?: string
  owner_display_name?: string
  package_id?: string
  mint_address?: string
  custom_specs?: Record<string, string>
  created_at: string
  updated_at: string
}

// Ownership history entry
export interface OwnershipRecord {
  id: string
  nft_id: string
  wallet_address: string
  display_name?: string
  event_type: 'mint' | 'transfer' | 'sale' | 'deliver'
  transaction_hash?: string
  price?: number
  timestamp: string
}

// Filter state
export interface NFTFilters {
  search: string
  status: NFTStatus | 'all'
  colors: NFTColor[]
  tiers: NFTTier[]
  eras: NFTEra[]
  rotations: NFTRotation[]
  sortBy: SortOption
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// API response
export interface NFTListResponse {
  data: NFT[]
  count: number
  page: number
  limit: number
  totalPages: number
}

// Default filter values
export const DEFAULT_FILTERS: NFTFilters = {
  search: '',
  status: 'all',
  colors: [],
  tiers: [],
  eras: [],
  rotations: [],
  sortBy: 'newest',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
}
