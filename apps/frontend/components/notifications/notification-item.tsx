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
  delivery_complete: 'text-[#00FF41] bg-[#00FF41]/10',
  trade_sold: 'text-[#00FFFF] bg-[#00FFFF]/10',
  trade_offer: 'text-[#00FF41] bg-[#00FF41]/10',
  purchase_confirmed: 'text-[#00FF41] bg-[#00FF41]/10',
  price_drop: 'text-[#FFB000] bg-[#FFB000]/10',
  new_nft_available: 'text-[#00FF41] bg-[#00FF41]/10',
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
        'flex w-full items-start gap-3 rounded-sm p-3 text-left transition-colors',
        'hover:bg-[#0D3B1E]/20',
        !notification.read && 'bg-[#0D3B1E]/10',
        compact && 'p-2'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-sm',
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
              notification.read ? 'text-[#00CC33]' : 'text-[#00FF41]'
            )}
          >
            {notification.title}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap text-xs text-[#1A6B35]">
              {formatTimeAgo(notification.created_at)}
            </span>
            {!notification.read && <span className="size-2 shrink-0 rounded-full bg-[#00FF41]" />}
          </div>
        </div>
        <p
          className={cn(
            'mt-0.5 line-clamp-2 text-sm',
            notification.read ? 'text-[#1A6B35]' : 'text-[#00AA2A]'
          )}
        >
          {notification.message}
        </p>
      </div>
    </button>
  )
}
