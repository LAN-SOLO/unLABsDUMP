/**
 * Dev Area Authentication Logic
 *
 * Handles wallet signature verification, passphrase verification,
 * and whitelist checking. Uses environment variables only - no database.
 */

import nacl from 'tweetnacl'
import bs58 from 'bs58'
import bcrypt from 'bcryptjs'
import { getMasterWallet } from './config'

/**
 * Check if a wallet address is in the whitelist.
 * The whitelist is a single master wallet from environment variable.
 */
export function isWalletWhitelisted(walletAddress: string): boolean {
  const masterWallet = getMasterWallet()
  if (!masterWallet) return false

  // Case-sensitive comparison for Solana addresses
  return walletAddress === masterWallet
}

/**
 * Verify an Ed25519 signature from a Solana wallet.
 *
 * @param publicKey - Base58-encoded Solana public key
 * @param signature - Base58-encoded signature
 * @param message - The message that was signed
 * @returns true if signature is valid
 */
export function verifyWalletSignature(
  publicKey: string,
  signature: string,
  message: string
): boolean {
  try {
    // Decode the public key from base58
    const publicKeyBytes = bs58.decode(publicKey)

    // Decode the signature from base58
    const signatureBytes = bs58.decode(signature)

    // Encode the message as bytes
    const messageBytes = new TextEncoder().encode(message)

    // Verify the signature using tweetnacl
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
  } catch {
    // Any decoding error means invalid signature
    return false
  }
}

/**
 * Verify a passphrase against the stored bcrypt hash.
 *
 * @param passphrase - The plaintext passphrase to verify
 * @returns true if passphrase matches
 */
export async function verifyPassphrase(passphrase: string): Promise<boolean> {
  // Hardcoded hash for 'devmaster2024' - env var escaping issues
  const hash = '$2b$12$uldWHQ6f8UrDlPJY0V7fxuysF6NK8x0x/0469YgAcUSqQuGcIzkCu'
  console.log('[DevAuth] Passphrase verification (using hardcoded hash)')
  console.log('[DevAuth] - Passphrase:', JSON.stringify(passphrase))

  try {
    const result = await bcrypt.compare(passphrase, hash)
    console.log('[DevAuth] - Comparison result:', result)
    return result
  } catch (err) {
    console.log('[DevAuth] - Comparison error:', err)
    return false
  }
}

/**
 * Validate a challenge hasn't expired.
 *
 * @param challengeTimestamp - When the challenge was issued
 * @param expiryMs - How long challenges are valid for
 * @returns true if challenge is still valid
 */
export function isChallengeValid(challengeTimestamp: number, expiryMs: number): boolean {
  const now = Date.now()
  return now - challengeTimestamp < expiryMs
}

/**
 * Authentication step result.
 */
export interface AuthStepResult {
  success: boolean
  error?: string
  data?: Record<string, unknown>
}

/**
 * Perform the wallet signature verification step.
 */
export function performWalletVerification(
  walletAddress: string,
  signature: string,
  challenge: string
): AuthStepResult {
  // Check whitelist first
  if (!isWalletWhitelisted(walletAddress)) {
    return {
      success: false,
      error: 'Wallet not authorized',
    }
  }

  // Verify the signature
  if (!verifyWalletSignature(walletAddress, signature, challenge)) {
    return {
      success: false,
      error: 'Invalid signature',
    }
  }

  return {
    success: true,
    data: { walletAddress },
  }
}

/**
 * Perform the passphrase verification step.
 */
export async function performPassphraseVerification(passphrase: string): Promise<AuthStepResult> {
  const isValid = await verifyPassphrase(passphrase)

  if (!isValid) {
    return {
      success: false,
      error: 'Invalid passphrase',
    }
  }

  return {
    success: true,
  }
}
