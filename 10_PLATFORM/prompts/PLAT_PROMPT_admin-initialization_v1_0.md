# UnstableLabs NFT Platform — Admin Backend Initialization Prompt v1.0

> **Purpose:** Claude Code prompt for implementing the admin backend in phases  
> **Status:** NOT_FOR_IMPORT — One-time instruction prompt  
> **Version:** 1.0  
> **Last Updated:** February 3, 2026

---

## Overview

This document provides phased prompts for Claude Code to implement the admin backend (`nftback.unstablecoins.io`). Execute each phase sequentially, ensuring all tests pass before proceeding.

**Target Directory:** `apps/admin/`

**Tech Stack:**

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL, Auth, Storage)
- Solana Web3.js + SPL Token
- @solana/wallet-adapter

---

## Pre-Implementation Checklist

Before starting, ensure:

- [ ] Monorepo structure is initialized (see Development Guide)
- [ ] Shared packages are built (`@unstablecoins/db`, `@unstablecoins/types`, `@unstablecoins/solana`)
- [ ] Supabase project is created with schema applied
- [ ] Environment variables are configured
- [ ] Admin wallet is funded with SOL and \_unSC for testing

---

## Phase 1: Authentication System

### 1.1 Wallet + Email Authentication

**Prompt:**

```
Implement a hybrid authentication system for the admin backend with the following requirements:

1. Create `app/(auth)/login/page.tsx`:
   - Two authentication methods:
     a. Solana wallet signature (Phantom, Solflare, Backpack)
     b. Email + password form
   - Both methods must validate against the `admins` database table
   - Display wallet connection status and connected address

2. Create `app/(auth)/layout.tsx`:
   - Minimal layout for auth pages
   - Redirect authenticated users to dashboard
   - Include UnstableLabs logo and branding

3. Create `lib/auth/`:
   - `wallet-auth.ts`: Generate message, verify signature, create session
   - `email-auth.ts`: Validate credentials, check password hash
   - `session.ts`: JWT generation with wallet address claim

4. Create API routes:
   - `app/api/auth/wallet/challenge/route.ts`: Generate nonce for signing
   - `app/api/auth/wallet/verify/route.ts`: Verify signature, return JWT
   - `app/api/auth/login/route.ts`: Email/password login
   - `app/api/auth/logout/route.ts`: Clear session

5. Security requirements:
   - Use bcrypt for password hashing
   - JWT expiry: 24 hours
   - Store session in HttpOnly cookie
   - Check admin exists in `admins` table before authenticating

6. Create `middleware.ts`:
   - Protect all routes except /login
   - Verify JWT on each request
   - Redirect to /login if unauthenticated

Use shadcn/ui components: Button, Card, Input, Label, Alert.
Style with dark theme matching UnstableLabs cyberpunk aesthetic (purple/cyan accents, monospace fonts).
```

### 1.2 Two-Factor Authentication (2FA)

**Prompt:**

```
Add TOTP-based two-factor authentication to the admin login flow:

1. Create `app/(auth)/2fa/setup/page.tsx`:
   - Generate TOTP secret using `otplib`
   - Display QR code using `qrcode` library
   - Show manual entry key
   - Verify first code before enabling
   - Store encrypted TOTP secret in `admins.totp_secret`
   - Set `admins.totp_enabled = true`

2. Create `app/(auth)/2fa/verify/page.tsx`:
   - Input for 6-digit TOTP code
   - Verify against stored secret
   - 3 attempt limit with lockout
   - Complete authentication on success

3. Create `lib/auth/totp.ts`:
   - Generate secret: `generateSecret()`
   - Generate QR code URI: `generateQRCodeURI(secret, email)`
   - Verify token: `verifyTOTP(secret, token)`
   - Encrypt/decrypt secret for storage

4. Update API routes:
   - `app/api/auth/2fa/setup/route.ts`: Generate and store secret
   - `app/api/auth/2fa/verify/route.ts`: Verify code, complete auth
   - `app/api/auth/2fa/disable/route.ts`: Disable 2FA (requires current code)

5. Update login flow:
   - After wallet/email auth, check if 2FA enabled
   - If enabled, redirect to 2FA verification
   - Session only created after 2FA verification

6. Create backup codes:
   - Generate 10 backup codes on 2FA setup
   - Store hashed in database
   - Allow one-time use for account recovery

Dependencies to install: `otplib`, `qrcode`, `@types/qrcode`
```

