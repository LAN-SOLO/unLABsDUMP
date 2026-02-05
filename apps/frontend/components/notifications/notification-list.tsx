'use client'

import { NotificationItem } from './notification-item'
import type { Notification } from '@/lib/notifications/types'
import { Bell } from 'lucide-react'

interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead?: (id: string) => void
  compact?: boolean
  emptyMessage?: string
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  compact = false,
  emptyMessage = 'No notifications yet',
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#111318]">
          <Bell className="size-8 text-[#1A6B35]" />
        </div>
        <p className="mt-4 text-sm text-[#00AA2A]">{emptyMessage}</p>
        <p className="mt-1 text-xs text-[#1A6B35]">Real-time updates will appear here</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#0D3B1E]">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          compact={compact}
        />
      ))}
    </div>
  )
}
