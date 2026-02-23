'use client'

/**
 * Dev Area Dashboard
 *
 * Main dashboard showing quick access to dev tools and system status.
 */

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SecurityStatus } from '@/components/dev/security-status'
import { generateFingerprint } from '@/components/dev/fingerprint'
import {
  Terminal,
  Network,
  Database,
  Settings,
  FileText,
  Shield,
  Activity,
  Server,
} from 'lucide-react'
import Link from 'next/link'

interface SessionData {
  wallet: string
  issuedAt: number
  expiresAt: number
}

export default function DevDashboardPage() {
  const [session, setSession] = useState<SessionData | null>(null)

  const fetchSession = useCallback(async () => {
    try {
      const fingerprint = await generateFingerprint()
      const response = await fetch('/api/dev/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint }),
      })
      const data = await response.json()
      if (data.authenticated) {
        setSession({
          wallet: data.wallet,
          issuedAt: data.issuedAt,
          expiresAt: data.expiresAt,
        })
      }
    } catch {
      // Ignore errors
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const tools = [
    {
      href: '/dev/network',
      icon: Network,
      title: 'Network Toggle',
      description: 'Switch between devnet and mainnet',
      color: 'text-blue-500',
    },
    {
      href: '/dev/database',
      icon: Database,
      title: 'Database Inspector',
      description: 'Browse tables and run queries',
      color: 'text-purple-500',
    },
    {
      href: '/dev/env',
      icon: Settings,
      title: 'Environment Viewer',
      description: 'View masked environment variables',
      color: 'text-yellow-500',
    },
    {
      href: '/dev/api-test',
      icon: Terminal,
      title: 'API Tester',
      description: 'Test API endpoints',
      color: 'text-green-500',
    },
    {
      href: '/dev/logs',
      icon: FileText,
      title: 'Access Logs',
      description: 'View security audit logs',
      color: 'text-red-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dev Dashboard</h1>
        <p className="text-zinc-400">Welcome to the development area</p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium text-zinc-400">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Security Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">Active</p>
            <p className="text-xs text-zinc-500">7-layer protection enabled</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium text-zinc-400">
              <Server className="h-4 w-4 text-blue-500" />
              <span>Environment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
            </p>
            <p className="text-xs text-zinc-500">
              {process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium text-zinc-400">
              <Activity className="h-4 w-4 text-yellow-500" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">Operational</p>
            <p className="text-xs text-zinc-500">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* Security status card */}
      {session && (
        <SecurityStatus
          wallet={session.wallet}
          issuedAt={session.issuedAt}
          ipBound={true}
          fingerprintBound={true}
        />
      )}

      {/* Tools grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Dev Tools</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700 hover:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${tool.color}`} />
                      <span className="text-white">{tool.title}</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-400">{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Warning notice */}
      <div className="rounded-lg border border-yellow-900/50 bg-yellow-950/20 p-4">
        <p className="text-sm text-yellow-500">
          <strong>Warning:</strong> This area contains sensitive development tools. All actions are
          logged and monitored. Use responsibly.
        </p>
      </div>
    </div>
  )
}
