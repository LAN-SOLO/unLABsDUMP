'use client'

import { useCallback, useEffect, useState } from 'react'
import { Pickaxe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TerminalFrame } from '@/components/ui/terminal-frame'
import { useAuth } from '@/hooks/useAuth'
import { usePoolStatus } from '@/lib/mintpool/use-pool-status'
import { PoolStatusBar } from '@/components/mintpool/pool-status-bar'
import { MiningConsole } from '@/components/mintpool/mining-console'
import { StakePanel } from '@/components/mintpool/stake-panel'
import { SliceInventory } from '@/components/mintpool/slice-inventory'
import { PoolNFTPreview } from '@/components/mintpool/pool-nft-preview'
import { Leaderboard } from '@/components/mintpool/leaderboard'

export default function MintPoolPage() {
  const { user } = useAuth()
  const { status, isLoading, refetch } = usePoolStatus()
  const [hasJoined, setHasJoined] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const currentRound = status?.current_round ?? null
  const playerStats = status?.player_stats ?? null

  // Check if player has already joined
  useEffect(() => {
    if (playerStats) {
      setHasJoined(true)
    }
  }, [playerStats])

  const handleJoinRound = useCallback(async () => {
    setIsJoining(true)
    try {
      const res = await fetch('/api/mintpool/join', { method: 'POST' })
      if (res.ok) {
        setHasJoined(true)
        refetch()
      }
    } catch {
      // Handle silently
    } finally {
      setIsJoining(false)
    }
  }, [refetch])

  const handleStakeChange = useCallback(() => {
    refetch()
  }, [refetch])

  const handleAssemblyComplete = useCallback(() => {
    refetch()
  }, [refetch])

  // Get stake info from player stats or fetch separately
  const currentStake = playerStats
    ? { amount: playerStats.staked_unsc, multiplier: playerStats.hash_rate_multiplier }
    : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00FF41] font-mono animate-pulse">Loading mint pool...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <TerminalFrame
          title="MINT_POOL.exe"
          pid="080"
          status="SYS"
          statusLabel={currentRound?.status === 'active' ? 'MINING' : 'STANDBY'}
          accent="cyan"
          borderStyle="single"
        >
          <div className="px-4 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pickaxe className="h-5 w-5 text-[#00FFFF]" />
                <h1
                  className="text-2xl font-bold text-[#00FFFF]"
                  style={{ textShadow: '0 0 8px rgba(0,255,255,0.6)' }}
                >
                  Mint Pool
                </h1>
              </div>
              <div className="ml-7 border-l border-dashed border-[#00FFFF]/20 pl-4">
                <p className="text-sm text-[#00AA2A]">
                  Mine hashes, earn slices, assemble hidden NFTs
                </p>
              </div>
            </div>

            {!hasJoined && currentRound?.status === 'active' && (
              <Button
                onClick={handleJoinRound}
                disabled={isJoining}
                className="bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 hover:bg-[#00FFFF]/20"
              >
                {isJoining ? 'Joining...' : 'Join Round'}
              </Button>
            )}
          </div>
        </TerminalFrame>

        {/* Pool Status Bar */}
        <PoolStatusBar
          round={currentRound}
          participants={status?.miners_online ?? 0}
          poolNftCount={status?.pool_nft_count ?? 0}
        />

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Mining Console */}
          <div className="lg:col-span-2">
            <TerminalFrame
              title="MINING_CONSOLE.exe"
              pid="081"
              status={hasJoined ? 'CONNECTED' : 'OFFLINE'}
              statusLabel={hasJoined ? 'ACTIVE' : 'JOIN REQUIRED'}
              accent="cyan"
              borderStyle="single"
            >
              {hasJoined ? (
                <MiningConsole
                  roundId={currentRound?.id ?? ''}
                  playerId={user?.playerId ?? ''}
                  difficulty={currentRound?.difficulty ?? 4}
                  roundStatus={currentRound?.status ?? 'pending'}
                  roundEndsAt={currentRound?.ends_at ?? null}
                  hasJoined={hasJoined}
                />
              ) : (
                <div className="p-8 text-center">
                  <div className="text-[#1A3A2A] font-mono text-sm mb-4">
                    {currentRound?.status === 'active'
                      ? 'Join the round to start mining'
                      : 'Waiting for next round to start...'}
                  </div>
                  {currentRound?.status === 'active' && (
                    <Button
                      onClick={handleJoinRound}
                      disabled={isJoining}
                      className="bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/30 hover:bg-[#00FFFF]/20"
                    >
                      {isJoining ? 'Joining...' : 'Join Round'}
                    </Button>
                  )}
                </div>
              )}
            </TerminalFrame>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Stake Panel */}
            <TerminalFrame
              title="STAKE.cfg"
              pid="082"
              status="MULTIPLIER"
              statusLabel={currentStake ? `${currentStake.multiplier}x` : '1.0x'}
              accent="green"
              borderStyle="single"
            >
              <StakePanel currentStake={currentStake} onStakeChange={handleStakeChange} />
            </TerminalFrame>

            {/* Slice Inventory */}
            <TerminalFrame
              title="SLICES.dat"
              pid="083"
              status="FRAGMENTS"
              statusLabel={`${status?.player_total_slices ?? 0} OWNED`}
              accent="green"
              borderStyle="single"
            >
              <SliceInventory onAssemblyComplete={handleAssemblyComplete} />
            </TerminalFrame>

            {/* Pool NFT Preview */}
            <TerminalFrame
              title="POOL_NFTS.idx"
              pid="084"
              status="HIDDEN"
              statusLabel={`${status?.pool_nft_count ?? 0} AVAILABLE`}
              accent="cyan"
              borderStyle="single"
            >
              <PoolNFTPreview nftCount={status?.pool_nft_count ?? 0} />
            </TerminalFrame>
          </div>
        </div>

        {/* Leaderboard */}
        <TerminalFrame
          title="LEADERBOARD.log"
          pid="085"
          status="TOP MINERS"
          statusLabel="LIVE"
          accent="green"
          borderStyle="single"
        >
          <Leaderboard />
        </TerminalFrame>
      </div>
    </div>
  )
}
