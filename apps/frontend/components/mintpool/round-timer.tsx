'use client'

import { useEffect, useState } from 'react'

interface RoundTimerProps {
  endsAt: string | null
  status: string
}

export function RoundTimer({ endsAt, status }: RoundTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!endsAt || status !== 'active') {
      setTimeLeft(0)
      return
    }

    function tick() {
      const remaining = Math.max(0, Math.floor((new Date(endsAt!).getTime() - Date.now()) / 1000))
      setTimeLeft(remaining)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endsAt, status])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const isLow = timeLeft > 0 && timeLeft <= 10

  if (status !== 'active') {
    return (
      <div className="text-center py-2">
        <span className="text-[#00AA2A] font-mono text-sm uppercase">
          {status === 'pending' ? 'Round starting soon...' : 'Round ended'}
        </span>
      </div>
    )
  }

  return (
    <div className="text-center py-2">
      <div className="text-[#00AA2A] text-[10px] uppercase tracking-widest mb-1">
        Time Remaining
      </div>
      <div
        className={`font-mono text-3xl font-bold tracking-widest ${isLow ? 'text-red-400' : 'text-[#00FFFF]'}`}
        style={{
          textShadow: isLow
            ? '0 0 10px rgba(248,113,113,0.8)'
            : '0 0 10px rgba(0,255,255,0.6), 0 0 20px rgba(0,255,255,0.3)',
        }}
      >
        {display}
      </div>
    </div>
  )
}
