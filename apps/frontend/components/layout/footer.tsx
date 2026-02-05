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
    <footer className="border-t border-[#0D3B1E] bg-black">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Status bar style */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Left: system status + links */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="led-online" />
              <span className="text-[#00FF41] uppercase tracking-wider">[Network: Mainnet]</span>
              <span className="text-[#1A6B35]">|</span>
              <span className="text-[#00AA2A] uppercase tracking-wider">[Status: Online]</span>
            </div>
            <nav className="flex flex-wrap items-center gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-[#00AA2A] transition-colors hover:text-[#00FF41] uppercase tracking-wider"
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
                className="text-xs text-[#00AA2A] transition-colors hover:text-[#00FF41] uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* System metrics bar */}
        <div className="mt-4 border-t border-[#0D3B1E]/50 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[10px] text-[#1A6B35] font-mono uppercase tracking-widest">
            <span>MEM: 64.2MB</span>
            <span>CPU: 0.3%</span>
            <span>UPTIME: 99.9%</span>
          </div>
          <p className="text-[10px] text-[#1A6B35] font-mono uppercase tracking-widest">
            &copy; 2026 _unstablecoins. Built on Solana.
          </p>
        </div>
      </div>
    </footer>
  )
}
