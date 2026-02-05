'use client'

import { useEffect, useRef } from 'react'

interface MiningLogProps {
  logs: string[]
}

export function MiningLog({ logs }: MiningLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="space-y-2">
      <h4 className="text-[#00FFFF] text-xs font-bold uppercase tracking-wider">Mining Log</h4>
      <div
        ref={scrollRef}
        className="h-32 overflow-y-auto bg-black/60 border border-[#0D3B1E] rounded-sm p-2 font-mono text-xs space-y-0.5"
      >
        {logs.length === 0 ? (
          <div className="text-[#1A3A2A]">Waiting for mining activity...</div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={
                log.includes('Hit') || log.includes('REWARD') || log.includes('Valid')
                  ? 'text-[#00FF41]'
                  : log.includes('Error') || log.includes('Miss')
                    ? 'text-[#1A6B35]'
                    : 'text-[#00AA2A]'
              }
            >
              <span className="text-[#1A3A2A]">[{String(i).padStart(3, '0')}]</span> {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
