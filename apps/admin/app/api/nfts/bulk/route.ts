import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(['update_status', 'delete']),
  status: z.enum(['draft', 'active', 'burned', 'transferred']).optional(),
})

const bulkImportItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  collection: z.string().optional(),
  status: z.enum(['draft', 'active']).default('draft'),
})

const bulkImportSchema = z.object({
  items: z.array(bulkImportItemSchema).min(1).max(100),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if this is a bulk update or bulk import
    if (body.ids) {
      // Bulk update/delete
      const result = bulkUpdateSchema.safeParse(body)

      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: result.error.flatten() },
          { status: 400 }
        )
      }

      const { ids, action, status } = result.data

      if (ids.length === 0) {
        return NextResponse.json({ error: 'No NFTs selected' }, { status: 400 })
      }

      const supabase = await createClient()

      if (action === 'delete') {
        const { error } = await supabase
          .from('nfts')
          .update({
            status: 'deleted',
            deleted_at: new Date().toISOString(),
          })
          .in('id', ids)

        if (error) {
          console.error('Bulk delete error:', error)
          return NextResponse.json({ error: 'Failed to delete NFTs' }, { status: 500 })
        }

        // Log audit
        await supabase.from('audit_logs').insert({
          admin_id: session.adminId,
          action: 'nft_bulk_deleted',
          entity_type: 'nft',
          details: { count: ids.length, ids },
        })

        return NextResponse.json({
          success: true,
          message: `${ids.length} NFT(s) deleted`,
          affected: ids.length,
        })
      }

      if (action === 'update_status' && status) {
        const { error } = await supabase
          .from('nfts')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .in('id', ids)

        if (error) {
          console.error('Bulk update error:', error)
          return NextResponse.json({ error: 'Failed to update NFTs' }, { status: 500 })
        }

        // Log audit
        await supabase.from('audit_logs').insert({
          admin_id: session.adminId,
          action: 'nft_bulk_updated',
          entity_type: 'nft',
          details: { count: ids.length, ids, newStatus: status },
        })

        return NextResponse.json({
          success: true,
          message: `${ids.length} NFT(s) updated to ${status}`,
          affected: ids.length,
        })
      }

      return NextResponse.json({ error: 'Invalid action or missing status' }, { status: 400 })
    } else if (body.items) {
      // Bulk import
      const result = bulkImportSchema.safeParse(body)

      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: result.error.flatten() },
          { status: 400 }
        )
      }

      const { items } = result.data

      const supabase = await createClient()

      const nftsToInsert = items.map((item) => ({
        ...item,
        created_by: session.adminId,
      }))

      const { data: nfts, error } = await supabase.from('nfts').insert(nftsToInsert).select()

      if (error) {
        console.error('Bulk import error:', error)
        return NextResponse.json({ error: 'Failed to import NFTs' }, { status: 500 })
      }

      // Log audit
      await supabase.from('audit_logs').insert({
        admin_id: session.adminId,
        action: 'nft_bulk_imported',
        entity_type: 'nft',
        details: { count: nfts?.length || 0 },
      })

      return NextResponse.json(
        {
          success: true,
          message: `${nfts?.length || 0} NFT(s) imported`,
          nfts,
        },
        { status: 201 }
      )
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
