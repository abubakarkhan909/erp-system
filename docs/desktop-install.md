# Give the ERP to a client (Windows)

## What you deliver

Copy **one file** to the client (USB / Google Drive):

`apps/desktop/release/Al Mas Jewelry ERP-1.0.0-Setup.exe`

**No MySQL / XAMPP / Node.js** on the client PC. The database is local SQLite.

## Build the installer (on your PC)

1. Stop `pnpm dev:api` / `pnpm dev:web` if packaging fails on locked files
2. From the project root:

```powershell
cd E:\working\personal\ERP
pnpm package:win
```

Installer path:

`E:\working\personal\ERP\apps\desktop\release\Al Mas Jewelry ERP-1.0.0-Setup.exe`

## On the client PC (first time)

| Step | Action |
|------|--------|
| 1 | Run **Al Mas Jewelry ERP-1.0.0-Setup.exe** |
| 2 | Open **Al Mas Jewelry ERP** from Desktop |
| 3 | Login: **admin** / **admin@1234** (or **zahid** / **zahid@1234**) |

First launch automatically creates the local SQLite database, runs migrations, and seeds the owner user.

Database file:

`%APPDATA%\Al Mas Jewelry ERP\data\jewelry.db`

### If you already installed an older MySQL-based Setup.exe

Uninstall the old app → install this **new** Setup.exe. The app upgrades `.env` from MySQL to SQLite automatically. If setup still fails, delete `%APPDATA%\Al Mas Jewelry ERP\.db-ready` and open the app again.

## Backup

Use **Backup** in the app → **Create Backup** → **Download** the `.db` file to a USB drive. Use **Restore** if you need to bring data back (then restart the app).

## After first login

Change the owner password in **Users**, and create staff logins/roles there.
