# UnstableLabs NFT Platform — Frontend Initialization Prompt v1.0

> **Purpose:** Claude Code prompt for implementing the player frontend in phases  
> **Status:** NOT_FOR_IMPORT — One-time instruction prompt  
> **Version:** 1.0  
> **Last Updated:** February 3, 2026

---

## Overview

This document provides phased prompts for Claude Code to implement the player frontend (`nft.unstablecoins.io`). Execute each phase sequentially, ensuring all tests pass before proceeding.

**Target Directory:** `apps/frontend/`

**Tech Stack:**

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL, Auth, Realtime)
- Solana Web3.js
- @solana/wallet-adapter

---

## Pre-Implementation Checklist

Before starting, ensure:

- [ ] Monorepo structure is initialized (see Development Guide)
- [ ] Shared packages are built (`@unstablecoins/db`, `@unstablecoins/types`, `@unstablecoins/solana`)
- [ ] Admin backend is deployed and accessible
- [ ] Environment variables are configured
- [ ] Test wallet with SOL for purchases

---

## Phase 1: Wallet Connection

### 1.1 Wallet Adapter Setup

**Prompt:**

````
Implement Solana wallet connection for the player frontend:

1. Create `components/wallet/`:
   - `wallet-provider.tsx`: Context provider wrapping the app
   - `wallet-button.tsx`: Connect/disconnect button
   - `wallet-modal.tsx`: Wallet selection modal
   - `wallet-status.tsx`: Display connected wallet info

2. Configure supported wallets:
   ```typescript
   const wallets = [
     new PhantomWalletAdapter(),
     new SolflareWalletAdapter(),
     new BackpackWalletAdapter(),
     new SolletWalletAdapter()
   ]
````

3. Create `app/providers.tsx`:
   - ConnectionProvider with Helius RPC
   - WalletProvider with supported wallets
   - WalletModalProvider

4. Create `lib/wallet/`:
   - `connection.ts`: Solana connection utilities
   - `balance.ts`: Get SOL and \_unSC balances
   - `sign.ts`: Sign message for authentication

5. Update `app/layout.tsx`:
   - Wrap with wallet providers
   - Include global styles

6. Wallet button behavior:
   - Not connected: Show "Connect Wallet"
   - Connected: Show truncated address + balance
   - Click connected: Show dropdown (disconnect, copy address, view in explorer)

7. Store connection in local state only (no localStorage for security).

Dependencies: @solana/wallet-adapter-react, @solana/wallet-adapter-react-ui, @solana/wallet-adapter-wallets

```

### 1.2 Wallet-Based Authentication

**Prompt:**

```

Implement wallet-based authentication for the player frontend:

1. Create `lib/auth/`:
   - `player-auth.ts`: Generate challenge, verify signature, manage session
   - `session.ts`: JWT handling with wallet address claim

2. Authentication flow:

   ```
   Connect wallet
        ↓
   Request challenge from API
        ↓
   Sign challenge with wallet
        ↓
   Send signature to API
        ↓
   Receive JWT, store in memory
        ↓
   Include JWT in all authenticated requests
   ```

3. Create `components/auth/`:
   - `auth-guard.tsx`: Protect routes requiring authentication
   - `sign-in-button.tsx`: Trigger sign-in flow

4. Create API routes:
   - `app/api/auth/challenge/route.ts`: Generate nonce for wallet
   - `app/api/auth/verify/route.ts`: Verify signature, return JWT
   - `app/api/auth/refresh/route.ts`: Refresh expiring JWT

5. Create `hooks/useAuth.ts`:

   ```typescript
   export function useAuth() {
     const { publicKey, signMessage } = useWallet()
     // Return: isAuthenticated, signIn, signOut, user
   }
   ```

6. Session management:
   - JWT expiry: 7 days
   - Auto-refresh when < 1 day remaining
   - Clear on wallet disconnect

7. Handle wallet change:
   - If user switches wallet, invalidate session
   - Prompt to re-authenticate

```

### 1.3 Player Profile

**Prompt:**

