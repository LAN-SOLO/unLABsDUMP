import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'

export interface EscrowWallet {
  publicKey: string
  solBalance: number
}

export interface EscrowTokenBalance {
  mint: string
  amount: number
}

/**
 * Load escrow wallet keypair from environment.
 * The secret key should be a base58-encoded or JSON array string.
 */
export function loadEscrowKeypair(secretKeyString: string): Keypair {
  try {
    // Try parsing as JSON array first
    const parsed = JSON.parse(secretKeyString)
    if (Array.isArray(parsed)) {
      return Keypair.fromSecretKey(Uint8Array.from(parsed))
    }
  } catch {
    // Not JSON, try base58
  }

  // Try base58
  const bs58 = require('bs58')
  const decoded = bs58.decode(secretKeyString)
  return Keypair.fromSecretKey(decoded)
}

/**
 * Get escrow wallet info (balance)
 */
export async function getEscrowInfo(
  connection: Connection,
  escrowPublicKey: PublicKey
): Promise<EscrowWallet> {
  const balance = await connection.getBalance(escrowPublicKey)

  return {
    publicKey: escrowPublicKey.toBase58(),
    solBalance: balance / LAMPORTS_PER_SOL,
  }
}

/**
 * Get token balance for the escrow wallet
 */
export async function getEscrowTokenBalance(
  connection: Connection,
  escrowPublicKey: PublicKey,
  mintAddress: string
): Promise<EscrowTokenBalance> {
  const mint = new PublicKey(mintAddress)

  try {
    const ata = await getAssociatedTokenAddress(mint, escrowPublicKey)
    const account = await getAccount(connection, ata)

    return {
      mint: mintAddress,
      amount: Number(account.amount),
    }
  } catch {
    return {
      mint: mintAddress,
      amount: 0,
    }
  }
}

/**
 * Get all NFTs held by the escrow wallet
 */
export async function getEscrowNFTs(
  connection: Connection,
  escrowPublicKey: PublicKey
): Promise<Array<{ mint: string; amount: number }>> {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(escrowPublicKey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  })

  return tokenAccounts.value
    .filter((account) => {
      const info = account.account.data.parsed.info
      return info.tokenAmount.uiAmount > 0
    })
    .map((account) => {
      const info = account.account.data.parsed.info
      return {
        mint: info.mint,
        amount: info.tokenAmount.uiAmount,
      }
    })
}
