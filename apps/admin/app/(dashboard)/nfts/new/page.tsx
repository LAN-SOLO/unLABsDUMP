'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, ArrowRight, Upload, X, Check } from 'lucide-react'
import { MetadataForm } from '@/components/nft/metadata-form'
import {
  type NFTMetadata,
  calculateRarityScore,
  getRarityLabel,
  TIER_LABELS,
  COLOR_HEX,
} from '@/lib/nft/metadata'

const STEPS = ['Image Upload', 'Metadata', 'Review & Create']

export default function CreateNFTPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    collection: '',
    status: 'draft',
  })

  const [metadata, setMetadata] = useState<NFTMetadata>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (file: File) => {
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          collection: formData.collection || undefined,
          metadata,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create NFT')
      }

      router.push('/nfts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    if (currentStep === 0) return !!formData.name
    if (currentStep === 1) return true
    return true
  }

  const rarityScore = calculateRarityScore(metadata)
  const rarityLabel = getRarityLabel(rarityScore)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/nfts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create NFT</h1>
          <p className="text-slate-400 mt-1">Add a new NFT to your collection</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => index < currentStep && setCurrentStep(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                index === currentStep
                  ? 'bg-purple-600 text-white'
                  : index < currentStep
                    ? 'bg-slate-800 text-purple-400 cursor-pointer hover:bg-slate-700'
                    : 'bg-slate-800/50 text-slate-500'
              }`}
              disabled={index > currentStep}
            >
              <span
                className={`flex items-center justify-center h-6 w-6 rounded-full text-xs ${
                  index < currentStep ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 min-w-4 ${index < currentStep ? 'bg-purple-500' : 'bg-slate-700'}`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Image Upload */}
      {currentStep === 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter NFT name"
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
                    placeholder="Enter NFT description"
                    className="bg-slate-800 border-slate-700 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collection">Collection</Label>
                  <Input
                    id="collection"
                    value={formData.collection}
                    onChange={(e) => handleChange('collection', e.target.value)}
                    placeholder="Collection name"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.image_url ? (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="NFT Preview"
                        className="w-full aspect-square object-cover rounded-lg"
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
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                    >
                      {isUploading ? (
                        <div className="space-y-2">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-500" />
                          <p className="text-sm text-slate-400">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-slate-500" />
                          <p className="mt-2 text-sm text-slate-400">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-xs text-slate-500">PNG, JPG, GIF, WebP up to 10MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileInput}
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
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Metadata */}
      {currentStep === 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">UnstableLabs Traits</CardTitle>
            </CardHeader>
            <CardContent>
              <MetadataForm metadata={metadata} onChange={setMetadata} />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="NFT Preview"
                  className="w-full max-w-xs mx-auto aspect-square object-cover rounded-lg"
                />
              )}
              <div className="space-y-2 text-sm">
                <h3 className="text-lg font-bold text-white">{formData.name}</h3>
                {formData.description && <p className="text-slate-400">{formData.description}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Review & Create */}
      {currentStep === 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Review NFT Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="NFT Preview"
                  className="w-full max-w-sm mx-auto aspect-square object-cover rounded-lg"
                />
              )}

              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-400">Name</span>
                  <span className="text-white font-medium">{formData.name}</span>
                </div>
                {formData.description && (
                  <div className="p-2 bg-slate-800 rounded">
                    <span className="text-slate-400 text-sm">Description</span>
                    <p className="text-white text-sm mt-1">{formData.description}</p>
                  </div>
                )}
                {formData.collection && (
                  <div className="flex justify-between p-2 bg-slate-800 rounded">
                    <span className="text-slate-400">Collection</span>
                    <span className="text-white">{formData.collection}</span>
                  </div>
                )}
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-400">Status</span>
                  <Badge className="bg-slate-600 text-white capitalize">{formData.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Traits Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between p-2 bg-slate-800 rounded">
                <span className="text-slate-400">Rarity</span>
                <Badge
                  className={`${
                    rarityLabel === 'Legendary'
                      ? 'bg-yellow-500'
                      : rarityLabel === 'Epic'
                        ? 'bg-purple-500'
                        : rarityLabel === 'Rare'
                          ? 'bg-blue-500'
                          : rarityLabel === 'Uncommon'
                            ? 'bg-green-500'
                            : 'bg-slate-500'
                  } text-white`}
                >
                  {rarityLabel} ({rarityScore})
                </Badge>
              </div>

              {metadata._capture && (
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-400">_capture</span>
                  <span className="text-white font-mono text-sm">{metadata._capture}</span>
                </div>
              )}

              {metadata._color && (
                <div className="flex justify-between items-center p-2 bg-slate-800 rounded">
                  <span className="text-slate-400">_color</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLOR_HEX[metadata._color] }}
                    />
                    <span className="text-white">{metadata._color}</span>
                  </div>
                </div>
              )}

              {metadata._io && (
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-400">_I/O</span>
                  <span className="text-white">
                    {metadata._io === 'CW' ? 'Clockwise' : 'Counter-Clockwise'}
                  </span>
                </div>
              )}

              {metadata.tier && (
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-400">Tier</span>
                  <span className="text-white">
                    Tier {metadata.tier} - {TIER_LABELS[metadata.tier]}
                  </span>
                </div>
              )}

              {metadata.bit && (
                <div className="flex justify-between p-2 bg-slate-800 rounded">
                  <span className="text-slate-400">Era</span>
                  <span className="text-white">{metadata.bit}</span>
                </div>
              )}

              {metadata.custom_spec && Object.keys(metadata.custom_spec).length > 0 && (
                <div className="p-2 bg-slate-800 rounded space-y-1">
                  <span className="text-slate-400 text-sm">Custom Specs</span>
                  {Object.entries(metadata.custom_spec).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-purple-400 font-mono">{key}</span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {!metadata._capture &&
                !metadata._color &&
                !metadata._io &&
                !metadata.tier &&
                !metadata.bit && (
                  <p className="text-slate-500 text-sm text-center py-4">No traits configured</p>
                )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() =>
            currentStep === 0 ? router.push('/nfts') : setCurrentStep(currentStep - 1)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create NFT'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
