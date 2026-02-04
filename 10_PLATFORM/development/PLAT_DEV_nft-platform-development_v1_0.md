# UnstableLabs NFT Platform — Development Guide v1.0

> **Purpose:** Local environment setup, monorepo initialization, and development workflow  
> **Status:** NOT_FOR_IMPORT — Reference documentation  
> **Version:** 1.0  
> **Last Updated:** February 3, 2026

---

## Quick Reference

| Component     | Details                  |
| :------------ | :----------------------- |
| Monorepo Tool | pnpm + Turborepo         |
| Framework     | Next.js 14+ (App Router) |
| Language      | TypeScript 5.x           |
| Styling       | Tailwind CSS 3.4+        |
| Components    | shadcn/ui                |
| Database      | Supabase (PostgreSQL)    |
| Blockchain    | Solana (Helius RPC)      |
| Testing       | Vitest + Playwright      |

---

## 1. Prerequisites

### 1.1 System Requirements

| Requirement | Minimum                | Recommended |
| :---------- | :--------------------- | :---------- |
| Node.js     | v20.x LTS              | v22.x LTS   |
| pnpm        | v8.x                   | v9.x        |
| macOS/Linux | macOS 13+ / Ubuntu 22+ | macOS 14+   |
| RAM         | 8GB                    | 16GB        |
| Disk        | 10GB free              | 20GB free   |

### 1.2 Required Software

```bash
# Install pnpm (if not installed)
npm install -g pnpm

# Install Turborepo CLI
pnpm install -g turbo

# Verify installations
node --version      # v20.x+
pnpm --version      # v8.x+
turbo --version     # v2.x+
```

### 1.3 Solana CLI (Optional for local testing)

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verify
solana --version
```

---

## 2. Monorepo Initialization

### 2.1 Create Project Structure

```bash
# Create root directory
mkdir unstablecoins-nft && cd unstablecoins-nft

# Initialize pnpm workspace
pnpm init

# Create workspace configuration
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Create Turborepo configuration
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
EOF

# Initialize git
git init
```

### 2.2 Directory Structure

```bash
# Create all directories
mkdir -p apps/admin apps/frontend
mkdir -p packages/{db,types,ui,solana,api-client}
mkdir -p .github/workflows
mkdir -p scripts

# Create root package.json
cat > package.json << 'EOF'
{
  "name": "unstablecoins-nft",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "turbo dev",
    "dev:admin": "turbo dev --filter=admin",
    "dev:frontend": "turbo dev --filter=frontend",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "db:generate": "turbo db:generate --filter=@unstablecoins/db",
    "db:migrate": "turbo db:migrate --filter=@unstablecoins/db",
    "db:studio": "pnpm --filter @unstablecoins/db studio",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
EOF
```

### 2.3 Initialize Apps

```bash
# Initialize Admin Backend
cd apps/admin
pnpm create next-app@latest . --typescript --tailwind --eslint --app --turbopack --yes
pnpm dlx shadcn@latest init --yes
pnpm dlx shadcn@latest add button card input label dropdown-menu sheet dialog avatar table badge tabs alert separator skeleton toast form

# Initialize Player Frontend
cd ../frontend
pnpm create next-app@latest . --typescript --tailwind --eslint --app --turbopack --yes
pnpm dlx shadcn@latest init --yes
pnpm dlx shadcn@latest add button card input dropdown-menu sheet dialog avatar badge tabs alert separator skeleton toast

cd ../..
```

### 2.4 Initialize Shared Packages

#### Database Package (`packages/db`)

```bash
cd packages/db
pnpm init

cat > package.json << 'EOF'
{
  "name": "@unstablecoins/db",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "typecheck": "tsc --noEmit",
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate",
    "studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "drizzle-orm": "^0.32.0",
    "postgres": "^3.4.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.23.0",
    "tsup": "^8.2.0",
    "typescript": "^5.4.0"
  }
}
EOF

mkdir -p src/{schema,migrations}
cd ../..
```

#### Types Package (`packages/types`)

```bash
cd packages/types
pnpm init

