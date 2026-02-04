'use client'

import { useState } from 'react'
import Link from 'next/link'
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
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Logo */}
          <Link href="/" className="mr-6 flex items-center gap-2 font-bold text-lg">
            <span className="text-gradient">UnstableLabs</span>
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
                    'relative px-3 py-2 text-sm font-medium transition-colors rounded-md',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-purple-500" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-400 hover:text-slate-200"
                onClick={() => setNotificationsOpen((prev) => !prev)}
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center p-0 text-[10px] bg-purple-600 text-white border-0">
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
