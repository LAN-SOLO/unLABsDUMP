'use client'

import { useState, useCallback } from 'react'
import { Play, Loader2, Copy, Check, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const ENDPOINTS = [
  {
    id: 'get-player-nfts',
    method: 'GET' as const,
    label: 'Get Player NFTs',
    path: '/api/game/nfts/{wallet}',
    params: [{ key: 'wallet', label: 'Wallet Address', placeholder: 'Solana wallet address...' }],
  },
  {
    id: 'get-nft-details',
    method: 'GET' as const,
    label: 'Get NFT Details',
    path: '/api/game/nft/{id}',
    params: [{ key: 'id', label: 'NFT ID', placeholder: 'NFT ID...' }],
  },
  {
    id: 'verify-ownership',
    method: 'POST' as const,
    label: 'Verify NFT Ownership',
    path: '/api/game/verify-ownership',
    params: [
      { key: 'wallet', label: 'Wallet Address', placeholder: 'Solana wallet address...' },
      { key: 'nft_id', label: 'NFT ID', placeholder: 'NFT ID...' },
    ],
  },
  {
    id: 'sse-events',
    method: 'GET' as const,
    label: 'SSE Game Events',
    path: '/api/game/ws',
    params: [{ key: 'wallet', label: 'Wallet Address', placeholder: 'Solana wallet address...' }],
  },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-600/20 text-green-400 border-green-600/30',
  POST: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
}

interface TryItProps {
  className?: string
}

export function TryIt({ className }: TryItProps) {
  const [apiKey, setApiKey] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0].id)
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [response, setResponse] = useState<string | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const endpoint = ENDPOINTS.find((e) => e.id === selectedEndpoint) || ENDPOINTS[0]

  const handleParamChange = useCallback((key: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const buildUrl = useCallback(() => {
    let url = endpoint.path
    for (const param of endpoint.params) {
      const value = paramValues[param.key] || ''
      if (url.includes(`{${param.key}}`)) {
        url = url.replace(`{${param.key}}`, encodeURIComponent(value))
      }
    }
    // For GET requests with query params (like SSE wallet)
    if (endpoint.method === 'GET' && !endpoint.path.includes(`{${endpoint.params[0]?.key}}`)) {
      const queryParams = endpoint.params
        .filter((p) => !endpoint.path.includes(`{${p.key}}`))
        .map((p) => `${p.key}=${encodeURIComponent(paramValues[p.key] || '')}`)
        .join('&')
      if (queryParams) url += `?${queryParams}`
    }
    return url
  }, [endpoint, paramValues])

  const handleSend = useCallback(async () => {
    setLoading(true)
    setResponse(null)
    setStatusCode(null)

    try {
      const url = buildUrl()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (apiKey.trim()) {
        headers['X-API-Key'] = apiKey.trim()
      }

      const fetchOptions: RequestInit = {
        method: endpoint.method,
        headers,
      }

      // POST body
      if (endpoint.method === 'POST') {
        const body: Record<string, string> = {}
        for (const param of endpoint.params) {
          body[param.key] = paramValues[param.key] || ''
        }
        fetchOptions.body = JSON.stringify(body)
      }

      const res = await fetch(url, fetchOptions)
      setStatusCode(res.status)

      const text = await res.text()
      try {
        const json = JSON.parse(text)
        setResponse(JSON.stringify(json, null, 2))
      } catch {
        setResponse(text)
      }
    } catch (err) {
      setResponse(
        JSON.stringify({ error: err instanceof Error ? err.message : 'Request failed' }, null, 2)
      )
      setStatusCode(0)
    } finally {
      setLoading(false)
    }
  }, [apiKey, buildUrl, endpoint, paramValues])

  const handleCopyResponse = useCallback(async () => {
    if (!response) return
    try {
      await navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }, [response])

  return (
    <Card className={cn('border-slate-800 bg-slate-900 p-6', className)}>
      <h3 className="text-lg font-semibold text-white mb-4">API Tester</h3>

      <div className="space-y-4">
        {/* API Key */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Key className="size-3" />
            API Key
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="X-API-Key header value..."
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs focus-visible:border-purple-500"
          />
        </div>

        {/* Endpoint selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Endpoint</label>
          <select
            value={selectedEndpoint}
            onChange={(e) => {
              setSelectedEndpoint(e.target.value)
              setParamValues({})
              setResponse(null)
              setStatusCode(null)
            }}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-[3px] focus:ring-purple-500/20"
          >
            {ENDPOINTS.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.method} {ep.path} - {ep.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 mt-1">
            <Badge
              className={cn(
                'rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider',
                METHOD_COLORS[endpoint.method]
              )}
            >
              {endpoint.method}
            </Badge>
            <code className="text-xs text-slate-300">{endpoint.path}</code>
          </div>
        </div>

        {/* Parameters */}
        {endpoint.params.map((param) => (
          <div key={param.key} className="space-y-2">
            <label className="text-xs font-medium text-slate-400">{param.label}</label>
            <Input
              value={paramValues[param.key] || ''}
              onChange={(e) => handleParamChange(param.key, e.target.value)}
              placeholder={param.placeholder}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs focus-visible:border-purple-500"
            />
          </div>
        ))}

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Play className="size-4 mr-2" />
              Send Request
            </>
          )}
        </Button>

        {/* Response display */}
        {response !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Response</span>
                {statusCode !== null && (
                  <Badge
                    className={cn(
                      'text-[10px] px-1.5 py-0',
                      statusCode >= 200 && statusCode < 300
                        ? 'bg-green-600/20 text-green-400 border-green-600/30'
                        : statusCode >= 400
                          ? 'bg-red-600/20 text-red-400 border-red-600/30'
                          : 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
                    )}
                  >
                    {statusCode === 0 ? 'Network Error' : statusCode}
                  </Badge>
                )}
              </div>
              <button
                onClick={handleCopyResponse}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
                  copied ? 'text-green-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                {copied ? (
                  <>
                    <Check className="size-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-4">
              <pre className="text-sm leading-relaxed">
                <code className="font-mono text-slate-200 whitespace-pre-wrap break-all">
                  {response}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
