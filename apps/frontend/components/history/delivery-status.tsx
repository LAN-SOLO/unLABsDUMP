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

        let dotColor = 'bg-slate-700 text-slate-500'
        if (isComplete) dotColor = 'bg-green-500/20 text-green-400'
        if (isActive) dotColor = 'bg-purple-500/20 text-purple-400'
        if (isFailedStep) dotColor = 'bg-red-500/20 text-red-400'

        let lineColor = 'bg-slate-700'
        if (isComplete) lineColor = 'bg-green-500/50'

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
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    delivering: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
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
