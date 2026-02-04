export const COLORS = [
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
export const ERAS = ['8-bit', '16-bit', '32-bit', '64-bit'] as const
export const ROTATIONS = ['CW', 'CCW'] as const
export const TIERS = [1, 2, 3, 4, 5] as const

export type NFTColor = (typeof COLORS)[number]
export type NFTEra = (typeof ERAS)[number]
export type NFTRotation = (typeof ROTATIONS)[number]
export type NFTTier = (typeof TIERS)[number]

export interface NFTMetadata {
  _capture?: string
  _color?: NFTColor
  _io?: NFTRotation
  tier?: NFTTier
  bit?: NFTEra
  custom_spec?: Record<string, string>
}

export const TIER_LABELS: Record<number, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',
  5: 'Legendary',
}

export const COLOR_HEX: Record<string, string> = {
  Infrared: '#ff0040',
  Red: '#ff0000',
  Orange: '#ff8000',
  Yellow: '#ffff00',
  Green: '#00ff00',
  Blue: '#0000ff',
  Indigo: '#4b0082',
  Violet: '#8b00ff',
  Gamma: '#00ffff',
}

export const TIER_COLORS: Record<number, string> = {
  1: 'text-slate-400',
  2: 'text-green-400',
  3: 'text-blue-400',
  4: 'text-purple-400',
  5: 'text-yellow-400',
}

export const TIER_BG_COLORS: Record<number, string> = {
  1: 'bg-slate-500',
  2: 'bg-green-500',
  3: 'bg-blue-500',
  4: 'bg-purple-500',
  5: 'bg-yellow-500',
}

/**
 * Validate NFT metadata fields
 */
export function validateMetadata(metadata: NFTMetadata): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (metadata._color && !COLORS.includes(metadata._color)) {
    errors.push(`Invalid color: ${metadata._color}. Must be one of: ${COLORS.join(', ')}`)
  }

  if (metadata._io && !ROTATIONS.includes(metadata._io)) {
    errors.push(`Invalid rotation: ${metadata._io}. Must be CW or CCW`)
  }

  if (metadata.tier !== undefined) {
    if (!TIERS.includes(metadata.tier as NFTTier)) {
      errors.push(`Invalid tier: ${metadata.tier}. Must be 1-5`)
    }
  }

  if (metadata.bit && !ERAS.includes(metadata.bit)) {
    errors.push(`Invalid era: ${metadata.bit}. Must be one of: ${ERAS.join(', ')}`)
  }

  if (metadata.custom_spec) {
    if (typeof metadata.custom_spec !== 'object' || Array.isArray(metadata.custom_spec)) {
      errors.push('custom_spec must be a key-value object')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Calculate rarity score based on NFT traits.
 * Higher score = rarer.
 * Tier is the primary factor (1-5), with color, rotation, and era as secondary factors.
 */
export function calculateRarityScore(metadata: NFTMetadata): number {
  let score = 0

  // Tier is the primary rarity factor (weighted heavily)
  if (metadata.tier) {
    score += metadata.tier * 20
  }

  // Color rarity: endpoints of spectrum are rarer
  if (metadata._color) {
    const colorIndex = COLORS.indexOf(metadata._color)
    const distFromCenter = Math.abs(colorIndex - 4) // 4 is center (Green)
    score += distFromCenter * 3
  }

  // Era rarity: higher bit depths are rarer
  if (metadata.bit) {
    const eraIndex = ERAS.indexOf(metadata.bit)
    score += (eraIndex + 1) * 4
  }

  // Rotation: CCW is slightly rarer
  if (metadata._io === 'CCW') {
    score += 2
  } else if (metadata._io === 'CW') {
    score += 1
  }

  // Custom specs add minor rarity
  if (metadata.custom_spec) {
    score += Math.min(Object.keys(metadata.custom_spec).length * 1, 5)
  }

  return score
}

/**
 * Get rarity label from score
 */
export function getRarityLabel(score: number): string {
  if (score >= 90) return 'Legendary'
  if (score >= 70) return 'Epic'
  if (score >= 50) return 'Rare'
  if (score >= 30) return 'Uncommon'
  return 'Common'
}

/**
 * Parse metadata from DB JSONB field
 */
export function parseMetadata(raw: unknown): NFTMetadata {
  if (!raw || typeof raw !== 'object') return {}
  const data = raw as Record<string, unknown>
  return {
    _capture: typeof data._capture === 'string' ? data._capture : undefined,
    _color:
      typeof data._color === 'string' && COLORS.includes(data._color as NFTColor)
        ? (data._color as NFTColor)
        : undefined,
    _io:
      typeof data._io === 'string' && ROTATIONS.includes(data._io as NFTRotation)
        ? (data._io as NFTRotation)
        : undefined,
    tier:
      typeof data.tier === 'number' && TIERS.includes(data.tier as NFTTier)
        ? (data.tier as NFTTier)
        : undefined,
    bit:
      typeof data.bit === 'string' && ERAS.includes(data.bit as NFTEra)
        ? (data.bit as NFTEra)
        : undefined,
    custom_spec:
      typeof data.custom_spec === 'object' && data.custom_spec && !Array.isArray(data.custom_spec)
        ? (data.custom_spec as Record<string, string>)
        : undefined,
  }
}

/**
 * Format metadata for Metaplex on-chain storage
 */
export function toMetaplexAttributes(
  metadata: NFTMetadata
): Array<{ trait_type: string; value: string }> {
  const attributes: Array<{ trait_type: string; value: string }> = []

  if (metadata._capture) {
    attributes.push({ trait_type: '_capture', value: metadata._capture })
  }
  if (metadata._color) {
    attributes.push({ trait_type: '_color', value: metadata._color })
  }
  if (metadata._io) {
    attributes.push({ trait_type: '_I/O', value: metadata._io })
  }
  if (metadata.tier) {
    attributes.push({ trait_type: 'tier', value: metadata.tier.toString() })
  }
  if (metadata.bit) {
    attributes.push({ trait_type: 'bit', value: metadata.bit })
  }
  if (metadata.custom_spec) {
    for (const [key, value] of Object.entries(metadata.custom_spec)) {
      attributes.push({ trait_type: key, value })
    }
  }

  return attributes
}
