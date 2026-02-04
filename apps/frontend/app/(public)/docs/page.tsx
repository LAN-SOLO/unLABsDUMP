'use client'

import { useState } from 'react'
import { Book, Key, Box, Shield, Radio, AlertTriangle, Gauge } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CodeBlock } from '@/components/docs/code-block'
import { EndpointCard } from '@/components/docs/endpoint-card'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started', icon: Book },
  { id: 'authentication', label: 'Authentication', icon: Key },
  { id: 'nft-endpoints', label: 'NFT Endpoints', icon: Box },
  { id: 'ownership', label: 'Ownership Verification', icon: Shield },
  { id: 'websocket', label: 'WebSocket Events', icon: Radio },
  { id: 'errors', label: 'Error Handling', icon: AlertTriangle },
  { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
] as const

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        {/* Sidebar Navigation */}
        <nav className="sticky top-8 hidden h-fit w-64 shrink-0 lg:block">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              API Reference
            </h2>
            <ul className="space-y-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                        activeSection === section.id
                          ? 'bg-purple-600/10 text-purple-400'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <Icon className="size-4" />
                      {section.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {/* Hero */}
          <div className="mb-12">
            <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-600/30">
              API v1.0
            </Badge>
            <h1 className="text-4xl font-bold text-white">
              UnstableLabs <span className="text-gradient">Game API</span>
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-400">
              Integrate NFT data into your game. Verify ownership, fetch player inventories, and
              receive real-time updates via WebSocket.
            </p>
          </div>

          {/* Getting Started */}
          <section id="getting-started" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">Getting Started</h2>
            <p className="mb-6 text-slate-400">
              The UnstableLabs Game API provides programmatic access to NFT data for game
              integration. All API requests are authenticated via API key and return JSON responses.
            </p>

            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">Base URL</h3>
              <CodeBlock code={`https://your-domain.com/api/game`} language="text" />

              <h3 className="mb-3 mt-6 text-lg font-semibold text-white">Quick Start</h3>
              <CodeBlock
                code={`// Fetch player NFTs
const response = await fetch(
  'https://your-domain.com/api/game/nfts/WALLET_ADDRESS',
  {
    headers: {
      'X-API-Key': 'your-api-key-here',
    },
  }
);

const data = await response.json();
console.log(data.data.nfts);`}
                language="typescript"
              />
            </Card>
          </section>

          <Separator className="my-12 bg-slate-800" />

          {/* Authentication */}
          <section id="authentication" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">Authentication</h2>
            <p className="mb-6 text-slate-400">
              All Game API requests require an API key passed via the{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-purple-400">X-API-Key</code>{' '}
              header. Contact the UnstableLabs team to obtain your key.
            </p>

            <CodeBlock
              code={`// Include your API key in every request
const headers = {
  'X-API-Key': process.env.GAME_API_KEY,
  'Content-Type': 'application/json',
};

// Example: Create a reusable API client
class UnstableLabsAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(\`\${this.baseUrl}\${path}\`, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    return response.json();
  }

  async getPlayerNFTs(wallet: string) {
    return this.request(\`/nfts/\${wallet}\`);
  }

  async getNFT(id: string) {
    return this.request(\`/nft/\${id}\`);
  }

  async verifyOwnership(wallet: string, nftId: string) {
    return this.request('/verify-ownership', {
      method: 'POST',
      body: JSON.stringify({ wallet, nft_id: nftId }),
    });
  }
}

// Usage
const api = new UnstableLabsAPI(
  'https://your-domain.com/api/game',
  'your-api-key'
);`}
              language="typescript"
            />
          </section>

          <Separator className="my-12 bg-slate-800" />

          {/* NFT Endpoints */}
          <section id="nft-endpoints" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-white">NFT Endpoints</h2>

            <div className="space-y-8">
              {/* Get Player NFTs */}
              <EndpointCard
                method="GET"
                path="/api/game/nfts/{wallet}"
                description="Retrieve all NFTs owned by a player identified by their Solana wallet address. Results are cached for 60 seconds."
                parameters={[
                  {
                    name: 'wallet',
                    type: 'string',
                    required: true,
                    description: 'Solana wallet address (base58)',
                    location: 'path',
                  },
                  {
                    name: 'X-API-Key',
                    type: 'string',
                    required: true,
                    description: 'Your game API key',
                    location: 'header',
                  },
                ]}
                requestExample={`const response = await fetch(
  'https://your-domain.com/api/game/nfts/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  {
    headers: { 'X-API-Key': 'your-api-key' },
  }
);`}
                responseExample={`{
  "success": true,
  "data": {
    "nfts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Cosmic Blade",
        "description": "A legendary weapon forged in the cosmos",
        "image_url": "https://cdn.unstablelabs.com/nfts/cosmic-blade.png",
        "mint_address": "7xKXtg2...",
        "rarity": "legendary",
        "attributes": {
          "damage": 150,
          "element": "cosmic"
        },
        "collection_id": "weapons-v1",
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "total": 1,
    "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  }
}`}
              />

              {/* Get Single NFT */}
              <EndpointCard
                method="GET"
                path="/api/game/nft/{id}"
                description="Retrieve detailed information about a single NFT by its ID. Results are cached for 60 seconds."
                parameters={[
                  {
                    name: 'id',
                    type: 'string (UUID)',
                    required: true,
                    description: 'The unique ID of the NFT',
                    location: 'path',
                  },
                  {
                    name: 'X-API-Key',
                    type: 'string',
                    required: true,
                    description: 'Your game API key',
                    location: 'header',
                  },
                ]}
                requestExample={`const response = await fetch(
  'https://your-domain.com/api/game/nft/550e8400-e29b-41d4-a716-446655440000',
  {
    headers: { 'X-API-Key': 'your-api-key' },
  }
);`}
                responseExample={`{
  "success": true,
  "data": {
    "nft": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Cosmic Blade",
      "description": "A legendary weapon forged in the cosmos",
      "image_url": "https://cdn.unstablelabs.com/nfts/cosmic-blade.png",
      "mint_address": "7xKXtg2...",
      "owner_id": "player-uuid",
      "rarity": "legendary",
      "attributes": {
        "damage": 150,
        "element": "cosmic"
      },
      "collection_id": "weapons-v1",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-02-01T12:30:00Z"
    }
  }
}`}
              />
            </div>
          </section>

          <Separator className="my-12 bg-slate-800" />

          {/* Ownership Verification */}
          <section id="ownership" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-white">Ownership Verification</h2>
            <p className="mb-6 text-slate-400">
              Verify whether a player owns a specific NFT. Useful for gating in-game content or
              features behind NFT ownership.
            </p>

            <EndpointCard
              method="POST"
              path="/api/game/verify-ownership"
              description="Verify that a given wallet address owns a specific NFT. Returns a boolean ownership result."
              parameters={[
                {
                  name: 'X-API-Key',
                  type: 'string',
                  required: true,
                  description: 'Your game API key',
                  location: 'header',
                },
                {
                  name: 'wallet',
                  type: 'string',
                  required: true,
                  description: 'Solana wallet address (base58)',
                  location: 'body',
                },
                {
                  name: 'nft_id',
                  type: 'string (UUID)',
                  required: true,
                  description: 'The NFT ID to check ownership for',
                  location: 'body',
                },
              ]}
              requestExample={`const response = await fetch(
  'https://your-domain.com/api/game/verify-ownership',
  {
    method: 'POST',
    headers: {
      'X-API-Key': 'your-api-key',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      nft_id: '550e8400-e29b-41d4-a716-446655440000',
    }),
  }
);`}
              responseExample={`{
  "success": true,
  "data": {
    "owns": true,
    "nft_id": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  }
}`}
            />

            <Card className="mt-8 border-slate-800 bg-slate-900/50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">Game Integration Example</h3>
              <p className="mb-4 text-sm text-slate-400">
                Here is how you might gate content in a game server based on NFT ownership.
              </p>
              <CodeBlock
                code={`// Game server middleware example
async function requireNFT(nftId: string) {
  return async (req: Request) => {
    const playerWallet = getPlayerWallet(req);

    const response = await fetch(
      'https://your-domain.com/api/game/verify-ownership',
      {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.GAME_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: playerWallet,
          nft_id: nftId,
        }),
      }
    );

    const data = await response.json();

    if (!data.success || !data.data.owns) {
      throw new Error('Player does not own the required NFT');
    }

    // Player owns the NFT, proceed
    return true;
  };
}

// Usage: Gate a legendary dungeon behind NFT ownership
app.get('/dungeon/legendary', requireNFT('cosmic-blade-uuid'), handler);`}
                language="typescript"
              />
            </Card>
          </section>

          <Separator className="my-12 bg-slate-800" />

          {/* WebSocket Events */}
          <section id="websocket" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">WebSocket Events</h2>
            <p className="mb-6 text-slate-400">
              Subscribe to real-time updates using Supabase Realtime channels. Listen for changes to
              purchases, NFTs, and trades scoped to specific players.
            </p>

            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">Available Channels</h3>
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                      purchases
                    </Badge>
                    <span className="text-sm text-slate-400">
                      WHERE buyer_wallet = currentWallet
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    Fired when a purchase is created or updated for the player.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">nfts</Badge>
                    <span className="text-sm text-slate-400">WHERE owner_id = currentPlayer</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    Fired when an NFT is added, updated, or removed from the player's inventory.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                      trades
                    </Badge>
                    <span className="text-sm text-slate-400">WHERE seller_id = currentPlayer</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    Fired when a trade offer is received or a sale is completed.
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-white">Subscribing to Events</h3>
              <CodeBlock
                code={`import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to player's NFT changes
const channel = supabase
  .channel('player-nfts')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'nfts',
      filter: \`owner_id=eq.\${playerId}\`,
    },
    (payload) => {
      console.log('NFT change:', payload.eventType);
      console.log('New data:', payload.new);

      switch (payload.eventType) {
        case 'INSERT':
          handleNewNFT(payload.new);
          break;
        case 'UPDATE':
          handleNFTUpdate(payload.new);
          break;
        case 'DELETE':
          handleNFTRemoved(payload.old);
          break;
      }
    }
  )
  .subscribe();

// Cleanup when done
channel.unsubscribe();`}
                language="typescript"
              />
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-white">Event Payload Format</h3>
              <CodeBlock
                code={`{
  "eventType": "INSERT" | "UPDATE" | "DELETE",
  "new": {
    "id": "nft-uuid",
    "name": "Cosmic Blade",
    "owner_id": "player-uuid",
    "rarity": "legendary",
    // ... full NFT record
  },
  "old": {
    // Previous record data (for UPDATE/DELETE)
  },
  "table": "nfts",
  "schema": "public"
}`}
                language="json"
              />
            </div>
          </section>

          <Separator className="my-12 bg-slate-800" />

          {/* Error Handling */}
          <section id="errors" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">Error Handling</h2>
            <p className="mb-6 text-slate-400">
              All error responses follow a consistent format with a{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-purple-400">
                success: false
              </code>{' '}
              flag and structured error details.
            </p>

            <CodeBlock
              code={`// Error response format
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  }
}`}
              language="json"
            />

            <Card className="mt-8 border-slate-800 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Error Codes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="pb-3 pr-4 text-left font-medium text-slate-400">
                        HTTP Status
                      </th>
                      <th className="pb-3 pr-4 text-left font-medium text-slate-400">Code</th>
                      <th className="pb-3 text-left font-medium text-slate-400">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr className="border-b border-slate-800">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                          400
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-red-400">INVALID_WALLET</code>
                      </td>
                      <td className="py-2.5">Invalid wallet address format</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                          400
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-red-400">VALIDATION_ERROR</code>
                      </td>
                      <td className="py-2.5">Request body validation failed</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-red-600/20 text-red-400 border-red-600/30">401</Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-red-400">MISSING_API_KEY</code>
                      </td>
                      <td className="py-2.5">X-API-Key header not provided</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-red-600/20 text-red-400 border-red-600/30">403</Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-red-400">INVALID_API_KEY</code>
                      </td>
                      <td className="py-2.5">The provided API key is invalid</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                          404
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-red-400">NFT_NOT_FOUND</code>
                      </td>
                      <td className="py-2.5">Requested NFT does not exist</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30">
                          429
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-red-400">RATE_LIMIT_EXCEEDED</code>
                      </td>
                      <td className="py-2.5">Too many requests, retry after cooldown</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-red-600/20 text-red-400 border-red-600/30">500</Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-red-400">INTERNAL_ERROR</code>
                      </td>
                      <td className="py-2.5">Unexpected server error occurred</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-white">Handling Errors in Code</h3>
              <CodeBlock
                code={`async function fetchWithErrorHandling(url: string, apiKey: string) {
  const response = await fetch(url, {
    headers: { 'X-API-Key': apiKey },
  });

  const data = await response.json();

  if (!data.success) {
    switch (data.error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        const retryAfter = response.headers.get('Retry-After');
        console.log(\`Rate limited. Retry after \${retryAfter}s\`);
        break;
      case 'INVALID_API_KEY':
        console.error('Check your API key configuration');
        break;
      case 'NFT_NOT_FOUND':
        console.log('NFT does not exist or has been burned');
        break;
      default:
        console.error(\`API error: \${data.error.message}\`);
    }
    throw new Error(data.error.message);
  }

  return data.data;
}`}
                language="typescript"
              />
            </div>
          </section>

          <Separator className="my-12 bg-slate-800" />

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-white">Rate Limits</h2>
            <p className="mb-6 text-slate-400">
              The Game API enforces rate limits to ensure fair usage and platform stability. Limits
              are applied per API key.
            </p>

            <Card className="border-slate-800 bg-slate-900/50 p-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">60</p>
                  <p className="mt-1 text-sm text-slate-400">Requests per minute</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-center">
                  <p className="text-3xl font-bold text-cyan-400">60s</p>
                  <p className="mt-1 text-sm text-slate-400">Cache TTL (GET endpoints)</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">200</p>
                  <p className="mt-1 text-sm text-slate-400">Max NFTs per response</p>
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-white">Rate Limit Headers</h3>
              <p className="mb-4 text-sm text-slate-400">
                When rate limited, the response includes headers to help you implement proper retry
                logic.
              </p>
              <CodeBlock
                code={`// Response headers on 429
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-06-15T10:01:00.000Z
Retry-After: 45`}
                language="text"
              />
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-white">Retry Strategy</h3>
              <CodeBlock
                code={`async function fetchWithRetry(
  url: string,
  apiKey: string,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitMs = retryAfter
        ? parseInt(retryAfter) * 1000
        : Math.pow(2, attempt) * 1000;

      console.log(\`Rate limited. Waiting \${waitMs}ms before retry...\`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    return response;
  }

  throw new Error('Max retries exceeded');
}`}
                language="typescript"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
