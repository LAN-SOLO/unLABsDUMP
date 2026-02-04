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
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'

interface Burn {
  id: string
  player_id: string
  amount: number
  token_type: string
  status: string
  reason: string | null
  transaction_signature: string | null
  created_at: string
  player: {
    id: string
    wallet_address: string
    username: string | null
  } | null
}

interface Stats {
  totalBurned: number
  thisMonthBurned: number
  completedBurns: number
  pendingBurns: number
  totalEvents: number
  uniqueBurners: number
  last7Days: Array<{ date: string; amount: number }>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function BurnsPage() {
  const router = useRouter()

  const [burns, setBurns] = useState<Burn[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchBurns = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      const res = await fetch(`/api/burns?${params}`)
      const data = await res.json()

      if (res.ok) {
        setBurns(data.burns)
        setPagination(data.pagination)
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/burns/stats')
      const data = await res.json()
      if (res.ok) {
        setStats(data)
      }
    } catch {
      // Handle error
    }
  }

  useEffect(() => {
    fetchBurns()
    fetchStats()
  }, [fetchBurns])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Burns</h1>
          <p className="text-slate-400 mt-1">Track _unSC token burn events</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            fetchBurns()
            fetchStats()
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-purple-600/30 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Burned</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(stats.totalBurned)}{' '}
                    <span className="text-purple-400 text-lg">_unSC</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-cyan-600/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">This Month</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(stats.thisMonthBurned)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Burn Events</p>
                  <p className="text-2xl font-bold text-white">{stats.completedBurns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Unique Burners</p>
                  <p className="text-2xl font-bold text-white">{stats.uniqueBurners}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 7-Day Chart */}
      {stats && stats.last7Days && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {stats.last7Days.map((day, _i) => {
                const maxAmount = Math.max(...stats.last7Days.map((d) => d.amount), 1)
                const height = (day.amount / maxAmount) * 100
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-purple-600 rounded-t transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs text-slate-400">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">
            {pagination.total} Burn Event{pagination.total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : burns.length === 0 ? (
            <div className="text-center py-12">
              <Flame className="mx-auto h-12 w-12 text-slate-600" />
              <p className="mt-4 text-slate-400">No burn events found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Player</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Reason</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {burns.map((burn) => (
                    <TableRow key={burn.id} className="border-slate-800">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">
                            {burn.player?.username || 'Unknown'}
                          </p>
                          <p className="text-sm text-slate-400 font-mono">
                            {burn.player?.wallet_address?.slice(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-purple-400" />
                          <span className="text-white font-medium">
                            {formatNumber(burn.amount)} {burn.token_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 max-w-[200px] truncate">
                        {burn.reason || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            burn.status === 'completed'
                              ? 'bg-green-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }
                        >
                          {burn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(burn.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/burns/${burn.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {burn.transaction_signature && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`https://explorer.solana.com/tx/${burn.transaction_signature}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View on Explorer
                                </a>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
