'use client'

/**
 * API Tester Page
 *
 * Test API endpoints with custom requests.
 */

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Terminal, Play, Clock, Loader2, Copy, Check } from 'lucide-react'

interface RequestResult {
  status: number
  statusText: string
  headers: Record<string, string>
  body: unknown
  timing: number
}

const COMMON_ENDPOINTS = [
  { method: 'GET', path: '/api/dev/session', description: 'Check dev session' },
  { method: 'GET', path: '/api/dev/logs', description: 'Fetch access logs' },
  { method: 'GET', path: '/api/health', description: 'Health check' },
]

export default function ApiTestPage() {
  const [method, setMethod] = useState<string>('GET')
  const [path, setPath] = useState<string>('/api/dev/session')
  const [body, setBody] = useState<string>('')
  const [result, setResult] = useState<RequestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const executeRequest = useCallback(async () => {
    setIsLoading(true)
    setResult(null)

    const startTime = performance.now()

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (method !== 'GET' && body.trim()) {
        try {
          JSON.parse(body) // Validate JSON
          options.body = body
        } catch {
          setResult({
            status: 0,
            statusText: 'Invalid JSON',
            headers: {},
            body: { error: 'Request body is not valid JSON' },
            timing: 0,
          })
          setIsLoading(false)
          return
        }
      }

      const response = await fetch(path, options)
      const timing = performance.now() - startTime

      // Get response headers
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      // Get response body
      let responseBody: unknown
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        responseBody = await response.json()
      } else {
        responseBody = await response.text()
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        headers,
        body: responseBody,
        timing: Math.round(timing),
      })
    } catch (err) {
      setResult({
        status: 0,
        statusText: 'Request Failed',
        headers: {},
        body: { error: err instanceof Error ? err.message : 'Unknown error' },
        timing: performance.now() - startTime,
      })
    } finally {
      setIsLoading(false)
    }
  }, [method, path, body])

  const copyResult = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result.body, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [result])

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500'
    if (status >= 300 && status < 400) return 'text-yellow-500'
    if (status >= 400 && status < 500) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">API Tester</h1>
        <p className="text-zinc-400">Test API endpoints with custom requests</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request panel */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Terminal className="h-5 w-5 text-green-500" />
              <span>Request</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick endpoints */}
            <div>
              <Label className="text-zinc-400">Quick Select</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMON_ENDPOINTS.map((endpoint) => (
                  <Button
                    key={`${endpoint.method}-${endpoint.path}`}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMethod(endpoint.method)
                      setPath(endpoint.path)
                    }}
                    className="border-zinc-700 text-xs text-zinc-400 hover:bg-zinc-800"
                  >
                    <Badge
                      variant="outline"
                      className={`mr-1 ${
                        endpoint.method === 'GET'
                          ? 'border-green-500 text-green-500'
                          : 'border-blue-500 text-blue-500'
                      }`}
                    >
                      {endpoint.method}
                    </Badge>
                    {endpoint.description}
                  </Button>
                ))}
              </div>
            </div>

            {/* Method and path */}
            <div className="flex space-x-2">
              <div className="w-28">
                <Label className="text-zinc-400">Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="mt-1 border-zinc-800 bg-zinc-950 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-950">
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                      <SelectItem key={m} value={m} className="text-white hover:bg-zinc-800">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-zinc-400">Path</Label>
                <Input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/api/endpoint"
                  className="mt-1 border-zinc-800 bg-zinc-950 text-white"
                />
              </div>
            </div>

            {/* Request body */}
            {method !== 'GET' && (
              <div>
                <Label className="text-zinc-400">Request Body (JSON)</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="mt-1 h-32 border-zinc-800 bg-zinc-950 font-mono text-sm text-white"
                />
              </div>
            )}

            {/* Execute button */}
            <Button
              onClick={executeRequest}
              disabled={isLoading || !path.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Response panel */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>Response</span>
              {result && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-sm text-zinc-400">
                    <Clock className="h-4 w-4" />
                    <span>{result.timing}ms</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(result.status)} border-current`}
                  >
                    {result.status} {result.statusText}
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex h-64 items-center justify-center text-zinc-500">
                Send a request to see the response
              </div>
            ) : (
              <div className="space-y-4">
                {/* Headers */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-zinc-400">Headers</Label>
                  </div>
                  <div className="max-h-32 overflow-auto rounded border border-zinc-800 bg-zinc-950 p-2">
                    {Object.entries(result.headers).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-zinc-500">{key}:</span>{' '}
                        <span className="text-zinc-300">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-zinc-400">Body</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyResult}
                      className="h-7 text-zinc-400 hover:text-white"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="max-h-64 overflow-auto rounded border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
                    {typeof result.body === 'object'
                      ? JSON.stringify(result.body, null, 2)
                      : String(result.body)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
