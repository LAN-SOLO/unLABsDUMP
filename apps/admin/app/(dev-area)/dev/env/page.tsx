'use client'

/**
 * Environment Viewer Page
 *
 * Display environment variables with values masked.
 * Never expose full secrets.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Eye,
  EyeOff,
  AlertTriangle,
  Server,
  Database,
  Wallet,
  Shield,
} from 'lucide-react'
import { useState } from 'react'

interface EnvVar {
  key: string
  value: string
  category: 'supabase' | 'solana' | 'platform' | 'security' | 'app'
  sensitive: boolean
}

// Mask a value, showing only first and last 4 characters
function maskValue(value: string): string {
  if (value.length <= 8) return '••••••••'
  return `${value.slice(0, 4)}${'•'.repeat(Math.min(20, value.length - 8))}${value.slice(-4)}`
}

// Get environment variables (client-side only sees NEXT_PUBLIC_*)
function getEnvVars(): EnvVar[] {
  const vars: EnvVar[] = []

  // Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    vars.push({
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      category: 'supabase',
      sensitive: false,
    })
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    vars.push({
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      category: 'supabase',
      sensitive: true,
    })
  }

  // Solana
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
    vars.push({
      key: 'NEXT_PUBLIC_SOLANA_RPC_URL',
      value: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
      category: 'solana',
      sensitive: true,
    })
  }
  if (process.env.NEXT_PUBLIC_SOLANA_NETWORK) {
    vars.push({
      key: 'NEXT_PUBLIC_SOLANA_NETWORK',
      value: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
      category: 'solana',
      sensitive: false,
    })
  }
  if (process.env.NEXT_PUBLIC_SOL_ADDRESS) {
    vars.push({
      key: 'NEXT_PUBLIC_SOL_ADDRESS',
      value: process.env.NEXT_PUBLIC_SOL_ADDRESS,
      category: 'solana',
      sensitive: false,
    })
  }
  if (process.env.NEXT_PUBLIC_UNSC_ADDRESS) {
    vars.push({
      key: 'NEXT_PUBLIC_UNSC_ADDRESS',
      value: process.env.NEXT_PUBLIC_UNSC_ADDRESS,
      category: 'solana',
      sensitive: false,
    })
  }

  // App
  if (process.env.NEXT_PUBLIC_APP_URL) {
    vars.push({
      key: 'NEXT_PUBLIC_APP_URL',
      value: process.env.NEXT_PUBLIC_APP_URL,
      category: 'app',
      sensitive: false,
    })
  }
  if (process.env.NEXT_PUBLIC_ADMIN_API_URL) {
    vars.push({
      key: 'NEXT_PUBLIC_ADMIN_API_URL',
      value: process.env.NEXT_PUBLIC_ADMIN_API_URL,
      category: 'app',
      sensitive: false,
    })
  }

  return vars
}

// Server-side only variables (shown as placeholders)
const SERVER_ONLY_VARS = [
  { key: 'SUPABASE_SERVICE_ROLE_KEY', category: 'supabase' as const },
  { key: 'DATABASE_URL', category: 'supabase' as const },
  { key: 'PLATFORM_WALLET_PRIVATE_KEY', category: 'platform' as const },
  { key: 'PLATFORM_WALLET_ADDRESS', category: 'platform' as const },
  { key: 'JWT_SECRET', category: 'security' as const },
  { key: 'DEV_AREA_MASTER_WALLET', category: 'security' as const },
  { key: 'DEV_AREA_PASSPHRASE_HASH', category: 'security' as const },
  { key: 'DEV_AREA_ENCRYPTION_KEY', category: 'security' as const },
  { key: 'DEV_AREA_SESSION_SECRET', category: 'security' as const },
]

const CATEGORY_ICONS = {
  supabase: Database,
  solana: Wallet,
  platform: Server,
  security: Shield,
  app: Settings,
}

const CATEGORY_COLORS = {
  supabase: 'text-green-500',
  solana: 'text-purple-500',
  platform: 'text-blue-500',
  security: 'text-red-500',
  app: 'text-yellow-500',
}

export default function EnvPage() {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const envVars = getEnvVars()

  const toggleShow = (key: string) => {
    setShowValues((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const groupedVars = envVars.reduce(
    (acc, v) => {
      if (!acc[v.category]) acc[v.category] = []
      acc[v.category].push(v)
      return acc
    },
    {} as Record<string, EnvVar[]>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Environment Variables</h1>
        <p className="text-zinc-400">View application configuration (values masked)</p>
      </div>

      {/* Security notice */}
      <Alert className="border-yellow-900/50 bg-yellow-950/20">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-200">
          Sensitive values are partially masked for security. Server-only variables are not
          accessible from the client.
        </AlertDescription>
      </Alert>

      {/* Client-accessible variables */}
      {Object.entries(groupedVars).map(([category, vars]) => {
        const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
        const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]

        return (
          <Card key={category} className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="capitalize">{category}</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">
                {category === 'supabase' && 'Supabase database configuration'}
                {category === 'solana' && 'Solana blockchain settings'}
                {category === 'platform' && 'Platform wallet configuration'}
                {category === 'security' && 'Security and authentication'}
                {category === 'app' && 'Application settings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vars.map((v) => (
                  <div
                    key={v.key}
                    className="flex items-center justify-between rounded border border-zinc-800 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <code className="text-sm text-white">{v.key}</code>
                      {v.sensitive && (
                        <Badge variant="outline" className="border-red-900 text-red-400">
                          Sensitive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="max-w-md truncate text-sm text-zinc-400">
                        {v.sensitive && !showValues[v.key] ? maskValue(v.value) : v.value}
                      </code>
                      {v.sensitive && (
                        <button
                          onClick={() => toggleShow(v.key)}
                          className="text-zinc-500 hover:text-white"
                        >
                          {showValues[v.key] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Server-only variables */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Shield className="h-5 w-5 text-red-500" />
            <span>Server-Only Variables</span>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            These variables are only available on the server and cannot be viewed from the client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SERVER_ONLY_VARS.map((v) => {
              const Icon = CATEGORY_ICONS[v.category]
              const color = CATEGORY_COLORS[v.category]

              return (
                <div
                  key={v.key}
                  className="flex items-center justify-between rounded border border-zinc-800 p-3"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <code className="text-sm text-white">{v.key}</code>
                  </div>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-500">
                    Server Only
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
