import { WalletProvider } from '@/components/providers/wallet-provider'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              UnstableLabs
            </h1>
            <p className="text-slate-400 mt-2 font-mono text-sm">Admin Portal</p>
          </div>

          {children}
        </div>
      </div>
    </WalletProvider>
  )
}
