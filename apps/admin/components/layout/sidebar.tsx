'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  Image,
  Truck,
  Flame,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  className?: string
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'NFTs',
    href: '/nfts',
    icon: Image,
  },
  {
    title: 'Packages',
    href: '/packages',
    icon: Package,
  },
  {
    title: 'Deliveries',
    href: '/deliveries',
    icon: Truck,
  },
  {
    title: 'Burns',
    href: '/burns',
    icon: Flame,
  },
  {
    title: 'Audit Logs',
    href: '/audit',
    icon: FileText,
  },
  {
    title: 'Security Alerts',
    href: '/alerts',
    icon: Shield,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      // Silently fail
    }
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-[#0D3B1E]">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="led-offline" />
            <span className="led-standby" />
            <span className="led-online" />
          </div>
          <div>
            <h1
              className="text-lg font-bold text-[#00FF41] uppercase tracking-wider"
              style={{ textShadow: '0 0 5px #00FF41' }}
            >
              _unOS
            </h1>
            <p className="text-[10px] text-[#1A6B35] font-mono uppercase tracking-widest">
              Terminal
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors uppercase tracking-wider',
                isActive
                  ? 'bg-[#0D3B1E]/40 text-[#00FF41] border-l-2 border-[#00FF41]'
                  : 'text-[#00AA2A] hover:text-[#00FF41] hover:bg-[#0D3B1E]/20'
              )}
              style={isActive ? { textShadow: '0 0 5px #00FF41' } : undefined}
            >
              {isActive && <span className="text-[#00FF41]">&gt;</span>}
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#0D3B1E]">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-[#00AA2A] hover:text-[#00FF41] hover:bg-[#0D3B1E]/20"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0D1117] border border-[#0D3B1E] rounded-sm text-[#00FF41]"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#0A0E14] border-r border-[#0D3B1E]',
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0E14] border-r border-[#0D3B1E] transform transition-transform duration-200 ease-in-out flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
