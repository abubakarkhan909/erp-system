/**
 * electron-builder excludes node_modules from extraResources (gitignore).
 * Copy them into the packaged app after pack so Prisma/Next can run on client PCs.
 */
const fs = require('fs');
const path = require('path');

exports.default = async function afterPack(context) {
  const resources = path.join(context.appOutDir, 'resources');
  const stage = path.join(__dirname, 'pack-stage');

  for (const part of ['api', 'web']) {
    const src = path.join(stage, part, 'node_modules');
    const dest = path.join(resources, part, 'node_modules');
    if (!fs.existsSync(src)) {
      console.warn(`[afterPack] missing ${src}`);
      continue;
    }
    console.log(`[afterPack] copying ${part}/node_modules → resources/${part}/node_modules ...`);
    fs.cpSync(src, dest, { recursive: true, force: true });
  }

  // Nest may emit either dist/main.js (flat) or dist/src/main.js (nested).
  // Never copy src/main.js to the root — its relative requires break (./app.module).
  // Prefer a thin wrapper so Electron can always start resources/api/main.js.
  const apiRes = path.join(resources, 'api');
  const nestedMain = path.join(apiRes, 'src', 'main.js');
  const rootMain = path.join(apiRes, 'main.js');
  const rootModule = path.join(apiRes, 'app.module.js');
  if (fs.existsSync(nestedMain) && !fs.existsSync(rootModule)) {
    fs.writeFileSync(
      rootMain,
      "'use strict';\nrequire('./src/main.js');\n",
      'utf8',
    );
    console.log('[afterPack] wrote main.js wrapper → ./src/main.js');
  }

  // Drop Next build cache if it slipped into the package (~300MB+)
  const nextCache = path.join(resources, 'web', '.next', 'cache');
  if (fs.existsSync(nextCache)) {
    console.log('[afterPack] removing web/.next/cache');
    fs.rmSync(nextCache, { recursive: true, force: true });
  }
};