```

Implement player profile management:

1. Create `app/(authenticated)/profile/page.tsx`:
   - Display wallet address (with copy button)
   - Show SOL balance
   - Show \_unSC balance (in-game)
   - NFT count
   - Purchase history summary
   - Trade history summary

2. Create `components/profile/`:
   - `profile-card.tsx`: Main profile display
   - `balance-display.tsx`: Token balances
   - `wallet-address.tsx`: Formatted address with copy

3. Create `lib/player/`:
   - `profile.ts`: Fetch player data
   - `balance.ts`: Get on-chain balances

4. Create API routes:
   - `app/api/player/profile/route.ts`: GET player profile
   - `app/api/player/balance/route.ts`: GET balances

5. Auto-create player record:
   - On first authentication, create player in database
   - Link to wallet address
   - Initialize empty profile

6. Profile features:
   - No editable fields (wallet-based identity)
   - Link to Solana explorer
   - QR code for wallet address

```

---

## Phase 2: NFT Browser and Search

### 2.1 NFT Listing Page

**Prompt:**

```

Implement the NFT browser/encyclopedia:

1. Create `app/(public)/browse/page.tsx`:
   - Grid layout of NFT cards
   - Infinite scroll or pagination
   - Filters sidebar
   - Search bar
   - Sort options (newest, rarity, price)

2. Create `components/nft/`:
   - `nft-card.tsx`:
     - Thumbnail image
     - Name and tier badge
     - Status indicator (minted/delivered)
     - Owner (if delivered)
     - Quick view button
   - `nft-grid.tsx`: Responsive grid container
   - `nft-filters.tsx`: Filter controls
   - `nft-search.tsx`: Search input

3. Filter options:
   - Status: Ready (blurred), Minted, Delivered
   - Color: All 9 wavelengths
   - Tier: 1-5
   - Era: 8-bit, 16-bit, 32-bit, 64-bit
   - Rotation: CW, CCW

4. Create API routes:
   - `app/api/nfts/route.ts`: GET list with filters
   - `app/api/nfts/search/route.ts`: Full-text search

5. Display modes based on status:
   - `ready`: Blurred preview, "Not Minted" label
   - `minted`: Full preview, "Available" label
   - `delivered`: Full preview, owner address shown

6. Performance:
   - Image lazy loading
   - Skeleton loading states
   - Cache filter results

```

### 2.2 NFT Detail Page

**Prompt:**

```

Implement detailed NFT view page:

1. Create `app/(public)/nft/[id]/page.tsx`:
   - Large image display (with zoom capability)
   - Full metadata table
   - Ownership history
   - Related NFTs (same tier/color)
   - Actions based on status

2. Create `components/nft/`:
   - `nft-detail-view.tsx`: Main detail component
   - `nft-metadata.tsx`: Formatted metadata display
   - `nft-history.tsx`: Ownership timeline
   - `nft-image-viewer.tsx`: Zoomable image

3. Metadata display:

   ```
   ┌─────────────────────────────────┐
   │ _capture: Solana Block #12345  │
   │ _color:   Gamma                │
   │ _I/O:     CW                   │
   │ tier:     5                    │
   │ bit:      64-bit               │
   └─────────────────────────────────┘
   ```

4. Create API route:
   - `app/api/nfts/[id]/route.ts`: GET full NFT details
   - `app/api/nfts/[id]/history/route.ts`: Ownership history

5. Actions by status:
   - `ready`: "Coming Soon" (disabled)
   - `minted`: Link to package containing this NFT
   - `delivered`: "Contact Owner" button (if for sale), owner explorer link

6. Social features:
   - Share button (Twitter, copy link)
   - Report button
   - Favorite/bookmark (if authenticated)

7. SEO:
   - Dynamic OG images
   - Structured data for NFT
   - Proper meta tags

```

### 2.3 Advanced Search

**Prompt:**

```

Implement advanced NFT search functionality:

1. Create `app/(public)/browse/search/page.tsx`:
   - Advanced search form
   - Multiple filter combinations
   - Save search preferences
   - Recent searches

2. Create `components/search/`:
   - `advanced-search-form.tsx`: Multi-field form
   - `search-results.tsx`: Results display
   - `saved-searches.tsx`: User's saved searches
   - `search-history.tsx`: Recent searches

3. Search capabilities:
   - Text search in name/description
   - Exact match filters (color, tier, era)
   - Range filters (creation date)
   - Owner search (by wallet address)
   - Rarity score range

4. Create API routes:
   - `app/api/nfts/search/route.ts`: Advanced search endpoint
   - `app/api/nfts/search/suggestions/route.ts`: Autocomplete

5. Search results:
   - Highlight matching text
   - Show relevance score
   - Group by category option
   - Export results (authenticated only)

6. URL state:
   - Persist search params in URL
   - Shareable search links
   - Browser back/forward support

```

