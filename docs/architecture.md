# System architecture

## Runtime (desktop)

```
Electron main
  ├─ spawns NestJS API on 127.0.0.1:3847 (production)
  ├─ loads Next.js UI
  └─ IPC: print, backup folder picker, app version

Next.js renderer ──HTTP JWT──▶ NestJS ──Prisma──▶ MySQL
```

Business rules never live in Electron IPC or the frontend. The UI is a client of the REST API only.

## Backend layering

```
Controller → Service → Prisma repository calls
                ↓
     AccountingEngine / InventoryEngine (domain services)
```

Posted documents run inside `prisma.$transaction` and update stock, party balances, VAT line history, and general ledger together.

## API conventions

- Base path: `/api/v1`
- Envelope: `{ success, data, meta?, message? }`
- Money: strings with 3 decimals (`"12.500"`) for OMR
- Auth: Bearer access JWT + refresh token rotation
- Guards: `JwtAuthGuard` + `PermissionsGuard`

## Shared package

`@jewelry-erp/shared` exports enums, Zod form schemas, and OMR-safe money math (`calcVat`, `calcGoldLine`, `addMoney`, …) used by API and web.

## Offline-first

Local MySQL + local uploads under `data/`. Cloud migration keeps the same NestJS/Next.js code with adapter swaps for storage and mail.
