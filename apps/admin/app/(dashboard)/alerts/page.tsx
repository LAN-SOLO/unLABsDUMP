'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  User,
  Globe,
  Key,
  Flame,
  Database,
} from 'lucide-react'

interface SecurityAlert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  admin_email?: string
  ip_address?: string
  created_at: string
  acknowledged: boolean
}

interface AlertSummary {
  total: number
  critical: number
  warning: number
  info: number
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    bg: 'bg-red-900/30 border-red-800',
    badge: 'bg-red-500',
    text: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-900/20 border-yellow-800/50',
    badge: 'bg-yellow-500',
    text: 'text-yellow-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-900/20 border-blue-800/50',
    badge: 'bg-blue-500',
    text: 'text-blue-400',
  },
}

const typeIcons: Record<string, typeof Shield> = {
  failed_logins: Key,
  new_ip_login: Globe,
  bulk_operation: Database,
  large_burn: Flame,
  '2fa_disabled': Shield,
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [summary, setSummary] = useState<AlertSummary>({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all')

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/alerts')
      const data = await res.json()
      if (res.ok) {
        setAlerts(data.alerts)
        setSummary(data.summary)
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Alerts</h1>
          <p className="text-slate-400 mt-1">Monitor security events and threats</p>
        </div>
        <Button variant="outline" onClick={fetchAlerts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-red-900/20 border-red-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-slate-300">Critical</span>
              </div>
              <span className="text-2xl font-bold text-red-400">{summary.critical}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-900/20 border-yellow-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-slate-300">Warning</span>
              </div>
              <span className="text-2xl font-bold text-yellow-400">{summary.warning}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                <span className="text-slate-300">Info</span>
              </div>
              <span className="text-2xl font-bold text-blue-400">{summary.info}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <Badge className="ml-2 bg-slate-700 text-white text-xs">
                {f === 'critical'
                  ? summary.critical
                  : f === 'warning'
                    ? summary.warning
                    : summary.info}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-slate-400">No security alerts. All clear.</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const config = severityConfig[alert.severity]
            const TypeIcon = typeIcons[alert.type] || Shield

            return (
              <Card key={alert.id} className={`border ${config.bg}`}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <TypeIcon className={`h-5 w-5 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{alert.title}</h3>
                        <Badge className={`${config.badge} text-white text-xs`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                        {alert.admin_email && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {alert.admin_email}
                          </span>
                        )}
                        {alert.ip_address && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {alert.ip_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
