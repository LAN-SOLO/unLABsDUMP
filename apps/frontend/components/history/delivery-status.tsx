'use client'

import { Check, Clock, Loader2, X, CreditCard, Truck, CheckCircle } from 'lucide-react'

const STEPS = [
  { key: 'pending', label: 'Payment', icon: CreditCard },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'delivering', label: 'Delivering', icon: Truck },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
] as const

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  delivering: 2,
  completed: 3,
  failed: -1,
  refunded: -1,
}

interface DeliveryStatusProps {
  status: string
  className?: string
}

export function DeliveryStatus({ status, className = '' }: DeliveryStatusProps) {
  const currentStep = STATUS_ORDER[status] ?? 0
  const isFailed = status === 'failed' || status === 'refunded'

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {STEPS.map((step, i) => {
        const StepIcon = step.icon
        const isActive = i === currentStep && !isFailed
        const isComplete = i < currentStep && !isFailed
        const isFailedStep = isFailed && i === 0

        let dotColor = 'bg-[#1A3A2A] text-[#1A6B35]'
        if (isComplete) dotColor = 'bg-[#00FF41]/20 text-[#00FF41]'
        if (isActive) dotColor = 'bg-[#0D3B1E]/20 text-[#00FF41]'
        if (isFailedStep) dotColor = 'bg-[#FF3333]/20 text-[#FF3333]'

        let lineColor = 'bg-[#1A3A2A]'
        if (isComplete) lineColor = 'bg-[#00FF41]/50'

        return (
          <div key={step.key} className="flex items-center gap-1">
            {/* Step dot */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${dotColor} transition-colors`}
              title={step.label}
            >
              {isComplete ? (
                <Check className="size-3" />
              ) : isFailedStep ? (
                <X className="size-3" />
              ) : isActive ? (
                status === 'delivering' ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <StepIcon className="size-3" />
                )
              ) : (
                <StepIcon className="size-3" />
              )}
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && <div className={`w-4 h-0.5 ${lineColor} transition-colors`} />}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Compact inline status dot with label.
 */
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30',
    confirmed: 'bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30',
    delivering: 'bg-[#0D3B1E]/20 text-[#00FF41] border-[#00FF41]/30',
    completed: 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/30',
    failed: 'bg-[#FF3333]/20 text-[#FF3333] border-[#FF3333]/30',
    refunded: 'bg-[#1A6B35]/20 text-[#00AA2A] border-[#1A6B35]/30',
  }

  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="size-3" />,
    confirmed: <Check className="size-3" />,
    delivering: <Loader2 className="size-3 animate-spin" />,
    completed: <CheckCircle className="size-3" />,
    failed: <X className="size-3" />,
    refunded: <X className="size-3" />,
  }

  const color = colors[status] || colors.pending

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
