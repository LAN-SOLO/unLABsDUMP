'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  ArrowLeft,
  Play,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Package,
  Image as ImageIcon,
} from 'lucide-react'

interface Delivery {
  id: string
  status: string
  delivery_type: string
  notes: string | null
  error_message: string | null
  transaction_signature: string | null
  created_at: string
  completed_at: string | null
  player: {
    id: string
    wallet_address: string
    username: string | null
  } | null
  nfts: Array<{
    nft: {
      id: string
      name: string
      image_url: string | null
      rarity: string | null
    }
  }>
  purchase: {
    id: string
    package: {
      id: string
      name: string
      price: number
    } | null
  } | null
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { color: 'text-[#FFB000]', bgColor: 'bg-[#FFB000]/20', icon: Clock },
  processing: { color: 'text-[#00FFFF]', bgColor: 'bg-[#00FFFF]/20', icon: RefreshCw },
  completed: { color: 'text-[#00FF41]', bgColor: 'bg-[#00FF41]/20', icon: CheckCircle },
  failed: { color: 'text-[#FF3333]', bgColor: 'bg-[#FF3333]/20', icon: XCircle },
}

const rarityColors: Record<string, string> = {
  common: 'bg-[#1A6B35]',
  uncommon: 'bg-[#00FF41]',
  rare: 'bg-[#00FFFF]',
  epic: 'bg-[#00FF41]',
  legendary: 'bg-[#FFB000]',
}

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchDelivery()
  }, [id])

  const fetchDelivery = async () => {
    try {
      const res = await fetch(`/api/deliveries/${id}`)
      const data = await res.json()

      if (res.ok) {
        setDelivery(data.delivery)
      } else {
        router.push('/deliveries')
      }
    } catch {
      router.push('/deliveries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcess = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/deliveries/${id}/process`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchDelivery()
      }
    } catch {
      // Handle error
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetry = async () => {
    await fetch(`/api/deliveries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending', error_message: null }),
    })
    handleProcess()
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

  if (!delivery) {
    return null
  }

  const StatusIcon = statusConfig[delivery.status]?.icon || Clock

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/deliveries">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#00FF41]">Delivery Details</h1>
            <p className="text-[#00AA2A] mt-1 font-mono text-sm">{delivery.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {delivery.status === 'pending' && (
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="bg-[#00FF41] text-black hover:bg-[#00CC33]"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Process Now
            </Button>
          )}
          {delivery.status === 'failed' && (
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <Card className={`${statusConfig[delivery.status]?.bgColor} border-0`}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 ${statusConfig[delivery.status]?.color}`} />
            <div>
              <p className={`font-medium capitalize ${statusConfig[delivery.status]?.color}`}>
                {delivery.status}
              </p>
              {delivery.status === 'completed' && delivery.completed_at && (
                <p className="text-sm text-[#00AA2A]">
                  Completed {new Date(delivery.completed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {delivery.error_message && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{delivery.error_message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* NFTs */}
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41]">NFTs to Deliver</CardTitle>
            </CardHeader>
            <CardContent>
              {delivery.nfts && delivery.nfts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {delivery.nfts.map(({ nft }) => (
                    <Link key={nft.id} href={`/nfts/${nft.id}`} className="group">
                      <div className="aspect-square rounded-sm bg-[#111318] overflow-hidden mb-2">
                        {nft.image_url ? (
                          <img
                            src={nft.image_url}
                            alt={nft.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-[#1A6B35]" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#00FF41] font-medium truncate group-hover:text-[#00FF41]">
                        {nft.name}
                      </p>
                      {nft.rarity && (
                        <Badge
                          className={`${rarityColors[nft.rarity]} text-[#00FF41] text-xs capitalize mt-1`}
                        >
                          {nft.rarity}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[#00AA2A] text-center py-8">No NFTs in this delivery</p>
              )}
            </CardContent>
          </Card>

          {/* Transaction */}
          {delivery.transaction_signature && (
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-[#00CC33] bg-[#111318] p-3 rounded truncate">
                    {delivery.transaction_signature}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(delivery.transaction_signature!)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-[#00FF41]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={`https://explorer.solana.com/tx/${delivery.transaction_signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {delivery.notes && (
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#00CC33]">{delivery.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Player Info */}
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41] flex items-center gap-2">
                <User className="h-5 w-5" />
                Recipient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {delivery.player ? (
                <>
                  <div>
                    <p className="text-sm text-[#00AA2A]">Username</p>
                    <p className="text-[#00FF41]">{delivery.player.username || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#00AA2A]">Wallet</p>
                    <p className="text-[#00FF41] font-mono text-sm break-all">
                      {delivery.player.wallet_address}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[#00AA2A]">Player not found</p>
              )}
            </CardContent>
          </Card>

          {/* Purchase Info */}
          {delivery.purchase?.package && (
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41] flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Package
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-[#00AA2A]">Name</p>
                  <Link
                    href={`/packages/${delivery.purchase.package.id}`}
                    className="text-[#00FF41] hover:text-[#00FF41]"
                  >
                    {delivery.purchase.package.name}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-[#00AA2A]">Price</p>
                  <p className="text-[#00FF41]">{delivery.purchase.package.price} SOL</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41]">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[#00AA2A]">Created</p>
                <p className="text-[#00FF41]">{new Date(delivery.created_at).toLocaleString()}</p>
              </div>
              {delivery.completed_at && (
                <div>
                  <p className="text-sm text-[#00AA2A]">Completed</p>
                  <p className="text-[#00FF41]">
                    {new Date(delivery.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
              <Separator className="bg-[#1A3A2A]" />
              <div>
                <p className="text-sm text-[#00AA2A]">Type</p>
                <Badge variant="outline" className="capitalize mt-1">
                  {delivery.delivery_type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
