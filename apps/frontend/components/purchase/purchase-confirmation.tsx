'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ExternalLink, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getExplorerUrl } from '@/lib/purchase/submit'

interface PurchaseConfirmationProps {
  transactionSignature: string
  packageName: string
  onClose: () => void
}

// Simple confetti particle
interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  velocityX: number
  velocityY: number
  rotation: number
  delay: number
}

function ConfettiEffect() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const colors = [
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EC4899', // pink
      '#3B82F6', // blue
    ]

    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      velocityX: (Math.random() - 0.5) * 120,
      velocityY: -60 - Math.random() * 80,
      rotation: Math.random() * 360,
      delay: Math.random() * 300,
    }))

    setParticles(newParticles)

    // Clear after animation
    const timer = setTimeout(() => setParticles([]), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-bounce"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall 2s ease-out ${p.delay}ms forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 80px), var(--ty, 200px)) rotate(720deg) scale(0.5);
          }
        }
      `}</style>
    </div>
  )
}

export function PurchaseConfirmation({
  transactionSignature,
  packageName,
  onClose,
}: PurchaseConfirmationProps) {
  const explorerUrl = getExplorerUrl(transactionSignature)

  return (
    <div className="relative text-center space-y-6 py-4">
      <ConfettiEffect />

      {/* Success icon */}
      <div className="relative mx-auto w-20 h-20">
        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
        <div className="relative w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="size-10 text-green-400" />
        </div>
      </div>

      {/* Success text */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <PartyPopper className="size-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">Purchase Complete!</h3>
          <PartyPopper className="size-5 text-amber-400 -scale-x-100" />
        </div>
        <p className="text-slate-400 text-sm">
          Your purchase of <span className="text-white font-medium">{packageName}</span> has been
          confirmed. Items will be delivered to your wallet shortly.
        </p>
      </div>

      {/* Transaction link */}
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
        <p className="text-xs text-slate-400 mb-1">Transaction</p>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-mono"
        >
          {transactionSignature.slice(0, 8)}...{transactionSignature.slice(-8)}
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button asChild className="bg-purple-600 hover:bg-purple-500 text-white">
          <a href="/history">View Purchase History</a>
        </Button>
        <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
