'use client'

import { useState, useCallback, useMemo } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { NotificationList } from '@/components/notifications/notification-list'
import { useRealtime } from '@/components/realtime/realtime-provider'
import { type NotificationType, NOTIFICATION_TYPE_LABELS } from '@/lib/notifications/types'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
    useRealtime()

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id)
      // Also persist to server
      fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {
        // Silently handle server-side persistence errors
      })
    },
    [markAsRead]
  )

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead()
    fetch('/api/notifications/read-all', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // Silently handle server-side persistence errors
    })
  }, [markAllAsRead])

  const handleClearAll = useCallback(() => {
    clearNotifications()
    fetch('/api/notifications', {
      method: 'DELETE',
      credentials: 'include',
    }).catch(() => {
      // Silently handle server-side persistence errors
    })
  }, [clearNotifications])

  const filteredNotifications = useMemo(() => {
    let result = notifications
    if (activeTab === 'unread') {
      result = result.filter((n) => !n.read)
    }
    if (typeFilter !== 'all') {
      result = result.filter((n) => n.type === typeFilter)
    }
    return result
  }, [notifications, activeTab, typeFilter])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-sm bg-[#0D3B1E]/30">
            <Bell className="size-5 text-[#00FF41]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#00FF41]">Notifications</h1>
            <p className="text-sm text-[#00AA2A]">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'All caught up'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5 border-[#1A3A2A] bg-[#0D3B1E]/20 text-[#00CC33] hover:bg-[#0D3B1E]/20 hover:text-[#00FF41]"
            >
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="gap-1.5 border-[#1A3A2A] bg-[#0D3B1E]/20 text-[#00CC33] hover:bg-[#FF3333]/15 hover:text-[#FF3333] hover:border-[#FF3333]/50"
            >
              <Trash2 className="size-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card className="border-[#0D3B1E] bg-[#0D1117]/50">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
          <div className="border-b border-[#0D3B1E] px-4 pt-3">
            <TabsList className="bg-[#0D3B1E]/20">
              <TabsTrigger
                value="all"
                className="text-[#00AA2A] data-[state=active]:bg-[#1A3A2A] data-[state=active]:text-[#00FF41]"
              >
                All
                <span className="ml-1.5 rounded-full bg-[#1A3A2A] px-1.5 py-0.5 text-xs text-[#00CC33]">
                  {notifications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="text-[#00AA2A] data-[state=active]:bg-[#1A3A2A] data-[state=active]:text-[#00FF41]"
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#0D3B1E]/30 px-1.5 py-0.5 text-xs text-[#00CC33]">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap gap-1.5 border-b border-[#0D3B1E] px-4 pb-3">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-[#0D3B1E]/30 text-[#00FF41]'
                  : 'text-[#1A6B35] hover:text-[#00CC33] hover:bg-[#0D3B1E]/20'
              }`}
            >
              All Types
            </button>
            {(Object.entries(NOTIFICATION_TYPE_LABELS) as [NotificationType, string][]).map(
              ([type, label]) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-[#0D3B1E]/30 text-[#00FF41]'
                      : 'text-[#1A6B35] hover:text-[#00CC33] hover:bg-[#0D3B1E]/20'
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>

          <Separator className="bg-[#111318]" />

          <TabsContent value="all" className="m-0">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage="No notifications yet"
            />
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage="No unread notifications"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
