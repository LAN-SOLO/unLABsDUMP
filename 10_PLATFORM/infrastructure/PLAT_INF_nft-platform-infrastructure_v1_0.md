# UnstableLabs NFT Platform — Infrastructure Guide v1.0

> **Purpose:** Production infrastructure setup, deployment configuration, and CI/CD pipeline  
> **Status:** NOT_FOR_IMPORT — Reference documentation  
> **Version:** 1.0  
> **Last Updated:** February 3, 2026

---

## Quick Reference

| Service        | Provider         | Tier        | Purpose                             |
| :------------- | :--------------- | :---------- | :---------------------------------- |
| Database       | Supabase         | Free → Pro  | PostgreSQL, Auth, Storage, Realtime |
| Hosting        | Vercel           | Free → Pro  | Next.js deployment, Edge Functions  |
| Solana RPC     | Helius           | Free → Paid | Reliable blockchain access          |
| Monitoring     | Vercel Analytics | Included    | Performance tracking                |
| Error Tracking | Sentry           | Free        | Error monitoring                    |
| DNS            | Cloudflare       | Free        | DNS, DDoS protection                |

---

## 1. Supabase Project Configuration

### 1.1 Create Project

1. Navigate to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Configure:
   - **Organization:** Select or create
   - **Name:** `unstablecoins-nft`
   - **Database Password:** Generate strong password (save securely)
   - **Region:** Choose closest to majority users (e.g., `us-east-1`)
   - **Pricing Plan:** Free (upgrade to Pro when needed)

### 1.2 Database Configuration

#### Apply Schema Migration

```sql
-- Run in Supabase SQL Editor
-- Contents from DB_SCHEMA_nft-platform_v1_0.sql
```

#### Configure Pooler Settings

1. Go to **Project Settings → Database**
2. Enable **Connection Pooling**
3. Note the **Pooler Connection String** (for production)
4. Set **Pool Mode:** Transaction (recommended for serverless)

### 1.3 Storage Buckets

```sql
-- Create storage buckets for NFT assets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('nft-images', 'nft-images', true),
  ('nft-metadata', 'nft-metadata', true),
  ('admin-uploads', 'admin-uploads', false);

-- RLS policies for storage
CREATE POLICY "Public read for nft-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'nft-images');

CREATE POLICY "Admin write for nft-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nft-images'
  AND auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Admin delete for nft-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'nft-images'
  AND auth.jwt() ->> 'role' = 'admin'
);
```

### 1.4 Edge Functions (Optional)

For scheduled tasks like burn confirmations:

```bash
# Initialize Supabase CLI
supabase init

# Create function
supabase functions new process-burns

# Deploy
supabase functions deploy process-burns
```

### 1.5 Realtime Configuration

Enable realtime for trading notifications:

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE nfts;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
ALTER PUBLICATION supabase_realtime ADD TABLE purchases;
```

---

## 2. Vercel Deployment Setup

### 2.1 Project Structure

Create two Vercel projects from the same repository:

| Project                  | Directory       | Domain                     |
| :----------------------- | :-------------- | :------------------------- |
| `unstablecoins-admin`    | `apps/admin`    | `nftback.unstablecoins.io` |
| `unstablecoins-frontend` | `apps/frontend` | `nft.unstablecoins.io`     |

### 2.2 Admin Backend Deployment

```bash
# Link Vercel project
cd apps/admin
vercel link

# Configure vercel.json
cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "cd ../.. && pnpm build --filter=admin",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://nft.unstablecoins.io" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PATCH,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type,Authorization" }
      ]
    }
  ],
  "rewrites": [],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
EOF
```

### 2.3 Frontend Deployment

```bash
# Link Vercel project
cd apps/frontend
vercel link

