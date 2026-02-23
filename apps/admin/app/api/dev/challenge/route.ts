/**
 * Dev Area Challenge API
 *
 * Issues a time-limited cryptographic challenge for wallet signature.
 * This is the first step in the dev area authentication flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { isDevAreaEnabled, DEV_CONFIG } from '@/lib/dev/config'
import { generateChallenge } from '@/lib/dev/crypto'
import { isWalletWhitelisted } from '@/lib/dev/auth'
import { checkRateLimit, recordFailedAttempt, resetDelayCounter } from '@/lib/dev/rate-limit'
import { logChallengeIssued, logAccessDenied, logLockoutTriggered } from '@/lib/dev/audit'

export async function POST(request: NextRequest) {
  // Get client info
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const userAgent = headersList.get('user-agent') || undefined

  try {
    // Check if dev area is enabled
    if (!isDevAreaEnabled()) {
      return NextResponse.json({ error: 'Dev area is not enabled' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { walletAddress } = body

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    // Check whitelist first
    const isWhitelisted = isWalletWhitelisted(walletAddress)

    // For whitelisted wallets: only check lockout status, not exponential delay
    // For non-whitelisted: apply full rate limiting before revealing whitelist status
    const rateLimitResult = checkRateLimit(ip, walletAddress, isWhitelisted)
    if (!rateLimitResult.allowed) {
      if (rateLimitResult.remainingLockoutMs) {
        return NextResponse.json(
          {
            error: 'Account locked',
            lockedUntil: rateLimitResult.lockedUntil,
            remainingMs: rateLimitResult.remainingLockoutMs,
          },
          { status: 429 }
        )
      }
      if (rateLimitResult.waitTimeMs) {
        return NextResponse.json(
          {
            error: 'Too many attempts',
            waitMs: rateLimitResult.waitTimeMs,
          },
          { status: 429 }
        )
      }
    }

    // Handle non-whitelisted wallets
    if (!isWhitelisted) {
      // Record failed attempt
      const { result, lockoutTriggered } = recordFailedAttempt(ip, walletAddress)

      // Log access denied
      await logAccessDenied(ip, 'Wallet not whitelisted', walletAddress, undefined, userAgent)

      // Log lockout if triggered
      if (lockoutTriggered && result.lockedUntil) {
        await logLockoutTriggered(
          ip,
          result.attemptsCount,
          result.lockedUntil - Date.now(),
          walletAddress,
          userAgent
        )
      }

      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate challenge
    const { challenge, timestamp } = generateChallenge()
    const expiresAt = timestamp + DEV_CONFIG.CHALLENGE_EXPIRY_MS

    // Reset delay counter - allows whitelisted wallet to proceed without waiting
    resetDelayCounter(ip, walletAddress)

    // Log challenge issued
    await logChallengeIssued(walletAddress, ip, userAgent)

    return NextResponse.json({
      challenge,
      expiresAt,
      message: `Sign this message to authenticate to the dev area:\n\n${challenge}`,
    })
  } catch (error) {
    console.error('[DevChallenge] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