### 1.3 Admin Profile Management

**Prompt:**

```
Create admin profile management functionality:

1. Create `app/(dashboard)/settings/page.tsx`:
   - Display current admin info (wallet, email, role)
   - Update email address
   - Change password (if email auth used)
   - Manage 2FA settings
   - View connected wallet
   - Session management (list active sessions, revoke)

2. Create API routes:
   - `app/api/admin/profile/route.ts`: GET/PATCH profile
   - `app/api/admin/password/route.ts`: Change password
   - `app/api/admin/sessions/route.ts`: List/revoke sessions

3. Create `lib/auth/password.ts`:
   - Password validation (min 12 chars, complexity)
   - Secure password change flow
   - Password history prevention

4. Access control:
   - Only `super_admin` can create new admins
   - Admins can only edit their own profile
   - Log all profile changes to audit log

5. UI Components:
   - Profile card with avatar
   - Form validation with error messages
   - Confirmation dialogs for destructive actions
```

---

## Phase 2: NFT CRUD and Image Upload

### 2.1 NFT Listing and Details

**Prompt:**

```
Implement NFT management interface with full CRUD operations:

1. Create `app/(dashboard)/nfts/page.tsx`:
   - DataTable with columns: thumbnail, name, status, tier, capture, color, created_at
   - Filters: status (draft/ready/minted/delivered), tier, color
   - Search by name, metadata
   - Pagination (25/50/100 per page)
   - Bulk actions: delete drafts, change status
   - "Create NFT" button

2. Create `app/(dashboard)/nfts/[id]/page.tsx`:
   - Full NFT details view
   - Image preview (large)
   - All metadata fields in editable form
   - Status workflow buttons
   - Ownership history
   - Delete button (drafts only)

3. Create `app/(dashboard)/nfts/create/page.tsx`:
   - Multi-step form:
     Step 1: Upload image
     Step 2: Enter metadata (_capture, _color, _I/O, tier, bit)
     Step 3: Preview and confirm
   - Save as draft initially

4. Create API routes:
   - `app/api/nfts/route.ts`: GET (list), POST (create)
   - `app/api/nfts/[id]/route.ts`: GET, PATCH, DELETE
   - `app/api/nfts/[id]/status/route.ts`: Update status
   - `app/api/nfts/bulk/route.ts`: Bulk operations

5. Data types from `@unstablecoins/types`:
   - NFT interface with all fields
   - NFTStatus enum
   - NFTMetadata interface

6. Use shadcn/ui: Table, Card, Form, Input, Select, Badge, Dialog, Tabs.
Include loading states and error handling.
```

### 2.2 Image Upload and Processing

**Prompt:**

```
Implement image upload system for NFT assets:

1. Create `lib/storage/nft-images.ts`:
   - Upload to Supabase Storage (`nft-images` bucket)
   - Generate unique filenames: `{nft_id}_{timestamp}.{ext}`
   - Support formats: PNG, JPEG, WebP, GIF
   - Max file size: 10MB
   - Generate thumbnail (200x200)
   - Generate preview (800x800)

2. Create `components/nft/image-uploader.tsx`:
   - Drag and drop zone
   - Click to upload
   - Preview before submit
   - Upload progress indicator
   - Error handling (file type, size)

3. Create API routes:
   - `app/api/nfts/upload/route.ts`: Handle file upload
   - `app/api/nfts/[id]/image/route.ts`: Get/update NFT image

4. Image processing (use `sharp`):
   - Resize to standard dimensions
   - Optimize for web
   - Strip EXIF data
   - Generate multiple sizes

5. Storage structure in Supabase:
```

nft-images/
{nft_id}/
original.{ext}
thumbnail.webp
preview.webp

```

6. Update NFT creation flow:
- Image required before moving from draft
- Validate image dimensions
- Show upload status

Dependencies: `sharp`, `uuid`
```

### 2.3 Metadata Management

**Prompt:**

````
Implement NFT metadata system aligned with UnstableLabs traits:

1. Create `components/nft/metadata-form.tsx`:
   - Form with fields:
     - `_capture`: select (blockchain source)
     - `_color`: select (9 wavelengths: Infrared→Gamma)
     - `_I/O`: select (CW/CCW rotation)
     - `tier`: select (1-5)
     - `bit`: select (8-bit, 16-bit, 32-bit, 64-bit)
     - `custom_spec`: key-value pairs (dynamic)
   - Validation rules per field
   - Help tooltips explaining each field

