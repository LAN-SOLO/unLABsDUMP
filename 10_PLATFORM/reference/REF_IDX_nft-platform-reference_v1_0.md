# UnstableLabs NFT Platform — Reference Index v1.0

> **Purpose:** Quick reference index for all NFT platform documentation  
> **Status:** NOT_FOR_IMPORT — Reference document  
> **Version:** 1.0  
> **Last Updated:** February 3, 2026

---

## Quick Navigation

### Document Index

| Document                                       | Type           | Purpose                                          |
| :--------------------------------------------- | :------------- | :----------------------------------------------- |
| `PLAT_DEV_nft-platform-development_v1_0.md`    | NOT_FOR_IMPORT | Local development setup, monorepo initialization |
| `PLAT_INF_nft-platform-infrastructure_v1_0.md` | NOT_FOR_IMPORT | Production infrastructure, deployment, CI/CD     |
| `PLAT_PROMPT_admin-initialization_v1_0.md`     | NOT_FOR_IMPORT | Claude Code prompts for admin backend            |
| `PLAT_PROMPT_frontend-initialization_v1_0.md`  | NOT_FOR_IMPORT | Claude Code prompts for player frontend          |
| `DB_SCHEMA_nft-platform_v1_0.sql`              | **FOR_IMPORT** | Database schema migration                        |
| `REF_IDX_nft-platform-reference_v1_0.md`       | NOT_FOR_IMPORT | This index document                              |

---

## File Type Legend

| Prefix         | Type                 | Database Import               |
| :------------- | :------------------- | :---------------------------- |
| `DB_SCHEMA_`   | Database Schema      | **YES** — Execute in Supabase |
| `PLAT_DEV_`    | Development Guide    | NO — Reference only           |
| `PLAT_INF_`    | Infrastructure Guide | NO — Reference only           |
| `PLAT_PROMPT_` | Claude Code Prompts  | NO — One-time instructions    |
| `REF_IDX_`     | Reference Index      | NO — Navigation document      |

---

## Platform Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        unstablecoins-nft/                           │
├─────────────────────────────────────────────────────────────────────┤
│  apps/                                                              │
│  ├── admin/         → nftback.unstablecoins.io (Internal)          │
│  └── frontend/      → nft.unstablecoins.io (Public)                │
├─────────────────────────────────────────────────────────────────────┤
│  packages/                                                          │
│  ├── db/            → Shared database layer (Drizzle + Supabase)   │
│  ├── types/         → Shared TypeScript types                      │
│  ├── solana/        → Blockchain utilities                         │
│  └── ui/            → Shared UI components                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Tech Stack Summary

| Layer      | Technology                                         |
| :--------- | :------------------------------------------------- |
| Frontend   | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Components | shadcn/ui                                          |
| Database   | Supabase (PostgreSQL)                              |
| Auth       | Supabase Auth + Solana Wallet Adapter              |
| Blockchain | Solana (via Helius RPC)                            |
| Hosting    | Vercel                                             |
| CI/CD      | GitHub Actions                                     |

---

## Token Addresses

| Token  | Address                                        | Network        |
| :----- | :--------------------------------------------- | :------------- |
| SOL    | `So11111111111111111111111111111111111111112`  | Solana Mainnet |
| \_unSC | `7Z7RcZQLGUvDZvBschTaTBr3NKA5tSKsRZArdTn7dkzT` | Solana Mainnet |

---

## Deflationary Mechanism

```
Player purchases Package (SOL)
          ↓
Package delivered to player wallet
          ↓
Equivalent _unSC tokens BURNED on Solana
          ↓
Total _unSC supply decreases
```

---

## Database Tables

| Table                   | Purpose                   | RLS                     |
| :---------------------- | :------------------------ | :---------------------- |
| `admins`                | Backend admin accounts    | Service role only       |
| `players`               | Player wallet accounts    | Public read, self write |
| `nfts`                  | NFT catalog and ownership | Public read             |
| `nft_ownership_history` | Ownership transfer log    | Public read             |
| `packages`              | Game packages for sale    | Public read active      |
| `purchases`             | Purchase transactions     | Own records only        |
| `deliveries`            | Delivery queue            | Service role only       |
| `burn_events`           | Token burn log            | Public read             |
| `trades`                | P2P marketplace           | Public read active      |
| `notifications`         | Player notifications      | Own records only        |
| `audit_logs`            | Admin action log          | Service role only       |
| `admin_sessions`        | Active admin sessions     | Service role only       |

---

## API Endpoints Summary

### Admin Backend (`nftback.unstablecoins.io`)

