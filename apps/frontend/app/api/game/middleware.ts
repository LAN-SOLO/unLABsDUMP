import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit, createErrorResponse } from '@/lib/game/api'

export interface GameApiContext {
  apiKey: string
}

/**
 * Shared helper for game API route handlers.
 * Validates API key and checks rate limits.
 * Returns null if validation passes, or a NextResponse error to return early.
 */
export function validateGameRequest(request: NextRequest): NextResponse | null {
  // Extract API key from header
  const apiKey = request.headers.get('X-API-Key')

  if (!apiKey) {
    return NextResponse.json(
      createErrorResponse('MISSING_API_KEY', 'X-API-Key header is required'),
      { status: 401 }
    )
  }

  // Validate the API key
  if (!validateApiKey(apiKey)) {
    return NextResponse.json(
      createErrorResponse('INVALID_API_KEY', 'The provided API key is invalid'),
      { status: 403 }
    )
  }

  // Check rate limiting using the API key as identifier
  const rateLimitResult = checkRateLimit(apiKey)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.'),
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null
}

/**
 * Format a standard game API error response.
 */
export function gameApiError(code: string, message: string, status: number = 500): NextResponse {
  return NextResponse.json(createErrorResponse(code, message), { status })
}
