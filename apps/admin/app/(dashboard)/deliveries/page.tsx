'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Loader2,
  MoreHorizontal,
  Eye,
  Play,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface Delivery {
  id: string
  status: string
  delivery_type: string
  created_at: string
  completed_at: string | null
  error_message: string | null
  player: {
    id: string
    wallet_address: string
    username: string | null
  } | null
  nfts: Array<{
    nft: {
      id: string
      name: string
      image_url: string | null
    }
  }>
}

interface Stats {
  pending: number
  processing: number
  completed: number
  failed: number
  total: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: 'bg-yellow-500', icon: Clock },
  processing: { color: 'bg-blue-500', icon: RefreshCw },
  completed: { color: 'bg-green-500', icon: CheckCircle },
  failed: { color: 'bg-red-500', icon: XCircle },
}

export default function DeliveriesPage() {
  const router = useRouter()

  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const res = await fetch(`/api/deliveries?${params}`)
      const data = await res.json()

      if (res.ok) {
        setDeliveries(data.deliveries)
        setPagination(data.pagination)
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/deliveries/stats')
      const data = await res.json()
      if (res.ok) {
        setStats(data.stats)
      }
    } catch {
      // Handle error
    }
  }

  useEffect(() => {
    fetchDeliveries()
    fetchStats()
  }, [fetchDeliveries])

  const handleProcess = async (id: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/deliveries/${id}/process`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchDeliveries()
        fetchStats()
      }
    } catch {
      // Handle error
    } finally {
      setProcessingId(null)
    }
  }

  const handleRetry = async (id: string) => {
    // Reset status to pending first
    await fetch(`/api/deliveries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending', error_message: null }),
    })
    // Then process
    handleProcess(id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Deliveries</h1>
        <p className="text-slate-400 mt-1">Manage NFT deliveries to players</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Processing</p>
                  <p className="text-2xl font-bold text-white">{stats.processing}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Failed</p>
                  <p className="text-2xl font-bold text-white">{stats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                fetchDeliveries()
                fetchStats()
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">
            {pagination.total} Deliver{pagination.total !== 1 ? 'ies' : 'y'} found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-slate-600" />
              <p className="mt-4 text-slate-400">No deliveries found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Player</TableHead>
                    <TableHead className="text-slate-400">NFTs</TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Created</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => {
                    const StatusIcon = statusConfig[delivery.status]?.icon || AlertCircle
                    return (
                      <TableRow key={delivery.id} className="border-slate-800">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">
                              {delivery.player?.username || 'Unknown'}
                            </p>
                            <p className="text-sm text-slate-400 font-mono">
                              {delivery.player?.wallet_address?.slice(0, 8)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {delivery.nfts?.length || 0} NFT
                          {(delivery.nfts?.length || 0) !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {delivery.delivery_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusConfig[delivery.status]?.color || 'bg-slate-500'} text-white capitalize`}
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {delivery.status}
                          </Badge>
                          {delivery.error_message && (
                            <p className="text-xs text-red-400 mt-1 max-w-[150px] truncate">
                              {delivery.error_message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/deliveries/${delivery.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {delivery.status === 'pending' && (
                                <DropdownMenuItem
                                  onClick={() => handleProcess(delivery.id)}
                                  disabled={processingId === delivery.id}
                                >
                                  {processingId === delivery.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Play className="mr-2 h-4 w-4" />
                                  )}
                                  Process Now
                                </DropdownMenuItem>
                              )}
                              {delivery.status === 'failed' && (
                                <DropdownMenuItem onClick={() => handleRetry(delivery.id)}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Retry
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <p className="text-sm text-slate-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
