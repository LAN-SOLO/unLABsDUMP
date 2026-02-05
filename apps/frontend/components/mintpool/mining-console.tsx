'use client'

import { useCallback, useState } from 'react'
import { RoundTimer } from './round-timer'
import { HashPuzzleMiner } from './hash-puzzle-miner'
import { ClickMiner } from './click-miner'
import { MiningLog } from './mining-log'
import { Separator } from '@/components/ui/separator'

interface MiningConsoleProps {
  roundId: string
  playerId: string
  difficulty: number
  roundStatus: string
  roundEndsAt: string | null
  hasJoined: boolean
}

export function MiningConsole({
  roundId,
  playerId,
  difficulty,
  roundStatus,
  roundEndsAt,
  hasJoined,
}: MiningConsoleProps) {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs((prev) => [...prev.slice(-99), `${timestamp} ${message}`])
  }, [])

  const handleValidHash = useCallback(
    async (nonce: string, hash: string) => {
      addLog(`[HASH] Valid hash found: ${hash.slice(0, 16)}...`)

      try {
        const res = await fetch('/api/mintpool/mine/hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ round_id: roundId, nonce, hash }),
        })
        const data = await res.json()

        if (data.valid) {
          addLog(`[HASH] Accepted! Leading zeros: ${data.leading_zeros}`)
        } else {
          addLog(`[HASH] Rejected by server`)
        }
      } catch {
        addLog(`[HASH] Error submitting hash`)
      }
    },
    [roundId, addLog]
  )

  const isRoundActive = roundStatus === 'active'

  return (
    <div className="space-y-4 p-4">
      <RoundTimer endsAt={roundEndsAt} status={roundStatus} />

      <Separator className="bg-[#0D3B1E]" />

      <HashPuzzleMiner
        roundId={roundId}
        playerId={playerId}
        difficulty={difficulty}
        isRoundActive={isRoundActive}
        onValidHash={handleValidHash}
      />

      <Separator className="bg-[#0D3B1E]" />

      <ClickMiner isRoundActive={isRoundActive} hasJoined={hasJoined} onLog={addLog} />

      <Separator className="bg-[#0D3B1E]" />

      <MiningLog logs={logs} />
    </div>
  )
}
