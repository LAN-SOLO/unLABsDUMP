# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Run all apps (admin:3006, frontend:3007)
pnpm dev:admin        # Run admin only (http://localhost:3006)
pnpm dev:frontend     # Run frontend only (http://localhost:3007)

# Build & Quality
pnpm build            # Build all apps and packages
pnpm lint             # Lint all workspaces
pnpm typecheck        # Type-check all workspaces

# Testing
pnpm test             # Run unit tests (Vitest)
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests (Playwright)

# Database
pnpm db:generate      # Generate Drizzle types from schema
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio

# Maintenance
pnpm clean            # Clean all build artifacts and node_modules
pnpm install          # Install all workspace dependencies
```

## Architecture

**Monorepo** using pnpm workspaces + Turborepo.

### Apps

| App      | Port | Path            | Description                |
| -------- | ---- | --------------- | -------------------------- |
| Admin    | 3006 | `apps/admin`    | Admin backend dashboard    |
| Frontend | 3007 | `apps/frontend` | Player-facing NFT platform |

Both apps use: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Supabase

### Shared Packages

| Package                     | Path                  | Description                               |
| --------------------------- | --------------------- | ----------------------------------------- |
| `@unstablecoins/types`      | `packages/types`      | Shared TypeScript types and Zod schemas   |
| `@unstablecoins/db`         | `packages/db`         | Supabase client and Drizzle ORM           |
| `@unstablecoins/solana`     | `packages/solana`     | Solana/Web3 utilities and wallet adapters |
| `@unstablecoins/ui`         | `packages/ui`         | Shared UI components and utilities        |
| `@unstablecoins/api-client` | `packages/api-client` | Type-safe API client                      |

### Adding Dependencies

```bash
# Add to specific app
pnpm add <package> --filter admin
pnpm add <package> --filter frontend

# Add to specific shared package
pnpm add <package> --filter @unstablecoins/db

# Add to root (dev dependencies)
pnpm add -Dw <package>
```

### Building Packages

Shared packages must be built before apps can use them:

```bash
pnpm build --filter=@unstablecoins/types
pnpm build --filter=@unstablecoins/db
pnpm build --filter=@unstablecoins/solana
pnpm build --filter=@unstablecoins/ui
```

## Supabase Auth Implementation Rules

**DO:**

1. Copy official Supabase examples exactly - do not modify the patterns
2. Use `getClaims()` not `getUser()` in the middleware/proxy for session refresh
3. Auth callback only needs `code` param via `exchangeCodeForSession(code)`
4. Logout must be a server action (not a client component with useEffect)

**DO NOT:**

1. Modify Supabase email templates - the default flow works
2. Add `token_hash` or `type` handling to auth callback
3. Use `getUser()` in middleware/proxy (use `getClaims()`)
4. Make logout a client component
5. Add complexity when simple code works
6. Blame cookies for HTTP 431 errors

## Error Troubleshooting

**First response to ANY error:**

1. Do not modify any code immediately
2. Use Supabase MCP tool to look up current documentation
3. Query the docs before implementing unfamiliar auth patterns

**Common Errors:**

- **HTTP 431 (Request Header Fields Too Large)**: Not a cookie issue - check for header bloat elsewhere
- **Turbopack panic**: Check for malformed imports or circular dependencies
- **Auth callback loops**: Verify only using `code` param, not adding extra token handling
- **Logout spinning**: Ensure logout is a server action, not client-side useEffect

## Environment Variables

**Root `.env.local`** (shared by all apps):

```
NEXT_PUBLIC_SUPABASE_URL=https://byxerucpcdjziwznsreu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.byxerucpcdjziwznsreu.supabase.co:5432/postgres
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOL_ADDRESS=So11111111111111111111111111111111111111112
NEXT_PUBLIC_UNSC_ADDRESS=7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT
PLATFORM_WALLET_PRIVATE_KEY=your_base58_private_key
PLATFORM_WALLET_ADDRESS=your_wallet_public_key
```

**Admin-specific** (`apps/admin/.env.local`):

```
NEXT_PUBLIC_APP_URL=http://localhost:3006
JWT_SECRET=your_32_char_random_string
CORS_ALLOWED_ORIGIN=http://localhost:3007
BURN_CONFIRMATION_REQUIRED=true
```

**Frontend-specific** (`apps/frontend/.env.local`):

```
NEXT_PUBLIC_APP_URL=http://localhost:3007
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3006/api
CORS_ALLOWED_ORIGINS=http://localhost:3006,http://localhost:3007
```

Use Supabase MCP to extract credentials from the project.

## Code Quality

**Formatting**: Prettier (`.prettierrc`) - no semicolons, single quotes, 100 char width
**Linting**: ESLint (`.eslintrc.js`) - TypeScript strict, Next.js rules
**Pre-commit**: Husky + lint-staged runs `eslint --fix` and `prettier --write` on staged files

## Testing

**Unit tests** (Vitest): `pnpm test`

- Config: `vitest.config.ts`
- Setup: `vitest.setup.ts`
- Location: `**/*.{test,spec}.{ts,tsx}`

**E2E tests** (Playwright): `pnpm test:e2e`

- Config: `playwright.config.ts`
- Location: `e2e/`
- Browsers: Chromium, Firefox, WebKit

## Database (Drizzle)

Schema defined in `packages/db/src/schema/index.ts`

Tables: `users`, `nft_packages`, `transactions`, `nfts`

```bash
pnpm db:generate   # Generate migration from schema changes
pnpm db:migrate    # Apply migrations to database
pnpm db:studio     # Open Drizzle Studio GUI
```

Requires `DATABASE_URL` in `.env.local` (Supabase connection string).

## Key Conventions

- shadcn/ui components in each app: `components/ui/`
- Shared utilities via `@unstablecoins/ui` package
- Path alias `@/*` maps to app root in each app
- Use sonner for toasts (not deprecated toast component)
