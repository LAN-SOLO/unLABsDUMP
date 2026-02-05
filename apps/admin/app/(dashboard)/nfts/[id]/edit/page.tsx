'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, X, Image as ImageIcon } from 'lucide-react'

interface NFT {
  id: string
  name: string
  description: string | null
  image_url: string | null
  rarity: string | null
  collection: string | null
  mint_address: string | null
  status: string
}

export default function EditNFTPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    rarity: '',
    collection: '',
    mint_address: '',
    status: 'draft',
  })

  useEffect(() => {
    fetchNFT()
  }, [id])

  const fetchNFT = async () => {
    try {
      const res = await fetch(`/api/nfts/${id}`)
      const data = await res.json()

      if (res.ok) {
        const nft = data.nft as NFT
        setFormData({
          name: nft.name,
          description: nft.description || '',
          image_url: nft.image_url || '',
          rarity: nft.rarity || '',
          collection: nft.collection || '',
          mint_address: nft.mint_address || '',
          status: nft.status,
        })
      } else {
        router.push('/nfts')
      }
    } catch {
      router.push('/nfts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const res = await fetch('/api/nfts/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFormData((prev) => ({ ...prev, image_url: data.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/nfts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rarity: formData.rarity || undefined,
          collection: formData.collection || undefined,
          mint_address: formData.mint_address || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update NFT')
      }

      router.push(`/nfts/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF41]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/nfts/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#00FF41]">Edit NFT</h1>
          <p className="text-[#00AA2A] mt-1">Update NFT details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Basic Information</CardTitle>
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
                    placeholder="Enter NFT name"
                    className="bg-[#111318] border-[#1A3A2A]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter NFT description"
                    className="bg-[#111318] border-[#1A3A2A] min-h-[100px]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="collection">Collection</Label>
                    <Input
                      id="collection"
                      value={formData.collection}
                      onChange={(e) => handleChange('collection', e.target.value)}
                      placeholder="Collection name"
                      className="bg-[#111318] border-[#1A3A2A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rarity">Rarity</Label>
                    <Select
                      value={formData.rarity}
                      onValueChange={(value) => handleChange('rarity', value)}
                    >
                      <SelectTrigger className="bg-[#111318] border-[#1A3A2A]">
                        <SelectValue placeholder="Select rarity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="uncommon">Uncommon</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mint_address">Mint Address</Label>
                  <Input
                    id="mint_address"
                    value={formData.mint_address}
                    onChange={(e) => handleChange('mint_address', e.target.value)}
                    placeholder="Solana mint address"
                    className="bg-[#111318] border-[#1A3A2A] font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.image_url ? (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="NFT Preview"
                        className="w-full aspect-square object-cover rounded-sm"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleChange('image_url', '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-[#1A3A2A] rounded-sm p-6 text-center">
                      {isUploading ? (
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00FF41]" />
                      ) : (
                        <>
                          <ImageIcon className="mx-auto h-12 w-12 text-[#1A6B35]" />
                          <p className="mt-2 text-sm text-[#00AA2A]">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-xs text-[#1A6B35]">PNG, JPG, GIF, WebP up to 5MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="image_url">Or enter image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => handleChange('image_url', e.target.value)}
                      placeholder="https://..."
                      className="bg-[#111318] border-[#1A3A2A]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="bg-[#0D1117] border-[#0D3B1E]">
              <CardHeader>
                <CardTitle className="text-[#00FF41]">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger className="bg-[#111318] border-[#1A3A2A]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="burned">Burned</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/nfts/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#00FF41] text-black hover:bg-[#00CC33]"
                disabled={isSaving || !formData.name}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
