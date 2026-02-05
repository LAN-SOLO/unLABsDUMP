'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const bootLines = [
  { text: '[OK] _unstablecoins Terminal v2.0 initialized', delay: 0 },
  { text: '[OK] Solana RPC established', delay: 400 },
  { text: '[OK] _unITM Registry: 12,400 assets loaded', delay: 800 },
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
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full opacity-15 blur-[120px]"
            style={{
              background:
                'radial-gradient(circle, rgba(0,255,65,0.5) 0%, rgba(0,255,255,0.3) 50%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          <div
            className="relative mb-10 border-2 border-[#00FF41]/60 rounded-sm p-1 bg-black/80"
            style={{
              boxShadow:
                '0 0 15px rgba(0,255,65,0.3), 0 0 40px rgba(0,255,65,0.15), inset 0 0 15px rgba(0,255,65,0.1)',
            }}
          >
            <Image
              src="/logo.gif"
              alt="_unstablecoins logo"
              width={256}
              height={256}
              unoptimized
              className="relative block w-40 h-40 sm:w-64 sm:h-64"
            />
          </div>

          <h1 className="relative text-3xl sm:text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            <span
              className="inline-block text-[#00FF41]"
              style={{
                textShadow:
                  '0 0 10px #00FF41, 0 0 20px rgba(0,255,65,0.5), 0 0 40px rgba(0,255,65,0.3)',
              }}
            >
              _unstablecoins
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-[#00AA2A] sm:text-xl">
            Collect, trade, and play with unique _unITM card packs on the Solana blockchain. Open
            packs, discover rare cards, and compete in the _unstablecoins gaming ecosystem.
          </p>

          {/* CTA Buttons - terminal command style */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/browse"
              className="glow-button inline-flex items-center justify-center rounded-sm bg-[#00FF41] px-8 py-3.5 text-base font-bold text-black uppercase tracking-widest transition-all hover:bg-[#00CC33] hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]"
            >
              [Browse_unITM]
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* ═══ COLLECT Terminal ═══ */}
            <div
              className="group relative font-mono bg-black/80 overflow-hidden transition-all hover:scale-[1.02]"
              style={{
                boxShadow: '0 0 1px #00FF41, inset 0 0 30px rgba(0,255,65,0.03)',
              }}
            >
              {/* Top border */}
              <div className="flex items-center text-[#00FF41]/40 text-xs select-none overflow-hidden">
                <span>╔</span>
                <span className="flex-1 overflow-hidden whitespace-nowrap">{'═'.repeat(60)}</span>
                <span>╗</span>
              </div>
              {/* Title bar */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#00FF41]/20">
                <div className="flex items-center gap-2">
                  <span className="led-online" />
                  <span
                    className="text-xs font-bold text-[#00FF41] uppercase tracking-widest"
                    style={{ textShadow: '0 0 8px rgba(0,255,65,0.6)' }}
                  >
                    COLLECT.exe
                  </span>
                </div>
                <span className="text-[10px] text-[#00FF41]/30">[PID 001]</span>
              </div>
              {/* Content */}
              <div className="px-4 py-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#00FF41]/50">&gt;</span>
                  <h3
                    className="text-xl font-bold text-[#00FF41] uppercase tracking-[0.2em]"
                    style={{ textShadow: '0 0 10px #00FF41, 0 0 30px rgba(0,255,65,0.3)' }}
                  >
                    Collect
                  </h3>
                </div>
                <div className="ml-5 border-l border-dashed border-[#00FF41]/20 pl-4">
                  <p className="text-sm text-[#00AA2A] leading-relaxed">
                    Purchase and open _unITM card packs to build your collection. Discover common,
                    rare, and legendary cards with unique art and abilities.
                  </p>
                </div>
              </div>
              {/* Status bar */}
              <div className="flex items-center justify-between px-3 py-1 border-t border-[#00FF41]/20 text-[10px] text-[#00FF41]/30">
                <span>MEM: 64K</span>
                <span className="inline-flex items-center gap-1">
                  <span className="animate-cursor-blink text-[#00FF41]">█</span>
                  READY
                </span>
              </div>
              {/* Bottom border */}
              <div className="flex items-center text-[#00FF41]/40 text-xs select-none overflow-hidden">
                <span>╚</span>
                <span className="flex-1 overflow-hidden whitespace-nowrap">{'═'.repeat(60)}</span>
                <span>╝</span>
              </div>
            </div>

            {/* ═══ TRADE Terminal ═══ */}
            <div
              className="group relative font-mono bg-black/80 overflow-hidden transition-all hover:scale-[1.02]"
              style={{
                boxShadow: '0 0 1px #00FFFF, inset 0 0 30px rgba(0,255,255,0.03)',
              }}
            >
              {/* Top border */}
              <div className="flex items-center text-[#00FFFF]/40 text-xs select-none overflow-hidden">
                <span>┌</span>
                <span className="flex-1 overflow-hidden whitespace-nowrap">{'─'.repeat(60)}</span>
                <span>┐</span>
              </div>
              {/* Title bar */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#00FFFF]/20">
                <div className="flex items-center gap-2">
                  <span
                    className="led-online"
                    style={{
                      background: '#00FFFF',
                      boxShadow: '0 0 4px #00FFFF, 0 0 8px rgba(0,255,255,0.5)',
                    }}
                  />
                  <span
                    className="text-xs font-bold text-[#00FFFF] uppercase tracking-widest"
                    style={{ textShadow: '0 0 8px rgba(0,255,255,0.6)' }}
                  >
                    TRADE.sys
                  </span>
                </div>
                <span className="text-[10px] text-[#00FFFF]/30">[PID 002]</span>
              </div>
              {/* Content */}
              <div className="px-4 py-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#00FFFF]/50">⇄</span>
                  <h3
                    className="text-xl font-bold text-[#00FFFF] uppercase tracking-[0.2em]"
                    style={{ textShadow: '0 0 10px #00FFFF, 0 0 30px rgba(0,255,255,0.3)' }}
                  >
                    Trade
                  </h3>
                </div>
                <div className="ml-5 border-l border-dashed border-[#00FFFF]/20 pl-4">
                  <p className="text-sm text-[#00AA2A] leading-relaxed">
                    List your cards on the marketplace, make offers, and trade with other players.
                    The peer-to-peer marketplace runs entirely on Solana.
                  </p>
                </div>
              </div>
              {/* Status bar */}
              <div className="flex items-center justify-between px-3 py-1 border-t border-[#00FFFF]/20 text-[10px] text-[#00FFFF]/30">
                <span>NET: SOLANA</span>
                <span className="inline-flex items-center gap-1">
                  <span className="animate-cursor-blink text-[#00FFFF]">█</span>
                  LISTENING
                </span>
              </div>
              {/* Bottom border */}
              <div className="flex items-center text-[#00FFFF]/40 text-xs select-none overflow-hidden">
                <span>└</span>
                <span className="flex-1 overflow-hidden whitespace-nowrap">{'─'.repeat(60)}</span>
                <span>┘</span>
              </div>
            </div>

            {/* ═══ PLAY Terminal ═══ */}
            <div
              className="group relative font-mono bg-black/80 overflow-hidden transition-all hover:scale-[1.02]"
              style={{
                boxShadow: '0 0 1px #00FF41, inset 0 0 30px rgba(0,255,65,0.03)',
              }}
            >
              {/* Top border */}
              <div className="flex items-center text-[#00FF41]/40 text-xs select-none overflow-hidden">
                <span>╓</span>
                <span className="flex-1 overflow-hidden whitespace-nowrap">{'─'.repeat(60)}</span>
                <span>╖</span>
              </div>
              {/* Title bar */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#00FF41]/20">
                <div className="flex items-center gap-2">
                  <span className="text-[#00FF41] text-xs">▶</span>
                  <span
                    className="text-xs font-bold text-[#00FF41] uppercase tracking-widest"
                    style={{ textShadow: '0 0 8px rgba(0,255,65,0.6)' }}
                  >
                    PLAY.run
                  </span>
                </div>
                <span className="text-[10px] text-[#00FF41]/30">[PID 003]</span>
              </div>
              {/* Content */}
              <div className="px-4 py-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#00FF41]/50">▸</span>
                  <h3
                    className="text-xl font-bold text-[#00FF41] uppercase tracking-[0.2em]"
                    style={{ textShadow: '0 0 10px #00FF41, 0 0 30px rgba(0,255,65,0.3)' }}
                  >
                    Play
                  </h3>
                </div>
                <div className="ml-5 border-l border-dashed border-[#00FF41]/20 pl-4">
                  <p className="text-sm text-[#00AA2A] leading-relaxed">
                    Use your _unITM cards in the _unstablecoins game. Battle other players, complete
                    challenges, and earn rewards through game integration.
                  </p>
                </div>
              </div>
              {/* Status bar */}
              <div className="flex items-center justify-between px-3 py-1 border-t border-[#00FF41]/20 text-[10px] text-[#00FF41]/30">
                <span>GPU: LOADED</span>
                <span className="inline-flex items-center gap-1">
                  <span className="animate-cursor-blink text-[#00FF41]">█</span>
                  STANDBY
                </span>
              </div>
              {/* Bottom border */}
              <div className="flex items-center text-[#00FF41]/40 text-xs select-none overflow-hidden">
                <span>╙</span>
                <span className="flex-1 overflow-hidden whitespace-nowrap">{'─'.repeat(60)}</span>
                <span>╜</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#0D3B1E]/60 py-8 text-center text-sm text-[#1A6B35] font-mono">
          <p>&copy; {new Date().getFullYear()} _unstablecoins. Built on Solana.</p>
        </footer>
      </div>
    </div>
  )
}