---

## Phase 3: Package Store and Purchase Flow

### 3.1 Package Listing

**Prompt:**

```

Implement the package store:

1. Create `app/(public)/packages/page.tsx`:
   - Package cards in grid layout
   - Featured package highlight
   - Sort: price, popularity, newest
   - Category filters

2. Create `components/packages/`:
   - `package-card.tsx`:
     - Package name and image
     - Price in SOL (+ USD estimate)
     - \_unSC token amount
     - NFT count with previews
     - "View Details" button
   - `package-grid.tsx`: Responsive grid
   - `package-filters.tsx`: Category filters

3. Package categories:
   - Starter Packs
   - Token Bundles
   - Collector Editions
   - Limited Releases

4. Create API route:
   - `app/api/packages/route.ts`: GET available packages

5. Display elements:
   - Price prominently displayed
   - "Best Value" badge for deals
   - Limited stock indicator
   - Sale countdown (if applicable)

6. Performance:
   - Static generation for package list
   - Revalidate on inventory change
   - Optimistic UI updates

```

### 3.2 Package Detail Page

**Prompt:**

```

Implement package detail and purchase initiation:

1. Create `app/(public)/packages/[id]/page.tsx`:
   - Package hero section
   - Detailed description
   - Contents breakdown:
     - \_unSC token amount
     - NFT list with previews
   - Purchase button (requires wallet)
   - Related packages

2. Create `components/packages/`:
   - `package-detail.tsx`: Main detail view
   - `package-contents.tsx`: Itemized contents
   - `package-purchase-button.tsx`: Buy button with states
   - `nft-preview-gallery.tsx`: NFT previews in package

3. Contents display:

   ```
   ┌─────────────────────────────────┐
   │ STARTER PACK                    │
   ├─────────────────────────────────┤
   │ 💰 10,000 _unSC tokens          │
   │ 🎴 3 NFTs included:            │
   │    • Crystal #1234 (Tier 2)    │
   │    • Crystal #1235 (Tier 1)    │
   │    • Crystal #1236 (Tier 1)    │
   ├─────────────────────────────────┤
   │ Price: 0.5 SOL (~$75)          │
   │ [Connect Wallet to Purchase]   │
   └─────────────────────────────────┘
   ```

4. Create API route:
   - `app/api/packages/[id]/route.ts`: GET package details

5. Purchase button states:
   - No wallet: "Connect Wallet"
   - Wallet connected, insufficient SOL: "Insufficient Balance"
   - Wallet connected, sufficient: "Purchase for X SOL"
   - Processing: Loading spinner
   - Success: "Purchase Complete!"

6. Show real-time availability:
   - Stock count (if limited)
   - "X remaining" warning when low
   - "Sold Out" state

```

### 3.3 Purchase Flow

**Prompt:**

```

Implement complete purchase transaction flow:

1. Create `components/purchase/`:
   - `purchase-modal.tsx`: Full purchase flow in modal
   - `purchase-summary.tsx`: Order summary
   - `purchase-confirmation.tsx`: Success state
   - `purchase-error.tsx`: Error handling

2. Purchase flow steps:

   ```
   1. Review Order
      ↓
   2. Confirm in Wallet (sign transaction)
      ↓
   3. Processing (transaction submitted)
      ↓
   4. Confirmation (transaction confirmed)
      ↓
   5. Delivery Status (redirect to inventory)
   ```

3. Create `lib/purchase/`:
   - `transaction.ts`: Build purchase transaction
   - `submit.ts`: Submit and monitor transaction
   - `verify.ts`: Verify payment received

4. Transaction building:

   ```typescript
   async function buildPurchaseTransaction(
     packageId: string,
     buyerWallet: PublicKey
   ): Promise<Transaction> {
     // Transfer SOL from buyer to platform wallet
     // Include package ID in memo
     // Return unsigned transaction
   }
   ```

5. Create API routes:
   - `app/api/packages/[id]/purchase/route.ts`: Initiate purchase
   - `app/api/purchases/[id]/status/route.ts`: Check status

6. Error handling:
   - User rejected transaction
   - Insufficient balance
   - Network error
   - Transaction timeout
   - Package no longer available

7. Post-purchase:
   - Show transaction signature
   - Link to Solana explorer
   - "View in Inventory" button
   - Email confirmation (if email on file)

```

