'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { POOL_STATUS_POLL_INTERVAL_MS } from './config'
import type { MintPoolStats } from './types'

export function usePoolStatus() {
  const [status, setStatus] = useState<MintPoolStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchStatus = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/mintpool/status', { signal: controller.signal })
      if (!res.ok) {
        throw new Error('Failed to fetch pool status')
      }
      const data = await res.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(fetchStatus, POOL_STATUS_POLL_INTERVAL_MS)
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        fetchStatus()
        startPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopPolling()
      abortRef.current?.abort()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchStatus])

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  }
}
