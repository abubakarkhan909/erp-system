import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { ChildProcess, spawn, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as net from 'net';
import * as crypto from 'crypto';

const DEFAULT_API_PORT = 3847;
const DEFAULT_WEB_PORT = 3000;
let apiPort = DEFAULT_API_PORT;
let webPort = DEFAULT_WEB_PORT;

function getWebUrl(): string {
  return `http://127.0.0.1:${webPort}`;
}

function getApiHealthUrl(): string {
  return `http://127.0.0.1:${apiPort}/api/v1/health`;
}
const PRODUCT = 'Al Zahid Jewelry ERP';
/** Bump when default users / seed logic changes so clients re-seed. */
const SEED_VERSION = '2';

let mainWindow: BrowserWindow | null = null;
let apiProcess: ChildProcess | null = null;
let webProcess: ChildProcess | null = null;

function isDev(): boolean {
  return !app.isPackaged;
}

function logsDir(): string {
  const dir = path.join(app.getPath('userData'), 'logs');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function appendLog(file: string, text: string): void {
  try {
    fs.appendFileSync(path.join(logsDir(), file), text, 'utf8');
  } catch {
    /* ignore */
  }
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

function waitHttp(
  url: string,
  timeoutMs = 180000,
  opts?: { child?: ChildProcess | null; label?: string },
): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve();
    };

    const onChildExit = (code: number | null) => {
      finish(
        new Error(
          `${opts?.label || 'Service'} process exited early (code=${code}). ` +
            `This is usually a startup crash — see the log file.`,
        ),
      );
    };
    opts?.child?.once('exit', onChildExit);

    const tick = () => {
      if (settled) return;
      const req = http.get(url, (res) => {
        res.resume();
        // 2xx–4xx means the server process is accepting connections
        if (res.statusCode && res.statusCode < 500) {
          opts?.child?.off('exit', onChildExit);
          finish();
          return;
        }
        if (Date.now() - start > timeoutMs) {
          opts?.child?.off('exit', onChildExit);
          finish(new Error(`Bad status ${res.statusCode} for ${url}`));
          return;
        }
        setTimeout(tick, 700);
      });
      req.on('error', () => {
        if (settled) return;
        if (Date.now() - start > timeoutMs) {
          opts?.child?.off('exit', onChildExit);
          finish(new Error(`Timeout waiting for ${url}`));
          return;
        }
        setTimeout(tick, 700);
      });
    };
    tick();
  });
}

function portFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function getAvailablePort(startPort: number, maxTries = 40): Promise<number> {
  let port = startPort;
  for (let i = 0; i < maxTries; i++) {
    if (await portFree(port)) return port;
    port++;
  }
  throw new Error(`No free TCP port found near ${startPort}`);
}