### 3.4 Purchase History

**Prompt:**

```

Implement purchase history for players:

1. Create `app/(authenticated)/history/page.tsx`:
   - List of all purchases
   - Filter: status, date range
   - Search by package name
   - Sort: newest, oldest, price

2. Create `components/history/`:
   - `purchase-list.tsx`: Table of purchases
   - `purchase-row.tsx`: Single purchase entry
   - `delivery-status.tsx`: Delivery progress indicator

3. Purchase status flow:
   - `pending`: Payment processing
   - `confirmed`: Payment received
   - `delivering`: NFTs being transferred
   - `completed`: Delivery complete
   - `failed`: Error (with retry option)

4. Create API route:
   - `app/api/purchases/route.ts`: GET player's purchases
   - `app/api/purchases/[id]/route.ts`: Single purchase details

5. Display for each purchase:

   ```
   ┌───────────────────────────────────────────┐
   │ Starter Pack           Feb 3, 2026 14:23 │
   │ ─────────────────────────────────────────│
   │ Price: 0.5 SOL                            │
   │ Status: ✓ Completed                       │
   │ TX: abc123...xyz789                       │
   │ [View NFTs] [View on Explorer]            │
   └───────────────────────────────────────────┘
   ```

6. Real-time updates:
   - WebSocket subscription for status changes
   - Push notification on delivery complete

```

---

## Phase 4: Player Inventory

### 4.1 Inventory Display

**Prompt:**

```

Implement player's NFT inventory:

1. Create `app/(authenticated)/inventory/page.tsx`:
   - Grid of owned NFTs
   - Filter by traits
   - Sort: acquired date, rarity, name
   - Select mode for bulk actions

2. Create `components/inventory/`:
   - `inventory-grid.tsx`: NFT grid with selection
   - `inventory-card.tsx`: NFT card with actions
   - `inventory-filters.tsx`: Filter controls
   - `inventory-stats.tsx`: Collection statistics

3. Inventory features:
   - Total NFT count
   - Rarity breakdown
   - Collection value (if listed prices exist)
   - "New" badge for recently acquired

4. Create API routes:
   - `app/api/inventory/route.ts`: GET player's NFTs
   - `app/api/inventory/stats/route.ts`: Collection stats

5. NFT card actions:
   - View details
   - List for sale
   - Transfer to another wallet
   - View on explorer

6. Empty state:
   - "No NFTs yet" message
   - Link to package store
   - Recently viewed NFTs

7. Performance:
   - Lazy load images
   - Virtual scrolling for large collections
   - Cache inventory data

```

### 4.2 NFT Transfer

**Prompt:**

```

Implement NFT transfer functionality:

1. Create `components/inventory/`:
   - `transfer-modal.tsx`: Transfer flow modal
   - `address-input.tsx`: Recipient address input with validation
   - `transfer-confirmation.tsx`: Confirm transfer details

2. Transfer flow:

   ```
   Select NFT → Enter recipient → Confirm → Sign → Complete
   ```

3. Create `lib/transfer/`:
   - `validate.ts`: Validate recipient address
   - `transaction.ts`: Build transfer transaction
   - `submit.ts`: Submit and confirm

4. Create API routes:
   - `app/api/inventory/[id]/transfer/route.ts`: Initiate transfer
   - `app/api/transfers/[id]/status/route.ts`: Check status

5. Validation:
   - Valid Solana address
   - Not transferring to self
   - NFT not currently listed for sale
   - Warning for known exchange addresses

6. Post-transfer:
   - Update inventory immediately
   - Show transaction link
   - Confirmation message

7. Security:
   - Require wallet signature
   - Clear warning before confirming
   - Cannot undo transfers

```

---

## Phase 5: Trading System

### 5.1 List NFT for Sale

**Prompt:**

