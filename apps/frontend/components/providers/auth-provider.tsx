'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'

export interface AuthUser {
  playerId: string
  walletAddress: string
}

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  token: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, disconnect, connected } = useWallet()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const previousWalletRef = useRef<string | null>(null)

  // On mount, try to restore session from cookie via player profile endpoint
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/player/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.player) {
            setUser({
              playerId: data.player.id,
              walletAddress: data.player.wallet_address,
            })
          }
        }
      } catch {
        // No active session
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  // Auto-clear session when wallet changes
  useEffect(() => {
    const currentWallet = publicKey?.toBase58() ?? null

    if (previousWalletRef.current !== null && currentWallet !== previousWalletRef.current) {
      // Wallet changed - clear session
      setUser(null)
      setToken(null)
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
        // Silently handle logout errors on wallet change
      })
    }

    previousWalletRef.current = currentWallet
  }, [publicKey])

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage || !connected) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)

    try {
      const walletAddress = publicKey.toBase58()

      // Step 1: Request challenge
      const challengeRes = await fetch('/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })

      if (!challengeRes.ok) {
        const error = await challengeRes.json()
        throw new Error(error.error || 'Failed to get challenge')
      }

      const { message } = await challengeRes.json()

      // Step 2: Sign with wallet
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signature = bs58.encode(signatureBytes)

      // Step 3: Verify signature and get JWT
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature, message }),
      })

      if (!verifyRes.ok) {
        const error = await verifyRes.json()
        throw new Error(error.error || 'Authentication failed')
      }

      const { player } = await verifyRes.json()

      setUser({
        playerId: player.id,
        walletAddress: player.walletAddress,
      })
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, signMessage, connected])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setToken(null)
      await disconnect()
    } catch {
      // Best effort
    } finally {
      setIsLoading(false)
    }
  }, [disconnect])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        token,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
