import { Transaction } from '@solana/web3.js'
import { createConnection } from '@/lib/wallet/connection'

export interface SubmitResult {
  signature: string
  confirmed: boolean
  error?: string
}

/**
 * Submit a signed transaction to the Solana network and wait for confirmation.
 */
export async function submitTransaction(signedTransaction: Transaction): Promise<SubmitResult> {
  const connection = createConnection()

  try {
    const rawTransaction = signedTransaction.serialize()

    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    })

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash: signedTransaction.recentBlockhash!,
        lastValidBlockHeight: signedTransaction.lastValidBlockHeight!,
      },
      'confirmed'
    )

    if (confirmation.value.err) {
      return {
        signature,
        confirmed: false,
        error: `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
      }
    }

    return {
      signature,
      confirmed: true,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown transaction error'
    return {
      signature: '',
      confirmed: false,
      error: message,
    }
  }
}

/**
 * Monitor a transaction signature until it reaches confirmed status.
 */
export async function waitForConfirmation(
  signature: string,
  timeoutMs: number = 60000
): Promise<boolean> {
  const connection = createConnection()
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    try {
      const status = await connection.getSignatureStatus(signature)

      if (
        status?.value?.confirmationStatus === 'confirmed' ||
        status?.value?.confirmationStatus === 'finalized'
      ) {
        return !status.value.err
      }

      if (status?.value?.err) {
        return false
      }
    } catch {
      // Retry on transient errors
    }

    // Poll every 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  return false
}

/**
 * Get the Solana Explorer URL for a transaction signature.
 */
export function getExplorerUrl(signature: string): string {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'mainnet-beta'
  const base = 'https://explorer.solana.com/tx'
  const suffix = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`
  return `${base}/${signature}${suffix}`
}