2. Create `lib/nft/metadata.ts`:
   - Validate metadata against schema
   - Generate on-chain metadata format
   - Calculate rarity score based on traits
   - Serialize for Solana Metaplex

3. Constants from project knowledge:
   ```typescript
   const COLORS = ['Infrared', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet', 'Gamma']
   const ERAS = ['8-bit', '16-bit', '32-bit', '64-bit']
   const ROTATIONS = ['CW', 'CCW']
   const TIERS = [1, 2, 3, 4, 5]
````

4. Update database:
   - Store metadata as JSONB in `nfts.metadata`
   - Index common query fields
   - Validate on insert/update

5. Create `app/api/nfts/[id]/metadata/route.ts`:
   - GET: Return parsed metadata
   - PATCH: Validate and update metadata

6. Display metadata in NFT detail page with visual indicators for rarity.

```

---

## Phase 3: Package Management

### 3.1 Package CRUD

**Prompt:**

```

Implement game package management system:

1. Create `app/(dashboard)/packages/page.tsx`:
   - DataTable: name, price (SOL), token amount (\_unSC), NFT count, status, sales
   - Filters: status (active/inactive/archived)
   - Sort by price, sales, created date
   - Create/Edit/Archive buttons

2. Create `app/(dashboard)/packages/[id]/page.tsx`:
   - Package details view
   - Edit form:
     - Name, description
     - Price in SOL
     - \_unSC token amount included
     - NFT selection (pick from minted NFTs)
     - Status toggle
   - Purchase history for this package
   - Revenue statistics

3. Create `app/(dashboard)/packages/create/page.tsx`:
   - Multi-step creation:
     Step 1: Basic info (name, description, price)
     Step 2: Token allocation (how much \_unSC)
     Step 3: NFT selection (which NFTs included)
     Step 4: Review and publish

4. Create API routes:
   - `app/api/packages/route.ts`: GET (list), POST (create)
   - `app/api/packages/[id]/route.ts`: GET, PATCH, DELETE
   - `app/api/packages/[id]/nfts/route.ts`: Manage NFTs in package

5. Package model:

   ```typescript
   interface Package {
     id: string
     name: string
     description: string
     price_sol: number
     unsc_amount: bigint
     nft_ids: string[]
     status: 'active' | 'inactive' | 'archived'
     total_sales: number
     total_revenue_sol: number
     created_at: Date
     updated_at: Date
   }
   ```

6. Validation:
   - Price must be > 0
   - At least one NFT or token amount required
   - NFTs must be in 'minted' status
   - Cannot archive with pending deliveries

```

### 3.2 Inventory Tracking

**Prompt:**

```

Implement inventory management for packages:

1. Create `components/packages/inventory-tracker.tsx`:
   - Display available inventory per package
   - Warning when inventory low (< 10)
   - Auto-restock settings
   - Reservation system for pending purchases

2. Create `lib/packages/inventory.ts`:
   - Check availability before purchase
   - Reserve items during checkout
   - Release reservation on timeout/cancel
   - Track inventory history

3. Update database:
   - Add `inventory_count` to packages table
   - Add `reserved_count` for pending purchases
   - Add `inventory_history` table for tracking

4. Create API routes:
   - `app/api/packages/[id]/inventory/route.ts`: Check/update inventory
   - `app/api/packages/[id]/reserve/route.ts`: Reserve for purchase

5. Dashboard widgets:
   - Low inventory alerts
   - Inventory trend chart
   - Restock recommendations

6. Integration with NFT status:
   - When NFT marked 'delivered', remove from inventory
   - Prevent overselling

```

---

## Phase 4: Delivery System

### 4.1 Delivery Queue

**Prompt:**

```

Implement delivery queue management:

1. Create `app/(dashboard)/deliveries/page.tsx`:
   - DataTable: purchase_id, buyer wallet, package, status, created_at
   - Status filters: pending, processing, delivered, failed
   - Action buttons: process, retry, cancel
   - Bulk process selected

2. Create `app/(dashboard)/deliveries/[id]/page.tsx`:
   - Full delivery details
   - Purchase information
   - Buyer wallet address
   - Items to deliver (NFTs + tokens)
   - Delivery attempt history
   - Manual retry button
   - Transaction links (Solana explorer)

3. Create `lib/delivery/`:
   - `queue.ts`: Add to queue, process queue, retry failed
   - `transfer.ts`: Execute Solana transfers
   - `status.ts`: Update delivery status

4. Create API routes:
   - `app/api/deliveries/route.ts`: GET list
   - `app/api/deliveries/[id]/route.ts`: GET details
   - `app/api/deliveries/[id]/process/route.ts`: Trigger delivery
   - `app/api/deliveries/[id]/retry/route.ts`: Retry failed
   - `app/api/deliveries/bulk/route.ts`: Bulk operations

5. Delivery status flow:

   ```
   pending → processing → delivered
                ↓
              failed → retry → processing
   ```

6. Include retry logic:
   - Max 3 automatic retries
   - Exponential backoff
   - Alert admin on repeated failures

```

