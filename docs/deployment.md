# Deployment

## Local desktop (recommended)

1. Install dependencies: `pnpm install`
2. Build shared + migrate SQLite: see [README](../README.md)
3. Package Windows installer: `pnpm package:win`
4. Deliver `Al Zahid Jewelry ERP-*-Setup.exe` only — no MySQL prerequisite

Data stays on the client PC:

- DB: `%APPDATA%\Al Zahid Jewelry ERP\data\jewelry.db`
- Uploads / backups under the same AppData folder

## Developer machine

- SQLite file: `apps/api/data/jewelry.db` (`DATABASE_URL=file:../data/jewelry.db`)
- No Docker / MySQL required

## Cloud (future)

See [cloud-migration.md](./cloud-migration.md). Swap `DATABASE_URL` to a managed Postgres/MySQL and keep the NestJS/Next.js API surface.
