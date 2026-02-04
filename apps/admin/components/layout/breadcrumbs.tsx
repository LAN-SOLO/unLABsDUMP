'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  nfts: 'NFTs',
  packages: 'Packages',
  deliveries: 'Deliveries',
  burns: 'Burns',
  audit: 'Audit Logs',
  alerts: 'Security Alerts',
  reports: 'Reports',
  settings: 'Settings',
  new: 'Create',
  edit: 'Edit',
  import: 'Import',
}

export function Breadcrumbs() {
  const pathname = usePathname()

  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1

    // Check if segment is a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
    const label = isUuid
      ? `${segment.slice(0, 8)}...`
      : ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1 text-sm mb-4">
      <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
        <Home className="h-4 w-4" />
      </Link>

      {crumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-slate-600" />
          {crumb.isLast ? (
            <span className="text-slate-300 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
