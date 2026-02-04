'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useAuth } from '@/hooks/useAuth'
import { resetRealtimeClient } from '@/lib/realtime/client'
import { unsubscribeAll } from '@/lib/realtime/subscriptions'
import { useRealtimeDelivery } from '@/hooks/useRealtimeDelivery'
import { useRealtimeTrades } from '@/hooks/useRealtimeTrades'
import { useRealtimeInventory } from '@/hooks/useRealtimeInventory'
import type { Notification } from '@/lib/notifications/types'
import { showNotificationToast } from './notification-toast'

interface RealtimeContextValue {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  isConnected: boolean
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const walletAddress = user?.walletAddress ?? null
  const playerId = user?.playerId ?? null

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 200))
    showNotificationToast(notification)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  // Subscribe to delivery updates
  useRealtimeDelivery({
    walletAddress,
    playerId,
    onNotification: addNotification,
  })

  // Subscribe to trade updates
  useRealtimeTrades({
    walletAddress,
    playerId,
    onNotification: addNotification,
  })

  // Subscribe to inventory updates
  useRealtimeInventory({
    walletAddress,
    playerId,
    onNotification: addNotification,
  })

  // Track connection state
  useEffect(() => {
    setIsConnected(isAuthenticated)
  }, [isAuthenticated])

  // Cleanup on unmount or logout
  useEffect(() => {
    if (!isAuthenticated) {
      unsubscribeAll()
      resetRealtimeClient()
      setIsConnected(false)
    }

    return () => {
      unsubscribeAll()
      resetRealtimeClient()
    }
  }, [isAuthenticated])

  const value = useMemo<RealtimeContextValue>(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      isConnected,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      isConnected,
    ]
  )

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}
