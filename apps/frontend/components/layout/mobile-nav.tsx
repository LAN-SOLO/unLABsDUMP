'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/auth-provider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { WalletStatus } from '@/components/wallet/wallet-status'
import { WalletButton } from '@/components/wallet/wallet-button'

const publicLinks = [
  { href: '/browse', label: 'Browse' },
  { href: '/packages', label: 'Packages' },
  { href: '/marketplace', label: 'Marketplace' },
]

const authenticatedLinks = [
  { href: '/mintpool', label: 'Mint Pool' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/history', label: 'History' },
]

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 bg-black border-[#0D3B1E]" showCloseButton={false}>
        <SheetHeader className="border-b border-[#0D3B1E]">
          <div className="flex items-center justify-between">
            <SheetTitle
              className="flex items-center gap-2 text-[#00FF41] font-bold text-lg"
              style={{ textShadow: '0 0 5px #00FF41' }}
            >
              <Image
                src="/logo.gif"
                alt="_unstablecoins logo"
                width={32}
                height={32}
                unoptimized
                className="rounded-sm"
              />
              _unstablecoins
            </SheetTitle>
            <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
              <X className="size-4 text-[#00FF41]" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4 py-4">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center rounded-sm px-3 py-2.5 text-sm font-medium transition-colors uppercase tracking-wider',
                pathname === link.href
                  ? 'bg-[#0D3B1E]/30 text-[#00FF41]'
                  : 'text-[#00AA2A] hover:bg-[#0D3B1E]/20 hover:text-[#00FF41]'
              )}
            >
              {pathname === link.href && <span className="mr-1">&gt;</span>}
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <Separator className="my-2 bg-[#0D3B1E]" />
              {authenticatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'flex items-center rounded-sm px-3 py-2.5 text-sm font-medium transition-colors uppercase tracking-wider',
                    pathname === link.href
                      ? 'bg-[#0D3B1E]/30 text-[#00FF41]'
                      : 'text-[#00AA2A] hover:bg-[#0D3B1E]/20 hover:text-[#00FF41]'
                  )}
                >
                  {pathname === link.href && <span className="mr-1">&gt;</span>}
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-[#0D3B1E] p-4 flex flex-col gap-3">
          <WalletStatus />
          <WalletButton />
        </div>
      </SheetContent>
    </Sheet>
  )
}
