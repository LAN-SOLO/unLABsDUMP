/**
 * Dev Area Audit Logging
 *
 * All security-relevant events are logged to the dev_access_logs table.
 * Logs are immutable - no delete/update operations exposed.
 */

import { createSupabaseAdminClient } from '@/lib/supabase/server'
import type { DevAccessEventType } from './config'

/**
 * Log entry for dev access audit.
 */
export interface DevAccessLogEntry {
  eventType: DevAccessEventType
  walletAddress?: string
  ipAddress: string
  userAgent?: string
  fingerprintHash?: string
  success: boolean
  failureReason?: string
  metadata?: Record<string, unknown>
}

/**
 * Log a dev access event to the database.
 *
 * @param entry - The log entry to record
 * @returns The created log ID or null on error
 */
export async function logDevAccess(entry: DevAccessLogEntry): Promise<string | null> {
  try {
    const supabase = await createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('dev_access_logs')
      .insert({
        event_type: entry.eventType,
        wallet_address: entry.walletAddress || null,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent || null,
        fingerprint_hash: entry.fingerprintHash || null,
        success: entry.success,
        failure_reason: entry.failureReason || null,
        metadata: entry.metadata || {},
      })
      .select('id')
      .single()

    if (error) {
      console.error('[DevAudit] Failed to log event:', error.message)
      return null
    }

    return data?.id || null
  } catch (err) {
    console.error('[DevAudit] Exception logging event:', err)
    return null
  }
}

/**
 * Convenience function to log a challenge issued event.
 */
export async function logChallengeIssued(
  walletAddress: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'challenge_issued',
    walletAddress,
    ipAddress,
    userAgent,
    success: true,
  })
}

/**
 * Convenience function to log a successful signature verification.
 */
export async function logSignatureVerified(
  walletAddress: string,
  ipAddress: string,
  fingerprintHash?: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'signature_verified',
    walletAddress,
    ipAddress,
    fingerprintHash,
    userAgent,
    success: true,
  })
}

/**
 * Convenience function to log a successful passphrase verification.
 */
export async function logPassphraseVerified(
  walletAddress: string,
  ipAddress: string,
  fingerprintHash?: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'passphrase_verified',
    walletAddress,
    ipAddress,
    fingerprintHash,
    userAgent,
    success: true,
  })
}

/**
 * Convenience function to log a session creation.
 */
export async function logSessionCreated(
  walletAddress: string,
  ipAddress: string,
  fingerprintHash: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'session_created',
    walletAddress,
    ipAddress,
    fingerprintHash,
    userAgent,
    success: true,
  })
}

/**
 * Convenience function to log an access denied event.
 */
export async function logAccessDenied(
  ipAddress: string,
  reason: string,
  walletAddress?: string,
  fingerprintHash?: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'access_denied',
    walletAddress,
    ipAddress,
    fingerprintHash,
    userAgent,
    success: false,
    failureReason: reason,
  })
}

/**
 * Convenience function to log a session expiration.
 */
export async function logSessionExpired(
  walletAddress: string,
  ipAddress: string,
  reason: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'session_expired',
    walletAddress,
    ipAddress,
    userAgent,
    success: false,
    failureReason: reason,
  })
}

/**
 * Convenience function to log a lockout trigger.
 */
export async function logLockoutTriggered(
  ipAddress: string,
  attemptCount: number,
  lockoutDurationMs: number,
  walletAddress?: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'lockout_triggered',
    walletAddress,
    ipAddress,
    userAgent,
    success: false,
    failureReason: `Lockout triggered after ${attemptCount} attempts`,
    metadata: {
      attemptCount,
      lockoutDurationMs,
      lockoutEndsAt: new Date(Date.now() + lockoutDurationMs).toISOString(),
    },
  })
}

/**
 * Convenience function to log a logout.
 */
export async function logLogout(
  walletAddress: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'logout',
    walletAddress,
    ipAddress,
    userAgent,
    success: true,
  })
}

/**
 * Convenience function to log a session validation.
 */
export async function logSessionValidated(
  walletAddress: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logDevAccess({
    eventType: 'session_validated',
    walletAddress,
    ipAddress,
    userAgent,
    success: true,
  })
}

/**
 * Fetch recent access logs for the log viewer.
 *
 * @param limit - Max number of records to fetch
 * @param offset - Number of records to skip (for pagination)
 * @param filters - Optional filters for event type, success, wallet
 * @returns Array of log entries
 */
export async function fetchAccessLogs(
  limit: number = 100,
  offset: number = 0,
  filters?: {
    eventType?: DevAccessEventType
    success?: boolean
    walletAddress?: string
    startDate?: string
    endDate?: string
  }
): Promise<{ logs: DevAccessLog[]; total: number }> {
  try {
    const supabase = await createSupabaseAdminClient()

    let query = supabase
      .from('dev_access_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType)
    }
    if (filters?.success !== undefined) {
      query = query.eq('success', filters.success)
    }
    if (filters?.walletAddress) {
      query = query.eq('wallet_address', filters.walletAddress)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[DevAudit] Failed to fetch logs:', error.message)
      return { logs: [], total: 0 }
    }

    return {
      logs: (data || []).map(mapLogRow),
      total: count || 0,
    }
  } catch (err) {
    console.error('[DevAudit] Exception fetching logs:', err)
    return { logs: [], total: 0 }
  }
}

/**
 * Database row to TypeScript type mapper.
 */
function mapLogRow(row: Record<string, unknown>): DevAccessLog {
  return {
    id: row.id as string,
    eventType: row.event_type as DevAccessEventType,
    walletAddress: row.wallet_address as string | null,
    ipAddress: row.ip_address as string,
    userAgent: row.user_agent as string | null,
    fingerprintHash: row.fingerprint_hash as string | null,
    success: row.success as boolean,
    failureReason: row.failure_reason as string | null,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.created_at as string,
  }
}

/**
 * Fetched log entry type.
 */
export interface DevAccessLog {
  id: string
  eventType: DevAccessEventType
  walletAddress: string | null
  ipAddress: string
  userAgent: string | null
  fingerprintHash: string | null
  success: boolean
  failureReason: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}
