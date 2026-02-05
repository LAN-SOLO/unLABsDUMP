'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useMiner } from '@/lib/mintpool/use-miner'

interface HashPuzzleMinerProps {
  roundId: string
  playerId: string
  difficulty: number
  isRoundActive: boolean
  onValidHash: (nonce: string, hash: string) => void
}

export function HashPuzzleMiner({
  roundId,
  playerId,
  difficulty,
  isRoundActive,
  onValidHash,
}: HashPuzzleMinerProps) {
  const handleValidHash = useCallback(
    (nonce: string, hash: string) => {
      onValidHash(nonce, hash)
    },
    [onValidHash]
  )

  const { isMining, hashRate, totalHashes, validHashes, start, stop } = useMiner({
    roundId,
    playerId,
    difficulty,
    onValidHash: handleValidHash,
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[#00FFFF] text-xs font-bold uppercase tracking-wider">Hash Mining</h4>
        <Button
          size="sm"
          onClick={isMining ? stop : start}
          disabled={!isRoundActive}
          className={
            isMining
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 hover:bg-[#00FFFF]/20'
          }
        >
          {isMining ? 'Stop Mining' : 'Start Mining'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/40 border border-[#0D3B1E] rounded-sm p-2 text-center">
          <div className="text-[#00AA2A] text-[10px] uppercase tracking-wider">Hash Rate</div>
          <div
            className="text-[#00FFFF] font-mono text-lg font-bold"
            style={{ textShadow: '0 0 5px rgba(0,255,255,0.4)' }}
          >
            {isMining ? `${hashRate}/s` : '—'}
          </div>
        </div>
        <div className="bg-black/40 border border-[#0D3B1E] rounded-sm p-2 text-center">
          <div className="text-[#00AA2A] text-[10px] uppercase tracking-wider">Total</div>
          <div className="text-[#00FF41] font-mono text-lg font-bold">
            {totalHashes.toLocaleString()}
          </div>
        </div>
        <div className="bg-black/40 border border-[#0D3B1E] rounded-sm p-2 text-center">
          <div className="text-[#00AA2A] text-[10px] uppercase tracking-wider">Valid</div>
          <div
            className="text-[#00FF41] font-mono text-lg font-bold"
            style={{ textShadow: '0 0 5px rgba(0,255,65,0.4)' }}
          >
            {validHashes}
          </div>
        </div>
      </div>

      {isMining && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FFFF] animate-pulse" />
          <span className="text-[#00FFFF]/60 text-xs font-mono">
            Mining with difficulty {difficulty} (looking for {difficulty} leading zeros)
          </span>
        </div>
      )}
    </div>
  )
}
