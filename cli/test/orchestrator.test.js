import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const agentvetterBin = new URL('../bin/agentvetter.js', import.meta.url).pathname;

test('agentvetter scan --help includes --force flag with description', async () => {
  const { stdout } = await exec('node', [agentvetterBin, 'scan', '--help']);
  assert.match(stdout, /--force/, 'Expected --force flag in scan help');
  assert.match(stdout, /re-scan even if content hash is unchanged/,
    'Expected descriptive help text for --force');
});

test('agentvetter setup --help retains its own --force (no collision)', async () => {
  const { stdout } = await exec('node', [agentvetterBin, 'setup', '--help']);
  assert.match(stdout, /--force/, 'Expected --force flag in setup help');
  assert.match(stdout, /re-apply schema/,
    'setup --force description should be about schema, not scanning');
});

test('scan --force is a boolean flag (no argument required)', async () => {
  const { stdout } = await exec('node', [agentvetterBin, 'scan', '--help']);
  assert.doesNotMatch(stdout, /--force </, '--force should not require an argument');
});

test('scan --no-defaults exits with actionable guidance when no targets are supplied', async () => {
  // -- Given --
  const args = [agentvetterBin, 'scan', '--no-defaults'];

  // -- When / Then --
  await assert.rejects(
    () => exec('node', args),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /No targets found/);
      return true;
    },
  );
});

test('scan with explicit target that has no artifacts exits 0 with zero-artifact message', async () => {
  // GWT-62.6 UX: explicit path/URL with nothing discoverable is not an error.
  // -- Given --
  const emptyDir = await mkdtemp(path.join(tmpdir(), 'av-empty-'));
  try {
    // -- When --
    const { stdout, stderr } = await exec('node', [agentvetterBin, 'scan', emptyDir, '--no-defaults']);

    // -- Then --
    assert.equal(stderr, '');
    assert.match(stdout, /No skill or MCP artifacts found/);
    assert.match(stdout, new RegExp(emptyDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    // GWT-63.1
    assert.match(stdout, /\[scanners\].*not run/);
    assert.match(stdout, /DepShield: not_run/);
    assert.match(stdout, /Ossprey: not_run/);
  } finally {
    await rm(emptyDir, { recursive: true, force: true });
  }
});

test('setup reports its environment requirement instead of applying schema without credentials', async () => {
  // -- Given --
  const args = [agentvetterBin, 'setup'];
  const env = { ...process.env, SUPABASE_URL: '', SUPABASE_ANON_KEY: '', SUPABASE_DB_URL: '' };

  // -- When / Then --
  await assert.rejects(
    () => exec('node', args, { env }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /SUPABASE_URL/);
      return true;
    },
  );
});

test('given invalid concurrency when scan starts then it exits before discovery or persistence', async () => {
  // -- Given --
  const args = [agentvetterBin, 'scan', '--concurrency', '0', '--no-defaults'];

  // -- When / Then --
  await assert.rejects(
    () => exec('node', args),
    (error) => error.code === 1 && /positive integer/.test(error.stderr),
  );
});

test('given malformed targets JSON when dry discovery runs then it exits with an actionable error', async () => {
  // -- Given --
  const dir = await mkdtemp(path.join(tmpdir(), 'av-targets-'));
  const targets = path.join(dir, 'targets.json');
  await writeFile(targets, '{not-json');

  // -- When / Then --
  try {
    await assert.rejects(
      () => exec('node', [agentvetterBin, 'scan', '--targets', targets, '--dry-discover']),
      (error) => error.code === 1 && /JSON|property name/.test(error.stderr),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('given an explicit MCP endpoint when dry discovery runs then it reports the discovered target without scanning', async () => {
  // -- Given --
  const endpoint = 'https://mcp.example.test/sse';

  // -- When --
  const { stdout } = await exec('node', [agentvetterBin, 'scan', endpoint, '--dry-discover']);

  // -- Then --
  assert.match(stdout, /mcp\.example\.test/);
  assert.match(stdout, /introspection_only/);
});

test('given invalid --type value when scan starts then it exits non-zero with valid values listed', async () => {
  /**
   * Scenario: Invalid type rejected
   * Given an operator passes --type badvalue
   * When the scan command is invoked
   * Then the process exits non-zero with a message explaining valid values.
   */
  // -- Given --
  const args = [agentvetterBin, 'scan', '--type', 'badvalue', '--dry-discover'];

  // -- When / Then --
  await assert.rejects(
    () => exec('node', args),
    (error) => error.code === 1 && /skill.*mcp|mcp.*skill/.test(error.stderr),
  );
});

test('given no database credentials when agentvetter route runs then exits non-zero', async () => {
  /**
   * Scenario: route action try/catch fires when runRoute throws.
   * Slice: coverage — agentvetter.js lines 70-78 (route command action catch branch)
   *
   * Given no Supabase credentials in the environment,
   * When `agentvetter route --batch-id test-batch` is invoked as a CLI subprocess,
   * Then the process exits with a non-zero code (runRoute throws, catch sets exitCode=1).
   */
  // -- Given --
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([k]) => !k.startsWith('SUPABASE')),
  );

  // -- When / Then --
  await assert.rejects(
    () => exec('node', [agentvetterBin, 'route', '--batch-id', 'test-batch'], { env }),
    (error) => error.code !== 0,
  );
});

test('scan --help includes --reveal-secrets masked-by-default contract', async () => {
  // -- Given / When --
  const { stdout } = await exec('node', [agentvetterBin, 'scan', '--help']);

  // -- Then --
  assert.match(stdout, /--reveal-secrets/, 'Expected --reveal-secrets flag in scan help');
  assert.match(stdout, /masked by\s+default/i, 'Help must say secrets are masked by default');
});

test('GWT-66.3: dry-discover of injection fixture prints an evidence warning', async () => {
  // -- Given --
  const skillDir = path.join(path.dirname(agentvetterBin), '../../fixtures/skills/vuln-prompt-injection-notes');

  // -- When --
  const { stdout } = await exec('node', [agentvetterBin, 'scan', skillDir, '--dry-discover', '--no-defaults']);

  // -- Then --
  assert.match(stdout, /\[evidence]/, 'pre-scan evidence report required');
  assert.match(stdout, /hidden_instruction|injection/, 'hidden instruction attempt must be recorded');
  assert.match(stdout, /SKILL\.md/);
});