### 4.2 NFT Transfer Execution

**Prompt:**

```

Implement Solana NFT transfer execution using @unstablecoins/solana:

1. Create `packages/solana/src/transfer.ts`:
   - `transferNFT(mint, from, to)`: Transfer single NFT
   - `transferBatch(transfers[])`: Batch multiple transfers
   - `buildTransferTransaction()`: Create transaction
   - Handle associated token accounts

2. Create `packages/solana/src/escrow.ts`:
   - Platform escrow wallet management
   - Check escrow balance before transfer
   - Track escrow inventory

3. Update `lib/delivery/transfer.ts`:
   - Import from @unstablecoins/solana
   - Execute transfer with error handling
   - Verify transfer success
   - Update NFT ownership in database

4. Transaction building:

   ```typescript
   async function transferNFT(
     mint: PublicKey,
     fromWallet: Keypair,
     toAddress: PublicKey
   ): Promise<string> {
     // Get or create ATA for recipient
     // Build transfer instruction
     // Sign and send transaction
     // Return transaction signature
   }
   ```

5. Error handling:
   - Insufficient SOL for fees
   - Invalid recipient address
   - NFT not in escrow
   - Network errors
   - Transaction timeout

6. Update delivery record with:
   - Transaction signature
   - Block confirmation
   - Timestamp

```

### 4.3 Delivery Confirmation

**Prompt:**

```

Implement delivery confirmation system:

1. Create `lib/delivery/confirm.ts`:
   - Verify transaction on-chain
   - Update NFT ownership in database
   - Mark delivery as complete
   - Trigger burn operation

2. Create `components/deliveries/confirmation-dialog.tsx`:
   - Show transaction details
   - Link to Solana explorer
   - Confirm/Reject buttons
   - Notes field for issues

3. Create webhook handler:
   - `app/api/webhooks/helius/route.ts`
   - Listen for transfer events
   - Auto-confirm successful transfers
   - Alert on failures

4. Update delivery flow:

   ```
   Transfer executed
        ↓
   Wait for confirmation (3 blocks)
        ↓
   Verify ownership changed
        ↓
   Update database
        ↓
   Trigger burn operation
   ```

5. Create `app/api/deliveries/[id]/confirm/route.ts`:
   - Manual confirmation endpoint
   - Requires admin verification
   - Updates all related records

6. Notifications:
   - Email buyer on delivery complete
   - WebSocket update to frontend
   - Audit log entry

```

---

## Phase 5: Burn Mechanism Integration

### 5.1 Burn Operations

**Prompt:**

```

Implement the deflationary burn mechanism for \_unSC tokens:

1. Create `packages/solana/src/burn.ts`:

   ```typescript
   export async function burnTokens(
     mint: PublicKey, // _unSC token address
     amount: bigint, // Amount to burn
     authority: Keypair // Platform wallet
   ): Promise<string> // Returns tx signature
   ```

2. Create `lib/burn/`:
   - `operations.ts`: Execute burn, verify burn
   - `scheduler.ts`: Queue burns for batch processing
   - `calculator.ts`: Calculate burn amount for package

3. Token addresses (from constants):

   ```typescript
   const UNSC_MINT = new PublicKey('7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT')
   ```

4. Burn flow after delivery:

   ```
   Delivery confirmed
        ↓
   Calculate burn amount (= package.unsc_amount)
        ↓
   Execute burn transaction
        ↓
   Record in burn_events table
        ↓
   Update total_supply tracking
   ```

5. Create API routes:
   - `app/api/burns/route.ts`: List burn events
   - `app/api/burns/execute/route.ts`: Manual burn trigger
   - `app/api/burns/[id]/route.ts`: Burn event details

6. Double confirmation requirement:
   - First admin initiates burn
   - Second admin (or same after delay) confirms
   - Only then execute on-chain

```