```

Implement NFT listing functionality:

1. Create `app/(authenticated)/inventory/[id]/sell/page.tsx`:
   - NFT preview
   - Price input (SOL)
   - Duration selector
   - Terms acceptance
   - List button

2. Create `components/trading/`:
   - `listing-form.tsx`: Price and duration form
   - `price-input.tsx`: SOL amount with USD conversion
   - `listing-preview.tsx`: Preview of listing

3. Listing options:
   - Fixed price (SOL)
   - Duration: 1 day, 3 days, 7 days, 30 days, no expiry
   - Optional description/notes

4. Create API routes:
   - `app/api/trades/route.ts`: POST create listing
   - `app/api/trades/[id]/route.ts`: GET, DELETE listing

5. Create `lib/trading/`:
   - `listing.ts`: Create/cancel listing logic
   - `escrow.ts`: Handle escrow (if applicable)
   - `fees.ts`: Calculate marketplace fees

6. Listing flow:

   ```
   Enter price → Preview → Sign message → Listed
   ```

7. Display on NFT:
   - "For Sale" badge
   - Listed price
   - Time remaining
   - Cancel listing button

```

### 5.2 Browse Marketplace

**Prompt:**

```

Implement NFT marketplace browser:

1. Create `app/(public)/marketplace/page.tsx`:
   - Active listings grid
   - Filters: price range, traits, seller
   - Sort: price (low/high), newest, ending soon
   - Recent sales

2. Create `components/marketplace/`:
   - `listing-card.tsx`: NFT with price and buy button
   - `marketplace-filters.tsx`: Filter controls
   - `price-range-slider.tsx`: Price filter
   - `recent-sales.tsx`: Recently completed trades

3. Listing card display:

   ```
   ┌─────────────────────────────┐
   │      [NFT IMAGE]           │
   │                            │
   │ Crystal #1234              │
   │ Tier 3 • Gamma • 64-bit    │
   ├─────────────────────────────┤
   │ Price: 2.5 SOL (~$375)     │
   │ Seller: abc1...xyz9        │
   │ Ends in: 3 days            │
   │                            │
   │     [Buy Now]              │
   └─────────────────────────────┘
   ```

4. Create API routes:
   - `app/api/trades/route.ts`: GET active listings
   - `app/api/trades/recent/route.ts`: Recent sales

5. Filters:
   - Price: min/max SOL
   - Traits: color, tier, era
   - Seller: specific wallet
   - Listing age: new, ending soon

6. Recent sales section:
   - Show last 10 completed trades
   - Price comparison (above/below floor)
   - Trend indicator

```

### 5.3 Purchase Listed NFT

**Prompt:**

```

Implement buying listed NFTs from other players:

1. Create `components/marketplace/`:
   - `buy-modal.tsx`: Purchase flow modal
   - `buy-confirmation.tsx`: Confirm purchase details
   - `buy-success.tsx`: Success state

2. Purchase flow:

   ```
   Click Buy → Confirm details → Sign transaction → Complete
   ```

3. Create `lib/trading/`:
   - `buy.ts`: Execute purchase transaction
   - `fees.ts`: Calculate and display fees

4. Create API routes:
   - `app/api/trades/[id]/buy/route.ts`: Execute purchase

5. Transaction details:
   - NFT price
   - Marketplace fee (if any)
   - Total cost
   - Transaction preview

6. Post-purchase:
   - NFT appears in buyer inventory
   - SOL transferred to seller
   - Listing removed
   - Both parties notified

7. Error handling:
   - Listing no longer available
   - Insufficient balance
   - Transaction failure

```

### 5.4 Contact Seller

**Prompt:**

```

Implement seller contact functionality for trade negotiations:

1. Create `components/marketplace/`:
   - `contact-seller-modal.tsx`: Contact form
   - `message-input.tsx`: Message composition

2. Contact options:
   - In-app message (if messaging enabled)
   - Copy seller wallet address
   - External link (Discord, Twitter if provided)

3. Message template:

   ```
   Hi, I'm interested in your NFT Crystal #1234.
   [Custom message]
   My wallet: abc1...xyz9
   ```

4. Privacy considerations:
   - Don't expose email addresses
   - Use wallet addresses only
   - Rate limit contact attempts

5. Create API route:
   - `app/api/trades/[id]/contact/route.ts`: Send contact message

6. Notification to seller:
   - In-app notification
   - Email (if configured)
   - Include buyer wallet and message

```

---

## Phase 6: WebSocket Real-Time Updates

### 6.1 Supabase Realtime Setup

**Prompt:**

