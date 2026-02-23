/**
 * Dev Area Session Management
 *
 * Sessions are encrypted JWTs that include:
 * - Wallet address (for identity)
 * - IP address (for binding)
 * - Fingerprint hash (for binding)
 * - Issue and expiry timestamps
 */

import jwt from 'jsonwebtoken'
import { DEV_CONFIG, getSessionSecret } from './config'
import { encryptPayload, decryptPayload, compareFingerprints } from './crypto'

/**
 * Dev session payload structure.
 */
export interface DevSession {
  wallet: string
  ip: string
  fingerprintHash: string
  issuedAt: number
  expiresAt: number
}

/**
 * Encrypted session token structure (inside JWT).
 */
interface EncryptedSessionToken {
  enc: string // Encrypted DevSession payload
  v: number // Version for future compatibility
}

const TOKEN_VERSION = 1

/**
 * Create a new dev session token.
 *
 * @param wallet - Master admin wallet address
 * @param ip - Client IP address
 * @param fingerprintHash - SHA-256 hash of browser fingerprint
 * @returns Signed JWT token or null on error
 */
export function createSession(wallet: string, ip: string, fingerprintHash: string): string | null {
  const secret = getSessionSecret()
  if (!secret) return null

  const now = Date.now()
  const session: DevSession = {
    wallet,
    ip,
    fingerprintHash,
    issuedAt: now,
    expiresAt: now + DEV_CONFIG.SESSION_DURATION_MS,
  }

  // Encrypt the session payload
  const encrypted = encryptPayload(session)
  if (!encrypted) return null

  // Sign with JWT for integrity
  const token: EncryptedSessionToken = {
    enc: encrypted,
    v: TOKEN_VERSION,
  }

  try {
    return jwt.sign(token, secret, {
      algorithm: 'HS512',
      expiresIn: Math.floor(DEV_CONFIG.SESSION_DURATION_MS / 1000),
    })
  } catch {
    return null
  }
}

/**
 * Session validation result.
 */
export interface SessionValidationResult {
  valid: boolean
  session?: DevSession
  error?: SessionValidationError
}

export type SessionValidationError =
  | 'invalid_token'
  | 'token_expired'
  | 'decryption_failed'
  | 'ip_mismatch'
  | 'fingerprint_mismatch'
  | 'session_expired'
  | 'version_mismatch'

/**
 * Validate a session token.
 *
 * @param token - The JWT session token
 * @param currentIp - Current client IP address
 * @param currentFingerprintHash - Current browser fingerprint hash
 * @returns Validation result with session or error
 */
export function validateSession(
  token: string,
  currentIp: string,
  currentFingerprintHash: string
): SessionValidationResult {
  const secret = getSessionSecret()
  if (!secret) {
    return { valid: false, error: 'invalid_token' }
  }

  // Verify JWT signature and expiry
  let decoded: EncryptedSessionToken
  try {
    decoded = jwt.verify(token, secret, { algorithms: ['HS512'] }) as EncryptedSessionToken
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'token_expired' }
    }
    return { valid: false, error: 'invalid_token' }
  }

  // Check version
  if (decoded.v !== TOKEN_VERSION) {
    return { valid: false, error: 'version_mismatch' }
  }

  // Decrypt the session payload
  const session = decryptPayload<DevSession>(decoded.enc)
  if (!session) {
    return { valid: false, error: 'decryption_failed' }
  }

  // Check session expiry (double-check beyond JWT)
  if (Date.now() > session.expiresAt) {
    return { valid: false, error: 'session_expired' }
  }

  // Verify IP binding
  if (DEV_CONFIG.FEATURES.IP_BINDING && session.ip !== currentIp) {
    return { valid: false, error: 'ip_mismatch' }
  }

  // Verify fingerprint binding
  if (
    DEV_CONFIG.FEATURES.FINGERPRINT_BINDING &&
    !compareFingerprints(session.fingerprintHash, currentFingerprintHash)
  ) {
    return { valid: false, error: 'fingerprint_mismatch' }
  }

  return { valid: true, session }
}

/**
 * Get remaining session time in milliseconds.
 */
export function getSessionTimeRemaining(session: DevSession): number {
  return Math.max(0, session.expiresAt - Date.now())
}

/**
 * Check if session is about to expire (less than 2 minutes remaining).
 */
export function isSessionExpiringSoon(session: DevSession): boolean {
  return getSessionTimeRemaining(session) < 2 * 60 * 1000
}

/**
 * Extract session from token without full validation.
 * Useful for getting session info for audit logging.
 */
export function extractSession(token: string): DevSession | null {
  const secret = getSessionSecret()
  if (!secret) return null

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS512'],
      ignoreExpiration: true,
    }) as EncryptedSessionToken

    if (decoded.v !== TOKEN_VERSION) return null

    return decryptPayload<DevSession>(decoded.enc)
  } catch {
    return null
  }
}
