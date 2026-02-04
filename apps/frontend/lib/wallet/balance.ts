import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token'

/** _unSC SPL token mint address */
export const UNSC_MINT = new PublicKey('7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT')

/**
 * Fetch the native SOL balance for a wallet address.
 * Returns a number denominated in SOL (not lamports).
 */
export async function getSolBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  const lamports = await connection.getBalance(walletAddress)
  return lamports / LAMPORTS_PER_SOL
}

/**
 * Fetch the _unSC token balance for a wallet address.
 * Returns 0 if the associated token account does not exist.
 */
export async function getUnscBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const ata = await getAssociatedTokenAddress(UNSC_MINT, walletAddress)
    const account = await getAccount(connection, ata)
    // _unSC uses 9 decimals (standard SPL)
    return Number(account.amount) / 1e9
  } catch {
    // Account doesn't exist or another error — treat as zero balance
    return 0
  }
}

/**
 * Fetch both SOL and _unSC balances at once.
 */
export async function getBalances(
  connection: Connection,
  walletAddress: PublicKey
): Promise<{ sol: number; unsc: number }> {
  const [sol, unsc] = await Promise.all([
    getSolBalance(connection, walletAddress),
    getUnscBalance(connection, walletAddress),
  ])
  return { sol, unsc }
}
