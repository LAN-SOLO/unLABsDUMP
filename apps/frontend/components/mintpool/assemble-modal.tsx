'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface AssembleTarget {
  nft_id: string
  nft_name: string
  slices_owned: number
  slices_required: number
}

interface AssembleModalProps {
  target: AssembleTarget | null
  onClose: () => void
  onComplete: () => void
}

export function AssembleModal({ target, onClose, onComplete }: AssembleModalProps) {
  const [isAssembling, setIsAssembling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAssemble = useCallback(async () => {
    if (!target) return
    setIsAssembling(true)
    setError(null)

    try {
      const res = await fetch('/api/mintpool/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nft_id: target.nft_id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Assembly failed')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onComplete()
      }, 2000)
    } catch {
      setError('Assembly failed')
    } finally {
      setIsAssembling(false)
    }
  }, [target, onComplete])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={!!target} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#0D1117] border-[#0D3B1E] text-[#00FF41]">
        <DialogHeader>
          <DialogTitle className="text-[#00FF41] font-mono">Assemble NFT</DialogTitle>
          <DialogDescription className="text-[#00AA2A]">
            Combine all slices to claim this NFT to your inventory.
          </DialogDescription>
        </DialogHeader>

        {target && (
          <div className="space-y-4 py-2">
            <div className="bg-black/40 border border-[#0D3B1E] rounded-sm p-4 text-center">
              <div className="text-[#00FF41] font-mono font-bold text-lg mb-1">
                {target.nft_name}
              </div>
              <div className="text-[#00AA2A] text-sm">
                {target.slices_owned}/{target.slices_required} slices collected
              </div>
            </div>

            {success ? (
              <div
                className="text-center py-4 text-[#00FF41] font-mono font-bold text-lg animate-pulse"
                style={{ textShadow: '0 0 10px rgba(0,255,65,0.8)' }}
              >
                NFT ASSEMBLED SUCCESSFULLY!
              </div>
            ) : (
              <div className="text-[#00AA2A] text-xs">
                This will permanently consume your slices and add the NFT to your inventory.
              </div>
            )}

            {error && <div className="text-red-400 text-xs">{error}</div>}
          </div>
        )}

        <DialogFooter>
          {!success && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[#0D3B1E] text-[#00AA2A]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssemble}
                disabled={isAssembling}
                className="bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/20"
              >
                {isAssembling ? 'Assembling...' : 'Confirm Assembly'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
