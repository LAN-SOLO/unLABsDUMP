'use client'

/**
 * Network Toggle Page
 *
 * Switch between devnet and mainnet RPC endpoints.
 * Display current network status and test connectivity.
 */

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Network, RefreshCw, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'

interface NetworkStatus {
  connected: boolean
  latency?: number
  blockHeight?: number
  error?: string
}

export default function NetworkPage() {
  const [currentNetwork] = useState<string>(
    process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta'
  )
  const [rpcUrl] = useState<string>(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '')
  const [status, setStatus] = useState<NetworkStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = useCallback(async () => {
    setIsChecking(true)
    const startTime = Date.now()

    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBlockHeight',
        }),
      })

      const latency = Date.now() - startTime
      const data = await response.json()

      if (data.result) {
        setStatus({
          connected: true,
          latency,
          blockHeight: data.result,
        })
      } else {
        setStatus({
          connected: false,
          error: data.error?.message || 'Unknown error',
        })
      }
    } catch (err) {
      setStatus({
        connected: false,
        error: err instanceof Error ? err.message : 'Connection failed',
      })
    } finally {
      setIsChecking(false)
    }
  }, [rpcUrl])

  useEffect(() => {
    if (rpcUrl) {
      checkConnection()
    }
  }, [rpcUrl, checkConnection])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Network Configuration</h1>
        <p className="text-zinc-400">Manage Solana network connection</p>
      </div>

      {/* Current network status */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Network className="h-5 w-5 text-blue-500" />
            <span>Current Network</span>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Active Solana network configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Network</span>
            <Badge
              variant="outline"
              className={
                currentNetwork === 'mainnet-beta'
                  ? 'border-green-500 text-green-500'
                  : 'border-yellow-500 text-yellow-500'
              }
            >
              {currentNetwork}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">RPC URL</span>
            <code className="max-w-xs truncate rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
              {rpcUrl ? `${rpcUrl.slice(0, 30)}...` : 'Not configured'}
            </code>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Connection Status</span>
            {isChecking ? (
              <div className="flex items-center space-x-2 text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking...</span>
              </div>
            ) : status?.connected ? (
              <div className="flex items-center space-x-2 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <span>Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-500">
                <XCircle className="h-4 w-4" />
                <span>Disconnected</span>
              </div>
            )}
          </div>

          {status?.connected && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Latency</span>
                <span className="text-white">{status.latency}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Block Height</span>
                <span className="font-mono text-white">{status.blockHeight?.toLocaleString()}</span>
              </div>
            </>
          )}

          {status?.error && (
            <Alert variant="destructive" className="border-red-900 bg-red-950/50">
              <AlertDescription>{status.error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={checkConnection}
            disabled={isChecking}
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
        </CardContent>
      </Card>

      {/* Network switch notice */}
      <Alert className="border-yellow-900/50 bg-yellow-950/20">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-200">
          Network switching is controlled by environment variables. To change networks:
          <ol className="mt-2 list-inside list-decimal text-sm text-yellow-300">
            <li>
              Update <code className="rounded bg-zinc-800 px-1">NEXT_PUBLIC_SOLANA_NETWORK</code> in{' '}
              <code className="rounded bg-zinc-800 px-1">.env.local</code>
            </li>
            <li>
              Update <code className="rounded bg-zinc-800 px-1">NEXT_PUBLIC_SOLANA_RPC_URL</code>{' '}
              with the appropriate RPC endpoint
            </li>
            <li>Restart the development server</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Network endpoints reference */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Common RPC Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="rounded border border-zinc-800 p-3">
              <p className="text-sm font-medium text-white">Mainnet-Beta</p>
              <code className="text-xs text-zinc-400">https://api.mainnet-beta.solana.com</code>
            </div>
            <div className="rounded border border-zinc-800 p-3">
              <p className="text-sm font-medium text-white">Devnet</p>
              <code className="text-xs text-zinc-400">https://api.devnet.solana.com</code>
            </div>
            <div className="rounded border border-zinc-800 p-3">
              <p className="text-sm font-medium text-white">Helius (Recommended)</p>
              <code className="text-xs text-zinc-400">
                https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
