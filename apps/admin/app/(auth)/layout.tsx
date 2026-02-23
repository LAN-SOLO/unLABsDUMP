import { WalletProvider } from '@/components/providers/wallet-provider'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-black flex items-center justify-center p-3 sm:p-6">
        {/* Outer terminal frame */}
        <div className="w-full max-w-2xl border border-[#0D3B1E] bg-black">
          {/* ── Top border with box-drawing ── */}
          <div className="text-[#0D3B1E] font-mono text-xs leading-none select-none px-0 overflow-hidden whitespace-nowrap">
            {'╔' + '═'.repeat(78) + '╗'}
          </div>

          {/* ── Title bar ── */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0A0E14] border-b border-[#0D3B1E]">
            <div className="flex items-center gap-3">
              {/* Traffic light dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF3333] shadow-[0_0_4px_#FF3333]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB000] shadow-[0_0_4px_#FFB000]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF41] shadow-[0_0_4px_#00FF41]" />
              </div>
              <span className="text-[#1A6B35] text-xs font-mono tracking-wider">
                unLABS://auth — terminal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#00FF41] text-xs font-mono">100.00 _unSC</span>
              <span className="text-[#FF3333] text-xs font-mono cursor-pointer hover:text-[#FF6666] transition-colors">
                [DISCONNECT]
              </span>
            </div>
          </div>

          {/* ── Inner terminal area ── */}
          <div className="bg-[#050810] min-h-[500px] p-6 sm:p-8">{children}</div>

          {/* ── Bottom status bar ── */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0A0E14] border-t border-[#0D3B1E]">
            <span className="text-[#1A6B35] text-[10px] font-mono tracking-wider uppercase">
              MODEL: UGT-0000
            </span>
            <span className="text-[#0D3B1E] text-[10px] font-mono tracking-[0.3em]">
              ▐▌▐▌▐▌▐▌▐▌
            </span>
            <span className="text-[#1A6B35] text-[10px] font-mono tracking-wider uppercase">
              SHIELD GENERATOR • INTEGRITY: 100%
            </span>
          </div>

          {/* ── Bottom border with box-drawing ── */}
          <div className="text-[#0D3B1E] font-mono text-xs leading-none select-none px-0 overflow-hidden whitespace-nowrap">
            {'╚' + '═'.repeat(78) + '╝'}
          </div>
        </div>
      </div>
    </WalletProvider>
  )
}
