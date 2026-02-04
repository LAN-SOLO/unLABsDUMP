'use client'

import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import bs58 from 'bs58'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wallet } from 'lucide-react'

interface WalletLoginProps {
  onSuccess: () => void
  onRequires2FA: (adminId: string) => void
}

export function WalletLogin({ onSuccess, onRequires2FA }: WalletLoginProps) {
  const { publicKey, signMessage, connected, disconnect } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const walletAddress = publicKey.toBase58()

      // Get challenge
      const challengeRes = await fetch('/api/auth/wallet/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })

      const challengeData = await challengeRes.json()

      if (!challengeRes.ok) {
        throw new Error(challengeData.error || 'Failed to get challenge')
      }

      // Sign message
      const messageBytes = new TextEncoder().encode(challengeData.message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)

      // Verify signature
      const verifyRes = await fetch('/api/auth/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature }),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Failed to verify signature')
      }

      if (verifyData.requires2FA) {
        onRequires2FA(verifyData.adminId)
      } else {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, signMessage, onSuccess, onRequires2FA])

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center gap-4">
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />

        {connected && publicKey && (
          <>
            <p className="text-sm text-muted-foreground font-mono">
              {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </p>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Sign to Authenticate
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => disconnect()}
              className="text-muted-foreground"
            >
              Disconnect
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