| Endpoint                     | Method             | Purpose                       |
| :--------------------------- | :----------------- | :---------------------------- |
| `/api/auth/login`            | POST               | Email + password login        |
| `/api/auth/verify-wallet`    | POST               | Wallet signature verification |
| `/api/auth/verify-2fa`       | POST               | 2FA verification              |
| `/api/nfts`                  | GET, POST          | List/create NFTs              |
| `/api/nfts/:id`              | GET, PATCH, DELETE | NFT operations                |
| `/api/nfts/:id/mint`         | POST               | Mint NFT on-chain             |
| `/api/packages`              | GET, POST          | List/create packages          |
| `/api/purchases`             | GET                | List purchases                |
| `/api/purchases/:id/deliver` | POST               | Trigger delivery              |
| `/api/burns`                 | GET                | Burn history                  |
| `/api/audit`                 | GET                | Audit logs                    |

### Player Frontend (`nft.unstablecoins.io`)

| Endpoint                     | Method    | Purpose                    |
| :--------------------------- | :-------- | :------------------------- |
| `/api/auth/challenge`        | GET       | Get wallet sign challenge  |
| `/api/auth/verify`           | POST      | Verify wallet signature    |
| `/api/nfts`                  | GET       | Browse NFTs                |
| `/api/nfts/search`           | GET       | Advanced search            |
| `/api/packages`              | GET       | Available packages         |
| `/api/packages/:id/purchase` | POST      | Initiate purchase          |
| `/api/inventory/:wallet`     | GET       | Player's NFTs              |
| `/api/trades`                | GET, POST | List/browse marketplace    |
| `/api/trades/:id/buy`        | POST      | Purchase listed NFT        |
| `/api/game/nfts/:wallet`     | GET       | Game API: Player NFTs      |
| `/api/game/verify-ownership` | POST      | Game API: Verify ownership |

---

## Implementation Phases

### Admin Backend

| Phase | Focus                                 | Status |
| :---- | :------------------------------------ | :----- |
| 1     | Authentication (Wallet + Email + 2FA) | 🔲     |
| 2     | NFT CRUD and Image Upload             | 🔲     |
| 3     | Package Management                    | 🔲     |
| 4     | Delivery System                       | 🔲     |
| 5     | Burn Mechanism                        | 🔲     |
| 6     | Audit Logging                         | 🔲     |
| 7     | Dashboard and Reporting               | 🔲     |

### Player Frontend

| Phase | Focus                      | Status |
| :---- | :------------------------- | :----- |
| 1     | Wallet Connection          | 🔲     |
| 2     | NFT Browser and Search     | 🔲     |
| 3     | Package Store and Purchase | 🔲     |
| 4     | Player Inventory           | 🔲     |
| 5     | Trading System             | 🔲     |
| 6     | WebSocket Updates          | 🔲     |
| 7     | Game API Integration       | 🔲     |

---

## Related Documents (Existing Project Knowledge)

| Document                             | Relation                       |
| :----------------------------------- | :----------------------------- |
| `ECO_IMPL_token-economy_v0_3.md`     | Token economics implementation |
| `ECO_DESIGN_modular-economy_v0_2.md` | Economy design document        |
| `GD_NFT_integration_v1_1.md`         | NFT integration game design    |
| `GD_NFT_item-composition.md`         | NFT item and trait composition |
| `DEV_GUIDE_solana-development.md`    | Solana development guide       |
| `INF_ARCH_full-stack.md`             | Full-stack architecture        |
| `REF_FAQ_nft-economy_v0_1.md`        | NFT economy FAQ                |

---

## Storage Paths

All NFT Platform documents should be stored in:

```
/mnt/project/10_PLATFORM/
├── development/
│   └── PLAT_DEV_nft-platform-development_v1_0.md
├── infrastructure/
│   └── PLAT_INF_nft-platform-infrastructure_v1_0.md
├── prompts/
│   ├── PLAT_PROMPT_admin-initialization_v1_0.md
│   └── PLAT_PROMPT_frontend-initialization_v1_0.md
├── schemas/
│   └── DB_SCHEMA_nft-platform_v1_0.sql
└── reference/
    └── REF_IDX_nft-platform-reference_v1_0.md
```

---

## Version History

| Version | Date        | Changes                        |
| :------ | :---------- | :----------------------------- |
| 1.0     | Feb 3, 2026 | Initial platform documentation |

---

## Cross-Reference Updates Required

When integrating these documents, update:

1. `REF_INDEX_master-database.md` — Add NFT Platform section
2. `REF_MAP_cross-references.md` — Add platform document links
3. `README.md` — Add platform folder to navigation

---

_Reference Index v1.0 — February 3, 2026_
