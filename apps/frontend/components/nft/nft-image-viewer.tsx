'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface NFTImageViewerProps {
  src: string
  alt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NFTImageViewer({ src, alt, open, onOpenChange }: NFTImageViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [loaded, setLoaded] = useState(false)

  function handleZoomIn() {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  function handleRotate() {
    setRotation((prev) => (prev + 90) % 360)
  }

  function handleReset() {
    setZoom(1)
    setRotation(0)
  }

  // Reset state when dialog opens
  function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      setZoom(1)
      setRotation(0)
      setLoaded(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-slate-950 border-slate-800 max-w-4xl w-[95vw] max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-sm truncate pr-8">{alt}</DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="text-slate-400 hover:text-white"
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="text-slate-500 text-xs w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="text-slate-400 hover:text-white"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleRotate}
                className="text-slate-400 hover:text-white"
              >
                <RotateCw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleReset}
                className="text-slate-400 hover:text-white text-xs"
              >
                Reset
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Image display */}
        <div className="relative overflow-auto flex items-center justify-center min-h-[400px] max-h-[calc(95vh-80px)] bg-slate-950">
          {!loaded && <Skeleton className="absolute inset-8 rounded-lg" />}
          <div
            className="transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <Image
              src={src}
              alt={alt}
              width={800}
              height={800}
              className={cn(
                'max-w-full h-auto object-contain transition-opacity',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setLoaded(true)}
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ClickableImageProps {
  src?: string
  alt: string
  fallbackColor?: string
  className?: string
}

export function ClickableNFTImage({ src, alt, fallbackColor, className }: ClickableImageProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!src || imageError) {
    return (
      <div
        className={cn(
          'relative aspect-square bg-slate-800 rounded-lg flex items-center justify-center',
          className
        )}
      >
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-3 opacity-40"
            style={{ backgroundColor: fallbackColor || '#8B5CF6' }}
          />
          <span className="text-slate-500 text-sm">No Image Available</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          'relative aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-zoom-in group',
          className
        )}
        onClick={() => setViewerOpen(true)}
      >
        {!imageLoaded && <Skeleton className="absolute inset-0 rounded-lg" />}
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            'object-cover transition-all duration-300 group-hover:scale-105',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <ZoomIn className="size-8 text-white drop-shadow-lg" />
        </div>
      </div>

      <NFTImageViewer src={src} alt={alt} open={viewerOpen} onOpenChange={setViewerOpen} />
    </>
  )
}
