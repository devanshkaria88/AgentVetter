import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = path.dirname(fileURLToPath(import.meta.url));
/** Deprecated npm bin name — still ships for one minor (ADR-0018). */
const shim = path.join(here, '..', 'bin', 'tripwire.js');
const primary = path.join(here, '..', 'bin', 'agentvetter.js');

function run(bin, args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [bin, ...args], { env: process.env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += c; });
    child.stderr.on('data', (c) => { stderr += c; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('deprecated tripwire bin warns and matches agentvetter --help exit', async () => {
  const [shimResult, primaryResult] = await Promise.all([
    run(shim, ['--help']),
    run(primary, ['--help']),
  ]);
  assert.match(shimResult.stderr, /deprecated/);
  assert.equal(shimResult.code, primaryResult.code);
  assert.match(shimResult.stdout, /agentvetter|Usage/i);
});
