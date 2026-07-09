#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'server.js');

function run(cmd) {
  console.log('> ' + cmd);
  execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

try {
  if (!fs.existsSync(distPath)) {
    console.error('dist/server.js not found — the build stage must produce this file before runtime.');
    process.exit(1);
  }
  // start the compiled server as a child process (handles ESM/CJS correctly)
  console.log('Starting server...');
  run('node dist/server.js');
} catch (err) {
  console.error('Failed to start server:', err);
  process.exit(1);
}
