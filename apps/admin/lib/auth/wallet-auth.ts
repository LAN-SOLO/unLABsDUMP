import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { AUTH_CONFIG } from './config'

// In-memory challenge store (use Redis in production)
const challenges = new Map<string, { nonce: string; expiresAt: number }>()

export function generateChallenge(walletAddress: string): string {
  const nonce = bs58.encode(nacl.randomBytes(32))
  const expiresAt = Date.now() + AUTH_CONFIG.CHALLENGE_EXPIRY

  challenges.set(walletAddress, { nonce, expiresAt })

  return `${AUTH_CONFIG.MESSAGE_PREFIX}${nonce}`
}

export function getChallenge(walletAddress: string): string | null {
  const challenge = challenges.get(walletAddress)

  if (!challenge) {
    return null
  }

  if (Date.now() > challenge.expiresAt) {
    challenges.delete(walletAddress)
    return null
  }

  return `${AUTH_CONFIG.MESSAGE_PREFIX}${challenge.nonce}`
}

export function verifySignature(
  walletAddress: string,
  signature: string,
  message: string
): boolean {
  try {
    const publicKey = new PublicKey(walletAddress)
    const signatureBytes = bs58.decode(signature)
    const messageBytes = new TextEncoder().encode(message)

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes())

    // Clear challenge after verification attempt
    challenges.delete(walletAddress)

    return isValid
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export function clearChallenge(walletAddress: string): void {
  challenges.delete(walletAddress)
}
