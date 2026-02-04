import { NextResponse } from 'next/server'

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'UnstableLabs Game API',
    version: '1.0.0',
    description: 'REST API for in-game NFT queries and ownership verification',
  },
  servers: [{ url: 'https://nft.unstablecoins.io', description: 'Production' }],
  security: [{ apiKey: [] }],
  components: {
    securitySchemes: {
      apiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
    },
  },
  paths: {
    '/api/game/nfts/{wallet}': {
      get: {
        summary: 'Get player NFTs',
        parameters: [{ name: 'wallet', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Player NFTs list' } },
      },
    },
    '/api/game/nft/{id}': {
      get: {
        summary: 'Get single NFT details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'NFT details' } },
      },
    },
    '/api/game/verify-ownership': {
      post: {
        summary: 'Verify NFT ownership',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  wallet: { type: 'string' },
                  nft_id: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Ownership verification result' } },
      },
    },
    '/api/game/ws': {
      get: {
        summary: 'Server-Sent Events for real-time game events',
        parameters: [{ name: 'wallet', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'SSE event stream' } },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(openApiSpec)
}
