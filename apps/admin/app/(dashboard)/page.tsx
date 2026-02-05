'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Image,
  Package,
  Truck,
  Flame,
  Users,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'

interface DashboardStats {
  nfts: {
    total: number
    active: number
  }
  packages: {
    total: number
    active: number
    featured: number
  }
  deliveries: {
    pending: number
    processing: number
    completed: number
  }
  burns: {
    total: number
    thisMonth: number
  }
  players: {
    total: number
  }
  recentActivity: Array<{
    id: string
    action: string
    entity_type: string | null
    created_at: string
    admin: { email: string | null } | null
  }>
  charts: {
    last7Days: Array<{ date: string; sales: number; deliveries: number }>
  }
  inventoryAlerts: Array<{
    packageId: string
    packageName: string
    available: number
    severity: 'warning' | 'critical'
  }>
}

const actionColors: Record<string, string> = {
  created: 'bg-[#00FF41]',
  updated: 'bg-[#00FFFF]',
  deleted: 'bg-[#FF3333]',
  processed: 'bg-[#00CC33] text-black',
}

const getActionColor = (action: string) => {
  for (const [key, color] of Object.entries(actionColors)) {
    if (action.includes(key)) return color
  }
  return 'bg-[#1A6B35]'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      if (res.ok) {
        setStats(data)
      }
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#00FF41]">Dashboard</h1>
          <p className="text-[#00AA2A] mt-2">Overview of your platform statistics</p>
        </div>
        <Button variant="outline" onClick={fetchStats}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#00AA2A]">Total NFTs</CardTitle>
            <Image className="h-4 w-4 text-[#00FF41]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00FF41]">
              {formatNumber(stats?.nfts.total || 0)}
            </div>
            <p className="text-xs text-[#1A6B35]">{stats?.nfts.active || 0} active</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#00AA2A]">Active Packages</CardTitle>
            <Package className="h-4 w-4 text-[#00FFFF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00FF41]">{stats?.packages.active || 0}</div>
            <p className="text-xs text-[#1A6B35]">{stats?.packages.featured || 0} featured</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#00AA2A]">Pending Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-[#FFB000]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00FFFF]">
              {stats?.deliveries.pending || 0}
            </div>
            <p className="text-xs text-[#1A6B35]">{stats?.deliveries.processing || 0} processing</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#00AA2A]">Total Burned</CardTitle>
            <Flame className="h-4 w-4 text-[#00FF41]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00FF41]">
              {formatNumber(stats?.burns.total || 0)} _unSC
            </div>
            <p className="text-xs text-[#1A6B35]">
              +{formatNumber(stats?.burns.thisMonth || 0)} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <Card className="bg-[#0D1117] border-[#0D3B1E] lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#00FF41]">Last 7 Days Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00AA2A]" />
          </CardHeader>
          <CardContent>
            {stats?.charts.last7Days && (
              <div className="space-y-4">
                {/* Simple bar chart */}
                <div className="flex items-end gap-2 h-40">
                  {stats.charts.last7Days.map((day) => {
                    const maxValue = Math.max(
                      ...stats.charts.last7Days.map((d) => d.sales + d.deliveries),
                      1
                    )
                    const totalHeight = ((day.sales + day.deliveries) / maxValue) * 100
                    const salesHeight =
                      (day.sales / (day.sales + day.deliveries || 1)) * totalHeight

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t overflow-hidden"
                          style={{ height: `${Math.max(totalHeight, 4)}%` }}
                        >
                          <div
                            className="w-full bg-[#00FF41]"
                            style={{ height: `${salesHeight}%` }}
                          />
                          <div
                            className="w-full bg-[#00FFFF]"
                            style={{ height: `${100 - salesHeight}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#00AA2A]">
                          {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-[#00FF41]" />
                    <span className="text-[#00AA2A]">Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-[#00FFFF]" />
                    <span className="text-[#00AA2A]">Deliveries</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-[#0D1117] border-[#0D3B1E]">
          <CardHeader>
            <CardTitle className="text-[#00FF41]">Platform Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#111318] rounded-sm">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#00FF41]" />
                <span className="text-[#00CC33]">Total Players</span>
              </div>
              <span className="text-[#00FF41] font-bold">
                {formatNumber(stats?.players.total || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#111318] rounded-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#00FF41]" />
                <span className="text-[#00CC33]">Completed Deliveries</span>
              </div>
              <span className="text-[#00FF41] font-bold">
                {formatNumber(stats?.deliveries.completed || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#111318] rounded-sm">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-[#00FF41]" />
                <span className="text-[#00CC33]">Total Packages</span>
              </div>
              <span className="text-[#00FF41] font-bold">
                {formatNumber(stats?.packages.total || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      {stats?.inventoryAlerts && stats.inventoryAlerts.length > 0 && (
        <Card className="bg-[#0D1117] border-[#FF3333]/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#FFB000]" />
              <CardTitle className="text-[#00FF41]">Inventory Alerts</CardTitle>
            </div>
            <Badge className="bg-[#FF3333] text-[#00FF41]">{stats.inventoryAlerts.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.inventoryAlerts.map((alert) => (
                <div
                  key={alert.packageId}
                  className={`flex items-center justify-between p-3 rounded-sm ${
                    alert.severity === 'critical'
                      ? 'bg-[#FF3333]/10 border border-[#FF3333]/50'
                      : 'bg-[#FFB000]/10 border border-[#FFB000]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package
                      className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-[#FF3333]' : 'text-[#FFB000]'}`}
                    />
                    <span className="text-[#00FF41] text-sm">{alert.packageName}</span>
                  </div>
                  <Badge
                    className={`${alert.severity === 'critical' ? 'bg-[#FF3333]' : 'bg-[#FFB000]'} text-[#00FF41] text-xs`}
                  >
                    {alert.available} remaining
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#00FF41]">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/audit">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-[#111318] rounded-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`${getActionColor(activity.action)} text-[#00FF41] text-xs`}>
                      {formatAction(activity.action)}
                    </Badge>
                    <div>
                      <p className="text-sm text-[#00FF41] capitalize">
                        {activity.entity_type || 'System'}
                      </p>
                      <p className="text-xs text-[#00AA2A]">
                        by {activity.admin?.email || 'System'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[#1A6B35]">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#00AA2A] text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-[#0D1117] border-[#0D3B1E]">
        <CardHeader>
          <CardTitle className="text-[#00FF41]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/nfts/new">
                <Image className="mr-2 h-4 w-4" />
                Create NFT
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/packages/new">
                <Package className="mr-2 h-4 w-4" />
                Create Package
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/deliveries">
                <Truck className="mr-2 h-4 w-4" />
                View Deliveries
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/burns">
                <Flame className="mr-2 h-4 w-4" />
                View Burns
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
