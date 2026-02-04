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
      <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
        <XCircle className="size-10 text-red-400" />
      </div>

      {/* Error text */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Purchase Failed</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Something went wrong with your purchase. Please try again.
        </p>
      </div>

      {/* Error details */}
      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-sm text-red-400 font-mono break-all">{error}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button onClick={onRetry} className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
          <RefreshCw className="size-4" />
          Try Again
        </Button>
        <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white gap-2">
          <ArrowLeft className="size-4" />
          Go Back
        </Button>
      </div>
    </div>
  )
}
