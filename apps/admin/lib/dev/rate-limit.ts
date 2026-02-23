/**
 * Rate Limiting and Lockout System
 *
 * Tracks failed authentication attempts by IP + wallet combination.
 * Uses in-memory storage (suitable for single-server deployment).
 * For production multi-server, replace with Redis.
 */

import { DEV_CONFIG } from './config'

/**
 * Attempt tracking record.
 */
interface AttemptRecord {
  attempts: number
  lastAttemptAt: number
  lockedUntil: number | null
  consecutiveFailures: number
}

/**
 * In-memory store for attempt tracking.
 * Key format: "ip:wallet" or "ip" (for IP-only tracking)
 */
const attemptStore = new Map<string, AttemptRecord>()

/**
 * Clean up expired records periodically.
 * Records older than 24 hours with no lockout are removed.
 */
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000 // 1 hour
const MAX_RECORD_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

let cleanupInterval: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupInterval) return

  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of attemptStore) {
      // Remove if no lockout and last attempt was > 24 hours ago
      if (!record.lockedUntil && now - record.lastAttemptAt > MAX_RECORD_AGE_MS) {
        attemptStore.delete(key)
      }
      // Remove expired lockouts with no recent activity
      if (
        record.lockedUntil &&
        record.lockedUntil < now &&
        now - record.lastAttemptAt > MAX_RECORD_AGE_MS
      ) {
        attemptStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)
}

// Start cleanup on module load
startCleanup()

/**
 * Generate a key for the attempt store.
 */
function getKey(ip: string, wallet?: string): string {
  return wallet ? `${ip}:${wallet}` : ip
}

/**
 * Get the current lockout tier based on attempt count.
 */
function getLockoutTier(attempts: number): (typeof DEV_CONFIG.LOCKOUT_TIERS)[number] | null {
  // Find the highest tier that applies
  for (let i = DEV_CONFIG.LOCKOUT_TIERS.length - 1; i >= 0; i--) {
    if (attempts >= DEV_CONFIG.LOCKOUT_TIERS[i].attempts) {
      return DEV_CONFIG.LOCKOUT_TIERS[i]
    }
  }
  return null
}

/**
 * Rate limit check result.
 */
export interface RateLimitResult {
  allowed: boolean
  lockedUntil?: number
  remainingLockoutMs?: number
  attemptsCount: number
  waitTimeMs?: number // Time to wait before next attempt
}

/**
 * Check if an authentication attempt is allowed.
 *
 * @param ip - Client IP address
 * @param wallet - Optional wallet address for combined tracking
 * @param skipDelay - If true, only check lockout status, not exponential delay
 * @returns Rate limit result
 */
export function checkRateLimit(ip: string, wallet?: string, skipDelay = false): RateLimitResult {
  const key = getKey(ip, wallet)
  const record = attemptStore.get(key)

  if (!record) {
    return { allowed: true, attemptsCount: 0 }
  }

  const now = Date.now()

  // Check if currently locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    return {
      allowed: false,
      lockedUntil: record.lockedUntil,
      remainingLockoutMs: record.lockedUntil - now,
      attemptsCount: record.attempts,
    }
  }

  // Check minimum delay between attempts (exponential backoff)
  // Skip this for challenge requests where we only care about lockouts
  if (!skipDelay) {
    const minDelay =
      DEV_CONFIG.MIN_ATTEMPT_DELAY_MS *
      Math.pow(DEV_CONFIG.ATTEMPT_DELAY_MULTIPLIER, record.consecutiveFailures)
    const timeSinceLastAttempt = now - record.lastAttemptAt

    if (timeSinceLastAttempt < minDelay) {
      return {
        allowed: false,
        attemptsCount: record.attempts,
        waitTimeMs: minDelay - timeSinceLastAttempt,
      }
    }
  }

  return { allowed: true, attemptsCount: record.attempts }
}

/**
 * Record a failed authentication attempt.
 *
 * @param ip - Client IP address
 * @param wallet - Optional wallet address
 * @returns Updated rate limit status and whether lockout was triggered
 */
export function recordFailedAttempt(
  ip: string,
  wallet?: string
): { result: RateLimitResult; lockoutTriggered: boolean } {
  const key = getKey(ip, wallet)
  const now = Date.now()

  let record = attemptStore.get(key)

  if (!record) {
    record = {
      attempts: 0,
      lastAttemptAt: now,
      lockedUntil: null,
      consecutiveFailures: 0,
    }
  }

  // Increment counters
  record.attempts++
  record.consecutiveFailures++
  record.lastAttemptAt = now

  // Check if we need to apply a lockout
  const tier = getLockoutTier(record.attempts)
  let lockoutTriggered = false

  if (tier) {
    const newLockoutUntil = now + tier.durationMs

    // Only apply if this is a new or longer lockout
    if (!record.lockedUntil || newLockoutUntil > record.lockedUntil) {
      record.lockedUntil = newLockoutUntil
      lockoutTriggered = true
    }
  }

  attemptStore.set(key, record)

  return {
    result: {
      allowed: false,
      lockedUntil: record.lockedUntil ?? undefined,
      remainingLockoutMs: record.lockedUntil ? record.lockedUntil - now : undefined,
      attemptsCount: record.attempts,
    },
    lockoutTriggered,
  }
}

/**
 * Record a successful authentication (resets failure counters).
 *
 * @param ip - Client IP address
 * @param wallet - Optional wallet address
 */
export function recordSuccessfulAttempt(ip: string, wallet?: string): void {
  const key = getKey(ip, wallet)

  // Reset the record on success
  attemptStore.set(key, {
    attempts: 0,
    lastAttemptAt: Date.now(),
    lockedUntil: null,
    consecutiveFailures: 0,
  })
}

/**
 * Get attempt history for an IP/wallet (for audit purposes).
 */
export function getAttemptHistory(ip: string, wallet?: string): AttemptRecord | null {
  const key = getKey(ip, wallet)
  return attemptStore.get(key) || null
}

/**
 * Reset the delay counter when a valid action is taken (e.g., challenge issued).
 * This allows the user to proceed without waiting, but keeps the attempt count.
 *
 * @param ip - Client IP address
 * @param wallet - Optional wallet address
 */
export function resetDelayCounter(ip: string, wallet?: string): void {
  const key = getKey(ip, wallet)
  const record = attemptStore.get(key)

  if (record) {
    record.consecutiveFailures = 0
    record.lastAttemptAt = Date.now()
    attemptStore.set(key, record)
  }
}

/**
 * Manually clear lockout (for testing/admin purposes).
 * This should NOT be exposed in any API.
 */
export function clearLockout(ip: string, wallet?: string): void {
  const key = getKey(ip, wallet)
  const record = attemptStore.get(key)

  if (record) {
    record.lockedUntil = null
    record.consecutiveFailures = 0
    attemptStore.set(key, record)
  }
}

/**
 * Get all current lockouts (for monitoring).
 */
export function getActiveLockouts(): Array<{ key: string; lockedUntil: number; attempts: number }> {
  const now = Date.now()
  const lockouts: Array<{ key: string; lockedUntil: number; attempts: number }> = []

  for (const [key, record] of attemptStore) {
    if (record.lockedUntil && record.lockedUntil > now) {
      lockouts.push({
        key,
        lockedUntil: record.lockedUntil,
        attempts: record.attempts,
      })
    }
  }

  return lockouts
}
