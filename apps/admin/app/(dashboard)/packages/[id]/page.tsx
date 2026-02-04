'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  Package as PackageIcon,
  Star,
  Image as ImageIcon,
  Users,
  Calendar,
  DollarSign,
} from 'lucide-react'

interface Package {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  is_active: boolean
  is_featured: boolean
  max_supply: number | null
  sold_count: number
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string | null
  package_nfts: Array<{
    id: string
    name: string
    image_url: string | null
    rarity: string | null
    status: string
  }>
  purchases: Array<{
    id: string
    player_id: string
    created_at: string
  }>
}

const rarityColors: Record<string, string> = {
  common: 'bg-slate-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
}

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [pkg, setPkg] = useState<Package | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPackage()
  }, [id])

  const fetchPackage = async () => {
    try {
      const res = await fetch(`/api/packages/${id}`)
      const data = await res.json()

      if (res.ok) {
        setPkg(data.package)
      } else {
        router.push('/packages')
      }
    } catch {
      router.push('/packages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/packages')
      }
    } catch {
      // Handle error
    }
  }

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'SOL') return `${price} SOL`
    if (currency === 'USDC') return `$${price}`
    return `${price} ${currency}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!pkg) {
    return null
  }

  const revenue = (pkg.sold_count || 0) * pkg.price

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/packages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">{pkg.name}</h1>
              {pkg.is_featured && <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />}
            </div>
            <p className="text-slate-400 mt-1">Package Details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/packages/${id}/edit`}>
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Price</p>
                <p className="text-xl font-bold text-white">
                  {formatPrice(pkg.price, pkg.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <PackageIcon className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">NFTs Included</p>
                <p className="text-xl font-bold text-white">{pkg.package_nfts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-600/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Sales</p>
                <p className="text-xl font-bold text-white">
                  {pkg.sold_count || 0}
                  {pkg.max_supply && (
                    <span className="text-slate-400 text-sm"> / {pkg.max_supply}</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Revenue</p>
                <p className="text-xl font-bold text-white">{formatPrice(revenue, pkg.currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{pkg.description || 'No description'}</p>
            </CardContent>
          </Card>

          {/* NFTs */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">NFTs in Package</CardTitle>
            </CardHeader>
            <CardContent>
              {pkg.package_nfts && pkg.package_nfts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {pkg.package_nfts.map((nft) => (
                    <Link key={nft.id} href={`/nfts/${nft.id}`} className="group">
                      <div className="aspect-square rounded-lg bg-slate-800 overflow-hidden mb-2">
                        {nft.image_url ? (
                          <img
                            src={nft.image_url}
                            alt={nft.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-white font-medium truncate group-hover:text-purple-400">
                        {nft.name}
                      </p>
                      {nft.rarity && (
                        <Badge
                          className={`${rarityColors[nft.rarity]} text-white text-xs capitalize mt-1`}
                        >
                          {nft.rarity}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No NFTs in this package</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {pkg.purchases && pkg.purchases.length > 0 ? (
                <div className="space-y-3">
                  {pkg.purchases.slice(0, 10).map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-white">
                          Player: {purchase.player_id.slice(0, 8)}...
                        </p>
                      </div>
                      <p className="text-sm text-slate-400">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No purchases yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Visibility</span>
                <Badge className={pkg.is_active ? 'bg-green-500' : 'bg-slate-500'}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Featured</span>
                <Badge className={pkg.is_featured ? 'bg-yellow-500' : 'bg-slate-500'}>
                  {pkg.is_featured ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          {(pkg.start_date || pkg.end_date) && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pkg.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Start</p>
                      <p className="text-sm text-white">
                        {new Date(pkg.start_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {pkg.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">End</p>
                      <p className="text-sm text-white">
                        {new Date(pkg.end_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Created</p>
                <p className="text-white">{new Date(pkg.created_at).toLocaleString()}</p>
              </div>
              {pkg.updated_at && (
                <div>
                  <p className="text-sm text-slate-400">Last Updated</p>
                  <p className="text-white">{new Date(pkg.updated_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
