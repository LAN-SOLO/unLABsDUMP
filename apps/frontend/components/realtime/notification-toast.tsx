'use client'

import { toast } from 'sonner'
import type { Notification, NotificationType } from '@/lib/notifications/types'
import {
  Package,
  ShoppingCart,
  ArrowLeftRight,
  CheckCircle2,
  TrendingDown,
  Sparkles,
} from 'lucide-react'
import { createElement } from 'react'

const TOAST_ICONS: Record<NotificationType, typeof Package> = {
  delivery_complete: Package,
  trade_sold: ShoppingCart,
  trade_offer: ArrowLeftRight,
  purchase_confirmed: CheckCircle2,
  price_drop: TrendingDown,
  new_nft_available: Sparkles,
}

const TOAST_COLORS: Record<NotificationType, string> = {
  delivery_complete: 'text-green-400',
  trade_sold: 'text-cyan-400',
  trade_offer: 'text-purple-400',
  purchase_confirmed: 'text-green-400',
  price_drop: 'text-yellow-400',
  new_nft_available: 'text-purple-400',
}

export function showNotificationToast(notification: Notification): void {
  const Icon = TOAST_ICONS[notification.type]
  const colorClass = TOAST_COLORS[notification.type]

  toast(notification.title, {
    description: notification.message,
    icon: createElement(Icon, { className: `size-5 ${colorClass}` }),
    duration: 5000,
    className: 'bg-slate-900 border-slate-700 text-white [&_[data-description]]:text-slate-300',
  })
}

export function showSuccessToast(title: string, message?: string): void {
  toast.success(title, {
    description: message,
    duration: 3000,
    className: 'bg-slate-900 border-slate-700 text-white [&_[data-description]]:text-slate-300',
  })
}

export function showErrorToast(title: string, message?: string): void {
  toast.error(title, {
    description: message,
    duration: 5000,
    className: 'bg-slate-900 border-red-800 text-white [&_[data-description]]:text-slate-300',
  })
}
