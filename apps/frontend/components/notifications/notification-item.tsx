'use client'

import {
  Package,
  ShoppingCart,
  ArrowLeftRight,
  CheckCircle2,
  TrendingDown,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/notifications/actions'
import type { Notification, NotificationType } from '@/lib/notifications/types'

const TYPE_ICONS: Record<NotificationType, typeof Package> = {
  delivery_complete: Package,
  trade_sold: ShoppingCart,
  trade_offer: ArrowLeftRight,
  purchase_confirmed: CheckCircle2,
  price_drop: TrendingDown,
  new_nft_available: Sparkles,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  delivery_complete: 'text-green-400 bg-green-400/10',
  trade_sold: 'text-cyan-400 bg-cyan-400/10',
  trade_offer: 'text-purple-400 bg-purple-400/10',
  purchase_confirmed: 'text-green-400 bg-green-400/10',
  price_drop: 'text-yellow-400 bg-yellow-400/10',
  new_nft_available: 'text-purple-400 bg-purple-400/10',
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  compact?: boolean
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  compact = false,
}: NotificationItemProps) {
  const Icon = TYPE_ICONS[notification.type]
  const colorClass = TYPE_COLORS[notification.type]

  return (
    <button
      onClick={() => {
        if (!notification.read && onMarkAsRead) {
          onMarkAsRead(notification.id)
        }
      }}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
        'hover:bg-slate-800/50',
        !notification.read && 'bg-slate-800/30',
        compact && 'p-2'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg',
          colorClass,
          compact ? 'size-8' : 'size-10'
        )}
      >
        <Icon className={compact ? 'size-4' : 'size-5'} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'truncate font-medium',
              compact ? 'text-sm' : 'text-sm',
              notification.read ? 'text-slate-300' : 'text-white'
            )}
          >
            {notification.title}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap text-xs text-slate-500">
              {formatTimeAgo(notification.created_at)}
            </span>
            {!notification.read && <span className="size-2 shrink-0 rounded-full bg-purple-500" />}
          </div>
        </div>
        <p
          className={cn(
            'mt-0.5 line-clamp-2 text-sm',
            notification.read ? 'text-slate-500' : 'text-slate-400'
          )}
        >
          {notification.message}
        </p>
      </div>
    </button>
  )
}
