'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Search, Shield, AlertCircle, AlertTriangle, X } from 'lucide-react'

interface Alert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  created_at: string
}

export function Header() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertCount, setAlertCount] = useState(0)
  const [showAlerts, setShowAlerts] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    fetchAlerts()
    // Poll for alerts every 60 seconds
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts')
      const data = await res.json()
      if (res.ok) {
        setAlerts(data.alerts?.slice(0, 5) || [])
        setAlertCount(data.summary?.total || 0)
      }
    } catch {
      // Silently fail
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/nfts?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  return (
    <header className="h-14 border-b border-[#0D3B1E] bg-black/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        {/* Search */}
        <div className="hidden md:block flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A6B35]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NFTs, packages..."
              className="pl-9 bg-[#0D1117] border-[#0D3B1E] h-9 text-sm text-[#00FF41] placeholder:text-[#1A6B35]"
            />
          </form>
        </div>

        {/* Mobile search toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#00AA2A] hover:text-[#00FF41]"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#00AA2A] hover:text-[#00FF41]"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-[#FF3333] text-[10px] text-black font-bold">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </Button>

          {/* Alert Dropdown */}
          {showAlerts && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#0D1117] border border-[#0D3B1E] rounded-sm shadow-xl z-50">
                <div className="flex items-center justify-between p-3 border-b border-[#0D3B1E]">
                  <h3 className="text-[#00FF41] font-medium text-sm uppercase tracking-wider">
                    Notifications
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-[#00AA2A] hover:text-[#00FF41]"
                    onClick={() => setShowAlerts(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center">
                      <Shield className="mx-auto h-8 w-8 text-[#00FF41]" />
                      <p className="mt-2 text-sm text-[#00AA2A]">All clear</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 border-b border-[#0D3B1E] last:border-0 hover:bg-[#0D3B1E]/20"
                      >
                        <div className="flex items-start gap-2">
                          {alert.severity === 'critical' ? (
                            <AlertCircle className="h-4 w-4 text-[#FF3333] mt-0.5 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-[#FFB000] mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-[#00FF41]">{alert.title}</p>
                            <p className="text-xs text-[#00AA2A] truncate">{alert.description}</p>
                            <p className="text-xs text-[#1A6B35] mt-1">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {alertCount > 0 && (
                  <div className="p-2 border-t border-[#0D3B1E]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[#00FF41] hover:text-[#00FF41] hover:bg-[#0D3B1E]/20"
                      asChild
                      onClick={() => setShowAlerts(false)}
                    >
                      <Link href="/alerts">View All Alerts</Link>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="absolute inset-x-0 top-full bg-black border-b border-[#0D3B1E] p-3 md:hidden z-50">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A6B35]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 bg-[#0D1117] border-[#0D3B1E] text-[#00FF41] placeholder:text-[#1A6B35]"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  )
}
