'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Image as ImageIcon,
} from 'lucide-react'

interface NFT {
  id: string
  name: string
  description: string | null
  image_url: string | null
  metadata: Record<string, unknown> | null
  rarity: string | null
  collection: string | null
  mint_address: string | null
  status: string
  created_at: string
  updated_at: string | null
  nft_ownership_history: Array<{
    id: string
    player_id: string
    acquired_at: string
    released_at: string | null
    acquisition_type: string
  }>
}

const rarityColors: Record<string, string> = {
  common: 'bg-[#1A6B35]',
  uncommon: 'bg-[#00FF41]',
  rare: 'bg-[#00FFFF]',
  epic: 'bg-[#00CC33] text-black',
  legendary: 'bg-[#FFB000]',
}

const statusColors: Record<string, string> = {
  draft: 'bg-[#1A6B35]',
  active: 'bg-[#00FF41]',
  burned: 'bg-[#FF3333]',
  transferred: 'bg-[#00FFFF]',
}

export default function NFTDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [nft, setNft] = useState<NFT | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchNFT()
  }, [id])

  const fetchNFT = async () => {
    try {
      const res = await fetch(`/api/nfts/${id}`)
      const data = await res.json()

      if (res.ok) {
        setNft(data.nft)
      } else {
        router.push('/nfts')
      }
    } catch {
      router.push('/nfts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this NFT?')) return

    try {
      const res = await fetch(`/api/nfts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/nfts')
      }
    } catch {
      // Handle error
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
      </div>
    )
  }

  if (!nft) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/nfts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#00FF41]">{nft.name}</h1>
            <p className="text-[#00AA2A] mt-1">NFT Details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/nfts/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-[#00AA2A]">Name</p>
                  <p className="text-[#00FF41] font-medium">{nft.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[#00AA2A]">Collection</p>
                  <p className="text-[#00FF41] font-medium">{nft.collection || '-'}</p>
                </div>
              </div>

              <Separator className="bg-[#111318]" />

              <div>
                <p className="text-sm text-[#00AA2A]">Description</p>
                <p className="text-[#00FF41] mt-1">{nft.description || 'No description'}</p>
              </div>

              <Separator className="bg-[#111318]" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-[#00AA2A]">Rarity</p>
                  {nft.rarity ? (
                    <Badge className={`${rarityColors[nft.rarity]} text-[#00FF41] capitalize mt-1`}>
                      {nft.rarity}
                    </Badge>
                  ) : (
                    <p className="text-[#00FF41]">-</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#00AA2A]">Status</p>
                  <Badge className={`${statusColors[nft.status]} text-[#00FF41] capitalize mt-1`}>
                    {nft.status}
                  </Badge>
                </div>
              </div>

              {nft.mint_address && (
                <>
                  <Separator className="bg-[#111318]" />
                  <div>
                    <p className="text-sm text-[#00AA2A]">Mint Address</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-[#00FF41] text-sm bg-[#111318] px-2 py-1 rounded flex-1 truncate">
                        {nft.mint_address}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(nft.mint_address!)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-[#00FF41]" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={`https://explorer.solana.com/address/${nft.mint_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          {nft.metadata && Object.keys(nft.metadata).length > 0 && (
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-[#00CC33] bg-[#111318] p-4 rounded-sm overflow-auto">
                  {JSON.stringify(nft.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Ownership History */}
          {nft.nft_ownership_history && nft.nft_ownership_history.length > 0 && (
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Ownership History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nft.nft_ownership_history.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-3 bg-[#111318] rounded-sm"
                    >
                      <div>
                        <p className="text-[#00FF41] text-sm">Player: {history.player_id}</p>
                        <p className="text-xs text-[#00AA2A] capitalize">
                          {history.acquisition_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#00CC33]">
                          {new Date(history.acquired_at).toLocaleDateString()}
                        </p>
                        {history.released_at && (
                          <p className="text-xs text-[#00AA2A]">
                            Released: {new Date(history.released_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41]">Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-sm bg-[#111318] flex items-center justify-center overflow-hidden">
                {nft.image_url ? (
                  <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-[#1A6B35]" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41]">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[#00AA2A]">Created</p>
                <p className="text-[#00FF41]">{new Date(nft.created_at).toLocaleString()}</p>
              </div>
              {nft.updated_at && (
                <div>
                  <p className="text-sm text-[#00AA2A]">Last Updated</p>
                  <p className="text-[#00FF41]">{new Date(nft.updated_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
