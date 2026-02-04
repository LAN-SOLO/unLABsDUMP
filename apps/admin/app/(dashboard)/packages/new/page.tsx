'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, X, Image as ImageIcon, Search } from 'lucide-react'

interface NFT {
  id: string
  name: string
  image_url: string | null
  rarity: string | null
}

export default function CreatePackagePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'SOL',
    max_supply: '',
    is_featured: false,
    is_active: true,
    start_date: '',
    end_date: '',
  })

  // NFT Selection
  const [availableNfts, setAvailableNfts] = useState<NFT[]>([])
  const [selectedNftIds, setSelectedNftIds] = useState<string[]>([])
  const [nftSearch, setNftSearch] = useState('')
  const [isLoadingNfts, setIsLoadingNfts] = useState(false)

  useEffect(() => {
    fetchNFTs()
  }, [])

  const fetchNFTs = async () => {
    setIsLoadingNfts(true)
    try {
      const res = await fetch('/api/nfts?limit=100&status=active')
      const data = await res.json()
      if (res.ok) {
        setAvailableNfts(data.nfts)
      }
    } catch {
      // Handle error
    } finally {
      setIsLoadingNfts(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleNft = (nftId: string) => {
    setSelectedNftIds((prev) =>
      prev.includes(nftId) ? prev.filter((id) => id !== nftId) : [...prev, nftId]
    )
  }

  const filteredNfts = availableNfts.filter((nft) =>
    nft.name.toLowerCase().includes(nftSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          max_supply: formData.max_supply ? parseInt(formData.max_supply) : undefined,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          nft_ids: selectedNftIds,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create package')
      }

      router.push('/packages')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/packages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Package</h1>
          <p className="text-slate-400 mt-1">Create a new NFT package or bundle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter package name"
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter package description"
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="0.00"
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleChange('currency', value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOL">SOL</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="_unSC">_unSC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max_supply">Max Supply (optional)</Label>
                    <Input
                      id="max_supply"
                      type="number"
                      min="1"
                      value={formData.max_supply}
                      onChange={(e) => handleChange('max_supply', e.target.value)}
                      placeholder="Unlimited"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NFT Selection */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">NFTs in Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected NFTs */}
                {selectedNftIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-700">
                    {selectedNftIds.map((id) => {
                      const nft = availableNfts.find((n) => n.id === id)
                      if (!nft) return null
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-lg"
                        >
                          <span className="text-sm">{nft.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleNft(id)}
                            className="hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search NFTs..."
                    value={nftSearch}
                    onChange={(e) => setNftSearch(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700"
                  />
                </div>

                {/* NFT Grid */}
                <div className="max-h-[400px] overflow-y-auto">
                  {isLoadingNfts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                    </div>
                  ) : filteredNfts.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No NFTs found</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filteredNfts.map((nft) => (
                        <button
                          key={nft.id}
                          type="button"
                          onClick={() => toggleNft(nft.id)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedNftIds.includes(nft.id)
                              ? 'border-purple-500 bg-purple-600/20'
                              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="aspect-square rounded bg-slate-700 mb-2 flex items-center justify-center overflow-hidden">
                            {nft.image_url ? (
                              <img
                                src={nft.image_url}
                                alt={nft.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-slate-500" />
                            )}
                          </div>
                          <p className="text-sm text-white font-medium truncate">{nft.name}</p>
                          {nft.rarity && (
                            <p className="text-xs text-slate-400 capitalize">{nft.rarity}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleChange('is_active', !!checked)}
                  />
                  <Label htmlFor="is_active" className="text-slate-300">
                    Active (visible in store)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleChange('is_featured', !!checked)}
                  />
                  <Label htmlFor="is_featured" className="text-slate-300">
                    Featured (shown prominently)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Schedule (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">NFTs included</span>
                  <span className="text-white">{selectedNftIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Price</span>
                  <span className="text-white">
                    {formData.price || '0'} {formData.currency}
                  </span>
                </div>
                {formData.max_supply && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max supply</span>
                    <span className="text-white">{formData.max_supply}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/packages')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={isLoading || !formData.name || !formData.price}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Package'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
