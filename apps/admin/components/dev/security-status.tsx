'use client'

/**
 * Security Status Component
 *
 * Displays current security state including session info,
 * IP binding status, and fingerprint binding status.
 */

import { Shield, Lock, Fingerprint, Globe, Wallet } from 'lucide-react'

interface SecurityStatusProps {
  wallet: string
  issuedAt: number
  ipBound: boolean
  fingerprintBound: boolean
}

export function SecurityStatus({
  wallet,
  issuedAt,
  ipBound,
  fingerprintBound,
}: SecurityStatusProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-4 flex items-center space-x-2">
        <Shield className="h-5 w-5 text-green-500" />
        <h3 className="font-semibold text-white">Security Status</h3>
      </div>

      <div className="space-y-3">
        {/* Wallet */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Wallet</span>
          </div>
          <span className="font-mono text-xs text-zinc-300">
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </span>
        </div>

        {/* Session Started */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Session Started</span>
          </div>
          <span className="text-xs text-zinc-300">{formatDate(issuedAt)}</span>
        </div>

        {/* IP Binding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Globe className="h-4 w-4" />
            <span className="text-sm">IP Binding</span>
          </div>
          <span className={`text-xs ${ipBound ? 'text-green-500' : 'text-yellow-500'}`}>
            {ipBound ? 'Active' : 'Disabled'}
          </span>
        </div>

        {/* Fingerprint Binding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Fingerprint className="h-4 w-4" />
            <span className="text-sm">Fingerprint Binding</span>
          </div>
          <span className={`text-xs ${fingerprintBound ? 'text-green-500' : 'text-yellow-500'}`}>
            {fingerprintBound ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Security levels indicator */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        <p className="mb-2 text-xs text-zinc-500">Security Layers Active</p>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5, 6, 7].map((layer) => (
            <div
              key={layer}
              className={`h-1.5 flex-1 rounded ${
                layer <= (ipBound ? 7 : 5) ? 'bg-green-500' : 'bg-zinc-700'
              }`}
              title={`Layer ${layer}`}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-600">
          7-layer security: Whitelist, Signature, Passphrase, IP, Fingerprint, Session, Rate Limit
        </p>
      </div>
    </div>
  )
}
