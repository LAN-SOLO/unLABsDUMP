'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, KeyRound } from 'lucide-react'

function TwoFactorVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const adminId = searchParams.get('adminId')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)

  const handleVerify = async () => {
    if (!adminId) {
      setError('Invalid session. Please log in again.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          token: code,
          isBackupCode: useBackupCode,
        }),
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
      setIsLoading(false)
    }
  }

  if (!adminId) {
    return (
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>Invalid session. Please log in again.</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/login')} className="mt-4 w-full" variant="outline">
            Return to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0D1117] border-[#0D3B1E]">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0D3B1E]/30">
          {useBackupCode ? (
            <KeyRound className="h-6 w-6 text-[#00FF41]" />
          ) : (
            <Shield className="h-6 w-6 text-[#00FF41]" />
          )}
        </div>
        <CardTitle className="text-xl text-[#00FF41]">
          {useBackupCode ? 'Enter Backup Code' : 'Two-Factor Authentication'}
        </CardTitle>
        <CardDescription className="text-[#00AA2A]">
          {useBackupCode
            ? 'Enter one of your backup codes to sign in'
            : 'Enter the 6-digit code from your authenticator app'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="code">{useBackupCode ? 'Backup Code' : 'Verification Code'}</Label>
          <Input
            id="code"
            type="text"
            inputMode={useBackupCode ? 'text' : 'numeric'}
            pattern={useBackupCode ? undefined : '[0-9]*'}
            maxLength={useBackupCode ? 8 : 6}
            placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
            value={code}
            onChange={(e) =>
              setCode(
                useBackupCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '')
              )
            }
            className="bg-[#111318] border-[#1A3A2A] text-center font-mono text-2xl tracking-widest"
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={(useBackupCode ? code.length !== 8 : code.length !== 6) || isLoading}
          className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => {
              setUseBackupCode(!useBackupCode)
              setCode('')
              setError(null)
            }}
            className="text-[#00AA2A] hover:text-[#00FF41]"
          >
            {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code instead'}
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/login')}
            className="text-[#1A6B35] text-sm"
          >
            Back to login
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TwoFactorVerifyPage() {
  return (
    <Suspense
      fallback={
        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
          </CardContent>
        </Card>
      }
    >
      <TwoFactorVerifyContent />
    </Suspense>
  )
}
