'use client'

/**
 * Dev Area Authentication Flow
 *
 * Multi-step authentication component:
 * 1. Wallet connection and challenge signing
 * 2. Passphrase verification
 * 3. Session creation and redirect
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChallengeStep } from './challenge-step'
import { PassphraseStep } from './passphrase-step'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle } from 'lucide-react'

type AuthStep = 'wallet' | 'passphrase' | 'complete'

interface AuthFlowProps {
  onSuccess?: () => void
}

export function AuthFlow({ onSuccess }: AuthFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>('wallet')
  const [error, setError] = useState<string | null>(null)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const handleChallengeSuccess = useCallback((token: string, wallet: string) => {
    setVerificationToken(token)
    setWalletAddress(wallet)
    setStep('passphrase')
    setError(null)
  }, [])

  const handlePassphraseSuccess = useCallback(() => {
    setStep('complete')
    setError(null)

    // Redirect to dev dashboard
    if (onSuccess) {
      onSuccess()
    } else {
      router.push('/dev')
    }
  }, [onSuccess, router])

  const handleError = useCallback((message: string) => {
    setError(message)
  }, [])

  const handleReset = useCallback(() => {
    setStep('wallet')
    setVerificationToken(null)
    setWalletAddress(null)
    setError(null)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <CardTitle className="text-xl text-white">Dev Area Authentication</CardTitle>
          <CardDescription className="text-zinc-400">
            {step === 'wallet' && 'Connect your wallet and sign the challenge'}
            {step === 'passphrase' && 'Enter your passphrase to continue'}
            {step === 'complete' && 'Authentication complete'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                step === 'wallet' ? 'bg-green-500' : 'bg-green-500'
              }`}
            />
            <div className="h-0.5 w-8 bg-zinc-800">
              <div
                className={`h-full bg-green-500 transition-all ${
                  step === 'wallet' ? 'w-0' : 'w-full'
                }`}
              />
            </div>
            <div
              className={`h-2 w-2 rounded-full ${
                step === 'passphrase' || step === 'complete' ? 'bg-green-500' : 'bg-zinc-800'
              }`}
            />
            <div className="h-0.5 w-8 bg-zinc-800">
              <div
                className={`h-full bg-green-500 transition-all ${
                  step === 'complete' ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div
              className={`h-2 w-2 rounded-full ${
                step === 'complete' ? 'bg-green-500' : 'bg-zinc-800'
              }`}
            />
          </div>

          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="border-red-900 bg-red-950/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step content */}
          {step === 'wallet' && (
            <ChallengeStep onSuccess={handleChallengeSuccess} onError={handleError} />
          )}

          {step === 'passphrase' && verificationToken && (
            <PassphraseStep
              verificationToken={verificationToken}
              walletAddress={walletAddress || ''}
              onSuccess={handlePassphraseSuccess}
              onError={handleError}
              onBack={handleReset}
            />
          )}

          {step === 'complete' && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-white">Authentication successful!</p>
              <p className="text-sm text-zinc-400">Redirecting to dev area...</p>
            </div>
          )}

          {/* Security notice */}
          <div className="mt-6 border-t border-zinc-800 pt-4">
            <p className="text-center text-xs text-zinc-500">
              This area is restricted to authorized personnel only.
              <br />
              All access attempts are logged and monitored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
