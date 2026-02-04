import { NextResponse } from 'next/server'
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import { getSession } from '@/lib/auth/session'
import { AUTH_CONFIG } from '@/lib/auth/config'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta')
    const connection = new Connection(rpcUrl, 'confirmed')
    const walletPubkey = new PublicKey(session.walletAddress)

    // Fetch SOL balance
    let solBalance = 0
    try {
      const lamports = await connection.getBalance(walletPubkey)
      solBalance = lamports / LAMPORTS_PER_SOL
    } catch (err) {
      console.error('SOL balance fetch error:', err)
    }

    // Fetch _unSC token balance
    let tokenBalance = 0
    try {
      const tokenMint = new PublicKey(AUTH_CONFIG.TOKEN_MINT)
      const ata = await getAssociatedTokenAddress(tokenMint, walletPubkey)
      const tokenAccount = await getAccount(connection, ata)
      // Assuming 9 decimals for the token (standard SPL)
      tokenBalance = Number(tokenAccount.amount) / 1e9
    } catch (err) {
      // Token account may not exist if user has never held the token
      console.error('Token balance fetch error:', err)
      tokenBalance = 0
    }

    // Fetch NFT count (token accounts with amount == 1, typical for NFTs)
    let nftCount = 0
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
        programId: new PublicKey('TokenkegQEqKXcWGS9sZqVcia4YBHBhCCHs1AQ9TGV3S'),
      })

      nftCount = tokenAccounts.value.filter((account) => {
        const parsed = account.account.data.parsed.info
        const amount = Number(parsed.tokenAmount.amount)
        const decimals = parsed.tokenAmount.decimals
        return amount === 1 && decimals === 0
      }).length
    } catch (err) {
      console.error('NFT count fetch error:', err)
    }

    return NextResponse.json({
      walletAddress: session.walletAddress,
      solBalance,
      tokenBalance,
      nftCount,
    })
  } catch (error) {
    console.error('Balance fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
