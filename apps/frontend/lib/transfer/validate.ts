import { PublicKey } from '@solana/web3.js'
import { z } from 'zod'

/**
 * Validates a Solana address string.
 * Checks valid base58 encoding and that it can be parsed as a PublicKey.
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    const pubkey = new PublicKey(address)
    return PublicKey.isOnCurve(pubkey.toBytes())
  } catch {
    return false
  }
}

/**
 * Checks whether the recipient address is NOT the sender's own address.
 */
export function isNotSelf(recipient: string, sender: string): boolean {
  return recipient.trim() !== sender.trim()
}

/**
 * Full validation result for a transfer recipient.
 */
export interface AddressValidation {
  valid: boolean
  error?: string
}

/**
 * Validate a recipient address for an NFT transfer.
 */
export function validateRecipientAddress(
  recipient: string,
  senderAddress: string
): AddressValidation {
  if (!recipient || recipient.trim().length === 0) {
    return { valid: false, error: 'Recipient address is required' }
  }

  const trimmed = recipient.trim()

  if (!isValidSolanaAddress(trimmed)) {
    return { valid: false, error: 'Invalid Solana address format' }
  }

  if (!isNotSelf(trimmed, senderAddress)) {
    return { valid: false, error: 'Cannot transfer to your own address' }
  }

  return { valid: true }
}

/**
 * Zod schema for the transfer request body.
 */
export const transferRequestSchema = z.object({
  recipientAddress: z.string().min(32, 'Address too short').max(44, 'Address too long'),
})

export type TransferRequest = z.infer<typeof transferRequestSchema>
