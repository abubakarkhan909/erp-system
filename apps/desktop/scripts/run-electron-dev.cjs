const { spawn } = require('child_process');
const electron = require('electron');

process.env.ELECTRON_START_URL =
  process.env.ELECTRON_START_URL || 'http://127.0.0.1:3000';

const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
