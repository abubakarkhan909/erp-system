# Deployment & installer

## Development

1. Start MySQL (`docker compose up -d`)
2. `pnpm install && pnpm --filter @jewelry-erp/shared build`
3. `pnpm db:generate && cd apps/api && pnpm exec prisma migrate deploy && pnpm prisma:seed`
4. `pnpm dev:api` and `pnpm dev:web`
5. Optional: `pnpm dev:desktop`

## Production desktop (outline)

1. Build API: `pnpm --filter @jewelry-erp/api build`
2. Build web: `pnpm --filter @jewelry-erp/web build` (static export or standalone)
3. Build desktop: `pnpm --filter @jewelry-erp/desktop build` (electron-builder)
4. Bundle MySQL/MariaDB or require installer prerequisite
5. First-run wizard: create DB, run migrations, seed owner password

## Performance notes

- Indexes on document numbers, barcodes, party phones, journal source, installment due dates, gold rates
- List endpoints paginated (max 100)
- Dashboard uses aggregates, not full table scans of line items where possible

## Testing

```bash
pnpm --filter @jewelry-erp/shared test
pnpm --filter @jewelry-erp/api test
```

Money/VAT unit tests live in `packages/shared` and `apps/api/src/**/*.spec.ts`.
