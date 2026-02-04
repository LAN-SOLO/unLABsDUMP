'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, ArrowRight, Send } from 'lucide-react'

interface TransferConfirmationProps {
  nftName: string
  nftImage: string | null
  nftRarity?: string
  mintAddress?: string
  senderAddress: string
  recipientAddress: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`
}

export function TransferConfirmation({
  nftName,
  nftImage,
  nftRarity,
  mintAddress,
  senderAddress,
  recipientAddress,
  onConfirm,
  onCancel,
  loading = false,
}: TransferConfirmationProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-4">
      <h3 className="text-lg font-semibold text-white">Confirm Transfer</h3>

      {/* NFT preview */}
      <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-700">
          <img
            src={nftImage || '/placeholder-nft.png'}
            alt={nftName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-white">{nftName}</h4>
          {nftRarity && (
            <Badge variant="outline" className="mt-1 text-[10px] capitalize text-slate-300">
              {nftRarity}
            </Badge>
          )}
        </div>
      </div>

      {/* From / To */}
      <div className="rounded-lg bg-slate-800/50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-slate-400">From (You)</p>
            <p className="mt-1 font-mono text-xs text-slate-200">
              {truncateAddress(senderAddress)}
            </p>
          </div>
          <ArrowRight className="mx-3 h-5 w-5 text-purple-400" />
          <div className="text-center">
            <p className="text-xs text-slate-400">To</p>
            <p className="mt-1 font-mono text-xs text-slate-200">
              {truncateAddress(recipientAddress)}
            </p>
          </div>
        </div>
      </div>

      {/* NFT details */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">NFT</span>
          <span className="font-medium text-white">{nftName}</span>
        </div>
        {nftRarity && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Rarity</span>
            <span className="capitalize text-slate-200">{nftRarity}</span>
          </div>
        )}
        {mintAddress && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Mint</span>
            <span className="font-mono text-xs text-slate-300">{truncateAddress(mintAddress)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Recipient</span>
          <span className="font-mono text-xs text-slate-300">
            {truncateAddress(recipientAddress)}
          </span>
        </div>
      </div>

      <Separator className="bg-slate-700" />

      {/* Irreversibility warning */}
      <div className="flex items-start gap-2 rounded-lg border border-red-800/50 bg-red-950/30 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <p className="text-xs text-red-300/80">
          This action is irreversible. Once confirmed, the NFT will be permanently transferred to
          the recipient. Please double-check the address before proceeding.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-slate-700 text-slate-300 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          <Send className="mr-1 h-4 w-4" />
          {loading ? 'Transferring...' : 'Confirm Transfer'}
        </Button>
      </div>
    </div>
  )
}
