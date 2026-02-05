import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { SLICES_PER_NFT } from '@/lib/mintpool/config'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('player_session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nft_id } = body

    if (!nft_id) {
      return NextResponse.json({ error: 'Missing nft_id' }, { status: 400 })
    }

    const supabase = await createSupabaseAdminClient()

    // Verify player owns enough slices for this NFT
    const { data: slices } = await supabase
      .from('mint_pool_slices')
      .select('id')
      .eq('player_id', session.playerId)
      .eq('nft_id', nft_id)

    if (!slices || slices.length < SLICES_PER_NFT) {
      return NextResponse.json(
        {
          error: `Need ${SLICES_PER_NFT} slices, have ${slices?.length || 0}`,
        },
        { status: 400 }
      )
    }

    const sliceIds = slices.map((s) => s.id)

    // Create assembly record
    const { data: assembly, error: assemblyError } = await supabase
      .from('mint_pool_assemblies')
      .insert({
        player_id: session.playerId,
        nft_id,
        slice_ids: sliceIds,
        status: 'processing',
      })
      .select()
      .single()

    if (assemblyError) {
      console.error('Assembly creation error:', assemblyError)
      return NextResponse.json({ error: 'Failed to create assembly' }, { status: 500 })
    }

    // Update NFT: set owner and status to delivered
    const { error: nftError } = await supabase
      .from('nfts')
      .update({
        owner_id: session.playerId,
        owner_wallet: session.walletAddress,
        status: 'delivered',
        updated_at: new Date().toISOString(),
      })
      .eq('id', nft_id)
      .eq('status', 'hidden')

    if (nftError) {
      // Rollback assembly
      await supabase
        .from('mint_pool_assemblies')
        .update({ status: 'failed', error_message: nftError.message })
        .eq('id', assembly.id)
      return NextResponse.json({ error: 'Failed to claim NFT' }, { status: 500 })
    }

    // Create ownership history record
    await supabase.from('nft_ownership_history').insert({
      nft_id,
      from_wallet: null,
      to_wallet: session.walletAddress,
      transfer_type: 'mint_pool_assembly',
    })

    // Mark assembly as completed
    await supabase
      .from('mint_pool_assemblies')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', assembly.id)

    return NextResponse.json({
      success: true,
      assembly_id: assembly.id,
      nft_id,
    })
  } catch (error) {
    console.error('Assemble error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