### 5.2 Burn Dashboard

**Prompt:**

```

Create comprehensive burn analytics dashboard:

1. Create `app/(dashboard)/burns/page.tsx`:
   - Summary cards:
     - Total burned (all time)
     - Burned this month
     - Burn rate (per day average)
     - Remaining supply
   - Burn events table: date, amount, package, tx signature
   - Filters: date range, amount range

2. Create `app/(dashboard)/burns/stats/page.tsx`:
   - Line chart: Daily burn amounts
   - Pie chart: Burns by package type
   - Progress toward burn goals
   - Projected total burn by date

3. Create `lib/burn/stats.ts`:
   - Calculate burn metrics
   - Generate time series data
   - Project future burns based on sales

4. Create API routes:
   - `app/api/burns/stats/route.ts`: Aggregated statistics
   - `app/api/burns/chart/route.ts`: Chart data

5. Real-time updates:
   - WebSocket subscription for new burns
   - Auto-refresh dashboard
   - Celebration animation on milestone burns

6. Export functionality:
   - Download burn report (CSV/PDF)
   - Generate proof of burns for community

```

---

## Phase 6: Audit Logging

### 6.1 Comprehensive Audit System

**Prompt:**

```

Implement complete audit logging for all admin actions:

1. Create `lib/audit/`:
   - `logger.ts`: Core logging function
   - `types.ts`: Audit event types
   - `middleware.ts`: Auto-log API requests

2. Audit event structure:

   ```typescript
   interface AuditLog {
     id: string
     admin_id: string
     action: string // CREATE_NFT, UPDATE_PACKAGE, EXECUTE_BURN, etc.
     entity_type: string // nft, package, delivery, burn
     entity_id: string
     details: {
       before?: object // Previous state
       after?: object // New state
       metadata?: object // Additional context
     }
     ip_address: string
     user_agent: string
     created_at: Date
   }
   ```

3. Create `app/(dashboard)/audit/page.tsx`:
   - Full audit log viewer
   - Filters: admin, action type, entity type, date range
   - Search by entity ID
   - Export to CSV

4. Create `app/(dashboard)/audit/[id]/page.tsx`:
   - Detailed audit event view
   - Show before/after diff for changes
   - Related events timeline
   - Admin who performed action

5. Create API routes:
   - `app/api/audit/route.ts`: List logs (paginated)
   - `app/api/audit/[id]/route.ts`: Single log details
   - `app/api/audit/export/route.ts`: Generate export

6. Auto-log these actions:
   - All authentication events
   - NFT create/update/delete/status changes
   - Package create/update/archive
   - Delivery processing
   - Burn operations
   - Admin profile changes

```

### 6.2 Security Audit Alerts

**Prompt:**

```

Implement security-focused audit alerts:

1. Create `lib/audit/alerts.ts`:
   - Define alert conditions
   - Send notifications on triggers
   - Track alert history

2. Alert conditions:
   - Failed login attempts (> 3 in 5 minutes)
   - Login from new IP address
   - Bulk operations (> 10 items)
   - Burn operations (all)
   - Admin role changes
   - 2FA disable attempts

3. Create `app/(dashboard)/audit/alerts/page.tsx`:
   - Active alerts list
   - Alert history
   - Configure alert rules
   - Notification preferences

4. Notification channels:
   - Email to admin
   - Dashboard notification
   - Optional: Slack/Discord webhook

5. Create API routes:
   - `app/api/audit/alerts/route.ts`: List/create alerts
   - `app/api/audit/alerts/[id]/route.ts`: Manage alert
   - `app/api/audit/alerts/config/route.ts`: Alert settings

6. Include IP-based security:
   - Track admin IPs
   - Alert on unusual locations
   - Optional: Geo-restrictions

```

---

## Phase 7: Dashboard and Reporting

### 7.1 Main Dashboard

**Prompt:**

