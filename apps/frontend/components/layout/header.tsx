'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/auth-provider'
import { useRealtime } from '@/components/providers/realtime-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WalletButton } from '@/components/wallet/wallet-button'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { MobileNav } from './mobile-nav'

const publicLinks = [
  { href: '/browse', label: 'Browse' },
  { href: '/packages', label: 'Packages' },
  { href: '/marketplace', label: 'Marketplace' },
]

const authenticatedLinks = [
  { href: '/mintpool', label: 'Mint Pool' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/history', label: 'History' },
  { href: '/profile', label: 'Profile' },
]

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const { unreadCount } = useRealtime()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const allLinks = isAuthenticated ? [...publicLinks, ...authenticatedLinks] : publicLinks

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
        {/* Terminal top border */}
        <div className="flex items-center text-[#00FF41]/20 text-[10px] select-none overflow-hidden font-mono leading-none">
          <span>╔</span>
          <span className="flex-1 overflow-hidden whitespace-nowrap">{'═'.repeat(300)}</span>
          <span>╗</span>
        </div>
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8 border-b border-[#0D3B1E]">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden text-[#00AA2A] hover:text-[#00FF41]"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Traffic light dots + Logo */}
          <Link
            href="/"
            className="mr-4 sm:mr-6 flex items-center gap-2 sm:gap-3 font-bold text-lg"
          >
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="led-offline" />
              <span className="led-standby" />
              <span className="led-online" />
            </div>
            <Image
              src="/logo.gif"
              alt="_unstablecoins logo"
              width={32}
              height={32}
              unoptimized
              className="rounded-sm"
            />
            <span
              className="hidden min-[480px]:inline text-[#00FF41] font-bold"
              style={{ textShadow: '0 0 5px #00FF41, 0 0 10px rgba(0,255,65,0.5)' }}
            >
              _unstablecoins
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {allLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium transition-colors rounded-sm uppercase tracking-wider',
                    isActive
                      ? 'text-[#00FF41]'
                      : 'text-[#00AA2A] hover:text-[#00FF41] hover:bg-[#0D3B1E]/50'
                  )}
                  style={isActive ? { textShadow: '0 0 5px #00FF41' } : undefined}
                >
                  {isActive && <span className="mr-1">&gt;</span>}
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-[#00FF41]"
                      style={{ boxShadow: '0 0 4px #00FF41' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Notification bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-[#00AA2A] hover:text-[#00FF41]"
                onClick={() => setNotificationsOpen((prev) => !prev)}
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center p-0 text-[10px] bg-[#00FF41] text-black border-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">
                  Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}
                </span>
              </Button>
              {notificationsOpen && (
                <NotificationDropdown onClose={() => setNotificationsOpen(false)} />
              )}
            </div>

            {/* Wallet button */}
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Mobile nav sheet */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  )
}
