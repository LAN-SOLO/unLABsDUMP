/**
 * Dev Area Signature Verification API
 *
 * Verifies the wallet signature of the challenge.
 * This is the second step in the dev area authentication flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { isDevAreaEnabled, DEV_CONFIG } from '@/lib/dev/config'
import { parseChallenge, hashFingerprint, type BrowserFingerprint } from '@/lib/dev/crypto'
import { performWalletVerification, isChallengeValid } from '@/lib/dev/auth'
import { checkRateLimit, recordFailedAttempt } from '@/lib/dev/rate-limit'
import { logSignatureVerified, logAccessDenied, logLockoutTriggered } from '@/lib/dev/audit'

// In-memory store for pending challenges (challenge -> { wallet, timestamp })
// In production, use Redis with TTL
const pendingChallenges = new Map<string, { wallet: string; timestamp: number }>()

// Cleanup old challenges periodically
setInterval(() => {
  const now = Date.now()
  for (const [challenge, data] of pendingChallenges) {
    if (now - data.timestamp > DEV_CONFIG.CHALLENGE_EXPIRY_MS * 2) {
      pendingChallenges.delete(challenge)
    }
  }
}, 60 * 1000) // Every minute

/**
 * Store a challenge for verification.
 * Called internally when challenge is issued.
 */
export function storePendingChallenge(challenge: string, wallet: string, timestamp: number) {
  pendingChallenges.set(challenge, { wallet, timestamp })
}

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
    const { walletAddress, signature, challenge, message, fingerprint } = body as {
      walletAddress: string
      signature: string
      challenge: string
      message?: string // Full message that was signed (optional for backwards compat)
      fingerprint?: BrowserFingerprint
    }

    if (!walletAddress || !signature || !challenge) {
      return NextResponse.json(
        { error: 'Wallet address, signature, and challenge are required' },
        { status: 400 }
      )
    }

    // Use the full message for signature verification if provided, otherwise use challenge
    const signedMessage = message || challenge

    // Check rate limiting
    const rateLimitResult = checkRateLimit(ip, walletAddress)
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

    // Parse and validate challenge
    const parsed = parseChallenge(challenge)
    if (!parsed) {
      await logAccessDenied(ip, 'Invalid challenge format', walletAddress, undefined, userAgent)
      recordFailedAttempt(ip, walletAddress)
      return NextResponse.json({ error: 'Invalid challenge format' }, { status: 400 })
    }

    // Check challenge expiry
    if (!isChallengeValid(parsed.timestamp, DEV_CONFIG.CHALLENGE_EXPIRY_MS)) {
      await logAccessDenied(ip, 'Challenge expired', walletAddress, undefined, userAgent)
      recordFailedAttempt(ip, walletAddress)
      return NextResponse.json({ error: 'Challenge expired' }, { status: 400 })
    }

    // Verify wallet signature (using the full signed message)
    const verificationResult = performWalletVerification(walletAddress, signature, signedMessage)

    if (!verificationResult.success) {
      const { result, lockoutTriggered } = recordFailedAttempt(ip, walletAddress)

      await logAccessDenied(
        ip,
        verificationResult.error || 'Verification failed',
        walletAddress,
        undefined,
        userAgent
      )

      if (lockoutTriggered && result.lockedUntil) {
        await logLockoutTriggered(
          ip,
          result.attemptsCount,
          result.lockedUntil - Date.now(),
          walletAddress,
          userAgent
        )
      }

      return NextResponse.json(
        { error: verificationResult.error || 'Verification failed' },
        { status: 401 }
      )
    }

    // Generate fingerprint hash if provided
    const fingerprintHash = fingerprint ? hashFingerprint(fingerprint) : undefined

    // Log successful verification
    await logSignatureVerified(walletAddress, ip, fingerprintHash, userAgent)

    // Generate a verification token for the next step
    // This is a simple approach - in production, use a proper state management
    const verificationToken = Buffer.from(
      JSON.stringify({
        wallet: walletAddress,
        ip,
        fingerprintHash,
        timestamp: Date.now(),
      })
    ).toString('base64')

    return NextResponse.json({
      verified: true,
      requiresPassphrase: DEV_CONFIG.FEATURES.PASSPHRASE_REQUIRED,
      verificationToken,
    })
  } catch (error) {
    console.error('[DevVerify] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
