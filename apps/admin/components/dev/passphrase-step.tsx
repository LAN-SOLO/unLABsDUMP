'use client'

/**
 * Passphrase Step Component
 *
 * Second factor authentication with passphrase.
 */

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react'
import { generateFingerprint } from './fingerprint'

interface PassphraseStepProps {
  verificationToken: string
  walletAddress: string
  onSuccess: () => void
  onError: (message: string) => void
  onBack: () => void
}

export function PassphraseStep({
  verificationToken,
  walletAddress,
  onSuccess,
  onError,
  onBack,
}: PassphraseStepProps) {
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!passphrase.trim()) {
        onError('Passphrase is required')
        return
      }

      setIsSubmitting(true)

      try {
        const fingerprint = await generateFingerprint()

        const response = await fetch('/api/dev/passphrase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passphrase,
            verificationToken,
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
            onError(data.error || 'Passphrase verification failed')
          }
          setIsSubmitting(false)
          setPassphrase('')
          return
        }

        if (data.success) {
          onSuccess()
        } else {
          onError('Verification failed')
          setIsSubmitting(false)
        }
      } catch {
        onError('Failed to connect to server')
        setIsSubmitting(false)
      }
    },
    [passphrase, verificationToken, onSuccess, onError]
  )

  return (
    <div className="space-y-4">
      {/* Wallet indicator */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
        <p className="text-xs text-zinc-500">Authenticated as</p>
        <p className="font-mono text-sm text-zinc-300">
          {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </p>
      </div>

      {/* Passphrase form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="passphrase" className="text-zinc-400">
            Passphrase
          </Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="passphrase"
              type={showPassphrase ? 'text' : 'password'}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your passphrase"
              className="border-zinc-800 bg-zinc-900 pl-10 pr-10 text-white placeholder:text-zinc-600"
              disabled={isSubmitting}
              autoComplete="off"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              tabIndex={-1}
            >
              {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !passphrase.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Authenticate'
            )}
          </Button>
        </div>
      </form>

      {/* Security hint */}
      <p className="text-center text-xs text-zinc-600">
        Your passphrase is never stored and is verified using a one-way hash.
      </p>
    </div>
  )
}
