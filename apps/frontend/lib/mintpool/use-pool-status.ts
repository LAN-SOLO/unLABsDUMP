'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { POOL_STATUS_POLL_INTERVAL_MS } from './config'
import type { MintPoolStats } from './types'

export function usePoolStatus() {
  const [status, setStatus] = useState<MintPoolStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/mintpool/status')
      if (!res.ok) {
        throw new Error('Failed to fetch pool status')
      }
      const data = await res.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()

    intervalRef.current = setInterval(fetchStatus, POOL_STATUS_POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchStatus])

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  }
}
