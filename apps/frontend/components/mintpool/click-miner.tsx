'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CLICK_COOLDOWN_MS } from '@/lib/mintpool/config'

interface ClickMinerProps {
  isRoundActive: boolean
  hasJoined: boolean
  onLog: (message: string) => void
}

export function ClickMiner({ isRoundActive, hasJoined, onLog }: ClickMinerProps) {
  const [cooldown, setCooldown] = useState(0)
  const [lastReward, setLastReward] = useState<boolean | null>(null)
  const [clickCount, setClickCount] = useState(0)
  const [isClicking, setIsClicking] = useState(false)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  const startCooldown = useCallback(() => {
    setCooldown(CLICK_COOLDOWN_MS)
    if (cooldownRef.current) clearInterval(cooldownRef.current)

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 100) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return prev - 100
      })
    }, 100)
  }, [])

  const handleClick = useCallback(async () => {
    if (!isRoundActive || !hasJoined || cooldown > 0 || isClicking) return

    setIsClicking(true)
    try {
      const res = await fetch('/api/mintpool/mine/click', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setClickCount(data.click_count || clickCount + 1)
        setLastReward(data.rewarded)
        startCooldown()

        if (data.rewarded) {
          onLog(`[CLICK] Hit! Reward earned (chance: ${(data.effective_chance * 100).toFixed(0)}%)`)
        } else {
          onLog(`[CLICK] Miss. Keep trying...`)
        }
      } else if (res.status === 429) {
        startCooldown()
      }
    } catch {
      onLog('[CLICK] Error sending click')
    } finally {
      setIsClicking(false)
    }
  }, [isRoundActive, hasJoined, cooldown, isClicking, clickCount, startCooldown, onLog])

  const cooldownProgress = cooldown > 0 ? (cooldown / CLICK_COOLDOWN_MS) * 100 : 0
  const isDisabled = !isRoundActive || !hasJoined || cooldown > 0 || isClicking

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[#00FFFF] text-xs font-bold uppercase tracking-wider">Click Mine</h4>
        <span className="text-[#00AA2A] text-xs font-mono">Clicks: {clickCount}</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        {/* Mine Button with cooldown ring */}
        <div className="relative">
          {/* Cooldown ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#0D3B1E" strokeWidth="3" />
            {cooldownProgress > 0 && (
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#00FFFF"
                strokeWidth="3"
                strokeDasharray={`${(cooldownProgress / 100) * 289} 289`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.1s linear' }}
              />
            )}
          </svg>

          <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`relative w-24 h-24 rounded-full border-2 font-mono text-sm font-bold uppercase tracking-wider transition-all ${
              isDisabled
                ? 'border-[#1A3A2A] text-[#1A3A2A] cursor-not-allowed'
                : 'border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF]/10 active:scale-95 cursor-pointer'
            }`}
            style={
              !isDisabled
                ? { boxShadow: '0 0 15px rgba(0,255,255,0.2), inset 0 0 15px rgba(0,255,255,0.05)' }
                : undefined
            }
          >
            MINE
          </button>
        </div>

        {/* Reward flash */}
        {lastReward !== null && (
          <div
            className={`text-sm font-mono font-bold animate-pulse ${
              lastReward ? 'text-[#00FF41]' : 'text-[#1A3A2A]'
            }`}
            style={lastReward ? { textShadow: '0 0 10px rgba(0,255,65,0.8)' } : undefined}
          >
            {lastReward ? '+ REWARD!' : 'Miss'}
          </div>
        )}
      </div>
    </div>
  )
}
