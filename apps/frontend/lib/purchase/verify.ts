import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createConnection } from '@/lib/wallet/connection'

const PLATFORM_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_PLATFORM_WALLET || '11111111111111111111111111111111'
)

export interface VerificationResult {
  verified: boolean
  amount?: number
  sender?: string
  error?: string
}

/**
 * Verify that a transaction signature corresponds to a valid payment
 * to the platform wallet for the expected amount.
 */
export async function verifyPayment(
  signature: string,
  expectedAmountSol: number,
  expectedSender: string
): Promise<VerificationResult> {
  const connection = createConnection()

  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })

    if (!tx) {
      return {
        verified: false,
        error: 'Transaction not found. It may still be processing.',
      }
    }

    if (tx.meta?.err) {
      return {
        verified: false,
        error: 'Transaction failed on-chain.',
      }
    }

    // Check that the transaction involves the expected sender
    const accountKeys = tx.transaction.message.getAccountKeys()
    const senderKey = accountKeys.get(0)
    if (!senderKey || senderKey.toBase58() !== expectedSender) {
      return {
        verified: false,
        error: 'Transaction sender does not match expected wallet.',
      }
    }

    // Find the SOL transfer to the platform wallet
    const preBalances = tx.meta?.preBalances || []
    const postBalances = tx.meta?.postBalances || []

    let platformIndex = -1
    for (let i = 0; i < accountKeys.length; i++) {
      const key = accountKeys.get(i)
      if (key && key.toBase58() === PLATFORM_WALLET.toBase58()) {
        platformIndex = i
        break
      }
    }

    if (platformIndex === -1) {
      return {
        verified: false,
        error: 'Platform wallet not found in transaction accounts.',
      }
    }

    const receivedLamports = postBalances[platformIndex] - preBalances[platformIndex]
    const receivedSol = receivedLamports / LAMPORTS_PER_SOL

    // Allow 0.1% tolerance for rounding
    const tolerance = expectedAmountSol * 0.001
    if (receivedSol < expectedAmountSol - tolerance) {
      return {
        verified: false,
        amount: receivedSol,
        error: `Received ${receivedSol} SOL, expected ${expectedAmountSol} SOL.`,
      }
    }

    return {
      verified: true,
      amount: receivedSol,
      sender: expectedSender,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification error'
    return {
      verified: false,
      error: message,
    }
  }
}

/**
 * Check if a transaction has been confirmed on-chain.
 */
export async function isTransactionConfirmed(signature: string): Promise<boolean> {
  const connection = createConnection()

  try {
    const status = await connection.getSignatureStatus(signature)
    return (
      status?.value?.confirmationStatus === 'confirmed' ||
      status?.value?.confirmationStatus === 'finalized'
    )
  } catch {
    return false
  }
}
