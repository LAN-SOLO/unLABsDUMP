'use client'

import { useState } from 'react'
import { Book, Key, Box, Shield, Radio, AlertTriangle, Gauge, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CodeBlock } from '@/components/docs/code-block'
import { EndpointCard } from '@/components/docs/endpoint-card'
import { cn } from '@/lib/utils'
import { TerminalFrame } from '@/components/ui/terminal-frame'

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started', icon: Book },
  { id: 'authentication', label: 'Authentication', icon: Key },
  { id: 'nft-endpoints', label: '_unITM Endpoints', icon: Box },
  { id: 'ownership', label: 'Ownership Verification', icon: Shield },
  { id: 'websocket', label: 'WebSocket Events', icon: Radio },
  { id: 'errors', label: 'Error Handling', icon: AlertTriangle },
  { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
  { id: 'sdk', label: 'SDK & Downloads', icon: Download },
] as const

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        {/* Sidebar Navigation */}
        <nav className="sticky top-8 hidden h-fit w-64 shrink-0 lg:block">
          <div className="rounded-sm border border-[#0D3B1E] bg-[#0D1117]/50 p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#00AA2A]">
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
                        'flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors',
                        activeSection === section.id
                          ? 'bg-[#0D3B1E]/20 text-[#00FF41]'
                          : 'text-[#00AA2A] hover:bg-[#0D3B1E]/20 hover:text-[#00FF41]'
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
            <TerminalFrame
              title="DOCS.api"
              pid="080"
              accent="cyan"
              borderStyle="single"
              status="SPEC: v1.0"
              statusLabel="DOCUMENTED"
            >
              <div className="px-4 py-6">
                <Badge className="mb-4 bg-[#0D3B1E]/30 text-[#00FF41] border-[#0D3B1E]/50 glitch-badge">
                  API v1.0
                </Badge>
                <h1 className="text-4xl font-bold text-[#00FF41]">
                  _unstablecoins <span className="text-gradient">Game API</span>
                </h1>
                <div className="mt-3 border-l border-dashed border-[#00FFFF]/20 pl-4">
                  <p className="max-w-2xl text-lg text-[#00AA2A]">
                    Integrate _unITM data into your game. Verify ownership, fetch player
                    inventories, and receive real-time updates via WebSocket.
                  </p>
                </div>
              </div>
            </TerminalFrame>
          </div>

          {/* Getting Started */}
          <section id="getting-started" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-[#00FF41]">Getting Started</h2>
            <p className="mb-6 text-[#00AA2A]">
              The UnstableLabs Game API provides programmatic access to _unITM data for game
              integration. All API requests are authenticated via API key and return JSON responses.
            </p>

            <Card className="border-[#0D3B1E] bg-[#0D1117]/50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">Base URL</h3>
              <CodeBlock code={`https://your-domain.com/api/game`} language="text" />

              <h3 className="mb-3 mt-6 text-lg font-semibold text-[#00FF41]">Quick Start</h3>
              <CodeBlock
                code={`// Fetch player _unITM
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

          <Separator className="my-12 bg-[#111318]" />

          {/* Authentication */}
          <section id="authentication" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-[#00FF41]">Authentication</h2>
            <p className="mb-6 text-[#00AA2A]">
              All Game API requests require an API key passed via the{' '}
              <code className="rounded bg-[#111318] px-1.5 py-0.5 text-[#00FF41]">X-API-Key</code>{' '}
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

          <Separator className="my-12 bg-[#111318]" />

          {/* _unITM Endpoints */}
          <section id="nft-endpoints" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-[#00FF41]">_unITM Endpoints</h2>

            <div className="space-y-8">
              {/* Get Player _unITM */}
              <EndpointCard
                method="GET"
                path="/api/game/nfts/{wallet}"
                description="Retrieve all _unITM owned by a player identified by their Solana wallet address. Results are cached for 60 seconds."
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
        "created_at": "2026-01-15T10:00:00Z"
      }
    ],
    "total": 1,
    "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  }
}`}
              />

              {/* Get Single _unITM */}
              <EndpointCard
                method="GET"
                path="/api/game/nft/{id}"
                description="Retrieve detailed information about a single _unITM by its ID. Results are cached for 60 seconds."
                parameters={[
                  {
                    name: 'id',
                    type: 'string (UUID)',
                    required: true,
                    description: 'The unique ID of the _unITM',
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
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-02-01T12:30:00Z"
    }
  }
}`}
              />
            </div>
          </section>

          <Separator className="my-12 bg-[#111318]" />

          {/* Ownership Verification */}
          <section id="ownership" className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-[#00FF41]">Ownership Verification</h2>
            <p className="mb-6 text-[#00AA2A]">
              Verify whether a player owns a specific _unITM. Useful for gating in-game content or
              features behind _unITM ownership.
            </p>

            <EndpointCard
              method="POST"
              path="/api/game/verify-ownership"
              description="Verify that a given wallet address owns a specific _unITM. Returns a boolean ownership result."
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
                  description: 'The _unITM ID to check ownership for',
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

            <Card className="mt-8 border-[#0D3B1E] bg-[#0D1117]/50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">
                Game Integration Example
              </h3>
              <p className="mb-4 text-sm text-[#00AA2A]">
                Here is how you might gate content in a game server based on _unITM ownership.
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
      throw new Error('Player does not own the required _unITM');
    }

    // Player owns the _unITM, proceed
    return true;
  };
}

// Usage: Gate a legendary dungeon behind _unITM ownership
app.get('/dungeon/legendary', requireNFT('cosmic-blade-uuid'), handler);`}
                language="typescript"
              />
            </Card>
          </section>

          <Separator className="my-12 bg-[#111318]" />

          {/* WebSocket Events */}
          <section id="websocket" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-[#00FF41]">WebSocket Events</h2>
            <p className="mb-6 text-[#00AA2A]">
              Subscribe to real-time updates using Supabase Realtime channels. Listen for changes to
              purchases, _unITM, and trades scoped to specific players.
            </p>

            <Card className="border-[#0D3B1E] bg-[#0D1117]/50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">Available Channels</h3>
              <div className="space-y-4">
                <div className="rounded-sm border border-[#0D3B1E] bg-black p-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/30">
                      purchases
                    </Badge>
                    <span className="text-sm text-[#00AA2A]">
                      WHERE buyer_wallet = currentWallet
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#00CC33]">
                    Fired when a purchase is created or updated for the player.
                  </p>
                </div>

                <div className="rounded-sm border border-[#0D3B1E] bg-black p-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#00FFFF]/20 text-[#00FFFF] border-[#00FFFF]/30">
                      nfts
                    </Badge>
                    <span className="text-sm text-[#00AA2A]">WHERE owner_id = currentPlayer</span>
                  </div>
                  <p className="mt-2 text-sm text-[#00CC33]">
                    Fired when an _unITM is added, updated, or removed from the player's inventory.
                  </p>
                </div>

                <div className="rounded-sm border border-[#0D3B1E] bg-black p-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#0D3B1E]/30 text-[#00FF41] border-[#0D3B1E]/50">
                      trades
                    </Badge>
                    <span className="text-sm text-[#00AA2A]">WHERE seller_id = currentPlayer</span>
                  </div>
                  <p className="mt-2 text-sm text-[#00CC33]">
                    Fired when a trade offer is received or a sale is completed.
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">Subscribing to Events</h3>
              <CodeBlock
                code={`import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to player's _unITM changes
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
      console.log('_unITM change:', payload.eventType);
      console.log('New data:', payload.new);

      switch (payload.eventType) {
        case 'INSERT':
          handleNewItem(payload.new);
          break;
        case 'UPDATE':
          handleItemUpdate(payload.new);
          break;
        case 'DELETE':
          handleItemRemoved(payload.old);
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
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">Event Payload Format</h3>
              <CodeBlock
                code={`{
  "eventType": "INSERT" | "UPDATE" | "DELETE",
  "new": {
    "id": "item-uuid",
    "name": "Cosmic Blade",
    "owner_id": "player-uuid",
    "rarity": "legendary",
    // ... full _unITM record
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

          <Separator className="my-12 bg-[#111318]" />

          {/* Error Handling */}
          <section id="errors" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-[#00FF41]">Error Handling</h2>
            <p className="mb-6 text-[#00AA2A]">
              All error responses follow a consistent format with a{' '}
              <code className="rounded bg-[#111318] px-1.5 py-0.5 text-[#00FF41]">
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

            <Card className="mt-8 border-[#0D3B1E] bg-[#0D1117]/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-[#00FF41]">Error Codes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1A3A2A]">
                      <th className="pb-3 pr-4 text-left font-medium text-[#00AA2A]">
                        HTTP Status
                      </th>
                      <th className="pb-3 pr-4 text-left font-medium text-[#00AA2A]">Code</th>
                      <th className="pb-3 text-left font-medium text-[#00AA2A]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#00CC33]">
                    <tr className="border-b border-[#0D3B1E]">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30">
                          400
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-[#FF3333]">INVALID_WALLET</code>
                      </td>
                      <td className="py-2.5">Invalid wallet address format</td>
                    </tr>
                    <tr className="border-b border-[#0D3B1E]">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30">
                          400
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-[#FF3333]">VALIDATION_ERROR</code>
                      </td>
                      <td className="py-2.5">Request body validation failed</td>
                    </tr>
                    <tr className="border-b border-[#0D3B1E]">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-[#FF3333]/20 text-[#FF3333] border-[#FF3333]/30">
                          401
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-[#FF3333]">MISSING_API_KEY</code>
                      </td>
                      <td className="py-2.5">X-API-Key header not provided</td>
                    </tr>
                    <tr className="border-b border-[#0D3B1E]">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-[#FF3333]/20 text-[#FF3333] border-[#FF3333]/30">
                          403
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-[#FF3333]">INVALID_API_KEY</code>
                      </td>
                      <td className="py-2.5">The provided API key is invalid</td>
                    </tr>
                    <tr className="border-b border-[#0D3B1E]">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30">
                          404
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-[#FF3333]">ITEM_NOT_FOUND</code>
                      </td>
                      <td className="py-2.5">Requested _unITM does not exist</td>
                    </tr>
                    <tr className="border-b border-[#0D3B1E]">
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-[#FFB000]/20 text-[#FFB000] border-[#FFB000]/30">
                          429
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-[#FF3333]">RATE_LIMIT_EXCEEDED</code>
                      </td>
                      <td className="py-2.5">Too many requests, retry after cooldown</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">
                        <Badge className="bg-[#FF3333]/20 text-[#FF3333] border-[#FF3333]/30">
                          500
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4">
                        <code className="text-[#FF3333]">INTERNAL_ERROR</code>
                      </td>
                      <td className="py-2.5">Unexpected server error occurred</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">Handling Errors in Code</h3>
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
      case 'ITEM_NOT_FOUND':
        console.log('_unITM does not exist or has been burned');
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

          <Separator className="my-12 bg-[#111318]" />

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-[#00FF41]">Rate Limits</h2>
            <p className="mb-6 text-[#00AA2A]">
              The Game API enforces rate limits to ensure fair usage and platform stability. Limits
              are applied per API key.
            </p>

            <Card className="border-[#0D3B1E] bg-[#0D1117]/50 p-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-sm border border-[#0D3B1E] bg-black p-4 text-center">
                  <p className="text-3xl font-bold text-[#00FF41]">60</p>
                  <p className="mt-1 text-sm text-[#00AA2A]">Requests per minute</p>
                </div>
                <div className="rounded-sm border border-[#0D3B1E] bg-black p-4 text-center">
                  <p className="text-3xl font-bold text-[#00FFFF]">60s</p>
                  <p className="mt-1 text-sm text-[#00AA2A]">Cache TTL (GET endpoints)</p>
                </div>
                <div className="rounded-sm border border-[#0D3B1E] bg-black p-4 text-center">
                  <p className="text-3xl font-bold text-[#00FF41]">200</p>
                  <p className="mt-1 text-sm text-[#00AA2A]">Max _unITM per response</p>
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">Rate Limit Headers</h3>
              <p className="mb-4 text-sm text-[#00AA2A]">
                When rate limited, the response includes headers to help you implement proper retry
                logic.
              </p>
              <CodeBlock
                code={`// Response headers on 429
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-06-15T10:01:00.000Z
Retry-After: 45`}
                language="text"
              />
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">Retry Strategy</h3>
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

          <Separator className="my-12 bg-[#111318]" />

          {/* SDK & Downloads */}
          <section id="sdk" className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-[#00FF41]">SDK & Downloads</h2>
            <p className="mb-6 text-[#00AA2A]">
              Download the OpenAPI specification to generate client SDKs in any language, or use our
              pre-built TypeScript SDK for quick integration.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-[#0D3B1E] bg-[#0D1117]/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-sm bg-[#0D3B1E]/30">
                    <Download className="size-5 text-[#00FF41]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#00FF41]">OpenAPI Spec</h3>
                    <p className="mt-1 text-sm text-[#00AA2A]">
                      Download the OpenAPI 3.0.3 specification file. Use it to auto-generate client
                      SDKs with tools like openapi-generator.
                    </p>
                    <a
                      href="/api/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-[#111318] px-3 py-1.5 text-sm font-medium text-[#00FF41] transition-colors hover:bg-[#0D3B1E]/20 hover:text-[#00FF41]"
                    >
                      <Download className="size-3.5" />
                      Download JSON
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="border-[#0D3B1E] bg-[#0D1117]/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-sm bg-[#00FFFF]/20">
                    <Box className="size-5 text-[#00FFFF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-[#00FF41]">TypeScript SDK</h3>
                    <p className="mt-1 text-sm text-[#00AA2A]">
                      Type-safe client with built-in retry logic and error handling. Install via
                      npm.
                    </p>
                    <CodeBlock code="npm install @unstablelabs/game-sdk" language="bash" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-[#00FF41]">
                Generate SDK from OpenAPI
              </h3>
              <CodeBlock
                code={`# Install the OpenAPI generator
npm install -g @openapitools/openapi-generator-cli

# Generate a TypeScript SDK
openapi-generator-cli generate \\
  -i https://your-domain.com/api/docs \\
  -g typescript-fetch \\
  -o ./generated-sdk

# Generate a Python SDK
openapi-generator-cli generate \\
  -i https://your-domain.com/api/docs \\
  -g python \\
  -o ./python-sdk`}
                language="bash"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
