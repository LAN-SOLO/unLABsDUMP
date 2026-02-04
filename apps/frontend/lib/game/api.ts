const GAME_API_KEY = process.env.GAME_API_KEY

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // 60 requests per minute

export function validateApiKey(key: string | null): boolean {
  if (!GAME_API_KEY) {
    console.warn('GAME_API_KEY is not set in environment variables')
    return false
  }

  if (!key) {
    return false
  }

  return key === GAME_API_KEY
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore) {
      if (now > value.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count += 1
  rateLimitStore.set(identifier, entry)

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  }
}

export function createSuccessResponse<T>(data: T) {
  return {
    success: true as const,
    data,
  }
}

export function createErrorResponse(code: string, message: string) {
  return {
    success: false as const,
    error: {
      code,
      message,
    },
  }
}
