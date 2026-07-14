# Give the ERP to a client (Windows)

## What you deliver

Copy **one file** to the client (USB / Google Drive):

`apps/desktop/release/Al Mas Jewelry ERP-1.0.0-Setup.exe`

(~400 MB after the packaging fix that includes Prisma/Next dependencies)

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
| 1 | Install **XAMPP** and start **MySQL** |
| 2 | In phpMyAdmin create database **`esp_shop`** (empty) |
| 3 | Run **Al Mas Jewelry ERP-1.0.0-Setup.exe** |
| 4 | Open **Al Mas Jewelry ERP** from Desktop |
| 5 | Login: **owner** / **Owner@12345** |

First launch automatically creates config, runs migrations, and seeds the owner user.

**Node.js is not required** on the client PC. **MySQL/XAMPP is required.**

### If you already installed an older Setup.exe

The old installer was missing Prisma (`Prisma CLI missing…`).  
Uninstall the old app → install this **new** Setup.exe → if setup still fails, delete `%APPDATA%\Al Mas Jewelry ERP\.db-ready` and open the app again.

## If MySQL root has a password

Edit `%APPDATA%\Al Mas Jewelry ERP\.env`:

```env
DATABASE_URL="mysql://root:YOURPASSWORD@127.0.0.1:3306/esp_shop"
```

Delete `%APPDATA%\Al Mas Jewelry ERP\.db-ready` and open the app again.

## After first login

Change the owner password in **Users**, and create staff logins/roles there.
