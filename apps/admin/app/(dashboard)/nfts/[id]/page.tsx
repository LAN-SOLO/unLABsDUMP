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
  common: 'bg-slate-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-500',
  active: 'bg-green-500',
  burned: 'bg-red-500',
  transferred: 'bg-cyan-500',
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
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
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
            <h1 className="text-3xl font-bold text-white">{nft.name}</h1>
            <p className="text-slate-400 mt-1">NFT Details</p>
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
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="text-white font-medium">{nft.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Collection</p>
                  <p className="text-white font-medium">{nft.collection || '-'}</p>
                </div>
              </div>

              <Separator className="bg-slate-800" />

              <div>
                <p className="text-sm text-slate-400">Description</p>
                <p className="text-white mt-1">{nft.description || 'No description'}</p>
              </div>

              <Separator className="bg-slate-800" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Rarity</p>
                  {nft.rarity ? (
                    <Badge className={`${rarityColors[nft.rarity]} text-white capitalize mt-1`}>
                      {nft.rarity}
                    </Badge>
                  ) : (
                    <p className="text-white">-</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge className={`${statusColors[nft.status]} text-white capitalize mt-1`}>
                    {nft.status}
                  </Badge>
                </div>
              </div>

              {nft.mint_address && (
                <>
                  <Separator className="bg-slate-800" />
                  <div>
                    <p className="text-sm text-slate-400">Mint Address</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-white text-sm bg-slate-800 px-2 py-1 rounded flex-1 truncate">
                        {nft.mint_address}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(nft.mint_address!)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
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
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-slate-300 bg-slate-800 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(nft.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Ownership History */}
          {nft.nft_ownership_history && nft.nft_ownership_history.length > 0 && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Ownership History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nft.nft_ownership_history.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                    >
                      <div>
                        <p className="text-white text-sm">Player: {history.player_id}</p>
                        <p className="text-xs text-slate-400 capitalize">
                          {history.acquisition_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-300">
                          {new Date(history.acquired_at).toLocaleDateString()}
                        </p>
                        {history.released_at && (
                          <p className="text-xs text-slate-400">
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
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                {nft.image_url ? (
                  <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-slate-500" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Created</p>
                <p className="text-white">{new Date(nft.created_at).toLocaleString()}</p>
              </div>
              {nft.updated_at && (
                <div>
                  <p className="text-sm text-slate-400">Last Updated</p>
                  <p className="text-white">{new Date(nft.updated_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