```

Implement real-time updates using Supabase Realtime:

1. Create `lib/realtime/`:
   - `client.ts`: Supabase realtime client setup
   - `subscriptions.ts`: Channel subscription management
   - `handlers.ts`: Event handlers

2. Subscribe to relevant tables:

   ```typescript
   // Player-specific channels
   - purchases: WHERE buyer_wallet = currentWallet
   - nfts: WHERE owner_id = currentPlayer
   - trades: WHERE seller_id = currentPlayer
   ```

3. Create `hooks/`:
   - `useRealtimeDelivery.ts`: Track delivery status
   - `useRealtimeTrades.ts`: Track trade activity
   - `useRealtimeInventory.ts`: Inventory updates

4. Create `components/realtime/`:
   - `realtime-provider.tsx`: Context provider
   - `notification-toast.tsx`: Display real-time notifications

5. Events to handle:
   - `INSERT` on nfts (new delivery)
   - `UPDATE` on purchases (status change)
   - `INSERT` on trades (new listing on owned NFT)
   - `DELETE` on trades (listing sold)

6. Notification types:
   - "Your NFT has been delivered!"
   - "Your listing has sold!"
   - "You received a trade offer"
   - "Package purchase complete"

```

### 6.2 Notification System

**Prompt:**

```

Implement comprehensive notification system:

1. Create `app/(authenticated)/notifications/page.tsx`:
   - Notification list
   - Filter: unread, all, by type
   - Mark as read functionality
   - Clear all button

2. Create `components/notifications/`:
   - `notification-list.tsx`: List of notifications
   - `notification-item.tsx`: Single notification
   - `notification-bell.tsx`: Header bell icon with count
   - `notification-dropdown.tsx`: Quick view dropdown

3. Notification types:

   ```typescript
   type NotificationType =
     | 'delivery_complete'
     | 'trade_sold'
     | 'trade_offer'
     | 'purchase_confirmed'
     | 'price_drop'
     | 'new_nft_available'
   ```

4. Create `lib/notifications/`:
   - `types.ts`: Notification interfaces
   - `actions.ts`: Mark read, clear, fetch

5. Create API routes:
   - `app/api/notifications/route.ts`: GET notifications
   - `app/api/notifications/[id]/read/route.ts`: Mark as read
   - `app/api/notifications/read-all/route.ts`: Mark all read

6. Header integration:
   - Bell icon in header
   - Unread count badge
   - Click to show dropdown
   - "View All" link to full page

7. Push notifications (optional):
   - Browser push notifications
   - Request permission on first trade

```

---

## Phase 7: Game API Integration

### 7.1 REST API for Game Client

**Prompt:**

```

Implement REST API for in-game NFT queries:

1. Create `app/api/game/` routes:
   - `nfts/[wallet]/route.ts`: Get player's NFTs
   - `nft/[id]/route.ts`: Get single NFT details
   - `verify-ownership/route.ts`: Verify NFT ownership

2. API response formats:

   ```typescript
   // GET /api/game/nfts/[wallet]
   {
     success: true,
     data: {
       nfts: NFT[],
       total: number,
       wallet: string
     }
   }

   // POST /api/game/verify-ownership
   {
     success: true,
     data: {
       owns: boolean,
       nft_id: string,
       wallet: string
     }
   }
   ```

3. Create `lib/game/`:
   - `api.ts`: Game API utilities
   - `verify.ts`: Ownership verification logic
   - `format.ts`: Format data for game client

4. API authentication:
   - API key authentication for game server
   - Rate limiting per API key
   - Audit logging for API calls

5. Caching:
   - Cache NFT data for 60 seconds
   - Invalidate on ownership change
   - ETag support for conditional requests

6. Error responses:
   ```typescript
   {
     success: false,
     error: {
       code: 'NOT_FOUND',
       message: 'NFT not found'
     }
   }
   ```

```

### 7.2 WebSocket for Game Events

**Prompt:**

