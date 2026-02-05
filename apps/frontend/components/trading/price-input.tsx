'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { DollarSign } from 'lucide-react'

interface PriceInputProps {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  error?: string
}

export function PriceInput({
  value,
  onChange,
  min = 0.001,
  max = 1_000_000,
  error,
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState(value !== null ? value.toString() : '')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value

      // Allow empty input
      if (raw === '') {
        setDisplayValue('')
        onChange(null)
        return
      }

      // Allow partial decimal input like "0." or "1."
      if (/^\d*\.?\d*$/.test(raw)) {
        setDisplayValue(raw)

        const parsed = parseFloat(raw)
        if (!isNaN(parsed)) {
          onChange(parsed)
        }
      }
    },
    [onChange]
  )

  const handleBlur = useCallback(() => {
    if (value !== null) {
      // Format on blur with proper precision
      const formatted = value.toFixed(value < 1 ? 4 : value < 100 ? 3 : 2)
      setDisplayValue(formatted)
    }
  }, [value])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#00FF41]">Price in SOL</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="text-sm font-semibold text-[#00FF41]">SOL</span>
        </div>
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0.00"
          className={`border-[#1A3A2A] bg-[#111318] pl-14 text-right text-lg font-mono text-[#00FF41] placeholder:text-[#1A6B35] ${
            error
              ? 'border-[#FF3333] focus-visible:border-[#FF3333] focus-visible:ring-[#FF3333]/20'
              : 'focus-visible:border-[#00FF41] focus-visible:ring-[#00FF41]/20'
          }`}
        />
      </div>

      {/* USD estimate placeholder */}
      {value !== null && value > 0 && (
        <p className="flex items-center gap-1 text-xs text-[#1A6B35]">
          <DollarSign className="h-3 w-3" />
          USD estimate unavailable
        </p>
      )}

      {error && <p className="text-xs text-[#FF3333]">{error}</p>}

      {/* Range info */}
      <p className="text-[10px] text-[#1A6B35]">
        Min: {min} SOL | Max: {max.toLocaleString()} SOL
      </p>
    </div>
  )
}
