'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  User,
  Shield,
  Key,
  LogOut,
  Check,
  AlertTriangle,
  Smartphone,
  Laptop,
} from 'lucide-react'

interface AdminProfile {
  id: string
  email: string | null
  wallet_address: string | null
  role: string
  two_factor_enabled: boolean
  created_at: string
  last_login: string | null
}

interface Session {
  id: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  last_active: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Email form state
  const [email, setEmail] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // 2FA state
  const [isDisabling2FA, setIsDisabling2FA] = useState(false)
  const [disable2FAToken, setDisable2FAToken] = useState('')

  useEffect(() => {
    fetchProfile()
    fetchSessions()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      setProfile(data.admin)
      setEmail(data.admin.email || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/profile/sessions')
      const data = await res.json()

      if (res.ok) {
        setSessions(data.sessions || [])
      }
    } catch {
      // Silently fail for sessions
    }
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingEmail(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email')
      }

      setSuccess('Email updated successfully')
      fetchProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPassword(true)
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsUpdatingPassword(false)
      return
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      setSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsDisabling2FA(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disable2FAToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to disable 2FA')
      }

      setSuccess('Two-factor authentication disabled')
      setDisable2FAToken('')
      fetchProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setIsDisabling2FA(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/profile/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchSessions()
      }
    } catch {
      // Silently fail
    }
  }

  const handleRevokeAllSessions = async () => {
    try {
      await fetch('/api/profile/sessions?revokeAll=true', {
        method: 'DELETE',
      })

      router.push('/login')
    } catch {
      // Silently fail
    }
  }

  const parseUserAgent = (ua: string | null): { type: string; browser: string } => {
    if (!ua) return { type: 'Unknown', browser: 'Unknown' }

    const isMobile = /Mobile|Android|iPhone|iPad/.test(ua)
    const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)/)?.[1] || 'Unknown'

    return {
      type: isMobile ? 'Mobile' : 'Desktop',
      browser,
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#00FF41]">Settings</h1>
        <p className="text-[#00AA2A] mt-2">Manage your account settings and security</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-[#00FF41]/50 bg-[#00FF41]/10">
          <Check className="h-4 w-4 text-[#00FF41]" />
          <AlertDescription className="text-[#00FF41]">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#00FF41]" />
              <CardTitle className="text-[#00FF41]">Profile Information</CardTitle>
            </div>
            <CardDescription className="text-[#00AA2A]">
              Update your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#00AA2A]">Role</Label>
              <div className="text-[#00FF41] font-medium capitalize">
                {profile?.role || 'Admin'}
              </div>
            </div>

            {profile?.wallet_address && (
              <div className="space-y-2">
                <Label className="text-[#00AA2A]">Wallet Address</Label>
                <div className="text-[#00FF41] font-mono text-sm bg-[#111318] p-2 rounded">
                  {profile.wallet_address}
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#111318] border-[#1A3A2A]"
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdatingEmail || email === profile?.email}
                className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
              >
                {isUpdatingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Email'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password */}
        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-[#00FF41]" />
              <CardTitle className="text-[#00FF41]">Change Password</CardTitle>
            </div>
            <CardDescription className="text-[#00AA2A]">Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[#111318] border-[#1A3A2A]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#111318] border-[#1A3A2A]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#111318] border-[#1A3A2A]"
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdatingPassword || !currentPassword || !newPassword}
                className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00FF41]" />
              <CardTitle className="text-[#00FF41]">Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription className="text-[#00AA2A]">
              Add an extra layer of security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#00FF41] font-medium">Status</p>
                <p
                  className={`text-sm ${profile?.two_factor_enabled ? 'text-[#00FF41]' : 'text-[#00AA2A]'}`}
                >
                  {profile?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {profile?.two_factor_enabled ? (
                <div className="h-8 w-8 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#00FF41]" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#FFB000]/20 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-[#FFB000]" />
                </div>
              )}
            </div>

            <Separator className="bg-[#1A3A2A]" />

            {profile?.two_factor_enabled ? (
              <div className="space-y-4">
                <p className="text-sm text-[#00AA2A]">
                  Enter a code from your authenticator app to disable 2FA.
                </p>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={disable2FAToken}
                  onChange={(e) => setDisable2FAToken(e.target.value.replace(/\D/g, ''))}
                  className="bg-[#111318] border-[#1A3A2A]"
                />
                <Button
                  variant="destructive"
                  onClick={handleDisable2FA}
                  disabled={disable2FAToken.length !== 6 || isDisabling2FA}
                >
                  {isDisabling2FA ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    'Disable 2FA'
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => router.push('/2fa/setup')}
                className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33]"
              >
                <Shield className="mr-2 h-4 w-4" />
                Enable 2FA
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-[#00FF41]" />
              <CardTitle className="text-[#00FF41]">Active Sessions</CardTitle>
            </div>
            <CardDescription className="text-[#00AA2A]">
              Manage your active sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-[#00AA2A] text-sm">No active sessions found</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const { type, browser } = parseUserAgent(session.user_agent)
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-[#111318] rounded-sm"
                    >
                      <div className="flex items-center gap-3">
                        {type === 'Mobile' ? (
                          <Smartphone className="h-5 w-5 text-[#00AA2A]" />
                        ) : (
                          <Laptop className="h-5 w-5 text-[#00AA2A]" />
                        )}
                        <div>
                          <p className="text-[#00FF41] text-sm font-medium">
                            {browser} on {type}
                          </p>
                          <p className="text-[#1A6B35] text-xs">
                            {session.ip_address || 'Unknown IP'} •{' '}
                            {session.last_active
                              ? new Date(session.last_active).toLocaleDateString()
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-[#FF3333] hover:text-[#FF3333]"
                      >
                        Revoke
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <Separator className="bg-[#1A3A2A]" />

            <Button variant="destructive" onClick={handleRevokeAllSessions} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out All Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
