'use client'

import React, { useState } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  NFT_COLORS,
  NFT_TIERS,
  NFT_ERAS,
  COLOR_HEX_MAP,
  TIER_LABELS,
  type NFTColor,
  type NFTTier,
  type NFTEra,
} from '@/lib/nft/types'

export interface AdvancedSearchValues {
  query: string
  colors: NFTColor[]
  tiers: NFTTier[]
  eras: NFTEra[]
  ownerWallet: string
  rarityMin: string
  rarityMax: string
}

const EMPTY_SEARCH: AdvancedSearchValues = {
  query: '',
  colors: [],
  tiers: [],
  eras: [],
  ownerWallet: '',
  rarityMin: '',
  rarityMax: '',
}

interface AdvancedSearchFormProps {
  initialValues?: Partial<AdvancedSearchValues>
  onSearch: (values: AdvancedSearchValues) => void
  loading?: boolean
}

export function AdvancedSearchForm({
  initialValues,
  onSearch,
  loading = false,
}: AdvancedSearchFormProps) {
  const [values, setValues] = useState<AdvancedSearchValues>({
    ...EMPTY_SEARCH,
    ...initialValues,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(values)
  }

  function handleReset() {
    setValues(EMPTY_SEARCH)
  }

  function toggleColor(color: NFTColor) {
    setValues((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }))
  }

  function toggleTier(tier: NFTTier) {
    setValues((prev) => ({
      ...prev,
      tiers: prev.tiers.includes(tier)
        ? prev.tiers.filter((t) => t !== tier)
        : [...prev.tiers, tier],
    }))
  }

  function toggleEra(era: NFTEra) {
    setValues((prev) => ({
      ...prev,
      eras: prev.eras.includes(era) ? prev.eras.filter((e) => e !== era) : [...prev.eras, era],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Text search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Search by Name or Description</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <Input
            type="text"
            value={values.query}
            onChange={(e) => setValues((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="Enter name, description, or capture hash..."
            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:border-purple-500"
          />
        </div>
      </div>

      {/* Owner wallet */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Owner Wallet Address</label>
        <Input
          type="text"
          value={values.ownerWallet}
          onChange={(e) => setValues((prev) => ({ ...prev, ownerWallet: e.target.value }))}
          placeholder="Solana wallet address..."
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs focus-visible:border-purple-500"
        />
      </div>

      <Separator className="bg-slate-800" />

      {/* Color wavelength */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Color Wavelength</label>
        <div className="grid grid-cols-3 gap-2">
          {NFT_COLORS.map((color) => (
            <label
              key={color}
              className={cn(
                'flex items-center gap-2 cursor-pointer p-2 rounded-md border transition-colors',
                values.colors.includes(color)
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              )}
            >
              <Checkbox
                checked={values.colors.includes(color)}
                onCheckedChange={() => toggleColor(color)}
                className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <div
                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: COLOR_HEX_MAP[color] }}
              />
              <span className="text-xs text-slate-300">{color}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Tier */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Tier</label>
        <div className="flex flex-wrap gap-2">
          {NFT_TIERS.map((tier) => (
            <label
              key={tier}
              className={cn(
                'flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors',
                values.tiers.includes(tier)
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              )}
            >
              <Checkbox
                checked={values.tiers.includes(tier)}
                onCheckedChange={() => toggleTier(tier)}
                className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <span className="text-sm text-slate-300">
                T{tier} - {TIER_LABELS[tier]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Era */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Era</label>
        <div className="flex flex-wrap gap-2">
          {NFT_ERAS.map((era) => (
            <label
              key={era}
              className={cn(
                'flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors',
                values.eras.includes(era)
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              )}
            >
              <Checkbox
                checked={values.eras.includes(era)}
                onCheckedChange={() => toggleEra(era)}
                className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <span className="text-sm text-slate-300 font-mono">{era}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Rarity range */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Rarity Score Range</label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={0}
            max={100}
            value={values.rarityMin}
            onChange={(e) => setValues((prev) => ({ ...prev, rarityMin: e.target.value }))}
            placeholder="Min (0)"
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 w-28 focus-visible:border-purple-500"
          />
          <span className="text-slate-600">to</span>
          <Input
            type="number"
            min={0}
            max={100}
            value={values.rarityMax}
            onChange={(e) => setValues((prev) => ({ ...prev, rarityMax: e.target.value }))}
            placeholder="Max (100)"
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 w-28 focus-visible:border-purple-500"
          />
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white glow-button flex-1 sm:flex-none"
        >
          <Search className="size-4 mr-2" />
          {loading ? 'Searching...' : 'Search'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="border-slate-700 text-slate-400 hover:text-white"
        >
          <RotateCcw className="size-4 mr-2" />
          Reset
        </Button>
      </div>
    </form>
  )
}
