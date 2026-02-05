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
  GET: 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/30',
  POST: 'bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30',
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
    <Card className={cn('border-[#0D3B1E] bg-[#0D1117] p-6', className)}>
      <h3 className="text-lg font-semibold text-[#00FF41] mb-4">API Tester</h3>

      <div className="space-y-4">
        {/* API Key */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#00AA2A] flex items-center gap-1.5">
            <Key className="size-3" />
            API Key
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="X-API-Key header value..."
            className="bg-[#111318] border-[#1A3A2A] text-[#00FF41] placeholder:text-[#1A6B35] font-mono text-xs focus-visible:border-[#00FF41]"
          />
        </div>

        {/* Endpoint selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#00AA2A]">Endpoint</label>
          <select
            value={selectedEndpoint}
            onChange={(e) => {
              setSelectedEndpoint(e.target.value)
              setParamValues({})
              setResponse(null)
              setStatusCode(null)
            }}
            className="w-full rounded-md border border-[#1A3A2A] bg-[#111318] px-3 py-2 text-sm text-[#00FF41] focus:border-[#00FF41] focus:outline-none focus:ring-[3px] focus:ring-[#00FF41]/20"
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
            <code className="text-xs text-[#00CC33]">{endpoint.path}</code>
          </div>
        </div>

        {/* Parameters */}
        {endpoint.params.map((param) => (
          <div key={param.key} className="space-y-2">
            <label className="text-xs font-medium text-[#00AA2A]">{param.label}</label>
            <Input
              value={paramValues[param.key] || ''}
              onChange={(e) => handleParamChange(param.key, e.target.value)}
              placeholder={param.placeholder}
              className="bg-[#111318] border-[#1A3A2A] text-[#00FF41] placeholder:text-[#1A6B35] font-mono text-xs focus-visible:border-[#00FF41]"
            />
          </div>
        ))}

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-[#00FF41] text-black hover:bg-[#00CC33]"
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
                <span className="text-xs font-medium text-[#00AA2A]">Response</span>
                {statusCode !== null && (
                  <Badge
                    className={cn(
                      'text-[10px] px-1.5 py-0',
                      statusCode >= 200 && statusCode < 300
                        ? 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/30'
                        : statusCode >= 400
                          ? 'bg-[#FF3333]/20 text-[#FF3333] border-[#FF3333]/30'
                          : 'bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30'
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
                  copied
                    ? 'text-[#00FF41]'
                    : 'text-[#00AA2A] hover:bg-[#111318] hover:text-[#00FF41]'
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
            <div className="overflow-x-auto rounded-sm border border-[#1A3A2A] bg-black p-4">
              <pre className="text-sm leading-relaxed">
                <code className="font-mono text-[#00FF41] whitespace-pre-wrap break-all">
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
