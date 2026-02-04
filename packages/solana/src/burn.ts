import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { createBurnInstruction, getAssociatedTokenAddress, getAccount } from '@solana/spl-token'

// _unSC token mint address
export const UNSC_MINT = new PublicKey('7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT')

export interface BurnResult {
  signature: string
  success: boolean
  amount: number
  error?: string
}

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

async function backoff(attempt: number): Promise<void> {
  const delay = BASE_DELAY_MS * Math.pow(2, attempt)
  await new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Burn _unSC tokens (deflationary mechanism).
 * Requires double confirmation via the `confirmed` flag.
 *
 * @param connection - Solana RPC connection
 * @param ownerKeypair - Keypair that owns the tokens to burn
 * @param amount - Amount of tokens to burn (in raw token units, considering decimals)
 * @param confirmed - Must be true as double-confirmation safety check
 */
export async function burnUnSC(
  connection: Connection,
  ownerKeypair: Keypair,
  amount: number,
  confirmed: boolean = false
): Promise<BurnResult> {
  if (!confirmed) {
    return {
      signature: '',
      success: false,
      amount: 0,
      error: 'Burn operation requires explicit confirmation (confirmed=true)',
    }
  }

  if (amount <= 0) {
    return {
      signature: '',
      success: false,
      amount: 0,
      error: 'Burn amount must be greater than 0',
    }
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const ata = await getAssociatedTokenAddress(UNSC_MINT, ownerKeypair.publicKey)

      // Verify token account exists and has sufficient balance
      const account = await getAccount(connection, ata)
      if (Number(account.amount) < amount) {
        return {
          signature: '',
          success: false,
          amount: 0,
          error: `Insufficient balance. Have ${account.amount}, need ${amount}`,
        }
      }

      const transaction = new Transaction().add(
        createBurnInstruction(ata, UNSC_MINT, ownerKeypair.publicKey, amount)
      )

      const signature = await sendAndConfirmTransaction(connection, transaction, [ownerKeypair], {
        commitment: 'confirmed',
      })

      return {
        signature,
        success: true,
        amount,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (attempt < MAX_RETRIES - 1) {
        console.warn(`Burn attempt ${attempt + 1} failed: ${errorMessage}. Retrying...`)
        await backoff(attempt)
        continue
      }

      return {
        signature: '',
        success: false,
        amount: 0,
        error: `Burn failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
      }
    }
  }

  return { signature: '', success: false, amount: 0, error: 'Max retries exceeded' }
}

/**
 * Get the current _unSC token balance for a wallet
 */
export async function getUnSCBalance(
  connection: Connection,
  walletAddress: string
): Promise<number> {
  try {
    const owner = new PublicKey(walletAddress)
    const ata = await getAssociatedTokenAddress(UNSC_MINT, owner)
    const account = await getAccount(connection, ata)
    return Number(account.amount)
  } catch {
    return 0
  }
}

/**
 * Burn any SPL token (generic burn)
 */
export async function burnToken(
  connection: Connection,
  mintAddress: string,
  ownerKeypair: Keypair,
  amount: number,
  confirmed: boolean = false
): Promise<BurnResult> {
  if (!confirmed) {
    return {
      signature: '',
      success: false,
      amount: 0,
      error: 'Burn operation requires explicit confirmation',
    }
  }

  const mint = new PublicKey(mintAddress)

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const ata = await getAssociatedTokenAddress(mint, ownerKeypair.publicKey)

      const transaction = new Transaction().add(
        createBurnInstruction(ata, mint, ownerKeypair.publicKey, amount)
      )

      const signature = await sendAndConfirmTransaction(connection, transaction, [ownerKeypair], {
        commitment: 'confirmed',
      })

      return { signature, success: true, amount }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (attempt < MAX_RETRIES - 1) {
        await backoff(attempt)
        continue
      }

      return {
        signature: '',
        success: false,
        amount: 0,
        error: `Burn failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
      }
    }
  }

  return { signature: '', success: false, amount: 0, error: 'Max retries exceeded' }
}
