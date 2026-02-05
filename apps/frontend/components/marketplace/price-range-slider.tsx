'use client'

import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'

interface PriceRangeSliderProps {
  minPrice: string
  maxPrice: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
}

export function PriceRangeSlider({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
}: PriceRangeSliderProps) {
  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#00AA2A]">Price Range (SOL)</label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="decimal"
          value={minPrice}
          onChange={(e) => handleNumericInput(e.target.value, onMinChange)}
          placeholder="Min"
          className="h-8 border-[#1A3A2A] bg-[#111318] text-center text-xs text-[#00FF41] placeholder:text-[#1A6B35] focus-visible:border-[#00FF41]"
        />
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#1A6B35]" />
        <Input
          type="text"
          inputMode="decimal"
          value={maxPrice}
          onChange={(e) => handleNumericInput(e.target.value, onMaxChange)}
          placeholder="Max"
          className="h-8 border-[#1A3A2A] bg-[#111318] text-center text-xs text-[#00FF41] placeholder:text-[#1A6B35] focus-visible:border-[#00FF41]"
        />
      </div>
    </div>
  )
}
