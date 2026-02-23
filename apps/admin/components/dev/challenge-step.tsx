'use client'

/**
 * Challenge Step Component
 *
 * Handles wallet connection and challenge signing.
 */

import { useState, useCallback, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import bs58 from 'bs58'
import { Button } from '@/components/ui/button'
import { Loader2, Wallet, CheckCircle } from 'lucide-react'
import { generateFingerprint } from './fingerprint'

interface ChallengeStepProps {
  onSuccess: (verificationToken: string, walletAddress: string) => void
  onError: (message: string) => void
}

export function ChallengeStep({ onSuccess, onError }: ChallengeStepProps) {
  const { publicKey, signMessage, connected, connecting } = useWallet()
  const [status, setStatus] = useState<'idle' | 'requesting' | 'signing' | 'verifying'>('idle')
  const [challenge, setChallenge] = useState<string | null>(null) // Raw challenge for verification
  const [messageToSign, setMessageToSign] = useState<string | null>(null) // Full message to display/sign

  // Request challenge when wallet connects
  const requestChallenge = useCallback(async () => {
    if (!publicKey) return

    setStatus('requesting')

    try {
      const fingerprint = await generateFingerprint()

      const response = await fetch('/api/dev/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          fingerprint,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          const waitTime = data.remainingMs
            ? Math.ceil(data.remainingMs / 1000 / 60)
            : data.waitMs
              ? Math.ceil(data.waitMs / 1000)
              : 'a few'
          onError(
            `Too many attempts. Please wait ${waitTime} ${data.remainingMs ? 'minutes' : 'seconds'}.`
          )
        } else {
          onError(data.error || 'Failed to get challenge')
        }
        setStatus('idle')
        return
      }

      setChallenge(data.challenge) // Raw challenge for verification
      setMessageToSign(data.message) // Full message to display and sign
      setStatus('idle')
    } catch {
      onError('Failed to connect to server')
      setStatus('idle')
    }
  }, [publicKey, onError])

  // Sign the challenge
  const signChallenge = useCallback(async () => {
    if (!publicKey || !signMessage || !challenge || !messageToSign) return

    setStatus('signing')

    try {
      // Sign the full message (including preamble)
      const messageBytes = new TextEncoder().encode(messageToSign)
      const signature = await signMessage(messageBytes)
      const signatureBase58 = bs58.encode(signature)

      setStatus('verifying')

      const fingerprint = await generateFingerprint()

      const response = await fetch('/api/dev/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          signature: signatureBase58,
          challenge, // Raw challenge for format validation
          message: messageToSign, // Full message that was signed
          fingerprint,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          const waitTime = data.remainingMs
            ? Math.ceil(data.remainingMs / 1000 / 60)
            : data.waitMs
              ? Math.ceil(data.waitMs / 1000)
              : 'a few'
          onError(
            `Too many attempts. Please wait ${waitTime} ${data.remainingMs ? 'minutes' : 'seconds'}.`
          )
        } else {
          onError(data.error || 'Signature verification failed')
        }
        setStatus('idle')
        setChallenge(null)
        setMessageToSign(null)
        return
      }

      if (data.verified && data.verificationToken) {
        onSuccess(data.verificationToken, publicKey.toBase58())
      } else {
        onError('Verification failed')
        setStatus('idle')
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('User rejected')) {
        onError('Signature rejected')
      } else {
        onError('Failed to sign message')
      }
      setStatus('idle')
    }
  }, [publicKey, signMessage, challenge, messageToSign, onSuccess, onError])

  // Auto-request challenge when wallet connects (with debounce)
  useEffect(() => {
    if (connected && publicKey && !challenge && status === 'idle') {
      // Small delay to prevent rapid re-requests
      const timer = setTimeout(() => {
        requestChallenge()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [connected, publicKey, challenge, status, requestChallenge])

  return (
    <div className="space-y-4">
      {/* Wallet connection */}
      <div className="flex flex-col items-center space-y-4">
        {!connected ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <Wallet className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400">Connect your authorized wallet to continue</p>
            <WalletMultiButton />
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-zinc-400">
              Connected: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
            </p>
          </>
        )}
      </div>

      {/* Challenge signing */}
      {connected && challenge && messageToSign && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Challenge Message
            </p>
            <pre className="whitespace-pre-wrap break-all font-mono text-xs text-zinc-300">
              {messageToSign}
            </pre>
          </div>

          <Button
            onClick={signChallenge}
            disabled={status !== 'idle'}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {status === 'signing' && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sign in wallet...
              </>
            )}
            {status === 'verifying' && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            )}
            {status === 'idle' && 'Sign Challenge'}
          </Button>
        </div>
      )}

      {/* Loading states */}
      {connecting && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          <span className="ml-2 text-zinc-400">Connecting wallet...</span>
        </div>
      )}

      {status === 'requesting' && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          <span className="ml-2 text-zinc-400">Requesting challenge...</span>
        </div>
      )}
    </div>
  )
}
