/**
 * Build Windows installer without Next standalone (avoids Windows symlink EPERM).
 * Ships local SQLite — no MySQL/XAMPP on the client PC.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const apiDir = path.join(root, 'apps', 'api');
const webDir = path.join(root, 'apps', 'web');
const desktopDir = path.join(root, 'apps', 'desktop');
const stageDir = path.join(desktopDir, 'pack-stage');

function run(cmd, cwd = root, env = {}) {
  console.log(`\n> ${cmd}`);
  const cleaned = { ...process.env, ...env };
  delete cleaned.NEXT_STANDALONE;
  delete cleaned.NEXT_EXPORT;
  if (!('NEXT_STANDALONE' in env)) cleaned.NEXT_STANDALONE = '';
  if (!('NEXT_EXPORT' in env)) cleaned.NEXT_EXPORT = '';
  execSync(cmd, { cwd, stdio: 'inherit', shell: true, env: cleaned });
}

function rimraf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function writeSharedVendor(targetRoot) {
  const vendor = path.join(targetRoot, 'vendor', 'shared');
  copyDir(path.join(root, 'packages', 'shared', 'dist'), path.join(vendor, 'dist'));
  fs.writeFileSync(
    path.join(vendor, 'package.json'),
    JSON.stringify({ name: '@jewelry-erp/shared', version: '1.0.0', main: './dist/index.js' }, null, 2),
  );
}

/** Drop build caches and non-Windows Prisma engines to shrink the installer. */
function slimStage(apiStage, webStage) {
  const drop = [
    path.join(webStage, '.next', 'cache'),
    path.join(webStage, '.next', 'trace'),
    path.join(apiStage, 'node_modules', '.cache'),
    path.join(webStage, 'node_modules', '.cache'),
    path.join(apiStage, 'prisma', 'data'),
  ];
  for (const p of drop) {
    if (fs.existsSync(p)) {
      console.log(`[slim] remove ${path.relative(stageDir, p)}`);
      rimraf(p);
    }
  }

  // Keep only Windows Prisma query/schema engines
  const engineJunk =
    /query_engine-(darwin|linux|debian|rhel|openssl)|libquery_engine-(darwin|linux)|schema-engine-(darwin|linux)/i;
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      let st;
      try {
        st = fs.statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        walk(full);
      } else if (engineJunk.test(name)) {
        console.log(`[slim] remove engine ${name}`);
        fs.unlinkSync(full);
      }
    }
  };
  walk(path.join(apiStage, 'node_modules'));
}

const CLIENT_INSTALL = `Al Zahid Jewelry ERP — Install on client PC
========================================

Give the client ONLY this file:
  Al Zahid Jewelry ERP-1.0.0-Setup.exe

No MySQL / XAMPP / Node.js needed.
Data is stored locally as SQLite under:
  %APPDATA%\\Al Zahid Jewelry ERP\\data\\jewelry.db

Install steps
-------------
1) Run Al Zahid Jewelry ERP-1.0.0-Setup.exe
   (Desktop shortcut will be created)

2) Open "Al Zahid Jewelry ERP" from the Desktop
   - First launch creates local database + owner login

3) Login:
   Username: admin
   Password: admin@1234

   (also available)
   Username: zahid
   Password: zahid@1234

CHANGE THE ADMIN PASSWORD after first login (Users tab).

Backup (important)
------------------
Use Backup in the app to copy the database file, then Download it to a USB drive.
If the PC dies, Restore that .db backup (or copy jewelry.db back into the AppData folder).

If first launch fails
---------------------
Delete this file and open the app again:
  %APPDATA%\\Al Zahid Jewelry ERP\\.db-ready
`;

