import { z } from 'zod'

/**
 * Valid listing durations in days.
 */
export const LISTING_DURATIONS = [
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: 'No expiry', value: 0 },
] as const

export type ListingDuration = (typeof LISTING_DURATIONS)[number]['value']

/**
 * Zod schema for creating a listing.
 */
export const createListingSchema = z.object({
  nftId: z.string().uuid(),
  priceInSol: z
    .number()
    .positive('Price must be greater than 0')
    .max(1_000_000, 'Price exceeds maximum'),
  durationDays: z.number().int().min(0).max(30),
  agreedToTerms: z.literal(true, {
    error: 'You must agree to the terms',
  }),
})

export type CreateListingInput = z.infer<typeof createListingSchema>

/**
 * Calculate expiry date from duration in days.
 * Returns null for "No expiry" (durationDays === 0).
 */
export function calculateExpiryDate(durationDays: number): Date | null {
  if (durationDays === 0) return null
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + durationDays)
  return expiry
}

/**
 * Check if a listing has expired.
 */
export function isListingExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

/**
 * Format time remaining for a listing.
 */
export function formatTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry'

  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = expiry.getTime() - now.getTime()

  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Create a listing via the API.
 */
export async function createListing(input: CreateListingInput): Promise<{ id: string }> {
  const response = await fetch('/api/trades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to create listing')
  }

  return response.json()
}

/**
 * Cancel (delete) an active listing.
 */
export async function cancelListing(listingId: string): Promise<void> {
  const response = await fetch(`/api/trades/${listingId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to cancel listing')
  }
}
