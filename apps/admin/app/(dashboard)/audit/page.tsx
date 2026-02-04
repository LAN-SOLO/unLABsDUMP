'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react'

interface AuditLog {
  id: string
  admin_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin: {
    id: string
    email: string | null
    wallet_address: string | null
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const actionColors: Record<string, string> = {
  created: 'bg-green-500',
  updated: 'bg-blue-500',
  deleted: 'bg-red-500',
  processed: 'bg-purple-500',
  failed: 'bg-red-600',
  exported: 'bg-cyan-500',
  imported: 'bg-yellow-500',
}

const getActionColor = (action: string) => {
  for (const [key, color] of Object.entries(actionColors)) {
    if (action.includes(key)) return color
  }
  return 'bg-slate-500'
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [actions, setActions] = useState<string[]>([])
  const [entityTypes, setEntityTypes] = useState<string[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [actionFilter, setActionFilter] = useState('all')
  const [entityTypeFilter, setEntityTypeFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Selected log for details view
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      if (actionFilter && actionFilter !== 'all') {
        params.set('action', actionFilter)
      }
      if (entityTypeFilter && entityTypeFilter !== 'all') {
        params.set('entity_type', entityTypeFilter)
      }
      if (startDate) {
        params.set('start_date', new Date(startDate).toISOString())
      }
      if (endDate) {
        params.set('end_date', new Date(endDate).toISOString())
      }

      const res = await fetch(`/api/audit?${params}`)
      const data = await res.json()

      if (res.ok) {
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, actionFilter, entityTypeFilter, startDate, endDate])

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch('/api/audit/actions')
      const data = await res.json()
      if (res.ok) {
        setActions(data.actions || [])
        setEntityTypes(data.entityTypes || [])
      }
    } catch {
      // Handle error
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (actionFilter && actionFilter !== 'all') {
      params.set('action', actionFilter)
    }
    if (entityTypeFilter && entityTypeFilter !== 'all') {
      params.set('entity_type', entityTypeFilter)
    }
    if (startDate) {
      params.set('start_date', new Date(startDate).toISOString())
    }
    if (endDate) {
      params.set('end_date', new Date(endDate).toISOString())
    }

    // Create downloadable JSON
    const dataStr = JSON.stringify(logs, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400 mt-1">Track all admin actions in the system</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => fetchLogs()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {formatAction(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px] bg-slate-800 border-slate-700"
                placeholder="Start Date"
              />
              <span className="text-slate-400">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px] bg-slate-800 border-slate-700"
                placeholder="End Date"
              />
            </div>

            {(actionFilter !== 'all' || entityTypeFilter !== 'all' || startDate || endDate) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setActionFilter('all')
                  setEntityTypeFilter('all')
                  setStartDate('')
                  setEndDate('')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">
            {pagination.total} Log Entr{pagination.total !== 1 ? 'ies' : 'y'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-slate-600" />
              <p className="mt-4 text-slate-400">No audit logs found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Timestamp</TableHead>
                    <TableHead className="text-slate-400">Admin</TableHead>
                    <TableHead className="text-slate-400">Action</TableHead>
                    <TableHead className="text-slate-400">Entity</TableHead>
                    <TableHead className="text-slate-400 text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-slate-800">
                      <TableCell className="text-slate-300 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white text-sm">
                            {log.admin?.email ||
                              log.admin?.wallet_address?.slice(0, 8) + '...' ||
                              'System'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} text-white`}>
                          {formatAction(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-slate-300 capitalize">{log.entity_type || '-'}</p>
                          {log.entity_id && (
                            <p className="text-slate-500 font-mono text-xs">
                              {log.entity_id.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white">Audit Log Details</DialogTitle>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-400">Timestamp</p>
                                    <p className="text-white">
                                      {new Date(selectedLog.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-400">Action</p>
                                    <Badge
                                      className={`${getActionColor(selectedLog.action)} text-white mt-1`}
                                    >
                                      {formatAction(selectedLog.action)}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-400">Admin</p>
                                    <p className="text-white">
                                      {selectedLog.admin?.email ||
                                        selectedLog.admin?.wallet_address ||
                                        'System'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-400">Entity</p>
                                    <p className="text-white capitalize">
                                      {selectedLog.entity_type || '-'}
                                    </p>
                                  </div>
                                  {selectedLog.entity_id && (
                                    <div className="col-span-2">
                                      <p className="text-sm text-slate-400">Entity ID</p>
                                      <p className="text-white font-mono text-sm">
                                        {selectedLog.entity_id}
                                      </p>
                                    </div>
                                  )}
                                  {selectedLog.ip_address && (
                                    <div>
                                      <p className="text-sm text-slate-400">IP Address</p>
                                      <p className="text-white">{selectedLog.ip_address}</p>
                                    </div>
                                  )}
                                </div>
                                {selectedLog.details &&
                                  Object.keys(selectedLog.details).length > 0 && (
                                    <div>
                                      <p className="text-sm text-slate-400 mb-2">Details</p>
                                      <pre className="text-sm text-slate-300 bg-slate-800 p-4 rounded-lg overflow-auto max-h-60">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
