'use client'

/**
 * Session Timer Component
 *
 * Displays remaining session time and handles auto-logout.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, AlertTriangle } from 'lucide-react'

interface SessionTimerProps {
  expiresAt: number
  onExpire?: () => void
}

export function SessionTimer({ expiresAt, onExpire }: SessionTimerProps) {
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  useEffect(() => {
    const updateTimer = () => {
      const remaining = expiresAt - Date.now()
      setTimeRemaining(Math.max(0, remaining))

      if (remaining <= 0) {
        // Session expired
        if (onExpire) {
          onExpire()
        } else {
          router.push('/dev/auth')
        }
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire, router])

  const isExpiringSoon = timeRemaining < 2 * 60 * 1000 // Less than 2 minutes
  const isExpired = timeRemaining <= 0

  if (isExpired) {
    return (
      <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 px-3 py-2 text-red-400">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Session expired</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${
        isExpiringSoon ? 'bg-yellow-950/50 text-yellow-400' : 'bg-zinc-800 text-zinc-400'
      }`}
    >
      <Clock className="h-4 w-4" />
      <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
      {isExpiringSoon && <span className="text-xs">Session expiring soon</span>}
    </div>
  )
}
