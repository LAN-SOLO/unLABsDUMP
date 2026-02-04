import Link from 'next/link'

const footerLinks = [
  { href: '/docs', label: 'Docs' },
  { href: '/support', label: 'Support' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
]

const socialLinks = [
  { href: 'https://twitter.com/unstablelabs', label: 'Twitter' },
  { href: 'https://discord.gg/unstablelabs', label: 'Discord' },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Left: brand + links */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <span className="text-gradient font-bold text-sm">UnstableLabs</span>
            <nav className="flex flex-wrap items-center gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-slate-400 transition-colors hover:text-slate-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 transition-colors hover:text-slate-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-slate-800/50 pt-4 text-center">
          <p className="text-xs text-slate-500">&copy; 2026 UnstableLabs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
