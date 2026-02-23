'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WalletLogin } from '@/components/auth/wallet-login'
import { EmailLogin } from '@/components/auth/email-login'

const BOOT_MESSAGES = [
  { text: '[BOOT] _unOS Kernel v4.2.1 loaded', color: 'text-[#1A6B35]' },
  { text: '[BOOT] Initializing quantum entropy pool...', color: 'text-[#1A6B35]' },
  { text: '[SYS ] Memory check: 2048 MB OK', color: 'text-[#1A6B35]' },
  { text: '[NET ] Connecting to SOLANA MAINNET-BETA...', color: 'text-[#00FFFF]' },
  { text: '[NET ] RPC endpoint verified ✓', color: 'text-[#00FF41]' },
  { text: '[SEC ] Security level: MAXIMUM', color: 'text-[#FFB000]' },
  { text: '[SEC ] Session encryption: AES-256-GCM', color: 'text-[#FFB000]' },
  { text: '[SEC ] Threat detection: ACTIVE', color: 'text-[#FFB000]' },
  { text: '[SYS ] Authentication module ready', color: 'text-[#00FF41]' },
]

const ASCII_BANNER = `╔═══════════════════════════════════════════════════╗
║                                                   ║
║    U N S T A B L E   L A B O R A T O R I E S      ║
║                    u n L A B S                     ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║       UNSTABLE LABORATORIES TERMINAL v2.0         ║
║       _unOS Quantum Research Interface            ║
╚═══════════════════════════════════════════════════╝`

export default function LoginPage() {
  const router = useRouter()
  const [requires2FA, setRequires2FA] = useState(false)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [bootStep, setBootStep] = useState(0)
  const [bootComplete, setBootComplete] = useState(false)
  const [activeTab, setActiveTab] = useState<'wallet' | 'email'>('wallet')

  useEffect(() => {
    if (bootStep < BOOT_MESSAGES.length) {
      const delay = 120 + Math.random() * 180
      const timer = setTimeout(() => setBootStep((s) => s + 1), delay)
      return () => clearTimeout(timer)
    } else if (!bootComplete) {
      const timer = setTimeout(() => setBootComplete(true), 400)
      return () => clearTimeout(timer)
    }
  }, [bootStep, bootComplete])

  const handleSuccess = () => {
    router.push('/')
    router.refresh()
  }

  const handleRequires2FA = (id: string) => {
    setAdminId(id)
    setRequires2FA(true)
    router.push(`/2fa/verify?adminId=${id}`)
  }

  if (requires2FA && adminId) {
    return null
  }

  return (
    <div className="font-mono text-sm space-y-0">
      {/* ── Boot sequence ── */}
      <div className="space-y-0.5 mb-4">
        {BOOT_MESSAGES.slice(0, bootStep).map((msg, i) => (
          <div
            key={i}
            className={`${msg.color} text-xs animate-boot-line`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {bootComplete && (
        <div className="space-y-4 animate-boot-line" style={{ animationDelay: '100ms' }}>
          {/* ── ASCII art banner ── */}
          <pre
            className="text-[#00FF41] text-[10px] sm:text-xs leading-tight select-none text-center"
            style={{ textShadow: '0 0 8px rgba(0, 255, 65, 0.4)' }}
          >
            {ASCII_BANNER}
          </pre>

          {/* ── System ready message ── */}
          <div className="text-center space-y-1">
            <h2
              className="text-lg font-bold text-[#00FF41] uppercase tracking-[0.2em]"
              style={{ textShadow: '0 0 10px #00FF41, 0 0 20px rgba(0,255,65,0.3)' }}
            >
              Authentication Required
            </h2>
            <p className="text-[#1A6B35] text-xs tracking-wider">
              CLEARANCE LEVEL: ADMIN • ACCESS: RESTRICTED
            </p>
          </div>

          {/* ── Auth method selector (terminal tabs) ── */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-1.5 font-mono tracking-wider transition-colors ${
                activeTab === 'wallet'
                  ? 'bg-[#00FF41] text-black'
                  : 'text-[#1A6B35] hover:text-[#00FF41] border border-[#0D3B1E]'
              }`}
            >
              [1] WALLET_AUTH
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-3 py-1.5 font-mono tracking-wider transition-colors ${
                activeTab === 'email'
                  ? 'bg-[#00FF41] text-black'
                  : 'text-[#1A6B35] hover:text-[#00FF41] border border-[#0D3B1E]'
              }`}
            >
              [2] EMAIL_AUTH
            </button>
          </div>

          {/* ── Auth form in dashed sub-frame ── */}
          <div className="border border-dashed border-[#0D3B1E] p-4 sm:p-5">
            <div className="text-[#1A6B35] text-xs mb-3 flex items-center gap-2">
              <span className="led-online" />
              <span className="uppercase tracking-wider">
                {activeTab === 'wallet' ? 'Solana Wallet Authentication' : 'Email Authentication'}
              </span>
            </div>

            {activeTab === 'wallet' ? (
              <WalletLogin onSuccess={handleSuccess} onRequires2FA={handleRequires2FA} />
            ) : (
              <EmailLogin onSuccess={handleSuccess} onRequires2FA={handleRequires2FA} />
            )}
          </div>

          {/* ── Protocol footer ── */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-[#0D3B1E] uppercase tracking-[0.2em] font-mono">
              [Secured by _unstablecoins Protocol • End-to-End Encrypted]
            </p>
          </div>

          {/* ── Command prompt ── */}
          <div className="flex items-center gap-1 text-xs pt-2">
            <span className="text-[#00FFFF]">adm</span>
            <span className="text-[#1A6B35]">@</span>
            <span className="text-[#00FF41]">_unLAB</span>
            <span className="text-[#1A6B35]">:</span>
            <span className="text-[#00FFFF]">/auth</span>
            <span className="text-[#1A6B35]">$</span>
            <span className="w-2 h-4 bg-[#00FF41] inline-block animate-cursor-blink ml-1" />
          </div>
        </div>
      )}
    </div>
  )
}
