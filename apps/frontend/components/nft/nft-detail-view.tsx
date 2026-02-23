'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  Package,
  Clock,
  Check,
  Heart,
  Flag,
  Link2,
  Twitter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ClickableNFTImage } from '@/components/nft/nft-image-viewer'
import { NFTMetadata } from '@/components/nft/nft-metadata'
import { NFTHistory } from '@/components/nft/nft-history'
import { NFTGrid } from '@/components/nft/nft-grid'
import { cn } from '@/lib/utils'
import {
  type NFT,
  type OwnershipRecord,
  COLOR_HEX_MAP,
  TIER_LABELS,
  TIER_COLORS,
  type NFTTier,
} from '@/lib/nft/types'

interface NFTDetailViewProps {
  id: string
}

export function NFTDetailView({ id }: NFTDetailViewProps) {
  const [nft, setNft] = useState<NFT | null>(null)
  const [history, setHistory] = useState<OwnershipRecord[]>([])
  const [relatedNfts, setRelatedNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    async function fetchNFT() {
      setLoading(true)
      try {
        const res = await fetch(`/api/nfts/${id}`)
        if (res.ok) {
          const data = await res.json()
          setNft(data)

          // Fetch related NFTs based on the same tier or color
          const relatedRes = await fetch(
            `/api/nfts?limit=4&color=${data.color}&tier=${data.tier}&exclude=${id}`
          )
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json()
            setRelatedNfts(relatedData.data || [])
          }
        }
      } catch (err) {
        console.error('Failed to fetch NFT:', err)
      } finally {
        setLoading(false)
      }
    }

    async function fetchHistory() {
      setHistoryLoading(true)
      try {
        const res = await fetch(`/api/nfts/${id}/history`)
        if (res.ok) {
          const data = await res.json()
          setHistory(data)
        }
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchNFT()
    fetchHistory()
  }, [id])

  async function handleShare() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select a text input
    }
  }

  if (loading) {
    return <NFTDetailSkeleton />
  }

  if (!nft) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-[#00FF41] mb-2">_unITM Not Found</h2>
        <p className="text-[#00AA2A] mb-4">
          The _unITM you are looking for does not exist or has been removed.
        </p>
        <Button asChild variant="outline" className="border-[#1A3A2A]">
          <Link href="/browse">
            <ArrowLeft className="size-4 mr-2" />
            Back to Browse
          </Link>
        </Button>
      </div>
    )
  }

  const colorHex = COLOR_HEX_MAP[nft.color]
  const tierColor = TIER_COLORS[nft.tier as NFTTier]

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-[#1A6B35]">
        <Link href="/browse" className="hover:text-[#00FF41] transition-colors">
          Browse
        </Link>
        <span>/</span>
        <span className="text-[#00CC33] truncate">{nft.name}</span>
      </nav>

      {/* Back link */}
      <Link
        href="/browse"
        className="inline-flex items-center gap-1.5 text-sm text-[#00AA2A] hover:text-[#00FF41] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Browse
      </Link>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image */}
        <div>
          <ClickableNFTImage src={nft.image_url} alt={nft.name} fallbackColor={colorHex} />
        </div>

        {/* Right: Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[#00FF41]">{nft.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs', tierColor)}>Tier {nft.tier}</Badge>
                  <span className="text-[#00AA2A] text-sm">{TIER_LABELS[nft.tier as NFTTier]}</span>
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: colorHex }}
                    title={`${nft.color} wavelength`}
                  />
                  <span className="text-[#1A6B35] text-xs">{nft.color}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Favorite / Bookmark button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#1A3A2A] text-[#00AA2A] hover:text-[#00FF41] h-8 w-8"
                  onClick={() => setFavorited((prev) => !prev)}
                  aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={cn(
                      'size-4 transition-colors',
                      favorited && 'fill-[#FF3333] text-[#FF3333]'
                    )}
                  />
                </Button>

                {/* Share dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[#1A3A2A] text-[#00AA2A] hover:text-[#00FF41] h-8 w-8"
                      aria-label="Share"
                    >
                      {copied ? (
                        <Check className="size-4 text-[#00FF41]" />
                      ) : (
                        <Share2 className="size-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#0D1117] border-[#1A3A2A] text-[#00FF41]"
                  >
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-[#0D3B1E]/20 focus:bg-[#0D3B1E]/20"
                      onClick={handleShare}
                    >
                      <Link2 className="size-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-[#0D3B1E]/20 focus:bg-[#0D3B1E]/20"
                      onClick={() => {
                        const url = `${window.location.origin}/nft/${id}`
                        const text = `Check out this NFT: ${nft.name}`
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }}
                    >
                      <Twitter className="size-4 mr-2" />
                      Share on Twitter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Report button */}
                <AlertDialog open={reportOpen} onOpenChange={setReportOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[#1A3A2A] text-[#00AA2A] hover:text-[#00FF41] h-8 w-8"
                      aria-label="Report"
                    >
                      <Flag className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#0D1117] border-[#1A3A2A] text-[#00FF41]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#00FF41]">
                        Report Submitted
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[#00AA2A]">
                        Report submitted. Thank you for helping us maintain quality.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction className="bg-[#00FF41] text-black hover:bg-[#00CC33] text-black">
                        OK
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {nft.description && (
              <p className="text-[#00AA2A] text-sm mt-3 leading-relaxed">{nft.description}</p>
            )}
          </div>

          <Separator className="bg-[#0D3B1E]" />

          {/* Actions based on status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#00FF41]">Status</h3>
            {nft.status === 'ready' && (
              <div className="bg-[#0D1117] rounded-sm border border-[#0D3B1E] p-4">
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-[#1A6B35]" />
                  <div>
                    <p className="text-sm text-[#00CC33]">Coming Soon</p>
                    <p className="text-xs text-[#1A6B35]">This _unITM has not been minted yet.</p>
                  </div>
                </div>
                <Button
                  disabled
                  className="mt-3 w-full bg-[#111318] text-[#1A6B35] cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              </div>
            )}

            {nft.status === 'minted' && (
              <div className="bg-[#0D1117] rounded-sm border border-[#00FFFF]/20 p-4">
                <div className="flex items-center gap-3">
                  <Package className="size-5 text-[#00FFFF]" />
                  <div>
                    <p className="text-sm text-[#00FFFF]">Available</p>
                    <p className="text-xs text-[#1A6B35]">This _unITM is minted and available.</p>
                  </div>
                </div>
                {nft.package_id && (
                  <Button
                    asChild
                    className="mt-3 w-full bg-[#00FFFF] hover:bg-[#00FFFF]/80 text-black"
                  >
                    <Link href={`/packages/${nft.package_id}`}>
                      <Package className="size-4 mr-2" />
                      View Package
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {nft.status === 'delivered' && (
              <div className="bg-[#0D1117] rounded-sm border border-[#00FF41]/20 p-4">
                <div className="flex items-center gap-3">
                  <ExternalLink className="size-5 text-[#00FF41]" />
                  <div>
                    <p className="text-sm text-[#00CC33]">Delivered</p>
                    <p className="text-xs text-[#1A6B35]">
                      Owned by{' '}
                      <span className="text-[#00AA2A] font-mono">
                        {nft.owner_display_name ||
                          (nft.owner_wallet
                            ? `${nft.owner_wallet.slice(0, 6)}...${nft.owner_wallet.slice(-4)}`
                            : 'Unknown')}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {nft.owner_wallet && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[#1A3A2A] text-[#00CC33]"
                    >
                      <a
                        href={`https://solscan.io/account/${nft.owner_wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3.5 mr-1.5" />
                        View on Explorer
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-[#0D3B1E]" />

          {/* Metadata table */}
          <NFTMetadata nft={nft} />
        </div>
      </div>

      {/* Ownership History */}
      <Separator className="bg-[#0D3B1E]" />
      <NFTHistory history={history} loading={historyLoading} />

      {/* Related _unITM */}
      {relatedNfts.length > 0 && (
        <>
          <Separator className="bg-[#0D3B1E]" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#00FF41]">Related _unITM</h3>
              <Link
                href={`/browse?color=${nft.color}&tier=${nft.tier}`}
                className="text-sm text-[#00FF41] hover:text-[#00CC33] transition-colors"
              >
                View all
              </Link>
            </div>
            <NFTGrid nfts={relatedNfts} />
          </div>
        </>
      )}
    </div>
  )
}

function NFTDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs skeleton */}
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-28" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <Skeleton className="aspect-square rounded-sm" />

        {/* Details skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>

          <Skeleton className="h-px w-full" />

          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-24 w-full rounded-sm" />
          </div>

          <Skeleton className="h-px w-full" />

          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
