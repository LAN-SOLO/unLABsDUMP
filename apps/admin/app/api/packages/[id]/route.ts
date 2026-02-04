import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updatePackageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.enum(['SOL', 'USDC', '_unSC']).optional(),
  nft_ids: z.array(z.string().uuid()).optional(),
  max_supply: z.number().int().min(1).nullable().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  start_date: z.string().datetime().nullable().optional(),
  end_date: z.string().datetime().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
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
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: pkg, error } = await supabase
      .from('packages')
      .select(
        '*, package_nfts:nfts(id, name, image_url, rarity, status), purchases(id, player_id, created_at)'
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 })
      }
      console.error('Package fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 })
    }

    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error('Package get error:', error)
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
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const result = updatePackageSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { nft_ids, ...packageData } = result.data
    const supabase = await createClient()

    // Check if package exists
    const { data: existingPkg, error: fetchError } = await supabase
      .from('packages')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingPkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Update package
    const { data: pkg, error: updateError } = await supabase
      .from('packages')
      .update({
        ...packageData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Package update error:', updateError)
      return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
    }

    // If NFT IDs provided, update associations
    if (nft_ids !== undefined) {
      // Remove existing associations
      await supabase.from('package_nfts').delete().eq('package_id', id)

      // Add new associations
      if (nft_ids.length > 0) {
        const packageNfts = nft_ids.map((nft_id) => ({
          package_id: id,
          nft_id,
        }))
        await supabase.from('package_nfts').insert(packageNfts)
      }
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'package_updated',
      entity_type: 'package',
      entity_id: pkg.id,
      details: { changes: result.data },
    })

    return NextResponse.json({ package: pkg })
  } catch (error) {
    console.error('Package update error:', error)
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
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if package exists
    const { data: existingPkg, error: fetchError } = await supabase
      .from('packages')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingPkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('packages')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (deleteError) {
      console.error('Package delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'package_deleted',
      entity_type: 'package',
      entity_id: id,
      details: { name: existingPkg.name },
    })

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    })
  } catch (error) {
    console.error('Package delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
