'use client'

/**
 * Access Logs Page
 *
 * View security audit logs with filtering.
 */

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, RefreshCw, Filter, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { generateFingerprint } from '@/components/dev/fingerprint'

interface LogEntry {
  id: string
  eventType: string
  walletAddress: string | null
  ipAddress: string
  userAgent: string | null
  fingerprintHash: string | null
  success: boolean
  failureReason: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

interface LogsResponse {
  logs: LogEntry[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

const EVENT_TYPES = [
  'challenge_issued',
  'signature_verified',
  'passphrase_verified',
  'session_created',
  'access_denied',
  'session_expired',
  'session_validated',
  'logout',
  'lockout_triggered',
]

const EVENT_COLORS: Record<string, string> = {
  challenge_issued: 'bg-blue-500/20 text-blue-400',
  signature_verified: 'bg-green-500/20 text-green-400',
  passphrase_verified: 'bg-green-500/20 text-green-400',
  session_created: 'bg-green-500/20 text-green-400',
  access_denied: 'bg-red-500/20 text-red-400',
  session_expired: 'bg-yellow-500/20 text-yellow-400',
  session_validated: 'bg-zinc-500/20 text-zinc-400',
  logout: 'bg-zinc-500/20 text-zinc-400',
  lockout_triggered: 'bg-red-500/20 text-red-400',
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('')
  const [successFilter, setSuccessFilter] = useState<string>('')
  const [walletFilter, setWalletFilter] = useState<string>('')

  const limit = 50

  const fetchLogs = useCallback(
    async (newOffset: number = 0) => {
      setIsLoading(true)

      try {
        const fingerprint = await generateFingerprint()

        const response = await fetch('/api/dev/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fingerprint,
            filters: {
              limit,
              offset: newOffset,
              eventType: eventTypeFilter || undefined,
              success:
                successFilter === 'true' ? true : successFilter === 'false' ? false : undefined,
              walletAddress: walletFilter || undefined,
            },
          }),
        })

        if (response.ok) {
          const data: LogsResponse = await response.json()
          setLogs(data.logs)
          setTotal(data.total)
          setHasMore(data.hasMore)
          setOffset(newOffset)
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false)
      }
    },
    [eventTypeFilter, successFilter, walletFilter, limit]
  )

  // Initial load
  useEffect(() => {
    fetchLogs(0)
  }, [fetchLogs])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatWallet = (wallet: string | null) => {
    if (!wallet) return '-'
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Access Logs</h1>
          <p className="text-zinc-400">Security audit trail for dev area access</p>
        </div>
        <Button
          onClick={() => fetchLogs(0)}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-sm text-white">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="border-zinc-800 bg-zinc-950 text-white">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="" className="text-white">
                    All Events
                  </SelectItem>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-white">
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-32">
              <Select value={successFilter} onValueChange={setSuccessFilter}>
                <SelectTrigger className="border-zinc-800 bg-zinc-950 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  <SelectItem value="" className="text-white">
                    All
                  </SelectItem>
                  <SelectItem value="true" className="text-white">
                    Success
                  </SelectItem>
                  <SelectItem value="false" className="text-white">
                    Failed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Input
                value={walletFilter}
                onChange={(e) => setWalletFilter(e.target.value)}
                placeholder="Wallet address..."
                className="border-zinc-800 bg-zinc-950 text-white"
              />
            </div>

            <Button onClick={() => fetchLogs(0)} className="bg-green-600 hover:bg-green-700">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs table */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <FileText className="h-5 w-5 text-red-500" />
            <span>Logs</span>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Showing {logs.length} of {total} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">No logs found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">Time</TableHead>
                      <TableHead className="text-zinc-400">Event</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Wallet</TableHead>
                      <TableHead className="text-zinc-400">IP</TableHead>
                      <TableHead className="text-zinc-400">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-zinc-800">
                        <TableCell className="text-xs text-zinc-300">
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border-none ${EVENT_COLORS[log.eventType] || 'bg-zinc-500/20 text-zinc-400'}`}
                          >
                            {log.eventType.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-300">
                          {formatWallet(log.walletAddress)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-300">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-zinc-500">
                          {log.failureReason || (log.metadata ? JSON.stringify(log.metadata) : '-')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-zinc-400">
                  Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => fetchLogs(offset - limit)}
                    disabled={offset === 0}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => fetchLogs(offset + limit)}
                    disabled={!hasMore}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
