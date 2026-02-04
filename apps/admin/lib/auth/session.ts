import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { AUTH_CONFIG } from './config'

export interface SessionPayload {
  adminId: string
  walletAddress?: string
  email?: string
  role: string
  iat?: number
  exp?: number
}

export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  const token = jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, {
    expiresIn: AUTH_CONFIG.JWT_EXPIRY as unknown as number,
  })
  return token
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const payload = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as SessionPayload
    return payload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_CONFIG.COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifySession(token)
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_CONFIG.COOKIE_NAME, token, AUTH_CONFIG.COOKIE_OPTIONS)
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_CONFIG.COOKIE_NAME)
}
