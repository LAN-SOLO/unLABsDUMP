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
    <div className="rounded-sm border border-[#0D3B1E] bg-[#0D1117] p-5 space-y-4">
      <h3 className="text-lg font-semibold text-[#00FF41]">Confirm Transfer</h3>

      {/* NFT preview */}
      <div className="flex items-center gap-3 rounded-sm bg-[#0D3B1E]/20 p-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[#1A3A2A]">
          <img
            src={nftImage || '/placeholder-nft.png'}
            alt={nftName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-[#00FF41]">{nftName}</h4>
          {nftRarity && (
            <Badge variant="outline" className="mt-1 text-[10px] capitalize text-[#00CC33]">
              {nftRarity}
            </Badge>
          )}
        </div>
      </div>

      {/* From / To */}
      <div className="rounded-sm bg-[#0D3B1E]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-[#00AA2A]">From (You)</p>
            <p className="mt-1 font-mono text-xs text-[#00FF41]">
              {truncateAddress(senderAddress)}
            </p>
          </div>
          <ArrowRight className="mx-3 h-5 w-5 text-[#00FF41]" />
          <div className="text-center">
            <p className="text-xs text-[#00AA2A]">To</p>
            <p className="mt-1 font-mono text-xs text-[#00FF41]">
              {truncateAddress(recipientAddress)}
            </p>
          </div>
        </div>
      </div>

      {/* NFT details */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#00AA2A]">NFT</span>
          <span className="font-medium text-[#00FF41]">{nftName}</span>
        </div>
        {nftRarity && (
          <div className="flex justify-between text-sm">
            <span className="text-[#00AA2A]">Rarity</span>
            <span className="capitalize text-[#00FF41]">{nftRarity}</span>
          </div>
        )}
        {mintAddress && (
          <div className="flex justify-between text-sm">
            <span className="text-[#00AA2A]">Mint</span>
            <span className="font-mono text-xs text-[#00CC33]">{truncateAddress(mintAddress)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-[#00AA2A]">Recipient</span>
          <span className="font-mono text-xs text-[#00CC33]">
            {truncateAddress(recipientAddress)}
          </span>
        </div>
      </div>

      <Separator className="bg-[#1A3A2A]" />

      {/* Irreversibility warning */}
      <div className="flex items-start gap-2 rounded-sm border border-[#FF3333]/30 bg-[#FF3333]/10 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3333]" />
        <p className="text-xs text-[#FF3333]/80">
          This action is irreversible. Once confirmed, the NFT will be permanently transferred to
          the recipient. Please double-check the address before proceeding.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[#1A3A2A] text-[#00CC33] hover:text-[#00FF41]"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-[#FF3333] hover:bg-[#FF3333]/80 text-[#00FF41]"
        >
          <Send className="mr-1 h-4 w-4" />
          {loading ? 'Transferring...' : 'Confirm Transfer'}
        </Button>
      </div>
    </div>
  )
}
