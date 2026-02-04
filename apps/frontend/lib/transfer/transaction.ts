import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

/**
 * Build an NFT transfer transaction (SPL token with amount = 1).
 *
 * Steps:
 * 1. Derive the sender's Associated Token Account (ATA) for the NFT mint.
 * 2. Derive the recipient's ATA.
 * 3. If the recipient ATA does not exist, add an instruction to create it.
 * 4. Add the SPL transfer instruction (amount = 1, decimals = 0 for NFTs).
 *
 * The returned Transaction is unsigned and must be signed by the sender wallet.
 */
export async function buildNftTransferTransaction({
  connection,
  senderAddress,
  recipientAddress,
  nftMintAddress,
}: {
  connection: Connection
  senderAddress: PublicKey
  recipientAddress: PublicKey
  nftMintAddress: PublicKey
}): Promise<Transaction> {
  const transaction = new Transaction()

  // Derive ATAs
  const senderAta = await getAssociatedTokenAddress(
    nftMintAddress,
    senderAddress,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  const recipientAta = await getAssociatedTokenAddress(
    nftMintAddress,
    recipientAddress,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  // Check if recipient ATA exists; if not, create it
  try {
    await getAccount(connection, recipientAta)
  } catch {
    // ATA doesn't exist — add create instruction
    transaction.add(
      createAssociatedTokenAccountInstruction(
        senderAddress, // payer
        recipientAta, // associated token account
        recipientAddress, // owner
        nftMintAddress, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )
  }

  // Transfer 1 NFT (amount = 1, NFTs have 0 decimals)
  transaction.add(
    createTransferInstruction(
      senderAta, // source
      recipientAta, // destination
      senderAddress, // owner / authority
      1, // amount (1 for NFT)
      [],
      TOKEN_PROGRAM_ID
    )
  )

  // Set recent blockhash and fee payer
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = senderAddress

  return transaction
}
