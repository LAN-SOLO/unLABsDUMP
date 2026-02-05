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
  delivery_complete: 'text-[#00FF41]',
  trade_sold: 'text-[#00FFFF]',
  trade_offer: 'text-[#00FF41]',
  purchase_confirmed: 'text-[#00FF41]',
  price_drop: 'text-[#FFB000]',
  new_nft_available: 'text-[#00FF41]',
}

export function showNotificationToast(notification: Notification): void {
  const Icon = TOAST_ICONS[notification.type]
  const colorClass = TOAST_COLORS[notification.type]

  toast(notification.title, {
    description: notification.message,
    icon: createElement(Icon, { className: `size-5 ${colorClass}` }),
    duration: 5000,
    className: 'bg-[#0D1117] border-[#1A3A2A] text-[#00FF41] [&_[data-description]]:text-[#00CC33]',
  })
}

export function showSuccessToast(title: string, message?: string): void {
  toast.success(title, {
    description: message,
    duration: 3000,
    className: 'bg-[#0D1117] border-[#1A3A2A] text-[#00FF41] [&_[data-description]]:text-[#00CC33]',
  })
}

export function showErrorToast(title: string, message?: string): void {
  toast.error(title, {
    description: message,
    duration: 5000,
    className: 'bg-[#0D1117] border-[#FF3333] text-[#00FF41] [&_[data-description]]:text-[#00CC33]',
  })
}
