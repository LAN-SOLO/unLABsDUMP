'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Copy, Check } from 'lucide-react'

interface SetupData {
  secret: string
  uri: string
  backupCodes: string[]
}

export default function TwoFactorSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'qr' | 'backup' | 'verify'>('qr')
  const [copied, setCopied] = useState(false)
  const [backupCodesCopied, setBackupCodesCopied] = useState(false)

  useEffect(() => {
    initSetup()
  }, [])

  const initSetup = async () => {
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize 2FA setup')
      }

      setSetupData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copySecret = async () => {
    if (setupData?.secret) {
      await navigator.clipboard.writeText(setupData.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyBackupCodes = async () => {
    if (setupData?.backupCodes) {
      await navigator.clipboard.writeText(setupData.backupCodes.join('\n'))
      setBackupCodesCopied(true)
      setTimeout(() => setBackupCodesCopied(false), 2000)
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
        </CardContent>
      </Card>
    )
  }

  if (error && !setupData) {
    return (
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/')} className="mt-4 w-full" variant="outline">
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0D1117] border-[#0D3B1E]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0D3B1E]/30">
          <Shield className="h-6 w-6 text-[#00FF41]" />
        </div>
        <CardTitle className="text-xl text-[#00FF41]">
          {step === 'qr' && 'Set Up Two-Factor Authentication'}
          {step === 'backup' && 'Save Your Backup Codes'}
          {step === 'verify' && 'Verify Setup'}
        </CardTitle>
        <CardDescription className="text-[#00AA2A]">
          {step === 'qr' && 'Scan the QR code with your authenticator app'}
          {step === 'backup' && "Store these codes safely - you'll need them if you lose access"}
          {step === 'verify' && 'Enter the code from your authenticator app'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'qr' && setupData && (
          <>
            <div className="flex justify-center">
              <div className="rounded-sm bg-[#F0F0F0] p-4">
                <QRCodeSVG value={setupData.uri} size={200} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#00AA2A]">Can't scan? Enter this code manually:</Label>
              <div className="flex gap-2">
                <Input
                  value={setupData.secret}
                  readOnly
                  className="bg-[#111318] border-[#1A3A2A] font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copySecret} className="shrink-0">
                  {copied ? (
                    <Check className="h-4 w-4 text-[#00FF41]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setStep('backup')}
              className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33]"
            >
              Continue
            </Button>
          </>
        )}

        {step === 'backup' && setupData && (
          <>
            <div className="rounded-sm bg-[#111318] p-4">
              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code, i) => (
                  <code key={i} className="text-center font-mono text-sm text-[#00CC33]">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <Button variant="outline" onClick={copyBackupCodes} className="w-full">
              {backupCodesCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-[#00FF41]" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Backup Codes
                </>
              )}
            </Button>

            <Alert className="border-[#FFB000]/50 bg-[#FFB000]/10">
              <AlertDescription className="text-[#FFB000]">
                Each backup code can only be used once. Store them in a safe place.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => setStep('verify')}
              className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33]"
            >
              I've Saved My Backup Codes
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="bg-[#111318] border-[#1A3A2A] text-center font-mono text-2xl tracking-widest"
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33]"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enable 2FA'
              )}
            </Button>

            <Button variant="ghost" onClick={() => setStep('qr')} className="w-full text-[#00AA2A]">
              Back to QR Code
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
