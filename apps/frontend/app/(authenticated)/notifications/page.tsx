'use client'

import { useState, useCallback, useMemo } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { NotificationList } from '@/components/notifications/notification-list'
import { useRealtime } from '@/components/realtime/realtime-provider'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
    useRealtime()

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

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
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.read)
    }
    return notifications
  }, [notifications, activeTab])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-600/20">
            <Bell className="size-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-slate-400">
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
              className="gap-1.5 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
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
              className="gap-1.5 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-red-900/50 hover:text-red-300 hover:border-red-800"
            >
              <Trash2 className="size-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card className="border-slate-800 bg-slate-900/50">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
          <div className="border-b border-slate-800 px-4 pt-3">
            <TabsList className="bg-slate-800/50">
              <TabsTrigger
                value="all"
                className="text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
              >
                All
                <span className="ml-1.5 rounded-full bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">
                  {notifications.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-purple-600/30 px-1.5 py-0.5 text-xs text-purple-300">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <Separator className="bg-slate-800" />

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
