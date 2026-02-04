'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { validateRecipientAddress } from '@/lib/transfer/validate'
import { CheckCircle, XCircle, Loader2, Wallet } from 'lucide-react'

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  senderAddress: string
  onValidation: (isValid: boolean) => void
}

export function AddressInput({ value, onChange, senderAddress, onValidation }: AddressInputProps) {
  const [validation, setValidation] = useState<{
    valid: boolean
    error?: string
  } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validate = useCallback(
    (address: string) => {
      if (!address || address.trim().length === 0) {
        setValidation(null)
        onValidation(false)
        return
      }

      setIsValidating(true)

      // Small delay for UX
      const timeout = setTimeout(() => {
        const result = validateRecipientAddress(address, senderAddress)
        setValidation(result)
        onValidation(result.valid)
        setIsValidating(false)
      }, 300)

      return () => clearTimeout(timeout)
    },
    [senderAddress, onValidation]
  )

  useEffect(() => {
    const cleanup = validate(value)
    return cleanup
  }, [value, validate])

  const truncatedAddress = value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-200">Recipient Address</label>
      <div className="relative">
        <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="Enter Solana wallet address..."
          className={`border-slate-700 bg-slate-800 pl-9 pr-10 font-mono text-sm text-white placeholder:text-slate-500 ${
            validation
              ? validation.valid
                ? 'border-green-600 focus-visible:border-green-500 focus-visible:ring-green-500/20'
                : 'border-red-600 focus-visible:border-red-500 focus-visible:ring-red-500/20'
              : 'focus-visible:border-purple-500 focus-visible:ring-purple-500/20'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValidating && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          {!isValidating && validation?.valid && <CheckCircle className="h-4 w-4 text-green-500" />}
          {!isValidating && validation && !validation.valid && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Validation message */}
      {validation && !validation.valid && (
        <p className="text-xs text-red-400">{validation.error}</p>
      )}

      {/* Resolved info */}
      {validation?.valid && value && (
        <div className="flex items-center gap-2 rounded-md bg-slate-800/50 px-3 py-2">
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          <span className="font-mono text-xs text-slate-300">{truncatedAddress}</span>
          <span className="text-xs text-slate-500">Valid Solana address</span>
        </div>
      )}
    </div>
  )
}
