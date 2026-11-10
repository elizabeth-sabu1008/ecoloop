import { spawn } from 'node:child_process';

const serverProc = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: false
});

const viteProc = spawn('node', ['node_modules/vite/bin/vite.js'], {
  stdio: 'inherit',
  shell: false
});

function shutdown() {
  serverProc.kill();
  viteProc.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

serverProc.on('exit', (code) => {
  if (code !== null && code !== 0) {
    viteProc.kill();
    process.exit(code);
  }
});

viteProc.on('exit', (code) => {
  serverProc.kill();
  process.exit(code ?? 0);
});