# Configure vercel.json
cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "cd ../.. && pnpm build --filter=frontend",
  "outputDirectory": ".next",
  "regions": ["iad1", "sfo1", "fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
EOF
```

### 2.4 Environment Variables (Production)

Configure in Vercel Dashboard → Project Settings → Environment Variables:

#### Admin Backend Variables

| Variable                        | Value                                          | Environment            |
| :------------------------------ | :--------------------------------------------- | :--------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxx.supabase.co`                      | All                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`                                       | All                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJ...`                                       | Production, Preview    |
| `NEXT_PUBLIC_SOLANA_RPC_URL`    | `https://mainnet.helius-rpc.com/?api-key=xxx`  | All                    |
| `NEXT_PUBLIC_SOLANA_NETWORK`    | `mainnet-beta`                                 | Production             |
| `NEXT_PUBLIC_UNSC_ADDRESS`      | `7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT` | All                    |
| `PLATFORM_WALLET_PRIVATE_KEY`   | `base58...`                                    | Production (encrypted) |
| `PLATFORM_WALLET_ADDRESS`       | `xxx...`                                       | All                    |
| `JWT_SECRET`                    | `random_32_char_string`                        | Production, Preview    |
| `ADMIN_2FA_ISSUER`              | `UnstableLabs`                                 | All                    |
| `BURN_CONFIRMATION_REQUIRED`    | `true`                                         | Production             |

#### Frontend Variables

| Variable                        | Value                                          | Environment |
| :------------------------------ | :--------------------------------------------- | :---------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxx.supabase.co`                      | All         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`                                       | All         |
| `NEXT_PUBLIC_SOLANA_RPC_URL`    | `https://mainnet.helius-rpc.com/?api-key=xxx`  | All         |
| `NEXT_PUBLIC_SOLANA_NETWORK`    | `mainnet-beta`                                 | Production  |
| `NEXT_PUBLIC_UNSC_ADDRESS`      | `7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT` | All         |
| `NEXT_PUBLIC_ADMIN_API_URL`     | `https://nftback.unstablecoins.io/api`         | Production  |

---

## 3. Domain Configuration

### 3.1 DNS Setup (Cloudflare)

Add these DNS records for `unstablecoins.io`:

| Type  | Name      | Content                | Proxy   |
| :---- | :-------- | :--------------------- | :------ |
| CNAME | `nft`     | `cname.vercel-dns.com` | Proxied |
| CNAME | `nftback` | `cname.vercel-dns.com` | Proxied |

### 3.2 Vercel Domain Configuration

```bash
# Add domains to Vercel projects
# Admin Backend
vercel domains add nftback.unstablecoins.io --project unstablecoins-admin

# Frontend
vercel domains add nft.unstablecoins.io --project unstablecoins-frontend
```

### 3.3 SSL Certificates

Vercel automatically provisions SSL certificates via Let's Encrypt.

Verify in Vercel Dashboard → Project → Domains → SSL Status: ✓

### 3.4 Cloudflare Settings

| Setting                  | Value         | Reason                |
| :----------------------- | :------------ | :-------------------- |
| SSL/TLS Mode             | Full (strict) | End-to-end encryption |
| Always Use HTTPS         | On            | Force HTTPS           |
| Minimum TLS              | 1.2           | Security              |
| Automatic HTTPS Rewrites | On            | Mixed content fix     |
| Bot Fight Mode           | On            | Bot protection        |
| Security Level           | Medium        | Balance UX/security   |

---

## 4. Helius RPC Setup

### 4.1 Create Account

1. Go to [helius.dev](https://helius.dev)
2. Sign up / Sign in
3. Create new API key

### 4.2 Configure RPC Endpoints

| Network | Endpoint                                           |
| :------ | :------------------------------------------------- |
| Mainnet | `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` |
| Devnet  | `https://devnet.helius-rpc.com/?api-key=YOUR_KEY`  |

### 4.3 Rate Limits

| Tier    | RPS | Monthly Requests |
| :------ | :-- | :--------------- |
| Free    | 10  | 1,000,000        |
| Starter | 50  | 10,000,000       |
| Growth  | 100 | 50,000,000       |

### 4.4 WebSocket (Optional)

For real-time blockchain events:

```typescript
// packages/solana/src/websocket.ts
const HELIUS_WSS = 'wss://mainnet.helius-rpc.com/?api-key=YOUR_KEY'

export function subscribeToWallet(address: string, callback: (update: any) => void) {
  const ws = new WebSocket(HELIUS_WSS)

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'accountSubscribe',
        params: [address, { encoding: 'jsonParsed' }],
      })
    )
  }

  ws.onmessage = (event) => {
    callback(JSON.parse(event.data))
  }

  return ws
}
```

---

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PNPM_VERSION: 9
  NODE_VERSION: 20

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build --filter=@unstablecoins/*

      - name: Lint
        run: pnpm lint

      - name: Type Check
        run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build --filter=@unstablecoins/*

      - name: Run Tests
        run: pnpm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm playwright install --with-deps

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Run E2E Tests
        run: pnpm test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### 5.2 Preview Deployments

Vercel automatically creates preview deployments for PRs:

```yaml
# .github/workflows/preview-comment.yml
name: Preview URL Comment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - name: Wait for Vercel
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        id: vercel
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300

      - name: Comment Preview URLs
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Preview Deployments Ready 🚀\n\n- **Admin:** ${{ steps.vercel.outputs.url }}\n- **Frontend:** (check Vercel dashboard)`
            })
```

### 5.3 Production Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_ADMIN_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./apps/admin

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_FRONTEND_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./apps/frontend
```

---

## 6. Monitoring & Alerts

### 6.1 Vercel Analytics

Enable in Vercel Dashboard → Project → Analytics:

- **Web Analytics:** Page views, visitors, performance
- **Speed Insights:** Core Web Vitals tracking

### 6.2 Sentry Error Tracking

```bash
# Install Sentry
pnpm add -w @sentry/nextjs
```

```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### 6.3 Supabase Monitoring

Built-in dashboard at:

- **Database Health:** Supabase Dashboard → Reports
- **API Logs:** Supabase Dashboard → Logs → API
- **Realtime:** Supabase Dashboard → Logs → Realtime

### 6.4 Custom Health Checks

```typescript
// apps/admin/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const checks = {
    database: false,
    solana: false,
    timestamp: new Date().toISOString(),
  }

  // Database check
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('nfts').select('count').limit(1)
    checks.database = !error
  } catch {}

  // Solana RPC check
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth',
      }),
    })
    const data = await response.json()
    checks.solana = data.result === 'ok'
  } catch {}

  const allHealthy = Object.values(checks).every((v) => v === true || typeof v === 'string')

  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503,
  })
}
```

### 6.5 Alert Configuration

Set up alerts via:

1. **Vercel:** Dashboard → Project → Settings → Notifications
2. **Supabase:** Dashboard → Project → Settings → Notifications
3. **Sentry:** sentry.io → Alerts → Create Alert Rule

Recommended alerts:

- Error rate > 1%
- Response time > 2s (p95)
- Database connections > 80%
- Burn operation failures

---

## 7. Security Hardening

### 7.1 Secrets Management

```bash
# Use Vercel encrypted env vars for sensitive data
vercel env add PLATFORM_WALLET_PRIVATE_KEY production --sensitive
```

### 7.2 Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    })
  }
}
```

### 7.3 CSP Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://*.helius-rpc.com wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]
```

---

## 8. Cost Estimation

### 8.1 Starting (Free Tier)

| Service    | Cost         |
| :--------- | :----------- |
| Supabase   | $0           |
| Vercel     | $0           |
| Helius     | $0           |
| Cloudflare | $0           |
| **Total**  | **$0/month** |

### 8.2 Scale to 1,000 Users

| Service        | Cost           |
| :------------- | :------------- |
| Supabase Pro   | $25            |
| Vercel Pro     | $20            |
| Helius Starter | $49            |
| **Total**      | **~$94/month** |

### 8.3 Scale to 10,000 Users

| Service       | Cost            |
| :------------ | :-------------- |
| Supabase Pro  | $75             |
| Vercel Pro    | $100            |
| Helius Growth | $199            |
| **Total**     | **~$374/month** |

---

## Related Documents

- [Development Guide](PLAT_DEV_nft-platform-development_v1_0.md)
- [Admin Initialization Prompt](PLAT_PROMPT_admin-initialization_v1_0.md)
- [Frontend Initialization Prompt](PLAT_PROMPT_frontend-initialization_v1_0.md)
- [Database Schema](DB_SCHEMA_nft-platform_v1_0.sql)

---

_Infrastructure Guide v1.0 — February 3, 2026_
