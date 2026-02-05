'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, ExternalLink, Copy, Check, Flame, User, Calendar } from 'lucide-react'

interface Burn {
  id: string
  player_id: string
  amount: number
  token_type: string
  status: string
  reason: string | null
  transaction_signature: string | null
  created_at: string
  player: {
    id: string
    wallet_address: string
    username: string | null
  } | null
}

export default function BurnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [burn, setBurn] = useState<Burn | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchBurn()
  }, [id])

  const fetchBurn = async () => {
    try {
      const res = await fetch(`/api/burns/${id}`)
      const data = await res.json()

      if (res.ok) {
        setBurn(data.burn)
      } else {
        router.push('/burns')
      }
    } catch {
      router.push('/burns')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
      </div>
    )
  }

  if (!burn) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/burns">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#00FF41]">Burn Details</h1>
          <p className="text-[#00AA2A] mt-1 font-mono text-sm">{burn.id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Card */}
          <Card className="bg-gradient-to-br from-[#0D3B1E]/50 to-[#0D1117] border-[#00FF41]/30">
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#0D3B1E]/30 flex items-center justify-center">
                  <Flame className="h-8 w-8 text-[#00FF41]" />
                </div>
                <div className="text-center">
                  <p className="text-[#00AA2A]">Amount Burned</p>
                  <p className="text-4xl font-bold text-[#00FF41]">
                    {formatNumber(burn.amount)}{' '}
                    <span className="text-[#00FF41] text-2xl">{burn.token_type}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason */}
          {burn.reason && (
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#00CC33]">{burn.reason}</p>
              </CardContent>
            </Card>
          )}

          {/* Transaction */}
          {burn.transaction_signature && (
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-[#00CC33] bg-[#111318] p-3 rounded truncate">
                    {burn.transaction_signature}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(burn.transaction_signature!)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-[#00FF41]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={`https://explorer.solana.com/tx/${burn.transaction_signature}`}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41]">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  burn.status === 'completed'
                    ? 'bg-[#00FF41] text-[#00FF41]'
                    : 'bg-[#FFB000] text-[#00FF41]'
                }
              >
                {burn.status}
              </Badge>
            </CardContent>
          </Card>

          {/* Player Info */}
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41] flex items-center gap-2">
                <User className="h-5 w-5" />
                Player
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {burn.player ? (
                <>
                  <div>
                    <p className="text-sm text-[#00AA2A]">Username</p>
                    <p className="text-[#00FF41]">{burn.player.username || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#00AA2A]">Wallet</p>
                    <p className="text-[#00FF41] font-mono text-sm break-all">
                      {burn.player.wallet_address}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[#00AA2A]">Player not found</p>
              )}
            </CardContent>
          </Card>

          {/* Timestamp */}
          <Card className="bg-[#0D1117] border-[#0D3B1E]">
            <CardHeader>
              <CardTitle className="text-[#00FF41] flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#00FF41]">{new Date(burn.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
