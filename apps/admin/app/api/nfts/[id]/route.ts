import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateNFTSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  collection: z.string().optional(),
  mint_address: z.string().optional(),
  status: z.enum(['draft', 'active', 'burned', 'transferred']).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'NFT ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: nft, error } = await supabase
      .from('nfts')
      .select('*, nft_ownership_history(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
      }
      console.error('NFT fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch NFT' }, { status: 500 })
    }

    return NextResponse.json({ nft })
  } catch (error) {
    console.error('NFT get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'NFT ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const result = updateNFTSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if NFT exists
    const { data: existingNFT, error: fetchError } = await supabase
      .from('nfts')
      .select('id, name, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingNFT) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
    }

    const { data: nft, error: updateError } = await supabase
      .from('nfts')
      .update({
        ...result.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('NFT update error:', updateError)
      return NextResponse.json({ error: 'Failed to update NFT' }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'nft_updated',
      entity_type: 'nft',
      entity_id: nft.id,
      details: {
        changes: result.data,
        previous: { name: existingNFT.name, status: existingNFT.status },
      },
    })

    return NextResponse.json({ nft })
  } catch (error) {
    console.error('NFT update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'NFT ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if NFT exists
    const { data: existingNFT, error: fetchError } = await supabase
      .from('nfts')
      .select('id, name, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingNFT) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
    }

    // Soft delete - mark as deleted instead of removing
    const { error: deleteError } = await supabase
      .from('nfts')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (deleteError) {
      console.error('NFT delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete NFT' }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'nft_deleted',
      entity_type: 'nft',
      entity_id: id,
      details: { name: existingNFT.name },
    })

    return NextResponse.json({
      success: true,
      message: 'NFT deleted successfully',
    })
  } catch (error) {
    console.error('NFT delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
