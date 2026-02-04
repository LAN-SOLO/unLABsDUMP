import { Connection, Transaction, SendOptions } from '@solana/web3.js'

export interface SubmitResult {
  signature: string
  success: boolean
  error?: string
}

export async function submitTransferTransaction(
  connection: Connection,
  signedTransaction: Transaction,
  options?: SendOptions
): Promise<SubmitResult> {
  try {
    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), options)

    await connection.confirmTransaction(signature, 'confirmed')

    return { signature, success: true }
  } catch (error) {
    return {
      signature: '',
      success: false,
      error: error instanceof Error ? error.message : 'Transfer submission failed',
    }
  }
}
