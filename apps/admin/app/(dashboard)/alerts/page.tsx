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
    bg: 'bg-[#FF3333]/10 border-[#FF3333]/50',
    badge: 'bg-[#FF3333]',
    text: 'text-[#FF3333]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[#FFB000]/10 border-[#FFB000]/30',
    badge: 'bg-[#FFB000]',
    text: 'text-[#FFB000]',
  },
  info: {
    icon: Info,
    bg: 'bg-[#00FFFF]/10 border-[#00FFFF]/30',
    badge: 'bg-[#00FFFF]',
    text: 'text-[#00FFFF]',
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
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00FF41]">Security Alerts</h1>
          <p className="text-[#00AA2A] mt-1">Monitor security events and threats</p>
        </div>
        <Button variant="outline" onClick={fetchAlerts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-[#FF3333]/10 border-[#FF3333]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#FF3333]" />
                <span className="text-[#00CC33]">Critical</span>
              </div>
              <span className="text-2xl font-bold text-[#FF3333]">{summary.critical}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#FFB000]/10 border-[#FFB000]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#FFB000]" />
                <span className="text-[#00CC33]">Warning</span>
              </div>
              <span className="text-2xl font-bold text-[#FFB000]">{summary.warning}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#00FFFF]/10 border-[#00FFFF]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-[#00FFFF]" />
                <span className="text-[#00CC33]">Info</span>
              </div>
              <span className="text-2xl font-bold text-[#00FFFF]">{summary.info}</span>
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
            className={filter === f ? 'bg-[#00FF41] text-black hover:bg-[#00CC33]' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <Badge className="ml-2 bg-[#1A3A2A] text-[#00FF41] text-xs">
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
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardContent className="py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-[#00FF41]" />
              <p className="mt-4 text-[#00AA2A]">No security alerts. All clear.</p>
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
                    <div className={`p-2 rounded-sm ${config.bg}`}>
                      <TypeIcon className={`h-5 w-5 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#00FF41] font-medium">{alert.title}</h3>
                        <Badge className={`${config.badge} text-[#00FF41] text-xs`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-[#00AA2A] text-sm">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#1A6B35]">
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