```

Create comprehensive admin dashboard homepage:

1. Create `app/(dashboard)/page.tsx`:
   - Overview cards:
     - Total NFTs (by status)
     - Active packages
     - Pending deliveries
     - Total burned \_unSC
     - Revenue (SOL)
   - Quick actions:
     - Create NFT
     - Process deliveries
     - View pending burns
   - Recent activity feed
   - Alert notifications

2. Create dashboard components:
   - `components/dashboard/stats-card.tsx`
   - `components/dashboard/activity-feed.tsx`
   - `components/dashboard/revenue-chart.tsx`
   - `components/dashboard/delivery-status.tsx`

3. Real-time data:
   - WebSocket subscriptions for live updates
   - Auto-refresh every 30 seconds
   - Visual indicators for changes

4. Create API route:
   - `app/api/dashboard/route.ts`: Aggregated dashboard data

5. Charts (use recharts):
   - Line: Daily revenue
   - Bar: NFTs by status
   - Donut: Packages by sales
   - Area: Burn rate over time

6. Responsive layout:
   - Grid system for different screen sizes
   - Collapsible sidebar
   - Mobile-friendly navigation

```

### 7.2 Reports and Analytics

**Prompt:**

```

Implement reporting and analytics system:

1. Create `app/(dashboard)/reports/page.tsx`:
   - Report templates:
     - Sales report (date range)
     - Inventory report
     - Burn report
     - Delivery performance
     - Admin activity
   - Custom report builder

2. Create `app/(dashboard)/reports/[type]/page.tsx`:
   - Dynamic report viewer
   - Filter and date range selection
   - Data visualization
   - Export options (CSV, PDF)

3. Create `lib/reports/`:
   - `generator.ts`: Build report data
   - `templates.ts`: Report configurations
   - `export.ts`: Format and download

4. Create API routes:
   - `app/api/reports/route.ts`: List available reports
   - `app/api/reports/[type]/route.ts`: Generate report
   - `app/api/reports/export/route.ts`: Download report

5. Scheduled reports:
   - Daily sales summary
   - Weekly burn report
   - Monthly analytics
   - Email delivery option

6. Report components:
   - `components/reports/report-table.tsx`
   - `components/reports/report-chart.tsx`
   - `components/reports/export-button.tsx`
   - `components/reports/date-range-picker.tsx`

```

### 7.3 Dashboard Layout and Navigation

**Prompt:**

```

Create polished dashboard layout and navigation:

1. Create `app/(dashboard)/layout.tsx`:
   - Sidebar navigation
   - Header with user menu
   - Breadcrumb navigation
   - Footer with version info

2. Create navigation components:
   - `components/layout/sidebar.tsx`:
     - Logo
     - Nav items: Dashboard, NFTs, Packages, Deliveries, Burns, Audit, Settings
     - Collapse/expand
     - Active state indicators
   - `components/layout/header.tsx`:
     - Search bar
     - Notifications bell
     - Admin profile dropdown
     - Quick actions
   - `components/layout/breadcrumb.tsx`:
     - Dynamic path display
     - Clickable segments

3. Theme and styling:
   - Dark mode default
   - UnstableLabs color scheme:
     - Primary: Purple (#8B5CF6)
     - Accent: Cyan (#06B6D4)
     - Background: Dark (#0F172A)
   - Monospace fonts for data
   - Subtle grid/scan line effects

4. Responsive behavior:
   - Mobile: Bottom nav or hamburger menu
   - Tablet: Collapsible sidebar
   - Desktop: Full sidebar

5. Accessibility:
   - Keyboard navigation
   - Focus indicators
   - ARIA labels
   - Screen reader support

6. Create `components/layout/notification-center.tsx`:
   - Toast notifications
   - Notification history dropdown
   - Mark as read functionality

```

---

## Testing Checklist

After completing all phases, verify:

- [ ] Wallet authentication works with Phantom/Solflare
- [ ] Email + password authentication works
- [ ] 2FA setup and verification works
- [ ] NFT CRUD operations work correctly
- [ ] Image upload and processing works
- [ ] Package creation with NFT selection works
- [ ] Delivery queue processes correctly
- [ ] NFT transfers execute on-chain
- [ ] Burn operations execute and record
- [ ] Audit logs capture all actions
- [ ] Dashboard displays accurate data
- [ ] Reports generate and export correctly
- [ ] All API routes are protected
- [ ] Error handling works throughout

---

## Related Documents

- [Development Guide](PLAT_DEV_nft-platform-development_v1_0.md)
- [Infrastructure Guide](PLAT_INF_nft-platform-infrastructure_v1_0.md)
- [Frontend Initialization Prompt](PLAT_PROMPT_frontend-initialization_v1_0.md)
- [Database Schema](DB_SCHEMA_nft-platform_v1_0.sql)

---

*Admin Backend Initialization Prompt v1.0 — February 3, 2026*
```
