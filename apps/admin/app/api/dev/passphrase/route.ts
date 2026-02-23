/**
 * Dev Area Passphrase Verification API
 *
 * Verifies the passphrase (second factor) and creates the session.
 * This is the third and final step in the dev area authentication flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers, cookies } from 'next/headers'
import { isDevAreaEnabled, DEV_CONFIG } from '@/lib/dev/config'
import { hashFingerprint, type BrowserFingerprint } from '@/lib/dev/crypto'
import { performPassphraseVerification, isWalletWhitelisted } from '@/lib/dev/auth'
import { createSession } from '@/lib/dev/session'
import { checkRateLimit, recordFailedAttempt, recordSuccessfulAttempt } from '@/lib/dev/rate-limit'
import {
  logPassphraseVerified,
  logSessionCreated,
  logAccessDenied,
  logLockoutTriggered,
} from '@/lib/dev/audit'

interface VerificationTokenPayload {
  wallet: string
  ip: string
  fingerprintHash?: string
  timestamp: number
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
    const { passphrase, verificationToken, fingerprint } = body as {
      passphrase: string
      verificationToken: string
      fingerprint?: BrowserFingerprint
    }

    if (!passphrase || !verificationToken) {
      return NextResponse.json(
        { error: 'Passphrase and verification token are required' },
        { status: 400 }
      )
    }

    // Decode and validate verification token
    let tokenPayload: VerificationTokenPayload
    try {
      tokenPayload = JSON.parse(Buffer.from(verificationToken, 'base64').toString('utf8'))
    } catch {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }

    // Validate token is recent (5 minutes max)
    const tokenAge = Date.now() - tokenPayload.timestamp
    if (tokenAge > 5 * 60 * 1000) {
      await logAccessDenied(
        ip,
        'Verification token expired',
        tokenPayload.wallet,
        undefined,
        userAgent
      )
      return NextResponse.json({ error: 'Verification token expired' }, { status: 400 })
    }

    // Validate IP matches (optional but recommended)
    if (DEV_CONFIG.FEATURES.IP_BINDING && tokenPayload.ip !== ip) {
      await logAccessDenied(
        ip,
        'IP mismatch from verification step',
        tokenPayload.wallet,
        undefined,
        userAgent
      )
      return NextResponse.json({ error: 'Session security violation' }, { status: 400 })
    }

    const walletAddress = tokenPayload.wallet

    // Re-verify wallet is still whitelisted
    if (!isWalletWhitelisted(walletAddress)) {
      await logAccessDenied(ip, 'Wallet no longer whitelisted', walletAddress, undefined, userAgent)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

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

    // Verify passphrase
    const passphraseResult = await performPassphraseVerification(passphrase)

    if (!passphraseResult.success) {
      const { result, lockoutTriggered } = recordFailedAttempt(ip, walletAddress)

      await logAccessDenied(
        ip,
        passphraseResult.error || 'Invalid passphrase',
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
        { error: passphraseResult.error || 'Invalid passphrase' },
        { status: 401 }
      )
    }

    // Generate fingerprint hash
    const fingerprintHash = fingerprint
      ? hashFingerprint(fingerprint)
      : tokenPayload.fingerprintHash || 'no-fingerprint'

    // Log passphrase verified
    await logPassphraseVerified(walletAddress, ip, fingerprintHash, userAgent)

    // Create session
    const sessionToken = createSession(walletAddress, ip, fingerprintHash)

    if (!sessionToken) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Reset rate limiting on success
    recordSuccessfulAttempt(ip, walletAddress)

    // Log session created
    await logSessionCreated(walletAddress, ip, fingerprintHash, userAgent)

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(DEV_CONFIG.COOKIE_NAME, sessionToken, {
      ...DEV_CONFIG.COOKIE_OPTIONS,
      maxAge: Math.floor(DEV_CONFIG.SESSION_DURATION_MS / 1000),
    })

    return NextResponse.json({
      success: true,
      expiresAt: Date.now() + DEV_CONFIG.SESSION_DURATION_MS,
    })
  } catch (error) {
    console.error('[DevPassphrase] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
