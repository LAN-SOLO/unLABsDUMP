import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateDeliverySchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  notes: z.string().optional(),
  error_message: z.string().optional(),
  transaction_signature: z.string().optional(),
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
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select(
        `
        *,
        player:players(id, wallet_address, username),
        nfts:delivery_nfts(nft:nfts(id, name, image_url, rarity)),
        purchase:purchases(id, package:packages(id, name, price))
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
      }
      console.error('Delivery fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch delivery' }, { status: 500 })
    }

    return NextResponse.json({ delivery })
  } catch (error) {
    console.error('Delivery get error:', error)
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
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const result = updateDeliverySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if delivery exists
    const { data: existingDelivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingDelivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      ...result.data,
      updated_at: new Date().toISOString(),
    }

    // Set completed_at if status is changing to completed
    if (result.data.status === 'completed' && existingDelivery.status !== 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data: delivery, error: updateError } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Delivery update error:', updateError)
      return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: session.adminId,
      action: 'delivery_updated',
      entity_type: 'delivery',
      entity_id: delivery.id,
      details: { changes: result.data, previousStatus: existingDelivery.status },
    })

    return NextResponse.json({ delivery })
  } catch (error) {
    console.error('Delivery update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
