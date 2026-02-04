import sharp from 'sharp'

export interface ProcessedImages {
  original: Buffer
  preview: Buffer
  thumbnail: Buffer
  originalFormat: string
}

export interface ImageSizes {
  original: { width: number; height: number }
  preview: { width: number; height: number }
  thumbnail: { width: number; height: number }
}

const PREVIEW_SIZE = 800
const THUMBNAIL_SIZE = 200

/**
 * Process an uploaded image into multiple sizes.
 * Strips EXIF data and converts derivatives to WebP.
 */
export async function processNFTImage(buffer: Buffer, mimeType: string): Promise<ProcessedImages> {
  // Load and strip EXIF metadata from original
  const image = sharp(buffer).rotate() // auto-rotate based on EXIF, then strip

  const originalProcessed = await image.withMetadata({ orientation: undefined }).toBuffer()

  // Generate preview (800x800 max, maintaining aspect ratio)
  const preview = await sharp(buffer)
    .rotate()
    .resize(PREVIEW_SIZE, PREVIEW_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer()

  // Generate thumbnail (200x200, cover crop)
  const thumbnail = await sharp(buffer)
    .rotate()
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'cover',
    })
    .webp({ quality: 80 })
    .toBuffer()

  const ext = mimeType.split('/')[1] || 'jpeg'

  return {
    original: originalProcessed,
    preview,
    thumbnail,
    originalFormat: ext === 'jpeg' ? 'jpg' : ext,
  }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata()
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  }
}

/**
 * Generate storage paths for an NFT's images
 */
export function getNFTImagePaths(nftId: string): {
  original: string
  preview: string
  thumbnail: string
} {
  return {
    original: `nfts/${nftId}/original`,
    preview: `nfts/${nftId}/preview.webp`,
    thumbnail: `nfts/${nftId}/thumbnail.webp`,
  }
}
