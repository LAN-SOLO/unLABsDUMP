'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface WalletOption {
  name: string
  icon: string
  detected: boolean
}

const WALLETS: WalletOption[] = [
  { name: 'Phantom', icon: '/wallets/phantom.svg', detected: false },
  { name: 'Solflare', icon: '/wallets/solflare.svg', detected: false },
  { name: 'Backpack', icon: '/wallets/backpack.svg', detected: false },
  { name: 'Sollet', icon: '/wallets/sollet.svg', detected: false },
]

function getDetectedWallets(): WalletOption[] {
  if (typeof window === 'undefined') return WALLETS

  const win = window as unknown as Record<string, unknown>

  return WALLETS.map((wallet) => {
    let detected = false
    if (wallet.name === 'Phantom' && win.phantom) {
      detected = true
    } else if (wallet.name === 'Solflare' && win.solflare) {
      detected = true
    } else if (wallet.name === 'Backpack' && win.backpack) {
      detected = true
    }
    return { ...wallet, detected }
  })
}

interface WalletModalProps {
  children?: React.ReactNode
  onSelectWallet?: (walletName: string) => void
}

export function WalletModal({ children, onSelectWallet }: WalletModalProps) {
  const [open, setOpen] = useState(false)
  const [wallets, setWallets] = useState<WalletOption[]>(WALLETS)

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setWallets(getDetectedWallets())
    }
    setOpen(isOpen)
  }

  const handleConnect = (walletName: string) => {
    onSelectWallet?.(walletName)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="bg-[#00FF41] text-black hover:bg-[#00CC33]">Connect Wallet</Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#0D1117] border-[#0D3B1E] text-[#00FF41] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#00FF41] text-lg font-bold">Connect Wallet</DialogTitle>
          <DialogDescription className="text-[#00AA2A]">
            Select a wallet to connect to UnstableLabs.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {wallets.map((wallet) => (
            <div
              key={wallet.name}
              className="flex items-center justify-between rounded-sm border border-[#0D3B1E] bg-[#0D3B1E]/20 px-4 py-3 transition-colors hover:border-[#1A3A2A] hover:bg-[#0D3B1E]/20"
            >
              <div className="flex items-center gap-3">
                {/* Wallet icon placeholder */}
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#1A3A2A]/60">
                  <span className="text-lg font-bold text-[#00CC33]">{wallet.name.charAt(0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#00FF41]">{wallet.name}</span>
                  {wallet.detected && (
                    <Badge
                      variant="outline"
                      className="border-[#00FFFF]/30 bg-[#00FFFF]/10 text-[#00FFFF] text-xs px-1.5 py-0"
                    >
                      Detected
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleConnect(wallet.name)}
                className="bg-[#00FF41] text-black hover:bg-[#00CC33] text-sm px-4"
              >
                Connect
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-[#1A6B35]">
          By connecting, you agree to the Terms of Service and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  )
}
