const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const stage = path.join(root, 'apps', 'desktop', 'pack-stage');
const apiStage = path.join(stage, 'api');
const webStage = path.join(stage, 'web');
const webDir = path.join(root, 'apps', 'web');
const desktopDir = path.join(root, 'apps', 'desktop');

function run(cmd, cwd) {
  console.log('>', cmd);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function writeShared(target) {
  const v = path.join(target, 'vendor', 'shared');
  copyDir(path.join(root, 'packages', 'shared', 'dist'), path.join(v, 'dist'));
  fs.writeFileSync(
    path.join(v, 'package.json'),
    JSON.stringify({ name: '@jewelry-erp/shared', version: '1.0.0', main: './dist/index.js' }),
  );
}

run('npm install @prisma/client@6.19.3 prisma@6.19.3', apiStage);
run('npx prisma generate', apiStage);

fs.mkdirSync(webStage, { recursive: true });
fs.copyFileSync(path.join(webDir, 'package.json'), path.join(webStage, 'package.json'));
copyDir(path.join(webDir, '.next'), path.join(webStage, '.next'));
if (fs.existsSync(path.join(webDir, 'public'))) {
  copyDir(path.join(webDir, 'public'), path.join(webStage, 'public'));
}
writeShared(webStage);

const webPkg = JSON.parse(fs.readFileSync(path.join(webStage, 'package.json'), 'utf8'));
webPkg.dependencies['@jewelry-erp/shared'] = 'file:./vendor/shared';
delete webPkg.devDependencies;
fs.writeFileSync(path.join(webStage, 'package.json'), JSON.stringify(webPkg, null, 2));
fs.writeFileSync(
  path.join(webStage, 'next.config.js'),
  "module.exports = { transpilePackages: ['@jewelry-erp/shared'] };\n",
);
run('npm install --omit=dev', webStage);

fs.writeFileSync(
  path.join(stage, 'SETUP.txt'),
  fs.readFileSync(path.join(root, 'docs', 'desktop-install.md'), 'utf8'),
);

run('pnpm --filter @jewelry-erp/desktop compile', root);
run('pnpm --filter @jewelry-erp/desktop exec electron-builder --win nsis', desktopDir);
console.log('DONE — check apps/desktop/release/');
