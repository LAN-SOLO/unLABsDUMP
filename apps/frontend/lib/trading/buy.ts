import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { calculateMarketplaceFee } from './fees'

/**
 * Marketplace treasury address for fee collection.
 */
export const MARKETPLACE_TREASURY = new PublicKey('7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT')

/**
 * Build a purchase transaction for a marketplace listing.
 *
 * The transaction sends:
 * 1. The listing price to the seller
 * 2. The marketplace fee to the treasury
 *
 * Note: The actual NFT transfer is handled server-side after confirming payment.
 */
export async function buildPurchaseTransaction({
  connection,
  buyerAddress,
  sellerAddress,
  priceInSol,
}: {
  connection: Connection
  buyerAddress: PublicKey
  sellerAddress: PublicKey
  priceInSol: number
}): Promise<Transaction> {
  const transaction = new Transaction()

  const fee = calculateMarketplaceFee(priceInSol)
  const sellerAmount = priceInSol - fee

  // Payment to seller
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerAddress,
      toPubkey: sellerAddress,
      lamports: Math.round(sellerAmount * LAMPORTS_PER_SOL),
    })
  )

  // Marketplace fee to treasury
  if (fee > 0) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: buyerAddress,
        toPubkey: MARKETPLACE_TREASURY,
        lamports: Math.round(fee * LAMPORTS_PER_SOL),
      })
    )
  }

  // Set recent blockhash and fee payer
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = buyerAddress

  return transaction
}

/**
 * Execute a purchase via the API.
 * This should be called after the transaction is signed and confirmed.
 */
export async function executePurchase(
  listingId: string,
  transactionSignature: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/trades/${listingId}/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionSignature }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Purchase failed')
  }

  return response.json()
}
