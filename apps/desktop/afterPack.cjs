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

  // Nest build may emit src/main.js — ensure a stable entry exists
  const apiRes = path.join(resources, 'api');
  const nestedMain = path.join(apiRes, 'src', 'main.js');
  const rootMain = path.join(apiRes, 'main.js');
  if (!fs.existsSync(rootMain) && fs.existsSync(nestedMain)) {
    fs.copyFileSync(nestedMain, rootMain);
    console.log('[afterPack] mirrored src/main.js → main.js');
  }
};