function main() {
  console.log('=== Packaging Al Zahid Jewelry ERP (Windows / SQLite) ===');

  // Avoid stale incremental TS emit (previously shipped nearly empty API → health timeout)
  rimraf(path.join(apiDir, 'dist'));
  const tsbuildinfo = path.join(apiDir, 'tsconfig.build.tsbuildinfo');
  if (fs.existsSync(tsbuildinfo)) fs.unlinkSync(tsbuildinfo);

  run('pnpm --filter @jewelry-erp/shared build');
  try {
    run('pnpm --filter @jewelry-erp/api prisma:generate');
  } catch {
    console.warn('prisma generate skipped (file locked — stop pnpm dev:api if packaging fails later)');
  }
  run('pnpm --filter @jewelry-erp/api build');
  run('pnpm --filter @jewelry-erp/web build', root, {
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3847/api/v1',
  });

  rimraf(stageDir);
  const apiStage = path.join(stageDir, 'api');
  const webStage = path.join(stageDir, 'web');
  fs.mkdirSync(apiStage, { recursive: true });
  fs.mkdirSync(webStage, { recursive: true });

  // API — Nest should emit flat dist/main.js; if legacy dist/src exists, flatten it.
  const apiDist = path.join(apiDir, 'dist');
  const nestedDistMain = path.join(apiDist, 'src', 'main.js');
  const flatDistMain = path.join(apiDist, 'main.js');
  if (fs.existsSync(nestedDistMain) && !fs.existsSync(flatDistMain)) {
    console.log('[stage] flattening dist/src → pack-stage/api');
    copyDir(path.join(apiDist, 'src'), apiStage);
  } else {
    copyDir(apiDist, apiStage);
  }

  // Hard fail if Nest emit is incomplete (same class of bug that caused client API timeout)
  const healthJs = [
    path.join(apiStage, 'modules', 'health', 'health.controller.js'),
    path.join(apiStage, 'src', 'modules', 'health', 'health.controller.js'),
  ].find((p) => fs.existsSync(p));
  const appModuleJs = [
    path.join(apiStage, 'app.module.js'),
    path.join(apiStage, 'src', 'app.module.js'),
  ].find((p) => fs.existsSync(p));
  const mainJs = [
    path.join(apiStage, 'main.js'),
    path.join(apiStage, 'src', 'main.js'),
  ].find((p) => fs.existsSync(p));
  if (!mainJs || !appModuleJs || !healthJs) {
    throw new Error(
      `[stage] Incomplete API build — missing entry/modules (main=${!!mainJs}, app.module=${!!appModuleJs}, health=${!!healthJs}). ` +
        'Clean apps/api/dist and rebuild.',
    );
  }
  const moduleCount = fs.existsSync(path.join(apiStage, 'modules'))
    ? fs.readdirSync(path.join(apiStage, 'modules')).length
    : fs.existsSync(path.join(apiStage, 'src', 'modules'))
      ? fs.readdirSync(path.join(apiStage, 'src', 'modules')).length
      : 0;
  if (moduleCount < 10) {
    throw new Error(`[stage] API modules look incomplete (count=${moduleCount}). Aborting package.`);
  }
  console.log(`[stage] API OK — modules=${moduleCount}, health present`);

  copyDir(path.join(apiDir, 'prisma'), path.join(apiStage, 'prisma'));
  // Do not ship local junk / dev databases inside prisma/
  rimraf(path.join(apiStage, 'prisma', 'data'));
  for (const junk of ['jewelry.db', 'jewelry.db-journal', 'dev.db']) {
    const p = path.join(apiStage, 'prisma', junk);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  const ownershipMig = path.join(
    apiStage,
    'prisma',
    'migrations',
    '20260720180000_product_ownership',
    'migration.sql',
  );
  if (!fs.existsSync(ownershipMig)) {
    throw new Error('[stage] Missing product_ownership migration in staged prisma/');
  }
  fs.copyFileSync(path.join(apiDir, 'package.json'), path.join(apiStage, 'package.json'));
  fs.copyFileSync(path.join(apiDir, '.env.example'), path.join(apiStage, '.env.example'));
  writeSharedVendor(apiStage);
  const apiPkg = JSON.parse(fs.readFileSync(path.join(apiStage, 'package.json'), 'utf8'));
  apiPkg.dependencies['@jewelry-erp/shared'] = 'file:./vendor/shared';
  apiPkg.dependencies['prisma'] = apiPkg.dependencies['prisma'] || '^6.10.1';
  if (!apiPkg.dependencies['@prisma/client']) {
    apiPkg.dependencies['@prisma/client'] = '^6.10.1';
  }
  apiPkg.prisma = { seed: 'node prisma/seed.cjs' };
  delete apiPkg.devDependencies;
  fs.writeFileSync(path.join(apiStage, 'package.json'), JSON.stringify(apiPkg, null, 2));
  run('npm install --omit=dev', apiStage);
  run('npm install @prisma/client@6.19.3 prisma@6.19.3 --no-save', apiStage);
  run('npx prisma generate', apiStage);
  // Bundle seed for first-run on client PC (no TypeScript/ts-node needed)
  run(
    'npx --yes esbuild ./prisma/seed.ts --bundle --platform=node --external:@prisma/client --external:bcrypt --outfile=./prisma/seed.cjs',
    apiStage,
  );

  // WEB
  fs.copyFileSync(path.join(webDir, 'package.json'), path.join(webStage, 'package.json'));
  if (fs.existsSync(path.join(webDir, 'next.config.ts'))) {
    fs.copyFileSync(path.join(webDir, 'next.config.ts'), path.join(webStage, 'next.config.ts'));
  }
  copyDir(path.join(webDir, '.next'), path.join(webStage, '.next'));
  // Largest easy win: Next build cache is useless at runtime (~300MB+)
  rimraf(path.join(webStage, '.next', 'cache'));
  if (fs.existsSync(path.join(webDir, 'public'))) {
    copyDir(path.join(webDir, 'public'), path.join(webStage, 'public'));
  }
  writeSharedVendor(webStage);
  const webPkg = JSON.parse(fs.readFileSync(path.join(webStage, 'package.json'), 'utf8'));
  webPkg.dependencies['@jewelry-erp/shared'] = 'file:./vendor/shared';
  delete webPkg.devDependencies;
  fs.writeFileSync(path.join(webStage, 'package.json'), JSON.stringify(webPkg, null, 2));
  fs.writeFileSync(
    path.join(webStage, 'next.config.js'),
    `/** @type {import('next').NextConfig} */\nmodule.exports = { transpilePackages: ['@jewelry-erp/shared'] };\n`,
  );
  run('npm install --omit=dev', webStage);

  slimStage(apiStage, webStage);

  fs.writeFileSync(path.join(stageDir, 'CLIENT-INSTALL.txt'), CLIENT_INSTALL);
  fs.writeFileSync(path.join(stageDir, 'SETUP.txt'), CLIENT_INSTALL);

  run('pnpm --filter @jewelry-erp/desktop compile');
  run('pnpm --filter @jewelry-erp/desktop exec electron-builder --win nsis', desktopDir);

  const releaseDir = path.join(desktopDir, 'release');
  const setup = fs
    .readdirSync(releaseDir)
    .find((f) => f.endsWith('-Setup.exe'));
  console.log('\n========================================');
  console.log('CLIENT INSTALLER READY (SQLite — no MySQL)');
  if (setup) {
    console.log(path.join(releaseDir, setup));
  } else {
    console.log(releaseDir);
  }
  console.log('Give the client: Setup.exe only');
  console.log('========================================\n');
}

main();
