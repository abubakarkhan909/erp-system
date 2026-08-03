# Al Zahid Jewelry ERP

Enterprise desktop ERP for a gold/jewelry shop in **Oman** (currency **OMR**, VAT **5%**).

## Stack

| Layer | Tech |
|-------|------|
| Desktop | Electron |
| Frontend | Next.js (App Router), TypeScript, Tailwind, Zustand, TanStack Query |
| Backend | NestJS, Prisma, JWT + RBAC |
| Database | SQLite (local file) |

## Monorepo layout

```
apps/api       NestJS REST API (:3847)
apps/web       Next.js UI (:3000)
apps/desktop   Electron shell
packages/shared  Shared enums, Zod schemas, OMR money helpers
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- No MySQL — database is a local SQLite file

## Quick start

### 1. Install & migrate

```bash
pnpm install
pnpm --filter @jewelry-erp/shared build
pnpm db:generate
cd apps/api && pnpm exec prisma migrate deploy && pnpm prisma:seed
```

SQLite file: `apps/api/data/jewelry.db` (`DATABASE_URL=file:../data/jewelry.db` in `apps/api/.env`).

### 2. Run (three terminals)

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:desktop   # optional
```

Default login (seed): **admin** / **admin@1234** (also **zahid** / **zahid@1234**)

### LAN access (another PC on the same Wi‑Fi/network)

1. On the server PC run `pnpm dev:api` and `pnpm dev:web` (web listens on `0.0.0.0:3000`).
2. Open `http://<server-lan-ip>:3000` on the other device (e.g. `http://192.168.88.173:3000`).
3. Login calls the API at `http://<same-ip>:3847` automatically.
4. If it still fails, allow **TCP 3000** and **TCP 3847** in Windows Firewall on the server PC.

## Environment

Copy `apps/api/.env.example` → `apps/api/.env`  
Copy `apps/web/.env.local.example` → `apps/web/.env.local`

## Documentation

- [**Client User Guide** (non-technical)](docs/CLIENT-USER-GUIDE.md) — features, flows, and how to use every screen
- [Architecture](docs/architecture.md)
- [Accounting](docs/accounting.md)
- [Oman VAT](docs/vat-oman.md)
- [Cloud migration](docs/cloud-migration.md)
- [Installer & deployment](docs/deployment.md)

## Phases

1. Auth, masters, dashboard  
2. Sales, purchases, inventory, cash/bank, expenses  
3. Accounting, VAT, reports, installments, advances  
4. Backup, audit, notifications, settings  
5. Tests, docs, optimization  

## License

Proprietary — all rights reserved.
