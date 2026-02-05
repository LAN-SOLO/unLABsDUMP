import { type SupabaseClient } from '@supabase/supabase-js'
import {
  ROUND_DURATION_SECONDS,
  SLICES_PER_NFT,
  HASH_SHARE_WEIGHT,
  CLICK_SHARE_WEIGHT,
  DEFAULT_DIFFICULTY,
} from './config'

/**
 * Advance rounds through the state machine:
 * pending → active → computing → completed
 * Called by the cron route.
 */
export async function advanceRounds(supabase: SupabaseClient) {
  const now = new Date().toISOString()

  // 1. Complete any active rounds whose time has expired
  const { data: expiredRounds } = await supabase
    .from('mint_pool_rounds')
    .select('*')
    .eq('status', 'active')
    .lt('ends_at', now)

  for (const round of expiredRounds || []) {
    // Transition to computing
    await supabase
      .from('mint_pool_rounds')
      .update({ status: 'computing', updated_at: now })
      .eq('id', round.id)

    // Distribute slices
    await distributeSlices(supabase, round.id, round.nft_pool_ids)

    // Mark completed
    await supabase
      .from('mint_pool_rounds')
      .update({ status: 'completed', completed_at: now, updated_at: now })
      .eq('id', round.id)
  }

  // 2. Activate any pending rounds whose start time has passed
  const { data: pendingRounds } = await supabase
    .from('mint_pool_rounds')
    .select('*')
    .eq('status', 'pending')
    .lte('starts_at', now)
    .order('round_number', { ascending: true })
    .limit(1)

  if (pendingRounds && pendingRounds.length > 0) {
    const round = pendingRounds[0]
    await supabase
      .from('mint_pool_rounds')
      .update({ status: 'active', updated_at: now })
      .eq('id', round.id)
  }

  // 3. Ensure there's always a next pending round
  const { data: activeOrPending } = await supabase
    .from('mint_pool_rounds')
    .select('id')
    .in('status', ['active', 'pending'])
    .limit(1)

  if (!activeOrPending || activeOrPending.length === 0) {
    await createNextRound(supabase)
  }
}

async function createNextRound(supabase: SupabaseClient) {
  // Get the latest round number
  const { data: lastRound } = await supabase
    .from('mint_pool_rounds')
    .select('round_number')
    .order('round_number', { ascending: false })
    .limit(1)

  const nextNumber = lastRound && lastRound.length > 0 ? lastRound[0].round_number + 1 : 1

  // Get hidden NFTs for the pool
  const { data: hiddenNfts } = await supabase
    .from('nfts')
    .select('id')
    .eq('status', 'hidden')
    .limit(20)

  const nftPoolIds = (hiddenNfts || []).map((n) => n.id)

  const startsAt = new Date(Date.now() + 10_000) // Start in 10 seconds
  const endsAt = new Date(startsAt.getTime() + ROUND_DURATION_SECONDS * 1000)

  await supabase.from('mint_pool_rounds').insert({
    round_number: nextNumber,
    status: 'pending',
    difficulty: DEFAULT_DIFFICULTY,
    duration_seconds: ROUND_DURATION_SECONDS,
    nft_pool_ids: nftPoolIds,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
  })
}

async function distributeSlices(supabase: SupabaseClient, roundId: string, nftPoolIds: string[]) {
  if (nftPoolIds.length === 0) return

  // Get all participants for this round
  const { data: participants } = await supabase
    .from('mint_pool_participants')
    .select('*')
    .eq('round_id', roundId)

  if (!participants || participants.length === 0) return

  // Calculate effective shares for each participant
  const shares = participants.map((p) => ({
    playerId: p.player_id,
    effectiveShares:
      (p.valid_hashes_submitted * HASH_SHARE_WEIGHT + p.click_mine_count * CLICK_SHARE_WEIGHT) *
      parseFloat(p.hash_rate_multiplier || '1'),
  }))

  const totalShares = shares.reduce((sum, s) => sum + s.effectiveShares, 0)
  if (totalShares === 0) return

  // Total slices available = NFTs * slices per NFT
  const totalSlicesAvailable = nftPoolIds.length * SLICES_PER_NFT

  // Count existing slices per NFT to know which slice indices are available
  const sliceAssignments: {
    playerId: string
    nftId: string
    sliceIndex: number
    earnedVia: 'hash' | 'click' | 'stake_bonus'
  }[] = []

  // For each player, calculate how many slices they earned
  let slicesAssignedTotal = 0
  for (const share of shares) {
    const playerSlices = Math.floor((share.effectiveShares / totalShares) * totalSlicesAvailable)
    for (let i = 0; i < playerSlices && slicesAssignedTotal < totalSlicesAvailable; i++) {
      // Round-robin across NFTs for load balancing
      const nftIndex = slicesAssignedTotal % nftPoolIds.length
      const nftId = nftPoolIds[nftIndex]

      // Get current slice count for this NFT
      const { count } = await supabase
        .from('mint_pool_slices')
        .select('*', { count: 'exact', head: true })
        .eq('nft_id', nftId)

      const sliceIndex = count || 0

      if (sliceIndex < SLICES_PER_NFT) {
        sliceAssignments.push({
          playerId: share.playerId,
          nftId,
          sliceIndex,
          earnedVia: 'hash',
        })
        slicesAssignedTotal++
      }
    }
  }

  // Insert all slice assignments
  if (sliceAssignments.length > 0) {
    await supabase.from('mint_pool_slices').insert(
      sliceAssignments.map((s) => ({
        player_id: s.playerId,
        round_id: roundId,
        nft_id: s.nftId,
        slice_index: s.sliceIndex,
        total_slices_required: SLICES_PER_NFT,
        earned_via: s.earnedVia,
      }))
    )

    // Update round totals
    await supabase
      .from('mint_pool_rounds')
      .update({
        total_slices_awarded: slicesAssignedTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roundId)

    // Update participant slice counts
    for (const share of shares) {
      const count = sliceAssignments.filter((s) => s.playerId === share.playerId).length
      if (count > 0) {
        await supabase
          .from('mint_pool_participants')
          .update({
            slices_earned: count,
            effective_shares: share.effectiveShares,
          })
          .eq('round_id', roundId)
          .eq('player_id', share.playerId)
      }
    }
  }
}
