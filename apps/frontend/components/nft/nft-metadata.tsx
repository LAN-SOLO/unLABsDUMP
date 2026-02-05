'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  type NFT,
  COLOR_HEX_MAP,
  TIER_LABELS,
  TIER_COLORS,
  ROTATION_LABELS,
  type NFTTier,
} from '@/lib/nft/types'

interface NFTMetadataProps {
  nft: NFT
  className?: string
}

function getRarityLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Mythic', color: 'text-[#FFB000]' }
  if (score >= 75) return { label: 'Legendary', color: 'text-[#00FF41]' }
  if (score >= 60) return { label: 'Epic', color: 'text-[#00FFFF]' }
  if (score >= 40) return { label: 'Rare', color: 'text-[#00FF41]' }
  if (score >= 20) return { label: 'Uncommon', color: 'text-[#00FFFF]' }
  return { label: 'Common', color: 'text-[#00AA2A]' }
}

export function NFTMetadata({ nft, className }: NFTMetadataProps) {
  const colorHex = COLOR_HEX_MAP[nft.color]
  const tierColor = TIER_COLORS[nft.tier as NFTTier]
  const tierLabel = TIER_LABELS[nft.tier as NFTTier]
  const rarityInfo = nft.rarity_score !== undefined ? getRarityLabel(nft.rarity_score) : null

  return (
    <div className={cn('space-y-1', className)}>
      <h3 className="text-sm font-semibold text-[#00FF41] mb-3">Traits & Metadata</h3>

      <div className="bg-[#0D1117] rounded-sm border border-[#0D3B1E] overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#0D3B1E]">
            {/* _capture */}
            <MetadataRow
              label="_capture"
              value={
                <code className="text-xs font-mono text-[#00FFFF] bg-[#111318] px-2 py-0.5 rounded break-all">
                  {nft.capture}
                </code>
              }
            />

            {/* _color */}
            <MetadataRow
              label="_color"
              value={
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="text-[#00FF41]">{nft.color}</span>
                </div>
              }
            />

            {/* _I/O (rotation) */}
            <MetadataRow
              label="_I/O"
              value={
                <span className="text-[#00FF41]">
                  {nft.rotation} ({ROTATION_LABELS[nft.rotation]})
                </span>
              }
            />

            {/* Tier */}
            <MetadataRow
              label="tier"
              value={
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs', tierColor)}>T{nft.tier}</Badge>
                  <span className="text-[#00AA2A]">{tierLabel}</span>
                </div>
              }
            />

            {/* bit (era) */}
            <MetadataRow
              label="bit"
              value={<span className="text-[#00FF41] font-mono">{nft.era}</span>}
            />

            {/* Rarity Score */}
            {nft.rarity_score !== undefined && rarityInfo && (
              <MetadataRow
                label="Rarity"
                value={
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#111318] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#00FF41]"
                        style={{ width: `${nft.rarity_score}%` }}
                      />
                    </div>
                    <span className={cn('text-xs font-medium', rarityInfo.color)}>
                      {nft.rarity_score.toFixed(1)} - {rarityInfo.label}
                    </span>
                  </div>
                }
              />
            )}

            {/* _unSC token mint */}
            <MetadataRow
              label="_unSC mint"
              value={
                <code className="text-xs font-mono text-[#00AA2A] bg-[#111318] px-2 py-0.5 rounded break-all">
                  7Z7RcZQ...n7dkzT
                </code>
              }
            />

            {/* Mint Address if available */}
            {nft.mint_address && (
              <MetadataRow
                label="Mint Address"
                value={
                  <code className="text-xs font-mono text-[#00FF41] bg-[#111318] px-2 py-0.5 rounded break-all">
                    {nft.mint_address}
                  </code>
                }
              />
            )}
          </tbody>
        </table>
      </div>

      {/* Custom spec fields */}
      {nft.custom_specs && Object.keys(nft.custom_specs).length > 0 && (
        <>
          <Separator className="bg-[#0D3B1E] my-4" />
          <h4 className="text-xs font-semibold text-[#00AA2A] uppercase tracking-wider mb-2">
            Custom Specs
          </h4>
          <div className="bg-[#0D1117] rounded-sm border border-[#0D3B1E] overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[#0D3B1E]">
                {Object.entries(nft.custom_specs).map(([key, value]) => (
                  <MetadataRow
                    key={key}
                    label={key}
                    value={<span className="text-[#00FF41]">{value}</span>}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function MetadataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td className="py-2.5 px-4 text-[#1A6B35] font-medium whitespace-nowrap w-32 align-top">
        {label}
      </td>
      <td className="py-2.5 px-4">{value}</td>
    </tr>
  )
}
