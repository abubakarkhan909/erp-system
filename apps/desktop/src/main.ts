import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { ChildProcess, spawn, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as crypto from 'crypto';

const API_PORT = 3847;
const WEB_PORT = 3000;
const WEB_URL = `http://127.0.0.1:${WEB_PORT}`;
const PRODUCT = 'Al Mas Jewelry ERP';

let mainWindow: BrowserWindow | null = null;
let apiProcess: ChildProcess | null = null;
let webProcess: ChildProcess | null = null;

function isDev(): boolean {
  return !app.isPackaged;
}

/** Prefer Electron-as-Node so client PCs do not need a separate Node.js install. */
function nodeCommand(): { bin: string; env: NodeJS.ProcessEnv } {
  if (isDev()) {
    return { bin: 'node', env: process.env };
  }
  return {
    bin: process.execPath,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  };
}

function waitHttp(url: string, timeoutMs = 180000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for ${url}`));
          return;
        }
        setTimeout(tick, 700);
      });
    };
    tick();
  });
}

function ensureUserEnv(): string {
  const userData = app.getPath('userData');
  fs.mkdirSync(userData, { recursive: true });
  fs.mkdirSync(path.join(userData, 'uploads'), { recursive: true });
  fs.mkdirSync(path.join(userData, 'backups'), { recursive: true });

  const envFile = path.join(userData, '.env');
  if (!fs.existsSync(envFile)) {
    const secret = () => crypto.randomBytes(24).toString('hex');
    const contents = [
      'DATABASE_URL="mysql://root@127.0.0.1:3306/esp_shop"',
      `JWT_SECRET="${secret()}"`,
      `JWT_REFRESH_SECRET="${secret()}"`,
      'JWT_EXPIRES_IN="8h"',
      'JWT_REFRESH_EXPIRES_IN="7d"',
      'API_PORT=3847',
      'API_HOST=127.0.0.1',
      'SEED_OWNER_USERNAME=owner',
      'SEED_OWNER_PASSWORD=Owner@12345',
      '',
    ].join('\n');
    fs.writeFileSync(envFile, contents, 'utf8');
  }
  return envFile;
}

function loadEnvFile(envFile: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(envFile)) return out;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function runPrisma(args: string[], apiDir: string, env: NodeJS.ProcessEnv): { ok: boolean; output: string } {
  const prismaCandidates = [
    path.join(apiDir, 'node_modules', 'prisma', 'build', 'index.js'),
    path.join(apiDir, 'node_modules', 'prisma', 'build', 'index.js'),
  ];
  // Also support pnpm-style nesting if present
  const prismaCli =
    prismaCandidates.find((p) => fs.existsSync(p)) ||
    (() => {
      try {
        const nest = path.join(apiDir, 'node_modules');
        if (!fs.existsSync(nest)) return null;
        const walk = (dir: string, depth: number): string | null => {
          if (depth > 4) return null;
          const direct = path.join(dir, 'prisma', 'build', 'index.js');
          if (fs.existsSync(direct)) return direct;
          for (const name of fs.readdirSync(dir)) {
            if (!name.startsWith('.') && name !== '.bin') {
              const full = path.join(dir, name);
              try {
                if (fs.statSync(full).isDirectory()) {
                  const found = walk(full, depth + 1);
                  if (found) return found;
                }
              } catch {
                /* ignore */
              }
            }
          }
          return null;
        };
        return walk(nest, 0);
      } catch {
        return null;
      }
    })();

  if (!prismaCli) {
    return {
      ok: false,
      output: `Prisma CLI missing under ${path.join(apiDir, 'node_modules')}. Reinstall with a newer Setup.exe.`,
    };
  }
  const { bin, env: nodeEnv } = nodeCommand();
  const result = spawnSync(bin, [prismaCli, ...args], {
    cwd: apiDir,
    env: { ...nodeEnv, ...env },
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
  return { ok: result.status === 0, output };
}

/** First launch: migrate schema + seed owner user (once). */
function ensureDatabaseReady(apiDir: string, envFile: string): { ok: boolean; message: string } {
  const userData = app.getPath('userData');
  const flag = path.join(userData, '.db-ready');
  if (fs.existsSync(flag)) {
    return { ok: true, message: 'Database already prepared' };
  }

  const fileEnv = loadEnvFile(envFile);
  const env = {
    ...process.env,
    ...fileEnv,
    DOTENV_CONFIG_PATH: envFile,
  };

  const migrate = runPrisma(['migrate', 'deploy', '--schema=prisma/schema.prisma'], apiDir, env);
  if (!migrate.ok) {
    return {
      ok: false,
      message:
        'Database setup failed (migrate).\n\n' +
        '1) Install MySQL / XAMPP and start MySQL\n' +
        '2) Create empty database: esp_shop\n' +
        '3) Confirm password in %APPDATA%\\Al Mas Jewelry ERP\\.env\n\n' +
        migrate.output.slice(-800),
    };
  }

  // Seed via compiled or ts-node is heavy; run prisma db seed if package.json has it,
  // otherwise run seed.js if present.
  const seedJs = path.join(apiDir, 'prisma', 'seed.cjs');
  let seedOk = true;
  let seedOut = '';

  if (fs.existsSync(seedJs)) {
    const { bin, env: nodeEnv } = nodeCommand();
    const result = spawnSync(bin, [seedJs], {
      cwd: apiDir,
      env: { ...nodeEnv, ...env },
      encoding: 'utf8',
      windowsHide: true,
    });
    seedOk = result.status === 0;
    seedOut = `${result.stdout || ''}\n${result.stderr || ''}`;
  } else {
    const seed = runPrisma(['db', 'seed', '--schema=prisma/schema.prisma'], apiDir, env);
    if (!seed.ok && !/No seed|not found|No "seed"/i.test(seed.output)) {
      seedOk = false;
      seedOut = seed.output;
    } else {
      seedOut = 'Seed script not bundled; owner user may be missing.';
      seedOk = false;
    }
  }

  if (!seedOk) {
    // Partial seed (e.g. duplicate gold rates) should not block the app — owner is usually already created.
    const recoverable = /P2002|Unique constraint|already exists|Owner login:/i.test(seedOut);
    fs.writeFileSync(flag, new Date().toISOString(), 'utf8');
    if (recoverable) {
      return {
        ok: true,
        message:
          'Database ready (seed had a recoverable warning).\nTry login: owner / Owner@12345',
      };
    }
    return {
      ok: true,
      message:
        'Database migrated. Seed reported an error; try login owner / Owner@12345.\n\n' +
        seedOut.slice(-500),
    };
  }

  fs.writeFileSync(flag, new Date().toISOString(), 'utf8');
  return { ok: true, message: 'Database ready' };
}

function spawnServices(envFile: string): void {
  if (isDev()) return;

  const apiDir = path.join(process.resourcesPath, 'api');
  const webDir = path.join(process.resourcesPath, 'web');
  const apiEntryCandidates = [
    path.join(apiDir, 'main.js'),
    path.join(apiDir, 'src', 'main.js'),
  ];
  const apiEntry = apiEntryCandidates.find((p) => fs.existsSync(p));
  const nextCli = path.join(webDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  const fileEnv = loadEnvFile(envFile);
  const { bin, env: nodeEnv } = nodeCommand();

  const baseEnv = {
    ...nodeEnv,
    ...fileEnv,
    NODE_ENV: 'production',
    DOTENV_CONFIG_PATH: envFile,
    UPLOAD_DIR: path.join(app.getPath('userData'), 'uploads'),
    BACKUP_DIR: path.join(app.getPath('userData'), 'backups'),
    API_HOST: '127.0.0.1',
    API_PORT: String(API_PORT),
    NEXT_PUBLIC_API_URL: `http://127.0.0.1:${API_PORT}/api/v1`,
  };

  if (apiEntry) {
    apiProcess = spawn(bin, [apiEntry], {
      cwd: apiDir,
      env: baseEnv,
      stdio: 'ignore',
      windowsHide: true,
    });
    apiProcess.on('exit', (code) => {
      console.error('API exited', code);
    });
  } else {
    console.error('API entry not found in', apiDir);
  }

  if (fs.existsSync(nextCli)) {
    webProcess = spawn(bin, [nextCli, 'start', '-H', '127.0.0.1', '-p', String(WEB_PORT)], {
      cwd: webDir,
      env: baseEnv,
      stdio: 'ignore',
      windowsHide: true,
    });
    webProcess.on('exit', (code) => {
      console.error('Web exited', code);
    });
  }
}

