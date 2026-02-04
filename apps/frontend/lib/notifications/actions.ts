import type { Notification } from './types'

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch('/api/notifications', {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch notifications')
  }

  const data = await res.json()
  return data.notifications
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to mark notification as read')
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await fetch('/api/notifications/read-all', {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to mark all notifications as read')
  }
}

export async function clearAllNotifications(): Promise<void> {
  const res = await fetch('/api/notifications', {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Failed to clear notifications')
  }
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
