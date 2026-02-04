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
      <label className="text-xs font-medium text-slate-400">Price Range (SOL)</label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="decimal"
          value={minPrice}
          onChange={(e) => handleNumericInput(e.target.value, onMinChange)}
          placeholder="Min"
          className="h-8 border-slate-700 bg-slate-800 text-center text-xs text-white placeholder:text-slate-600 focus-visible:border-purple-500"
        />
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <Input
          type="text"
          inputMode="decimal"
          value={maxPrice}
          onChange={(e) => handleNumericInput(e.target.value, onMaxChange)}
          placeholder="Max"
          className="h-8 border-slate-700 bg-slate-800 text-center text-xs text-white placeholder:text-slate-600 focus-visible:border-purple-500"
        />
      </div>
    </div>
  )
}
