'use client'

import { Badge } from '@/components/ui/badge'
import type { MintPoolRound } from '@/lib/mintpool/types'

interface PoolStatusBarProps {
  round: MintPoolRound | null
  participants: number
  poolNftCount: number
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    active: 'bg-[#00FFFF]/10 text-[#00FFFF] border-[#00FFFF]/30',
    computing: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    completed: 'bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30',
  }

  return (
    <Badge variant="secondary" className={`text-xs border ${styles[status] || styles.pending}`}>
      {status.toUpperCase()}
    </Badge>
  )
}

export function PoolStatusBar({ round, participants, poolNftCount }: PoolStatusBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-black/40 border border-[#0D3B1E] rounded-sm">
      <div className="flex items-center gap-2">
        <span className="text-[#00AA2A] text-xs uppercase tracking-wider">Round</span>
        <span
          className="text-[#00FFFF] font-mono font-bold"
          style={{ textShadow: '0 0 5px rgba(0,255,255,0.5)' }}
        >
          #{round?.round_number ?? '—'}
        </span>
      </div>

      <div className="w-px h-4 bg-[#0D3B1E]" />

      <StatusBadge status={round?.status ?? 'pending'} />

      <div className="w-px h-4 bg-[#0D3B1E]" />

      <div className="flex items-center gap-2">
        <span className="text-[#00AA2A] text-xs">Difficulty</span>
        <span className="text-[#00FF41] font-mono text-sm">{round?.difficulty ?? 4}</span>
      </div>

      <div className="w-px h-4 bg-[#0D3B1E]" />

      <div className="flex items-center gap-2">
        <span className="text-[#00AA2A] text-xs">Miners</span>
        <span className="text-[#00FF41] font-mono text-sm">{participants}</span>
      </div>

      <div className="w-px h-4 bg-[#0D3B1E]" />

      <div className="flex items-center gap-2">
        <span className="text-[#00AA2A] text-xs">Pool _unITM</span>
        <span className="text-[#00FF41] font-mono text-sm">{poolNftCount}</span>
      </div>
    </div>
  )
}
