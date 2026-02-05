'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { STAKE_TIERS, getStakeTierLabel, getStakeMultiplier } from '@/lib/mintpool/config'

interface StakePanelProps {
  currentStake: { amount: string; multiplier: string } | null
  onStakeChange: () => void
}

export function StakePanel({ currentStake, onStakeChange }: StakePanelProps) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentAmount = currentStake ? Number(currentStake.amount) : 0
  const currentMultiplier = currentStake ? Number(currentStake.multiplier) : 1
  const currentTier = getStakeTierLabel(currentAmount)

  const handleStake = useCallback(async () => {
    if (!amount || Number(amount) <= 0) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/mintpool/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to stake')
        return
      }

      setAmount('')
      onStakeChange()
    } catch {
      setError('Failed to stake')
    } finally {
      setIsLoading(false)
    }
  }, [amount, onStakeChange])

  const handleWithdraw = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/mintpool/stake/withdraw', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to withdraw')
        return
      }
      onStakeChange()
    } catch {
      setError('Failed to withdraw')
    } finally {
      setIsLoading(false)
    }
  }, [onStakeChange])

  const previewMultiplier = amount ? getStakeMultiplier(Number(amount)) : null

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-[#00FF41] text-xs font-bold uppercase tracking-wider">_unSC Staking</h4>

      {/* Current stake info */}
      <div className="bg-black/40 border border-[#0D3B1E] rounded-sm p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#00AA2A]">Staked</span>
          <span className="text-[#00FF41] font-mono">
            {currentAmount > 0 ? currentAmount.toLocaleString() : '0'} _unSC
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#00AA2A]">Multiplier</span>
          <span className="text-[#00FFFF] font-mono">{currentMultiplier}x</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#00AA2A]">Tier</span>
          <span className="text-[#00FF41] font-mono">{currentTier}</span>
        </div>
      </div>

      {/* Tier bars */}
      <div className="space-y-1">
        {STAKE_TIERS.map((tier) => {
          const isActive = currentAmount >= tier.min
          return (
            <div key={tier.label} className="flex items-center gap-2 text-[10px]">
              <span className="text-[#00AA2A] w-14 truncate">{tier.label}</span>
              <div className="flex-1 h-1.5 bg-[#0D3B1E] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isActive ? 'bg-[#00FF41]' : 'bg-transparent'}`}
                  style={{ width: isActive ? '100%' : '0%' }}
                />
              </div>
              <span className="text-[#00AA2A] font-mono w-8 text-right">{tier.multiplier}x</span>
            </div>
          )
        })}
      </div>

      {/* Stake/Withdraw actions */}
      {currentAmount > 0 ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleWithdraw}
          disabled={isLoading}
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          {isLoading ? 'Withdrawing...' : 'Withdraw Stake'}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-black/40 border border-[#0D3B1E] rounded-sm px-2 py-1.5 text-xs text-[#00FF41] font-mono placeholder:text-[#1A3A2A] focus:border-[#00FF41]/50 focus:outline-none"
            />
            <Button
              size="sm"
              onClick={handleStake}
              disabled={isLoading || !amount}
              className="bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/20"
            >
              {isLoading ? '...' : 'Stake'}
            </Button>
          </div>
          {previewMultiplier && (
            <div className="text-[10px] text-[#00AA2A]">
              Preview: {previewMultiplier}x multiplier ({getStakeTierLabel(Number(amount))} tier)
            </div>
          )}
        </div>
      )}

      {error && <div className="text-red-400 text-xs">{error}</div>}
    </div>
  )
}
