import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        aria-hidden="true"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center overflow-hidden">
        {/* Background glow effects */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(6,182,212,0.3) 50%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <h1
          className="relative text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          <span
            className="inline-block bg-clip-text text-transparent animate-pulse"
            style={{
              backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #8B5CF6 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 4s ease infinite',
            }}
          >
            UnstableLabs NFT Platform
          </span>
        </h1>

        <p
          className="mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          Collect, trade, and play with unique NFT card packs on the Solana blockchain. Open packs,
          discover rare cards, and compete in the UnstableLabs gaming ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Link
            href="/browse"
            className="glow-button inline-flex items-center justify-center rounded-lg bg-purple-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            Browse NFTs
          </Link>
          <Link
            href="/packages"
            className="glow-button inline-flex items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-8 py-3.5 text-base font-semibold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Open Packs
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-8 py-3.5 text-base font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800"
          >
            Marketplace
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Collect Card */}
          <div className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-8 transition-all hover:border-purple-500/30 hover:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20">
              <svg
                className="h-6 w-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Collect
            </h3>
            <p
              className="mt-2 text-slate-400"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              Purchase and open NFT card packs to build your collection. Discover common, rare, and
              legendary cards with unique art and abilities.
            </p>
          </div>

          {/* Trade Card */}
          <div className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-8 transition-all hover:border-cyan-500/30 hover:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
              <svg
                className="h-6 w-6 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Trade
            </h3>
            <p
              className="mt-2 text-slate-400"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              List your cards on the marketplace, make offers, and trade with other players. The
              peer-to-peer marketplace runs entirely on Solana.
            </p>
          </div>

          {/* Play Card */}
          <div className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-8 transition-all hover:border-purple-500/30 hover:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/20">
              <svg
                className="h-6 w-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              Play
            </h3>
            <p
              className="mt-2 text-slate-400"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              Use your NFT cards in the UnstableLabs game. Battle other players, complete
              challenges, and earn rewards through game integration.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-slate-800/60 bg-slate-950 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2
            className="mb-12 text-center text-3xl font-bold text-white"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Platform Stats
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-4xl font-bold text-gradient bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                12,400+
              </p>
              <p className="mt-2 text-sm text-slate-400 uppercase tracking-wider">Total NFTs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gradient bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                3,200+
              </p>
              <p className="mt-2 text-sm text-slate-400 uppercase tracking-wider">Active Traders</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gradient bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                8,750+
              </p>
              <p className="mt-2 text-sm text-slate-400 uppercase tracking-wider">Packs Opened</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} UnstableLabs. Built on Solana.</p>
      </footer>

      {/* Gradient animation keyframes */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
