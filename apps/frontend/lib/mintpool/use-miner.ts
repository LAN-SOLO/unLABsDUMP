'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface MinerState {
  isMining: boolean
  hashRate: number
  totalHashes: number
  validHashes: number
}

interface UseMinerOptions {
  roundId: string
  playerId: string
  difficulty: number
  onValidHash?: (nonce: string, hash: string, leadingZeros: number) => void
}

export function useMiner({ roundId, playerId, difficulty, onValidHash }: UseMinerOptions) {
  const workerRef = useRef<Worker | null>(null)
  const [state, setState] = useState<MinerState>({
    isMining: false,
    hashRate: 0,
    totalHashes: 0,
    validHashes: 0,
  })

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' })
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  const start = useCallback(() => {
    if (workerRef.current) return

    const worker = new Worker(new URL('./hash-worker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (e) => {
      const { type, nonce, hash, leadingZeros, hashRate, totalHashes } = e.data

      if (type === 'valid_hash' && nonce && hash && leadingZeros) {
        setState((prev) => ({ ...prev, validHashes: prev.validHashes + 1 }))
        onValidHash?.(nonce, hash, leadingZeros)
      }

      if (type === 'stats') {
        setState((prev) => ({
          ...prev,
          hashRate: hashRate ?? prev.hashRate,
          totalHashes: totalHashes ?? prev.totalHashes,
        }))
      }

      if (type === 'stopped') {
        setState((prev) => ({ ...prev, isMining: false }))
      }
    }

    worker.onerror = () => {
      setState((prev) => ({ ...prev, isMining: false }))
      workerRef.current = null
    }

    workerRef.current = worker
    setState((prev) => ({ ...prev, isMining: true, hashRate: 0, totalHashes: 0, validHashes: 0 }))

    worker.postMessage({
      type: 'start',
      roundId,
      playerId,
      difficulty,
    })
  }, [roundId, playerId, difficulty, onValidHash])

  const stop = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' })
      workerRef.current.terminate()
      workerRef.current = null
    }
    setState((prev) => ({ ...prev, isMining: false }))
  }, [])

  return {
    ...state,
    start,
    stop,
  }
}
