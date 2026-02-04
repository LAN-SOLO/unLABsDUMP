import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { processNFTImage, getImageDimensions, getNFTImagePaths } from '@/lib/storage/nft-images'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const nftId = formData.get('nft_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size: 10MB' }, { status: 400 })
    }

    const supabase = await createClient()
    const buffer = Buffer.from(await file.arrayBuffer())

    // Get original dimensions
    const dimensions = await getImageDimensions(buffer)

    // Process image into multiple sizes
    const processed = await processNFTImage(buffer, file.type)

    // Generate paths
    const imageId = nftId || randomUUID()
    const paths = getNFTImagePaths(imageId)

    // Upload all sizes in parallel
    const [originalUpload, previewUpload, thumbnailUpload] = await Promise.all([
      supabase.storage
        .from('nft-images')
        .upload(`${paths.original}.${processed.originalFormat}`, processed.original, {
          contentType: file.type,
          upsert: true,
        }),
      supabase.storage.from('nft-images').upload(paths.preview, processed.preview, {
        contentType: 'image/webp',
        upsert: true,
      }),
      supabase.storage.from('nft-images').upload(paths.thumbnail, processed.thumbnail, {
        contentType: 'image/webp',
        upsert: true,
      }),
    ])

    if (originalUpload.error) {
      console.error('Original upload error:', originalUpload.error)
      return NextResponse.json({ error: 'Failed to upload original image' }, { status: 500 })
    }

    // Get public URLs
    const { data: originalUrl } = supabase.storage
      .from('nft-images')
      .getPublicUrl(originalUpload.data.path)

    const previewUrl = previewUpload.data
      ? supabase.storage.from('nft-images').getPublicUrl(previewUpload.data.path).data.publicUrl
      : null

    const thumbnailUrl = thumbnailUpload.data
      ? supabase.storage.from('nft-images').getPublicUrl(thumbnailUpload.data.path).data.publicUrl
      : null

    return NextResponse.json({
      url: originalUrl.publicUrl,
      path: originalUpload.data.path,
      preview_url: previewUrl,
      thumbnail_url: thumbnailUrl,
      dimensions,
      sizes: {
        original: processed.original.length,
        preview: processed.preview.length,
        thumbnail: processed.thumbnail.length,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
