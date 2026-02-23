/**
 * Dev Area Security Configuration
 *
 * All timing values are in milliseconds unless otherwise noted.
 * Security constants are immutable - no admin UI to modify.
 */

export const DEV_CONFIG = {
  // Session Settings
  SESSION_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  CHALLENGE_EXPIRY_MS: 30 * 1000, // 30 seconds

  // Cookie Settings
  COOKIE_NAME: 'dev_session',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/', // Must be '/' to work with both /dev/* and /api/dev/*
  },

  // Rate Limiting
  MAX_ATTEMPTS: 10,
  LOCKOUT_TIERS: [
    { attempts: 3, durationMs: 15 * 60 * 1000 }, // 15 minutes
    { attempts: 5, durationMs: 60 * 60 * 1000 }, // 1 hour
    { attempts: 10, durationMs: 24 * 60 * 60 * 1000 }, // 24 hours
  ] as const,

  // Attempt delay (exponential backoff between attempts)
  MIN_ATTEMPT_DELAY_MS: 1000, // 1 second minimum between attempts
  ATTEMPT_DELAY_MULTIPLIER: 2, // Each attempt waits 2x longer

  // Feature toggles
  FEATURES: {
    IP_BINDING: true,
    FINGERPRINT_BINDING: false, // Disabled - layout doesn't send fingerprint with session checks
    PASSPHRASE_REQUIRED: true,
  },
} as const

/**
 * Environment variable keys for dev area security.
 * These are the ONLY places admin credentials can be configured.
 */
export const DEV_ENV_KEYS = {
  MASTER_WALLET: 'DEV_AREA_MASTER_WALLET',
  PASSPHRASE_HASH: 'DEV_AREA_PASSPHRASE_HASH',
  ENCRYPTION_KEY: 'DEV_AREA_ENCRYPTION_KEY',
  SESSION_SECRET: 'DEV_AREA_SESSION_SECRET',
  ENABLED: 'DEV_AREA_ENABLED',
} as const

/**
 * Check if dev area is enabled via environment variable.
 */
export function isDevAreaEnabled(): boolean {
  return process.env[DEV_ENV_KEYS.ENABLED] === 'true'
}

/**
 * Get the master wallet address from environment.
 * Returns null if not configured.
 */
export function getMasterWallet(): string | null {
  return process.env[DEV_ENV_KEYS.MASTER_WALLET] || null
}

/**
 * Get the bcrypt passphrase hash from environment.
 * Returns null if not configured.
 */
export function getPassphraseHash(): string | null {
  return process.env[DEV_ENV_KEYS.PASSPHRASE_HASH] || null
}

/**
 * Get the AES-256 encryption key from environment.
 * Must be 32 bytes (64 hex characters).
 * Returns null if not configured or invalid.
 */
export function getEncryptionKey(): Buffer | null {
  const key = process.env[DEV_ENV_KEYS.ENCRYPTION_KEY]
  if (!key || key.length !== 64) return null
  try {
    return Buffer.from(key, 'hex')
  } catch {
    return null
  }
}

/**
 * Get the session signing secret from environment.
 * Should be at least 32 bytes (64 hex characters).
 * Returns null if not configured.
 */
export function getSessionSecret(): string | null {
  const secret = process.env[DEV_ENV_KEYS.SESSION_SECRET]
  if (!secret || secret.length < 64) return null
  return secret
}

/**
 * Validate all required environment variables are set.
 * Returns array of missing/invalid variable names.
 */
export function validateDevConfig(): string[] {
  const errors: string[] = []

  if (!isDevAreaEnabled()) {
    errors.push(`${DEV_ENV_KEYS.ENABLED} is not set to 'true'`)
  }

  if (!getMasterWallet()) {
    errors.push(`${DEV_ENV_KEYS.MASTER_WALLET} is not set`)
  }

  if (!getPassphraseHash()) {
    errors.push(`${DEV_ENV_KEYS.PASSPHRASE_HASH} is not set`)
  }

  if (!getEncryptionKey()) {
    errors.push(`${DEV_ENV_KEYS.ENCRYPTION_KEY} is not set or invalid (must be 64 hex chars)`)
  }

  if (!getSessionSecret()) {
    errors.push(`${DEV_ENV_KEYS.SESSION_SECRET} is not set or too short (min 64 chars)`)
  }

  return errors
}

export type DevAccessEventType =
  | 'challenge_issued'
  | 'signature_verified'
  | 'passphrase_verified'
  | 'session_created'
  | 'access_denied'
  | 'session_expired'
  | 'session_validated'
  | 'logout'
  | 'lockout_triggered'
