# Cloud migration checklist

Goal: deploy the same NestJS + Next.js apps online with minimal domain-code changes.

## Steps

1. **Database** — Export local SQLite (or use a SQL dump tool), restore to managed Postgres/MySQL (RDS/Cloud SQL/DigitalOcean). Point Prisma `provider` + `DATABASE_URL` at the cloud database.
2. **API** — Deploy `apps/api` to a Node host / container. Set JWT secrets, `UPLOAD_DIR` or object storage.
3. **Storage adapter** — Replace local disk `AttachmentsService` paths with S3-compatible `StorageService` implementation (interface already isolated under attachments/backups).
4. **Web** — Deploy `apps/web` to Vercel/Node. Set `NEXT_PUBLIC_API_URL` to public API HTTPS URL.
5. **Auth cookies** — Prefer httpOnly refresh cookies behind HTTPS; keep JWT access token pattern.
6. **Electron** — Optional thin client pointing at cloud API, or keep hybrid offline mode later via sync.
7. **Backups** — Rely on managed DB backups; keep `POST /backups` as user-triggered export.
8. **Multi-tenant (future)** — Add `tenantId` / `companyId` filters to all queries; schema already has a single `Company` row as the foothold.

## Do not change

- Prisma schema domain models (except additive columns)
- Posting / VAT / inventory transaction logic
- Permission codes
