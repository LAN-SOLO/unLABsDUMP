import { createSupabaseAdminClient } from '@/lib/supabase/server'

export interface OwnershipResult {
  owns: boolean
  nft_id: string
  wallet: string
}

export async function verifyNFTOwnership(wallet: string, nftId: string): Promise<OwnershipResult> {
  const supabase = await createSupabaseAdminClient()

  // Look up the player by wallet address
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('wallet_address', wallet)
    .single()

  if (!player) {
    return { owns: false, nft_id: nftId, wallet }
  }

  // Check if the NFT belongs to this player
  const { data: nft } = await supabase
    .from('nfts')
    .select('id')
    .eq('id', nftId)
    .eq('owner_id', player.id)
    .single()

  return {
    owns: !!nft,
    nft_id: nftId,
    wallet,
  }
}

export async function getPlayerNFTs(wallet: string) {
  const supabase = await createSupabaseAdminClient()

  // Look up the player by wallet address
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('wallet_address', wallet)
    .single()

  if (!player) {
    return { nfts: [], total: 0, wallet }
  }

  const { data: nfts, error } = await supabase
    .from('nfts')
    .select('*')
    .eq('owner_id', player.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch NFTs: ${error.message}`)
  }

  return {
    nfts: nfts ?? [],
    total: nfts?.length ?? 0,
    wallet,
  }
}

export async function getNFTById(id: string) {
  const supabase = await createSupabaseAdminClient()

  const { data: nft, error } = await supabase.from('nfts').select('*').eq('id', id).single()

  if (error || !nft) {
    return null
  }

  return nft
}
