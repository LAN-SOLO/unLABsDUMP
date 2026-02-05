'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X, HelpCircle } from 'lucide-react'
import {
  COLORS,
  ERAS,
  ROTATIONS,
  TIERS,
  TIER_LABELS,
  COLOR_HEX,
  TIER_COLORS,
  type NFTMetadata,
  calculateRarityScore,
  getRarityLabel,
} from '@/lib/nft/metadata'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MetadataFormProps {
  metadata: NFTMetadata
  onChange: (metadata: NFTMetadata) => void
  disabled?: boolean
}

export function MetadataForm({ metadata, onChange, disabled }: MetadataFormProps) {
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')

  const handleChange = (field: keyof NFTMetadata, value: unknown) => {
    onChange({ ...metadata, [field]: value })
  }

  const addCustomSpec = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return
    const currentSpecs = metadata.custom_spec || {}
    onChange({
      ...metadata,
      custom_spec: { ...currentSpecs, [newSpecKey.trim()]: newSpecValue.trim() },
    })
    setNewSpecKey('')
    setNewSpecValue('')
  }

  const removeCustomSpec = (key: string) => {
    const currentSpecs = { ...metadata.custom_spec }
    delete currentSpecs[key]
    onChange({
      ...metadata,
      custom_spec: Object.keys(currentSpecs).length > 0 ? currentSpecs : undefined,
    })
  }

  const rarityScore = calculateRarityScore(metadata)
  const rarityLabel = getRarityLabel(rarityScore)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Rarity Preview */}
        <div className="flex items-center justify-between p-3 bg-[#111318] rounded-sm">
          <span className="text-sm text-[#00AA2A]">Calculated Rarity</span>
          <div className="flex items-center gap-2">
            <Badge
              className={`${
                rarityLabel === 'Legendary'
                  ? 'bg-[#FFB000]'
                  : rarityLabel === 'Epic'
                    ? 'bg-[#00FF41]'
                    : rarityLabel === 'Rare'
                      ? 'bg-[#00FFFF]'
                      : rarityLabel === 'Uncommon'
                        ? 'bg-[#00FF41]'
                        : 'bg-[#1A6B35]'
              } text-[#00FF41]`}
            >
              {rarityLabel}
            </Badge>
            <span className="text-xs text-[#1A6B35] font-mono">Score: {rarityScore}</span>
          </div>
        </div>

        {/* _capture */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="capture">_capture</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-[#1A6B35]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Blockchain source identifier for this NFT</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="capture"
            value={metadata._capture || ''}
            onChange={(e) => handleChange('_capture', e.target.value || undefined)}
            placeholder="Blockchain source"
            className="bg-[#111318] border-[#1A3A2A]"
            disabled={disabled}
          />
        </div>

        {/* _color */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="color">_color</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-[#1A6B35]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Wavelength spectrum classification (Infrared to Gamma)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={metadata._color || ''}
            onValueChange={(value) => handleChange('_color', value || undefined)}
            disabled={disabled}
          >
            <SelectTrigger className="bg-[#111318] border-[#1A3A2A]">
              <SelectValue placeholder="Select wavelength" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full border border-[#1A3A2A]"
                      style={{ backgroundColor: COLOR_HEX[color] }}
                    />
                    {color}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* _I/O */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="io">_I/O</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-[#1A6B35]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Rotation direction: Clockwise (CW) or Counter-Clockwise (CCW)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={metadata._io || ''}
            onValueChange={(value) => handleChange('_io', value || undefined)}
            disabled={disabled}
          >
            <SelectTrigger className="bg-[#111318] border-[#1A3A2A]">
              <SelectValue placeholder="Select rotation" />
            </SelectTrigger>
            <SelectContent>
              {ROTATIONS.map((rotation) => (
                <SelectItem key={rotation} value={rotation}>
                  {rotation === 'CW' ? 'Clockwise (CW)' : 'Counter-Clockwise (CCW)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tier */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="tier">Tier</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-[#1A6B35]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Rarity tier from 1 (Common) to 5 (Legendary)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={metadata.tier?.toString() || ''}
            onValueChange={(value) => handleChange('tier', value ? parseInt(value) : undefined)}
            disabled={disabled}
          >
            <SelectTrigger className="bg-[#111318] border-[#1A3A2A]">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              {TIERS.map((tier) => (
                <SelectItem key={tier} value={tier.toString()}>
                  <span className={TIER_COLORS[tier]}>
                    Tier {tier} - {TIER_LABELS[tier]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bit (Era) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="bit">Era (Bit Depth)</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-[#1A6B35]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Processing era classification</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={metadata.bit || ''}
            onValueChange={(value) => handleChange('bit', value || undefined)}
            disabled={disabled}
          >
            <SelectTrigger className="bg-[#111318] border-[#1A3A2A]">
              <SelectValue placeholder="Select era" />
            </SelectTrigger>
            <SelectContent>
              {ERAS.map((era) => (
                <SelectItem key={era} value={era}>
                  {era}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Spec */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Custom Specifications</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3.5 w-3.5 text-[#1A6B35]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Additional custom key-value attributes</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {metadata.custom_spec &&
            Object.entries(metadata.custom_spec).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 p-2 bg-[#111318] rounded">
                <span className="text-sm text-[#00FF41] font-mono">{key}</span>
                <span className="text-[#1A6B35]">=</span>
                <span className="text-sm text-[#00FF41] flex-1">{value}</span>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeCustomSpec(key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}

          {!disabled && (
            <div className="flex gap-2">
              <Input
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                placeholder="Key"
                className="bg-[#111318] border-[#1A3A2A] flex-1"
              />
              <Input
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="Value"
                className="bg-[#111318] border-[#1A3A2A] flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSpec())}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addCustomSpec}
                disabled={!newSpecKey.trim() || !newSpecValue.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
