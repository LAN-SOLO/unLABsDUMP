'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SliceProgressBar } from './slice-progress-bar'
import { AssembleModal } from './assemble-modal'

interface SliceGroup {
  nft_id: string
  nft_name: string
  nft_image: string | null
  slices_owned: number
  slices_required: number
  can_assemble: boolean
  slice_ids: string[]
}

interface SliceInventoryProps {
  onAssemblyComplete: () => void
}

export function SliceInventory({ onAssemblyComplete }: SliceInventoryProps) {
  const [slices, setSlices] = useState<SliceGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [assembleTarget, setAssembleTarget] = useState<SliceGroup | null>(null)

  const fetchSlices = useCallback(async () => {
    try {
      const res = await fetch('/api/mintpool/slices')
      if (res.ok) {
        const data = await res.json()
        setSlices(data.slices || [])
      }
    } catch {
      // Handle silently
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlices()
  }, [fetchSlices])

  const handleAssembleComplete = useCallback(() => {
    setAssembleTarget(null)
    fetchSlices()
    onAssemblyComplete()
  }, [fetchSlices, onAssemblyComplete])

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-[#00FF41] text-xs font-bold uppercase tracking-wider">
        _unSLC Inventory
      </h4>

      {isLoading ? (
        <div className="text-[#1A3A2A] text-xs font-mono">Loading _unSLC...</div>
      ) : slices.length === 0 ? (
        <div className="text-[#1A3A2A] text-xs font-mono py-4 text-center">
          No _unSLC yet. Start mining to earn _unSLC!
        </div>
      ) : (
        <div className="space-y-3">
          {slices.map((group) => (
            <div
              key={group.nft_id}
              className="bg-black/40 border border-[#0D3B1E] rounded-sm p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#00FF41] text-xs font-mono truncate">{group.nft_name}</span>
                {group.can_assemble && (
                  <Button
                    size="sm"
                    onClick={() => setAssembleTarget(group)}
                    className="bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/20 text-[10px] h-6 px-2"
                  >
                    Assemble
                  </Button>
                )}
              </div>
              <SliceProgressBar owned={group.slices_owned} required={group.slices_required} />
            </div>
          ))}
        </div>
      )}

      <AssembleModal
        target={assembleTarget}
        onClose={() => setAssembleTarget(null)}
        onComplete={handleAssembleComplete}
      />
    </div>
  )
}
