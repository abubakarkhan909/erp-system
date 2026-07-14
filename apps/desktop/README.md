# Al Mas Jewelry ERP — Desktop

Electron shell for the Jewelry ERP web UI and local NestJS API.

## Prerequisites

- Node.js 20+
- pnpm 9+
- MySQL running locally with the database configured in `apps/api/.env`

## Local development

Run each service in its own terminal from the repository root:

```bash
# 1. Start MySQL (example — adjust for your install)
# Windows service, Docker, or local mysqld

# 2. API (NestJS on http://127.0.0.1:3847)
pnpm dev:api

# 3. Web (Next.js on http://127.0.0.1:3000)
pnpm dev:web

# 4. Desktop (waits for the web dev server, then opens Electron)
pnpm dev:desktop
```

The desktop app loads `ELECTRON_START_URL` when set (defaults to `http://127.0.0.1:3000` in dev). The Nest API is **not** spawned in dev — start `pnpm dev:api` separately on port **3847**.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Compile TypeScript, watch for changes, wait for the web dev server, launch Electron |
| `pnpm start` | Run Electron against compiled `dist/` (production-style, no dev server) |
| `pnpm build` | Compile TypeScript and package the app with electron-builder |
| `pnpm compile` | TypeScript only → `dist/` |

## Environment variables

| Variable | Purpose |
| --- | --- |
| `ELECTRON_START_URL` | Web URL for the BrowserWindow (dev). Default: `http://127.0.0.1:3000` |
| `JEWELRY_API_PATH` | Path to compiled Nest entry (`main.js`) when spawning the API in packaged mode |
| `API_HOST` / `API_PORT` | Passed to the spawned API process (default port `3847`) |

## Preload API (`window.jewelryDesktop`)

The renderer can call:

- `getAppVersion()` — desktop app version
- `selectBackupDir()` — native folder picker for backup location
- `printPdf({ filePath })` or `printPdf({ data })` — open a PDF for printing

## Production build

Build the web static export and API first, then package the desktop app:

```bash
pnpm --filter @jewelry-erp/web build
pnpm --filter @jewelry-erp/api build
pnpm --filter @jewelry-erp/desktop build
```

Installers are written to `apps/desktop/release/`.
