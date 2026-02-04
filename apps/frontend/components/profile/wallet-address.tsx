'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink } from 'lucide-react'

interface WalletAddressProps {
  address: string
  showFull?: boolean
}

export function WalletAddress({ address, showFull = false }: WalletAddressProps) {
  const [copied, setCopied] = useState(false)

  const displayAddress = showFull ? address : `${address.slice(0, 6)}...${address.slice(-6)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerUrl = `https://explorer.solana.com/address/${address}`

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-slate-200">{displayAddress}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        className="text-slate-400 hover:text-white hover:bg-slate-800"
        title="Copy address"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 hover:text-cyan-400 transition-colors"
        title="View on Solana Explorer"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
