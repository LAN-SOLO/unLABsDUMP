import { WalletProvider } from '@/components/providers/wallet-provider'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-1">
              <img
                src="/logo.gif"
                alt="_unstablecoins logo"
                width={40}
                height={40}
                className="inline-block"
              />
              <h1
                className="text-3xl font-bold text-[#00FF41]"
                style={{ textShadow: '0 0 10px #00FF41, 0 0 20px rgba(0,255,65,0.5)' }}
              >
                _unstablecoins
              </h1>
            </div>
            <p className="text-[#1A6B35] mt-2 font-mono text-sm uppercase tracking-widest">
              Admin Terminal v2.0
            </p>
          </div>

          {children}
        </div>
      </div>
    </WalletProvider>
  )
}
