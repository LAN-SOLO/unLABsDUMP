import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { AUTH_CONFIG } from './config'

// In-memory challenge store (use Redis in production)
const challenges = new Map<string, { nonce: string; timestamp: number; expiresAt: number }>()

export function generateChallenge(walletAddress: string): {
  nonce: string
  message: string
  timestamp: number
} {
  const nonce = bs58.encode(nacl.randomBytes(32))
  const timestamp = Date.now()
  const expiresAt = timestamp + AUTH_CONFIG.CHALLENGE_EXPIRY

  challenges.set(walletAddress, { nonce, timestamp, expiresAt })

  const message = `${AUTH_CONFIG.MESSAGE_PREFIX}${nonce}\nTimestamp: ${timestamp}`

  return { nonce, message, timestamp }
}

export function getChallenge(
  walletAddress: string
): { nonce: string; message: string; timestamp: number } | null {
  const challenge = challenges.get(walletAddress)

  if (!challenge) {
    return null
  }

  if (Date.now() > challenge.expiresAt) {
    challenges.delete(walletAddress)
    return null
  }

  const message = `${AUTH_CONFIG.MESSAGE_PREFIX}${challenge.nonce}\nTimestamp: ${challenge.timestamp}`

  return { nonce: challenge.nonce, message, timestamp: challenge.timestamp }
}

export function verifySignature(message: string, signature: string, publicKey: string): boolean {
  try {
    const pubKey = new PublicKey(publicKey)
    const signatureBytes = bs58.decode(signature)
    const messageBytes = new TextEncoder().encode(message)

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, pubKey.toBytes())

    return isValid
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export function clearChallenge(walletAddress: string): void {
  challenges.delete(walletAddress)
}

export function consumeChallenge(walletAddress: string): {
  nonce: string
  message: string
  timestamp: number
} | null {
  const challenge = getChallenge(walletAddress)
  if (challenge) {
    challenges.delete(walletAddress)
  }
  return challenge
}
