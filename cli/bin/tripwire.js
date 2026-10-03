#!/usr/bin/env node
/**
 * Deprecated CLI shim. Warns once on stderr, then execs agentvetter
 * with the same argv (ADR-0018 / docs/MIGRATION-AGENTVETTER.md).
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const agentvetter = path.join(here, 'agentvetter.js');

console.error(
  'warning: `tripwire` is deprecated; use `agentvetter` instead '
  + '(see docs/MIGRATION-AGENTVETTER.md).',
);

const child = spawn(process.execPath, [agentvetter, ...process.argv.slice(2)], {
  stdio: 'inherit',
});
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
child.on('error', (err) => {
  console.error(err.message || err);
  process.exit(1);
});
