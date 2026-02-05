'use client'

import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PurchaseErrorProps {
  error: string
  onRetry: () => void
  onClose: () => void
}

export function PurchaseError({ error, onRetry, onClose }: PurchaseErrorProps) {
  return (
    <div className="text-center space-y-6 py-4">
      {/* Error icon */}
      <div className="mx-auto w-20 h-20 bg-[#FF3333]/20 rounded-full flex items-center justify-center">
        <XCircle className="size-10 text-[#FF3333]" />
      </div>

      {/* Error text */}
      <div>
        <h3 className="text-xl font-bold text-[#00FF41] mb-2">Purchase Failed</h3>
        <p className="text-[#00AA2A] text-sm max-w-sm mx-auto">
          Something went wrong with your purchase. Please try again.
        </p>
      </div>

      {/* Error details */}
      <div className="p-3 rounded-sm bg-[#FF3333]/10 border border-[#FF3333]/20">
        <p className="text-sm text-[#FF3333] font-mono break-all">{error}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={onRetry}
          className="bg-[#00FF41] text-black hover:bg-[#00CC33] text-black gap-2"
        >
          <RefreshCw className="size-4" />
          Try Again
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-[#00AA2A] hover:text-[#00FF41] gap-2"
        >
          <ArrowLeft className="size-4" />
          Go Back
        </Button>
      </div>
    </div>
  )
}
