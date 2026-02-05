'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ROUTE_LABELS: Record<string, string> = {
  nfts: 'nfts',
  packages: 'packages',
  deliveries: 'deliveries',
  burns: 'burns',
  audit: 'audit',
  alerts: 'alerts',
  reports: 'reports',
  settings: 'settings',
  new: 'new',
  edit: 'edit',
  import: 'import',
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
    const label = isUuid ? `${segment.slice(0, 8)}` : ROUTE_LABELS[segment] || segment

    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1 text-sm mb-4 font-mono">
      <Link href="/" className="text-[#1A6B35] hover:text-[#00FF41] transition-colors">
        ~
      </Link>

      {crumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <span className="text-[#1A6B35]">/</span>
          {crumb.isLast ? (
            <span className="text-[#00FF41] font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[#1A6B35] hover:text-[#00FF41] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
      <span className="text-[#00FF41] animate-cursor-blink ml-1">_</span>
    </nav>
  )
}
