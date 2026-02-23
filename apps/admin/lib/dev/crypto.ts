/**
 * Cryptographic utilities for dev area security.
 * Uses AES-256-GCM for encryption and SHA-256 for hashing.
 */

import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto'
import { getEncryptionKey } from './config'

const AES_ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits for GCM
const AUTH_TAG_LENGTH = 16 // 128 bits

/**
 * Generate a cryptographically secure challenge string.
 * Includes timestamp for expiry validation.
 */
export function generateChallenge(): { challenge: string; timestamp: number } {
  const randomPart = randomBytes(32).toString('hex')
  const timestamp = Date.now()
  const challenge = `dev-auth:${timestamp}:${randomPart}`
  return { challenge, timestamp }
}

/**
 * Parse a challenge string to extract timestamp.
 */
export function parseChallenge(challenge: string): { timestamp: number; nonce: string } | null {
  const parts = challenge.split(':')
  if (parts.length !== 3 || parts[0] !== 'dev-auth') {
    return null
  }
  const timestamp = parseInt(parts[1], 10)
  if (isNaN(timestamp)) {
    return null
  }
  return { timestamp, nonce: parts[2] }
}

/**
 * Encrypt data using AES-256-GCM.
 * Returns base64-encoded string containing IV + ciphertext + auth tag.
 */
export function encryptPayload(data: object): string | null {
  const key = getEncryptionKey()
  if (!key) return null

  try {
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(AES_ALGORITHM, key, iv)

    const plaintext = JSON.stringify(data)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])

    const authTag = cipher.getAuthTag()

    // Combine IV + ciphertext + auth tag
    const combined = Buffer.concat([iv, encrypted, authTag])
    return combined.toString('base64')
  } catch {
    return null
  }
}

/**
 * Decrypt data encrypted with encryptPayload.
 * Returns null on any error (tampered data, wrong key, etc).
 */
export function decryptPayload<T = object>(encrypted: string): T | null {
  const key = getEncryptionKey()
  if (!key) return null

  try {
    const combined = Buffer.from(encrypted, 'base64')

    // Extract IV, ciphertext, and auth tag
    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH)
    const ciphertext = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(AES_ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])

    return JSON.parse(decrypted.toString('utf8')) as T
  } catch {
    return null
  }
}

/**
 * Hash browser fingerprint components using SHA-256.
 * Normalizes the fingerprint object before hashing for consistency.
 */
export function hashFingerprint(fingerprint: BrowserFingerprint): string {
  // Normalize by sorting keys and creating stable representation
  const normalized = {
    canvas: fingerprint.canvas || '',
    webgl: fingerprint.webgl || '',
    audio: fingerprint.audio || '',
    timezone: fingerprint.timezone || '',
    language: fingerprint.language || '',
    platform: fingerprint.platform || '',
    screenResolution: fingerprint.screenResolution || '',
    colorDepth: fingerprint.colorDepth || 0,
  }

  const data = JSON.stringify(normalized)
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Hash a string using SHA-256.
 */
export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Generate a random hex string of specified byte length.
 */
export function randomHex(bytes: number): string {
  return randomBytes(bytes).toString('hex')
}

/**
 * Browser fingerprint components.
 */
export interface BrowserFingerprint {
  canvas?: string
  webgl?: string
  audio?: string
  timezone?: string
  language?: string
  platform?: string
  screenResolution?: string
  colorDepth?: number
}

/**
 * Compare two fingerprint hashes with timing-safe comparison.
 * Returns true only if they match exactly.
 */
export function compareFingerprints(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  // Use constant-time comparison to prevent timing attacks
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
