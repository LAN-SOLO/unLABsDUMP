import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token'

export interface TransferResult {
  signature: string
  success: boolean
  error?: string
}

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

/**
 * Wait with exponential backoff
 */
async function backoff(attempt: number): Promise<void> {
  const delay = BASE_DELAY_MS * Math.pow(2, attempt)
  await new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Transfer an NFT (SPL token with 0 decimals) from one wallet to another
 */
export async function transferNFT(
  connection: Connection,
  mintAddress: string,
  fromKeypair: Keypair,
  toWallet: string
): Promise<TransferResult> {
  const mint = new PublicKey(mintAddress)
  const to = new PublicKey(toWallet)

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const fromAta = await getAssociatedTokenAddress(mint, fromKeypair.publicKey)
      const toAta = await getAssociatedTokenAddress(mint, to)

      const transaction = new Transaction()

      // Check if destination ATA exists, create if not
      try {
        await getAccount(connection, toAta)
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(fromKeypair.publicKey, toAta, to, mint)
        )
      }

      // Add transfer instruction (amount = 1 for NFT)
      transaction.add(createTransferInstruction(fromAta, toAta, fromKeypair.publicKey, 1))

      const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair], {
        commitment: 'confirmed',
      })

      return { signature, success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (attempt < MAX_RETRIES - 1) {
        console.warn(`Transfer attempt ${attempt + 1} failed: ${errorMessage}. Retrying...`)
        await backoff(attempt)
        continue
      }

      return {
        signature: '',
        success: false,
        error: `Transfer failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
      }
    }
  }

  return { signature: '', success: false, error: 'Max retries exceeded' }
}

/**
 * Transfer multiple NFTs in batch
 */
export async function transferBatch(
  connection: Connection,
  transfers: Array<{ mintAddress: string; toWallet: string }>,
  fromKeypair: Keypair
): Promise<TransferResult[]> {
  const results: TransferResult[] = []

  for (const transfer of transfers) {
    const result = await transferNFT(
      connection,
      transfer.mintAddress,
      fromKeypair,
      transfer.toWallet
    )
    results.push(result)

    // Small delay between transfers to avoid rate limiting
    if (results.length < transfers.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return results
}