```

Implement WebSocket endpoint for real-time game events:

1. Create `app/api/game/ws/route.ts`:
   - WebSocket upgrade handler
   - Authentication via token
   - Event subscription management

2. Event types:

   ```typescript
   type GameEvent =
     | { type: 'nft_delivered'; data: NFT }
     | { type: 'trade_complete'; data: Trade }
     | { type: 'balance_updated'; data: Balance }
   ```

3. Create `lib/game/`:
   - `websocket.ts`: WebSocket server utilities
   - `events.ts`: Event publishing

4. Client connection flow:

   ```
   Connect → Authenticate (JWT) → Subscribe → Receive events
   ```

5. Message format:

   ```json
   {
     "type": "nft_delivered",
     "timestamp": "2026-02-03T14:30:00Z",
     "data": {
       "nft_id": "abc123",
       "name": "Crystal #1234",
       "owner": "wallet_address"
     }
   }
   ```

6. Connection management:
   - Heartbeat every 30 seconds
   - Reconnection handling
   - Max connections per wallet: 3

7. Integration with Supabase Realtime:
   - Forward relevant database events
   - Filter events by connected wallet

```

### 7.3 API Documentation

**Prompt:**

```

Create API documentation for game developers:

1. Create `app/(public)/docs/page.tsx`:
   - Interactive API documentation
   - Request/response examples
   - Authentication guide
   - Rate limits

2. Documentation sections:
   - Getting Started
   - Authentication
   - NFT Endpoints
   - Ownership Verification
   - WebSocket Events
   - Error Handling
   - Rate Limits

3. Create `components/docs/`:
   - `endpoint-card.tsx`: API endpoint documentation
   - `code-block.tsx`: Code examples
   - `try-it.tsx`: Interactive API tester

4. Example code snippets:

   ```typescript
   // Fetch player NFTs
   const response = await fetch('https://nft.unstablecoins.io/api/game/nfts/WALLET_ADDRESS', {
     headers: { 'X-API-Key': 'your_api_key' },
   })
   const { data } = await response.json()
   ```

5. OpenAPI specification:
   - Generate from route definitions
   - Serve at `/api/docs/openapi.json`

6. SDK generation:
   - TypeScript SDK
   - Usage examples
   - Download links

```

---

## Layout and Styling

### Global Layout

**Prompt:**

```

Create polished frontend layout with UnstableLabs branding:

1. Create `app/layout.tsx`:
   - Header with navigation
   - Main content area
   - Footer
   - Providers wrapper

2. Create `components/layout/`:
   - `header.tsx`:
     - Logo (link to home)
     - Navigation: Browse, Packages, Marketplace
     - Wallet button (right side)
     - User menu (if authenticated)
   - `footer.tsx`:
     - Links: Docs, Support, Terms, Privacy
     - Social icons
     - Copyright
   - `mobile-nav.tsx`:
     - Hamburger menu
     - Slide-out navigation

3. Navigation items:
   - Public: Browse, Packages, Marketplace
   - Authenticated: + Inventory, History, Profile

4. Theme:
   - Dark mode by default
   - Colors:
     - Background: #0F172A (dark blue)
     - Primary: #8B5CF6 (purple)
     - Accent: #06B6D4 (cyan)
     - Text: #E2E8F0 (light gray)
   - Fonts:
     - Headings: Space Grotesk
     - Body: Inter
     - Mono: JetBrains Mono

5. Styling effects:
   - Subtle grid background
   - Glow effects on buttons
   - CRT scan line overlay (subtle)
   - Animated gradients

6. Responsive breakpoints:
   - Mobile: < 640px
   - Tablet: 640px - 1024px
   - Desktop: > 1024px

```

---

## Testing Checklist

After completing all phases, verify:

- [ ] Wallet connection works with all supported wallets
- [ ] Authentication flow completes successfully
- [ ] NFT browser displays all public NFTs
- [ ] Filters and search work correctly
- [ ] Package detail shows accurate contents
- [ ] Purchase flow executes transaction
- [ ] Delivery appears in inventory
- [ ] NFT transfer works
- [ ] Listing NFT for sale works
- [ ] Buying listed NFT works
- [ ] Real-time notifications appear
- [ ] Game API returns correct data
- [ ] WebSocket events fire correctly
- [ ] Mobile responsive design works
- [ ] Error handling throughout

---

## Related Documents

- [Development Guide](PLAT_DEV_nft-platform-development_v1_0.md)
- [Infrastructure Guide](PLAT_INF_nft-platform-infrastructure_v1_0.md)
- [Admin Initialization Prompt](PLAT_PROMPT_admin-initialization_v1_0.md)
- [Database Schema](DB_SCHEMA_nft-platform_v1_0.sql)

---

*Frontend Initialization Prompt v1.0 — February 3, 2026*
```
