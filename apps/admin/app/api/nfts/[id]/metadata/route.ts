import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import {
  validateMetadata,
  parseMetadata,
  calculateRarityScore,
  getRarityLabel,
  toMetaplexAttributes,
} from '@/lib/nft/metadata'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { data: nft, error } = await supabase
      .from('nfts')
      .select('id, name, metadata')
      .eq('id', id)
      .single()

    if (error || !nft) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
    }

    const parsed = parseMetadata(nft.metadata)
    const rarityScore = calculateRarityScore(parsed)
    const attributes = toMetaplexAttributes(parsed)

    return NextResponse.json({
      id: nft.id,
      name: nft.name,
      metadata: parsed,
      rarityScore,
      rarityLabel: getRarityLabel(rarityScore),
      metaplexAttributes: attributes,
    })
  } catch (error) {
    console.error('Metadata fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate metadata
    const validation = validateMetadata(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid metadata', details: validation.errors },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check NFT exists
    const { data: existingNft, error: fetchError } = await supabase
      .from('nfts')
      .select('id, metadata')
      .eq('id', id)
      .single()

    if (fetchError || !existingNft) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
    }

    // Merge with existing metadata
    const currentMetadata = parseMetadata(existingNft.metadata)
    const updatedMetadata = { ...currentMetadata, ...body }

    const { data: nft, error: updateError } = await supabase
      .from('nfts')
      .update({ metadata: updatedMetadata })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 })
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'metadata_updated',
      entity_type: 'nft',
      entity_id: id,
      details: { metadata: updatedMetadata },
    })

    const parsed = parseMetadata(nft.metadata)
    const rarityScore = calculateRarityScore(parsed)

    return NextResponse.json({
      id: nft.id,
      metadata: parsed,
      rarityScore,
      rarityLabel: getRarityLabel(rarityScore),
    })
  } catch (error) {
    console.error('Metadata update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