cat > package.json << 'EOF'
{
  "name": "@unstablecoins/types",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "tsup": "^8.2.0",
    "typescript": "^5.4.0"
  }
}
EOF

mkdir -p src
cd ../..
```

#### Solana Package (`packages/solana`)

```bash
cd packages/solana
pnpm init

cat > package.json << 'EOF'
{
  "name": "@unstablecoins/solana",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@solana/web3.js": "^1.95.0",
    "@solana/spl-token": "^0.4.0",
    "@solana/wallet-adapter-base": "^0.9.0",
    "@solana/wallet-adapter-react": "^0.15.0",
    "@solana/wallet-adapter-react-ui": "^0.9.0",
    "@solana/wallet-adapter-wallets": "^0.19.0",
    "@metaplex-foundation/mpl-token-metadata": "^3.2.0",
    "@metaplex-foundation/umi": "^0.9.0",
    "@metaplex-foundation/umi-bundle-defaults": "^0.9.0",
    "bs58": "^6.0.0"
  },
  "devDependencies": {
    "tsup": "^8.2.0",
    "typescript": "^5.4.0"
  }
}
EOF

mkdir -p src
cd ../..
```

#### UI Package (`packages/ui`)

```bash
cd packages/ui
pnpm init

cat > package.json << 'EOF'
{
  "name": "@unstablecoins/ui",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tsup": "^8.2.0",
    "typescript": "^5.4.0"
  }
}
EOF

mkdir -p src/components
cd ../..
```

---

## 3. Database Setup

### 3.1 Supabase Project

1. **Create Project** at [supabase.com](https://supabase.com)
2. **Copy credentials** from Project Settings → API:
   - Project URL
   - anon/public key
   - service_role key (for admin backend only)

### 3.2 Apply Database Schema

The complete schema is defined in `DB_SCHEMA_nft-platform_v1_0.sql`.

```bash
# Option 1: Via Supabase CLI
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# Option 2: Via SQL Editor in Supabase Dashboard
# Paste contents of DB_SCHEMA_nft-platform_v1_0.sql
```

### 3.3 Generate TypeScript Types

```bash
# Generate types from Supabase schema
pnpm supabase gen types typescript --project-id YOUR_PROJECT_REF > packages/db/src/schema/database.types.ts
```

---

## 4. Environment Variables

### 4.1 Root `.env.local` Template

```bash
# Create root .env.local (shared by all apps)
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta

# Token Addresses
NEXT_PUBLIC_SOL_ADDRESS=So11111111111111111111111111111111111111112
NEXT_PUBLIC_UNSC_ADDRESS=7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT

# Platform Wallet (for admin backend)
PLATFORM_WALLET_PRIVATE_KEY=your_base58_private_key
PLATFORM_WALLET_ADDRESS=your_wallet_public_key
EOF
```

### 4.2 Admin Backend `.env.local`

```bash
cat > apps/admin/.env.local << 'EOF'
# Inherit from root
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin-specific
ADMIN_2FA_ISSUER=UnstableLabs Admin
JWT_SECRET=your_32_char_random_string
CORS_ALLOWED_ORIGIN=http://localhost:3000

# Burn Operations (require double confirmation)
BURN_CONFIRMATION_REQUIRED=true
EOF
```

### 4.3 Frontend `.env.local`

```bash
cat > apps/frontend/.env.local << 'EOF'
# Inherit from root
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Frontend-specific
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3000/api
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
```

---

## 5. Running Locally

### 5.1 Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Build shared packages first
pnpm build --filter=@unstablecoins/types
pnpm build --filter=@unstablecoins/db
pnpm build --filter=@unstablecoins/solana
pnpm build --filter=@unstablecoins/ui
```

### 5.2 Start Development Servers

```bash
# Run all apps
pnpm dev

# Or run individually
pnpm dev:admin     # http://localhost:3000
pnpm dev:frontend  # http://localhost:3001
```

### 5.3 Port Configuration

| App             | Port  | URL                      |
| :-------------- | :---- | :----------------------- |
| Admin Backend   | 3000  | `http://localhost:3000`  |
| Player Frontend | 3001  | `http://localhost:3001`  |
| Supabase Studio | 54323 | `http://localhost:54323` |