function stopServices(): void {
  for (const p of [webProcess, apiProcess]) {
    if (p && !p.killed) {
      try {
        p.kill();
      } catch {
        /* ignore */
      }
    }
  }
  webProcess = null;
  apiProcess = null;
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    title: PRODUCT,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  const url = isDev()
    ? process.env.ELECTRON_START_URL || 'http://127.0.0.1:3000'
    : WEB_URL;

  if (!isDev()) {
    try {
      await waitHttp(WEB_URL);
    } catch (e) {
      console.error(e);
      dialog.showErrorBox(
        PRODUCT,
        'Could not start the app.\n\nChecklist:\n' +
          '1) MySQL is running (XAMPP)\n' +
          '2) Database esp_shop exists\n' +
          '3) Config: %APPDATA%\\Al Mas Jewelry ERP\\.env\n\n' +
          'See CLIENT-INSTALL.txt next to the installed app resources.',
      );
    }
  }

  await mainWindow.loadURL(url);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpc(): void {
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('select-backup-dir', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory'],
    });
    return result.canceled ? null : result.filePaths[0];
  });
  ipcMain.handle('print-pdf', async (_e, payload: { filePath?: string; data?: number[] }) => {
    let pdfPath = payload.filePath;
    if (!pdfPath && payload.data) {
      pdfPath = path.join(app.getPath('temp'), `print-${Date.now()}.pdf`);
      fs.writeFileSync(pdfPath, Uint8Array.from(payload.data));
    }
    if (!pdfPath) throw new Error('No PDF');
    await shell.openPath(pdfPath);
    return { ok: true };
  });
}

app.whenReady().then(async () => {
  registerIpc();

  if (!isDev()) {
    const envFile = ensureUserEnv();
    const apiDir = path.join(process.resourcesPath, 'api');
    const db = ensureDatabaseReady(apiDir, envFile);
    if (!db.ok) {
      dialog.showErrorBox(`${PRODUCT} — first setup`, db.message);
    }
    spawnServices(envFile);
  }

  await createWindow();
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('before-quit', () => stopServices());
