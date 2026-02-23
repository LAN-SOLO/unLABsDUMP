'use client'

import { useState, useEffect, useRef } from 'react'

interface LeaderboardEntry {
  rank: number
  wallet_address: string
  effective_shares: string
  valid_hashes: number
  clicks: number
  slices_earned: number
  is_you: boolean
}

function truncateWallet(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

const LEADERBOARD_POLL_MS = 30000

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/mintpool/leaderboard', { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setEntries(data.leaderboard || [])
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      } finally {
        setIsLoading(false)
      }
    }

    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(fetchLeaderboard, LEADERBOARD_POLL_MS)
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
        fetchLeaderboard()
        startPolling()
      }
    }

    fetchLeaderboard()
    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopPolling()
      controller.abort()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-[#00FF41] text-xs font-bold uppercase tracking-wider">Leaderboard</h4>

      {isLoading ? (
        <div className="text-[#1A3A2A] text-xs font-mono">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-[#1A3A2A] text-xs font-mono py-4 text-center">
          No miners yet this round
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[#00AA2A] border-b border-[#0D3B1E]">
                <th className="text-left py-2 pr-2">#</th>
                <th className="text-left py-2 pr-2">Wallet</th>
                <th className="text-right py-2 pr-2">Shares</th>
                <th className="text-right py-2 pr-2">Hashes</th>
                <th className="text-right py-2 pr-2">Clicks</th>
                <th className="text-right py-2">_unSLC</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`border-b border-[#0D3B1E]/50 ${entry.is_you ? 'bg-[#00FF41]/5' : ''}`}
                >
                  <td className="py-1.5 pr-2 text-[#00FFFF]">{entry.rank}</td>
                  <td className="py-1.5 pr-2">
                    <span className={entry.is_you ? 'text-[#00FF41] font-bold' : 'text-[#00AA2A]'}>
                      {truncateWallet(entry.wallet_address)}
                      {entry.is_you && ' (you)'}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2 text-right text-[#00FF41]">
                    {Number(entry.effective_shares).toFixed(1)}
                  </td>
                  <td className="py-1.5 pr-2 text-right text-[#00AA2A]">{entry.valid_hashes}</td>
                  <td className="py-1.5 pr-2 text-right text-[#00AA2A]">{entry.clicks}</td>
                  <td className="py-1.5 text-right text-[#00FFFF]">{entry.slices_earned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