Configure ports in each app's `next.config.ts`:

```typescript
// apps/admin/next.config.ts
const config = {
  // ... other config
  serverRuntimeConfig: { port: 3000 },
}

// apps/frontend/next.config.ts
const config = {
  // ... other config
  serverRuntimeConfig: { port: 3001 },
}
```

---

## 6. Testing Strategy

### 6.1 Test Framework Setup

```bash
# Install test dependencies in root
pnpm add -Dw vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom happy-dom playwright @playwright/test msw
```

### 6.2 Unit Tests (Vitest)

```typescript
// packages/solana/src/__tests__/burn.test.ts
import { describe, it, expect, vi } from 'vitest'
import { calculateBurnAmount } from '../burn'

describe('calculateBurnAmount', () => {
  it('should calculate correct burn amount for package', () => {
    const result = calculateBurnAmount(1000, 'TIER_1')
    expect(result).toBe(500000n)
  })
})
```

### 6.3 Integration Tests (Playwright)

```typescript
// apps/admin/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('admin can login with wallet', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('Connect Wallet')).toBeVisible()
  // ... wallet connection mock
})
```

### 6.4 API Tests (MSW)

```typescript
// apps/frontend/src/__tests__/api.test.ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const handlers = [
  http.get('/api/packages', () => {
    return HttpResponse.json([{ id: '1', name: 'Starter Pack', price_sol: 0.1 }])
  }),
]

const server = setupServer(...handlers)
```

### 6.5 Test Commands

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 7. Code Quality

### 7.1 ESLint Configuration

```javascript
// .eslintrc.js (root)
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
  },
}
```

### 7.2 Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 7.3 Pre-commit Hooks

```bash
# Install husky and lint-staged
pnpm add -Dw husky lint-staged

# Initialize husky
pnpm husky init

# Configure lint-staged
cat > .lintstagedrc.json << 'EOF'
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
EOF

# Add pre-commit hook
echo "pnpm lint-staged" > .husky/pre-commit
```

---

## 8. Common Development Tasks

### 8.1 Adding a New API Route

```bash
# Admin: apps/admin/app/api/[endpoint]/route.ts
# Frontend: apps/frontend/app/api/[endpoint]/route.ts
```

### 8.2 Adding a New Database Table

1. Update `DB_SCHEMA_nft-platform_v1_0.sql`
2. Run migration: `pnpm db:migrate`
3. Regenerate types: `pnpm db:generate`

### 8.3 Adding a New Shared Type

1. Add to `packages/types/src/`
2. Export from `packages/types/src/index.ts`
3. Rebuild: `pnpm build --filter=@unstablecoins/types`

### 8.4 Adding a New UI Component

1. Add to `packages/ui/src/components/`
2. Export from `packages/ui/src/index.ts`
3. Rebuild: `pnpm build --filter=@unstablecoins/ui`

---

## 9. Troubleshooting

### 9.1 Common Issues

| Issue                           | Solution                                    |
| :------------------------------ | :------------------------------------------ |
| Type errors after schema change | Run `pnpm db:generate`                      |
| Package not found               | Run `pnpm install` then `pnpm build`        |
| Port already in use             | Kill process: `lsof -ti:3000 \| xargs kill` |
| Supabase connection failed      | Check `.env.local` credentials              |
| Wallet not connecting           | Clear browser cache, check RPC URL          |

### 9.2 Cleaning Project

```bash
# Full clean
pnpm clean

# Reinstall
pnpm install

# Rebuild packages
pnpm build
```

---

## Related Documents

- [Infrastructure Guide](PLAT_INF_nft-platform-infrastructure_v1_0.md)
- [Admin Initialization Prompt](PLAT_PROMPT_admin-initialization_v1_0.md)
- [Frontend Initialization Prompt](PLAT_PROMPT_frontend-initialization_v1_0.md)
- [Database Schema](DB_SCHEMA_nft-platform_v1_0.sql)

---

_Development Guide v1.0 — February 3, 2026_
