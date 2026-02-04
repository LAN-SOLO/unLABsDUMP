import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js'
import { createConnection } from '@/lib/wallet/connection'

const PLATFORM_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_PLATFORM_WALLET || '11111111111111111111111111111111'
)

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

/**
 * Build a SOL transfer transaction for a package purchase.
 * Includes a memo instruction encoding the packageId for on-chain reference.
 */
export async function buildPurchaseTransaction(
  packageId: string,
  buyerWallet: PublicKey,
  priceInSol: number
): Promise<Transaction> {
  const connection = createConnection()
  const lamports = Math.round(priceInSol * LAMPORTS_PER_SOL)

  const transaction = new Transaction()

  // SOL transfer to platform wallet
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: buyerWallet,
      toPubkey: PLATFORM_WALLET,
      lamports,
    })
  )

  // Memo instruction with packageId for on-chain verification
  const memoData = JSON.stringify({
    type: 'package_purchase',
    packageId,
    timestamp: Date.now(),
  })

  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: buyerWallet, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoData),
    })
  )

  // Set recent blockhash and fee payer
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = buyerWallet

  return transaction
}

/**
 * Calculate the lamport amount for a given SOL price.
 */
export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL)
}

/**
 * Format SOL amount for display.
 */
export function formatSol(sol: number | string): string {
  const value = typeof sol === 'string' ? parseFloat(sol) : sol
  if (value >= 1) return value.toFixed(2)
  if (value >= 0.01) return value.toFixed(3)
  return value.toFixed(4)
}
