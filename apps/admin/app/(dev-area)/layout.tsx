'use client'

/**
 * Dev Area Layout
 *
 * Wraps all dev area pages with:
 * - Wallet provider for authentication
 * - Session validation
 * - Dev area UI shell
 */

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { WalletProvider } from '@/components/providers/wallet-provider'
import { SessionTimer } from '@/components/dev/session-timer'
import { Button } from '@/components/ui/button'
import {
  Shield,
  LogOut,
  Terminal,
  Network,
  Database,
  Settings,
  FileText,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface SessionInfo {
  authenticated: boolean
  wallet?: string
  issuedAt?: number
  expiresAt?: number
  timeRemaining?: number
}

export default function DevAreaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Auth page - just render with wallet provider, no session check
  const isAuthPage = pathname === '/dev/auth'

  // Check session status (only for non-auth pages)
  const checkSession = useCallback(async () => {
    if (isAuthPage) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/dev/session', {
        method: 'GET',
      })

      const data = await response.json()
      setSession(data)

      // Redirect to auth if not authenticated
      if (!data.authenticated) {
        router.push('/dev/auth')
      }
    } catch {
      setSession({ authenticated: false })
      router.push('/dev/auth')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthPage, router])

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/dev/logout', { method: 'POST' })
    } finally {
      setSession({ authenticated: false })
      router.push('/dev/auth')
    }
  }, [router])

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Auth page - simple wrapper
  if (isAuthPage) {
    return <WalletProvider>{children}</WalletProvider>
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-zinc-400">Validating session...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session?.authenticated) {
    return null // Will redirect in useEffect
  }

  // Navigation items
  const navItems = [
    { href: '/dev', icon: Terminal, label: 'Dashboard' },
    { href: '/dev/network', icon: Network, label: 'Network' },
    { href: '/dev/database', icon: Database, label: 'Database' },
    { href: '/dev/env', icon: Settings, label: 'Environment' },
    { href: '/dev/api-test', icon: Terminal, label: 'API Test' },
    { href: '/dev/logs', icon: FileText, label: 'Access Logs' },
  ]

  return (
    <WalletProvider>
      <div className="flex min-h-screen bg-black">
        {/* Sidebar */}
        <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-950">
          {/* Header */}
          <div className="flex items-center space-x-2 border-b border-zinc-800 p-4">
            <Shield className="h-6 w-6 text-green-500" />
            <span className="font-semibold text-white">Dev Area</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-green-500/10 text-green-500'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Session info */}
          <div className="border-t border-zinc-800 p-4">
            {session.expiresAt && <SessionTimer expiresAt={session.expiresAt} />}
            <div className="mt-3">
              <p className="text-xs text-zinc-500">Logged in as</p>
              <p className="font-mono text-xs text-zinc-300">
                {session.wallet?.slice(0, 4)}...{session.wallet?.slice(-4)}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </WalletProvider>
  )
}
