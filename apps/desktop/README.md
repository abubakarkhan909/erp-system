# Al Zahid Jewelry ERP — Desktop

Electron shell for the Jewelry ERP web UI and local NestJS API.

## Prerequisites

- Node.js 20+
- pnpm 9+
- SQLite via Prisma (created automatically — no MySQL)

## Local development

Run each service in its own terminal from the repository root:

```bash
# 1. API (NestJS on http://127.0.0.1:3847) — uses apps/api/data/jewelry.db
pnpm dev:api

# 2. Web (Next.js on http://127.0.0.1:3000)
pnpm dev:web

# 3. Desktop (waits for the web dev server, then opens Electron)
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

```bash
pnpm package:win
```

Installer: `apps/desktop/release/Al Zahid Jewelry ERP-*-Setup.exe`  
Client PCs need **only** that Setup.exe (SQLite is created on first launch).
