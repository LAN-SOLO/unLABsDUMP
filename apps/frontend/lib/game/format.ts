// Fields to strip from NFT data before sending to game clients
const INTERNAL_FIELDS = [
  'created_by',
  'updated_by',
  'internal_notes',
  'admin_tags',
  'moderation_status',
  'report_count',
  'raw_metadata',
] as const

type InternalField = (typeof INTERNAL_FIELDS)[number]

export interface GameNFT {
  id: string
  name: string
  description: string | null
  image_url: string | null
  mint_address: string | null
  owner_id: string
  rarity: string | null
  attributes: Record<string, unknown> | null
  collection_id: string | null
  created_at: string
  updated_at: string | null
}

export function formatNFTForGame(nft: Record<string, unknown>): GameNFT {
  const formatted = { ...nft }

  // Remove internal fields
  for (const field of INTERNAL_FIELDS) {
    delete formatted[field as string]
  }

  return formatted as unknown as GameNFT
}

export function formatNFTsForGame(nfts: Record<string, unknown>[]): GameNFT[] {
  return nfts.map(formatNFTForGame)
}

export function stripInternalFields<T extends Record<string, unknown>>(
  data: T
): Omit<T, InternalField> {
  const cleaned = { ...data }

  for (const field of INTERNAL_FIELDS) {
    delete (cleaned as Record<string, unknown>)[field as string]
  }

  return cleaned as Omit<T, InternalField>
}
