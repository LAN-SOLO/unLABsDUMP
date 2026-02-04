import { NextRequest } from 'next/server'
import { validateApiKey } from '@/lib/game/api'
import { createErrorResponse } from '@/lib/game/api'
import { addConnection, removeConnection, HEARTBEAT_INTERVAL_MS } from '@/lib/game/websocket'
import { serializeSSE, createGameEvent } from '@/lib/game/events'

// Extract and validate API key using the same pattern as middleware.ts
function getValidatedApiKey(request: NextRequest): string | null {
  const apiKey = request.headers.get('X-API-Key')
  if (!apiKey || !validateApiKey(apiKey)) return null
  return apiKey
}

// Extract wallet from query params
function getWallet(request: NextRequest): string | null {
  return request.nextUrl.searchParams.get('wallet')
}

export async function GET(request: NextRequest) {
  const apiKey = getValidatedApiKey(request)
  if (!apiKey) {
    return new Response(
      JSON.stringify(createErrorResponse('UNAUTHORIZED', 'Valid X-API-Key header required')),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const wallet = getWallet(request)
  if (!wallet) {
    return new Response(
      JSON.stringify(createErrorResponse('BAD_REQUEST', 'wallet query parameter required')),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const encoder = new TextEncoder()
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null
  let controllerRef: ReadableStreamDefaultController | null = null

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller
      const added = addConnection(wallet, controller)
      if (!added) {
        controller.enqueue(
          encoder.encode(
            serializeSSE(
              createGameEvent('heartbeat', {
                error: 'Max connections reached for this wallet',
              })
            )
          )
        )
        controller.close()
        return
      }

      // Send initial connection event
      controller.enqueue(
        encoder.encode(serializeSSE(createGameEvent('heartbeat', { status: 'connected', wallet })))
      )

      // Heartbeat every 30s to keep the connection alive
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(serializeSSE(createGameEvent('heartbeat', { status: 'alive' })))
          )
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval)
        }
      }, HEARTBEAT_INTERVAL_MS)
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      if (controllerRef && wallet) {
        removeConnection(wallet, controllerRef)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