/** Prefer an entry whose sibling app.module.js exists (avoids broken root copies). */
function resolveApiEntry(apiDir: string): string | null {
  const candidates = [
    path.join(apiDir, 'src', 'main.js'),
    path.join(apiDir, 'main.js'),
  ];
  for (const entry of candidates) {
    if (!fs.existsSync(entry)) continue;
    const sibling = path.join(path.dirname(entry), 'app.module.js');
    if (fs.existsSync(sibling)) return entry;
  }
  // Thin wrapper at root that only re-exports ./src/main.js is still usable
  const rootMain = path.join(apiDir, 'main.js');
  if (fs.existsSync(rootMain) && fs.existsSync(path.join(apiDir, 'src', 'main.js'))) {
    return rootMain;
  }
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function readLogTail(file: string, maxChars = 1200): string {
  try {
    const full = path.join(logsDir(), file);
    if (!fs.existsSync(full)) return `(no ${file} yet)`;
    const text = fs.readFileSync(full, 'utf8');
    return text.slice(-maxChars).trim() || `(${file} empty)`;
  } catch {
    return `(could not read ${file})`;
  }
}

function sqliteDatabaseUrl(userData: string): string {
  const dbPath = path.join(userData, 'data', 'jewelry.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  return `file:${dbPath.replace(/\\/g, '/')}`;
}

function ensureUserEnv(): string {
  const userData = app.getPath('userData');
  fs.mkdirSync(userData, { recursive: true });
  fs.mkdirSync(path.join(userData, 'uploads'), { recursive: true });
  fs.mkdirSync(path.join(userData, 'backups'), { recursive: true });
  logsDir();

  const envFile = path.join(userData, '.env');
  const databaseUrl = sqliteDatabaseUrl(userData);

  if (!fs.existsSync(envFile)) {
    const secret = () => crypto.randomBytes(24).toString('hex');
    const contents = [
      `DATABASE_URL="${databaseUrl}"`,
      `JWT_SECRET="${secret()}"`,
      `JWT_REFRESH_SECRET="${secret()}"`,
      'JWT_EXPIRES_IN="8h"',
      'JWT_REFRESH_EXPIRES_IN="7d"',
      `API_PORT=${DEFAULT_API_PORT}`,
      'API_HOST=127.0.0.1',
      'SEED_OWNER_USERNAME=admin',
      'SEED_OWNER_PASSWORD=admin@1234',
      '',
    ].join('\n');
    fs.writeFileSync(envFile, contents, 'utf8');
  } else {
    let contents = fs.readFileSync(envFile, 'utf8');
    if (/DATABASE_URL\s*=\s*.*mysql/i.test(contents)) {
      contents = contents.replace(
        /DATABASE_URL\s*=\s*.*/i,
        `DATABASE_URL="${databaseUrl}"`,
      );
      fs.writeFileSync(envFile, contents, 'utf8');
      const flag = path.join(userData, '.db-ready');
      if (fs.existsSync(flag)) fs.unlinkSync(flag);
      const seedFlag = path.join(userData, `.seed-v${SEED_VERSION}`);
      if (fs.existsSync(seedFlag)) fs.unlinkSync(seedFlag);
    } else if (!/DATABASE_URL\s*=/i.test(contents)) {
      contents = `DATABASE_URL="${databaseUrl}"\n` + contents;
      fs.writeFileSync(envFile, contents, 'utf8');
    }
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
  ];
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
  appendLog('prisma.log', `\n[${new Date().toISOString()}] prisma ${args.join(' ')}\n${output}\n`);
  return { ok: result.status === 0, output };
}

function runSeed(apiDir: string, env: NodeJS.ProcessEnv): { ok: boolean; output: string } {
  const seedJs = path.join(apiDir, 'prisma', 'seed.cjs');
  if (!fs.existsSync(seedJs)) {
    return { ok: false, output: `Seed script missing: ${seedJs}` };
  }
  const { bin, env: nodeEnv } = nodeCommand();
  const result = spawnSync(bin, [seedJs], {
    cwd: apiDir,
    env: { ...nodeEnv, ...env },
    encoding: 'utf8',
    windowsHide: true,
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
  appendLog('seed.log', `\n[${new Date().toISOString()}]\n${output}\n`);
  return { ok: result.status === 0, output };
}

/** First launch + seed-version upgrades: migrate + seed admin/zahid. */
function ensureDatabaseReady(apiDir: string, envFile: string): { ok: boolean; message: string } {
  const userData = app.getPath('userData');
  const dbReady = path.join(userData, '.db-ready');
  const seedFlag = path.join(userData, `.seed-v${SEED_VERSION}`);

  const fileEnv = loadEnvFile(envFile);
  const env = {
    ...process.env,
    ...fileEnv,
    DOTENV_CONFIG_PATH: envFile,
  };

  const needsMigrate = !fs.existsSync(dbReady);
  const needsSeed = !fs.existsSync(seedFlag);

  if (!needsMigrate && !needsSeed) {
    return { ok: true, message: 'Database already prepared' };
  }

  if (needsMigrate) {
    const migrate = runPrisma(['migrate', 'deploy', '--schema=prisma/schema.prisma'], apiDir, env);
    if (!migrate.ok) {
      return {
        ok: false,
        message:
          'Database setup failed (migrate).\n\n' +
          'Delete this folder and reopen the app:\n' +
          `%APPDATA%\\${PRODUCT}\n\n` +
          migrate.output.slice(-800),
      };
    }
    fs.writeFileSync(dbReady, new Date().toISOString(), 'utf8');
  }

  if (needsSeed) {
    const seed = runSeed(apiDir, env);
    const recoverable =
      seed.ok ||
      /P2002|Unique constraint|already exists|Admin login:|Owner login:/i.test(seed.output);

    if (!recoverable) {
      return {
        ok: false,
        message:
          'Database seed failed (admin users not created).\n\n' +
          `See logs in %APPDATA%\\${PRODUCT}\\logs\\seed.log\n\n` +
          seed.output.slice(-800),
      };
    }

    fs.writeFileSync(seedFlag, new Date().toISOString(), 'utf8');
    if (!seed.ok) {
      return {
        ok: true,
        message:
          'Database ready (seed warning).\nLogin: admin / admin@1234\n\n' +
          seed.output.slice(-400),
      };
    }
  }

  return { ok: true, message: 'Database ready' };
}

function spawnLogged(
  bin: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
  logFile: string,
): ChildProcess {
  const child = spawn(bin, args, {
    cwd,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const stamp = () => `[${new Date().toISOString()}] `;
  child.stdout?.on('data', (buf: Buffer) => appendLog(logFile, stamp() + buf.toString()));
  child.stderr?.on('data', (buf: Buffer) => appendLog(logFile, stamp() + buf.toString()));
  child.on('exit', (code) => {
    appendLog(logFile, `${stamp()}process exited code=${code}\n`);
  });
  return child;
}

/**
 * Update a key=value line in the .env file.
 * If the key does not exist, it is appended.
 */
function updateEnvFileKey(envFile: string, key: string, value: string): void {
  try {
    let contents = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : '';
    const re = new RegExp(`^${key}\\s*=.*`, 'm');
    if (re.test(contents)) {
      contents = contents.replace(re, `${key}=${value}`);
    } else {
      contents = contents.trimEnd() + `\n${key}=${value}\n`;
    }
    fs.writeFileSync(envFile, contents, 'utf8');
  } catch {
    /* ignore — env var override in baseEnv will still take effect */
  }
}

async function spawnServices(envFile: string): Promise<{ ok: boolean; message: string }> {
  if (isDev()) return { ok: true, message: 'dev' };

  try {
    // If 3847 (or 3000) is busy, automatically use the next free port.
    apiPort = await getAvailablePort(DEFAULT_API_PORT);
    webPort = await getAvailablePort(DEFAULT_WEB_PORT);
    if (webPort === apiPort) {
      webPort = await getAvailablePort(Math.max(apiPort, DEFAULT_WEB_PORT) + 1);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `Could not reserve ports.\n\n${msg}` };
  }

  // CRITICAL: Update .env file with actual chosen port so NestJS ConfigModule
  // reads the correct port (ConfigModule reads .env file and may override process.env).
  updateEnvFileKey(envFile, 'API_PORT', String(apiPort));
  updateEnvFileKey(envFile, 'API_HOST', '127.0.0.1');

  const apiDir = path.join(process.resourcesPath, 'api');
  const webDir = path.join(process.resourcesPath, 'web');
  const apiEntry = resolveApiEntry(apiDir);
  const nextCli = path.join(webDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  // Re-read env file after updating port
  const fileEnv = loadEnvFile(envFile);
  const { bin, env: nodeEnv } = nodeCommand();
  const userData = app.getPath('userData');

  // baseEnv: process env overrides take priority over file env;
  // API_PORT and API_HOST are set last so they always win regardless of .env content.
  const baseEnv: NodeJS.ProcessEnv = {
    ...nodeEnv,
    ...fileEnv,
    NODE_ENV: 'production',
    DOTENV_CONFIG_PATH: envFile,
    DATABASE_URL: fileEnv.DATABASE_URL || sqliteDatabaseUrl(userData),
    UPLOAD_DIR: path.join(userData, 'uploads'),
    BACKUP_DIR: path.join(userData, 'backups'),
    // These must come LAST so they override anything from .env
    API_HOST: '127.0.0.1',
    API_PORT: String(apiPort),
    PORT: String(webPort),
    NEXT_PUBLIC_API_URL: `http://127.0.0.1:${apiPort}/api/v1`,
  };

  if (!apiEntry) {
    return { ok: false, message: `API entry not found in ${apiDir}` };
  }
  if (!fs.existsSync(nextCli)) {
    return { ok: false, message: `Next.js CLI not found in ${webDir}` };
  }

  appendLog(
    'api.log',
    `\n=== API start ${new Date().toISOString()} entry=${apiEntry} port=${apiPort} ===\n`,
  );
  appendLog('web.log', `\n=== WEB start ${new Date().toISOString()} port=${webPort} ===\n`);

  apiProcess = spawnLogged(bin, [apiEntry], apiDir, baseEnv, 'api.log');
  webProcess = spawnLogged(
    bin,
    [nextCli, 'start', '-H', '127.0.0.1', '-p', String(webPort)],
    webDir,
    baseEnv,
    'web.log',
  );

  try {
    // Wait for API first — login depends on it. Fail immediately if process crashes.
    await waitHttp(getApiHealthUrl(), 120000, { child: apiProcess, label: 'API' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      message:
        `API failed to start (tried port ${apiPort}).\n\n` +
        `${msg}\n\n` +
        `Log: %APPDATA%\\${PRODUCT}\\logs\\api.log\n\n` +
        `--- last log lines ---\n${readLogTail('api.log')}`,
    };
  }

  try {
    await waitHttp(getWebUrl(), 120000, { child: webProcess, label: 'UI' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      message:
        `UI failed to start (tried port ${webPort}).\n\n` +
        `${msg}\n\n` +
        `Log: %APPDATA%\\${PRODUCT}\\logs\\web.log\n\n` +
        `--- last log lines ---\n${readLogTail('web.log')}`,
    };
  }

  return { ok: true, message: 'Services ready' };
}

function stopServices(): void {
  for (const p of [webProcess, apiProcess]) {
    if (p && !p.killed) {
      try {
        // On Windows, kill() only kills the parent process but leaves child
        // processes (like the NestJS/Next.js server) orphaned.
        // Use taskkill /T /F to recursively kill the entire process tree.
        if (process.platform === 'win32' && p.pid) {
          try {
            spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], {
              windowsHide: true,
              stdio: 'ignore',
            });
          } catch {
            /* fallback */
            p.kill();
          }
        } else {
          p.kill();
        }
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

  const baseUrl = isDev()
    ? process.env.ELECTRON_START_URL || `http://127.0.0.1:${webPort}`
    : getWebUrl();
  const url = `${baseUrl}?apiPort=${apiPort}`;

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
      dialog.showErrorBox(`${PRODUCT} — database setup`, db.message);
    } else if (db.message.includes('Login:')) {
      dialog.showMessageBoxSync({
        type: 'info',
        title: PRODUCT,
        message: db.message,
      });
    }

    const services = await spawnServices(envFile);
    if (!services.ok) {
      dialog.showErrorBox(`${PRODUCT} — startup`, services.message);
      // Still open window so user can read the error context / retry after closing ports
    }
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
