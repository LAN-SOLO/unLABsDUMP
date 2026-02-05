'use client'

import Link from 'next/link'
import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { NotificationList } from './notification-list'
import { useRealtime } from '@/components/realtime/realtime-provider'

interface NotificationDropdownProps {
  onClose: () => void
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtime()
  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="absolute right-0 top-12 z-50 w-[380px] overflow-hidden rounded-sm border border-[#1A3A2A] bg-[#0D1117] shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#0D3B1E] px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#00FF41]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center rounded-full bg-[#0D3B1E]/30 px-2 py-0.5 text-xs font-medium text-[#00FF41]">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="h-7 gap-1.5 px-2 text-xs text-[#00AA2A] hover:text-[#00FF41]"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-[400px] overflow-y-auto">
        <NotificationList
          notifications={recentNotifications}
          onMarkAsRead={markAsRead}
          compact
          emptyMessage="You're all caught up!"
        />
      </div>

      {/* Footer */}
      <Separator className="bg-[#0D3B1E]" />
      <div className="p-2">
        <Link
          href="/notifications"
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-sm py-2 text-sm font-medium text-[#00FF41] transition-colors hover:bg-[#0D3B1E]/20 hover:text-[#00FF41]"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  )
}
