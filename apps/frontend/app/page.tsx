'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const bootLines = [
  { text: '[OK] _unOS Terminal v2.0 initialized', delay: 0 },
  { text: '[OK] Solana RPC established', delay: 400 },
  { text: '[OK] NFT Registry: 12,400 assets loaded', delay: 800 },
  { text: '> SYSTEM READY', delay: 1200 },
]

export default function Home() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    bootLines.forEach((line, index) => {
      setTimeout(() => setVisibleLines(index + 1), line.delay)
    })
    setTimeout(() => setShowContent(true), 1800)
  }, [])

  return (
    <div className="min-h-screen bg-black text-[#00FF41]">
      {/* Boot Sequence */}
      <div className="px-4 pt-8 pb-4 max-w-4xl mx-auto font-mono text-sm">
        {bootLines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="animate-boot-line"
            style={{
              animationDelay: `${line.delay}ms`,
              color: line.text.startsWith('>') ? '#00FF41' : '#00AA2A',
              textShadow: line.text.startsWith('>') ? '0 0 5px #00FF41' : 'none',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Main Content - fades in after boot */}
      <div className="transition-opacity duration-1000" style={{ opacity: showContent ? 1 : 0 }}>
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center px-4 pt-16 pb-20 text-center overflow-hidden">
          {/* Background glow effects */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
            style={{
              background:
                'radial-gradient(circle, rgba(0,255,65,0.5) 0%, rgba(0,255,255,0.3) 50%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          <h1 className="relative text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl uppercase">
            <span
              className="inline-block text-[#00FF41]"
              style={{
                textShadow:
                  '0 0 10px #00FF41, 0 0 20px rgba(0,255,65,0.5), 0 0 40px rgba(0,255,65,0.3)',
              }}
            >
              _unOS NFT Platform
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-[#00AA2A] sm:text-xl">
            Collect, trade, and play with unique NFT card packs on the Solana blockchain. Open
            packs, discover rare cards, and compete in the _unOS gaming ecosystem.
          </p>

          {/* CTA Buttons - terminal command style */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/browse"
              className="glow-button inline-flex items-center justify-center rounded-sm bg-[#00FF41] px-8 py-3.5 text-base font-bold text-black uppercase tracking-widest transition-all hover:bg-[#00CC33] hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]"
            >
              [Browse_NFTs]
            </Link>
            <Link
              href="/packages"
              className="glow-button inline-flex items-center justify-center rounded-sm border border-[#00FFFF]/40 bg-[#00FFFF]/10 px-8 py-3.5 text-base font-bold text-[#00FFFF] uppercase tracking-widest transition-all hover:bg-[#00FFFF]/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              [Open_Packs]
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-sm border border-[#0D3B1E] bg-[#0D1117] px-8 py-3.5 text-base font-bold text-[#00FF41] uppercase tracking-widest transition-all hover:border-[#00FF41]/30 hover:bg-[#0D1117]/80"
            >
              [Marketplace]
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Collect Card */}
            <div className="group relative rounded-sm border border-[#0D3B1E] bg-[#0D1117]/60 p-8 transition-all hover:border-[#00FF41]/30 hover:bg-[#0D1117]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-[#0D3B1E]/30">
                <svg
                  className="h-6 w-6 text-[#00FF41]"
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
              <h3 className="text-xl font-bold text-[#00FF41] uppercase tracking-wider">Collect</h3>
              <p className="mt-2 text-[#00AA2A]">
                Purchase and open NFT card packs to build your collection. Discover common, rare,
                and legendary cards with unique art and abilities.
              </p>
            </div>

            {/* Trade Card */}
            <div className="group relative rounded-sm border border-[#0D3B1E] bg-[#0D1117]/60 p-8 transition-all hover:border-[#00FFFF]/30 hover:bg-[#0D1117]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-[#00FFFF]/10">
                <svg
                  className="h-6 w-6 text-[#00FFFF]"
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
              <h3 className="text-xl font-bold text-[#00FF41] uppercase tracking-wider">Trade</h3>
              <p className="mt-2 text-[#00AA2A]">
                List your cards on the marketplace, make offers, and trade with other players. The
                peer-to-peer marketplace runs entirely on Solana.
              </p>
            </div>

            {/* Play Card */}
            <div className="group relative rounded-sm border border-[#0D3B1E] bg-[#0D1117]/60 p-8 transition-all hover:border-[#00FF41]/30 hover:bg-[#0D1117]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-[#0D3B1E]/30">
                <svg
                  className="h-6 w-6 text-[#00FF41]"
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
              <h3 className="text-xl font-bold text-[#00FF41] uppercase tracking-wider">Play</h3>
              <p className="mt-2 text-[#00AA2A]">
                Use your NFT cards in the _unOS game. Battle other players, complete challenges, and
                earn rewards through game integration.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t border-[#0D3B1E]/60 bg-black py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2
              className="mb-12 text-center text-3xl font-bold text-[#00FF41] uppercase tracking-widest"
              style={{ textShadow: '0 0 10px #00FF41, 0 0 20px rgba(0,255,65,0.3)' }}
            >
              &gt; Platform Stats
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="led-online" />
                </div>
                <p
                  className="text-4xl font-bold text-[#00FF41]"
                  style={{ textShadow: '0 0 5px #00FF41' }}
                >
                  12,400+
                </p>
                <p className="mt-2 text-sm text-[#00AA2A] uppercase tracking-widest">Total NFTs</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="led-online" />
                </div>
                <p
                  className="text-4xl font-bold text-[#00FFFF]"
                  style={{ textShadow: '0 0 5px #00FFFF' }}
                >
                  3,200+
                </p>
                <p className="mt-2 text-sm text-[#00AA2A] uppercase tracking-widest">
                  Active Traders
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="led-online" />
                </div>
                <p
                  className="text-4xl font-bold text-[#00FF41]"
                  style={{ textShadow: '0 0 5px #00FF41' }}
                >
                  8,750+
                </p>
                <p className="mt-2 text-sm text-[#00AA2A] uppercase tracking-widest">
                  Packs Opened
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#0D3B1E]/60 py-8 text-center text-sm text-[#1A6B35] font-mono">
          <p>&copy; {new Date().getFullYear()} _unOS. Built on Solana.</p>
        </footer>
      </div>
    </div>
  )
}
