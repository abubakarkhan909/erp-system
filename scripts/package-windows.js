/**
 * Build Windows installer without Next standalone (avoids Windows symlink EPERM).
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

const CLIENT_INSTALL = `Al Mas Jewelry ERP — Install on client PC
========================================

Give the client ONLY this file:
  Al Mas Jewelry ERP-1.0.0-Setup.exe

BEFORE installing the ERP (once on that PC)
------------------------------------------
1) Install XAMPP (or MySQL 8) and START MySQL
   https://www.apachefriends.org/

2) Open phpMyAdmin → create database named:  esp_shop
   (empty database is fine)

3) Install Al Mas Jewelry ERP-1.0.0-Setup.exe
   (Desktop shortcut will be created)

4) Open "Al Mas Jewelry ERP" from the Desktop
   - First launch creates config automatically
   - First launch creates tables + owner login

5) Login:
   Username: owner
   Password: Owner@12345

CHANGE THE OWNER PASSWORD after first login (Users tab).

If MySQL root has a password, edit:
  %APPDATA%\\Al Mas Jewelry ERP\\.env
and set:
  DATABASE_URL="mysql://root:YOURPASSWORD@127.0.0.1:3306/esp_shop"
Then delete the file:
  %APPDATA%\\Al Mas Jewelry ERP\\.db-ready
and open the app again.

Node.js is NOT required on the client PC (bundled).
MySQL / XAMPP IS required.
`;

function main() {
  console.log('=== Packaging Al Mas Jewelry ERP (Windows) ===');

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

  // API
  copyDir(path.join(apiDir, 'dist'), apiStage);
  copyDir(path.join(apiDir, 'prisma'), path.join(apiStage, 'prisma'));
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

  fs.writeFileSync(path.join(stageDir, 'CLIENT-INSTALL.txt'), CLIENT_INSTALL);
  fs.writeFileSync(path.join(stageDir, 'SETUP.txt'), CLIENT_INSTALL);

  run('pnpm --filter @jewelry-erp/desktop compile');
  run('pnpm --filter @jewelry-erp/desktop exec electron-builder --win nsis', desktopDir);

  const releaseDir = path.join(desktopDir, 'release');
  const setup = fs
    .readdirSync(releaseDir)
    .find((f) => f.endsWith('-Setup.exe'));
  console.log('\n========================================');
  console.log('CLIENT INSTALLER READY');
  if (setup) {
    console.log(path.join(releaseDir, setup));
  } else {
    console.log(releaseDir);
  }
  console.log('Give the client: Setup.exe + CLIENT-INSTALL.txt instructions');
  console.log('========================================\n');
}

main();
