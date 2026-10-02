import fs from 'node:fs';
import path from 'node:path';

/** Preferred config home dir name under $HOME (ADR-0018). */
export const CONFIG_HOME_NAME = '.agentvetter';
/** Legacy Tripwire-era config home — read-fallback only. */
export const LEGACY_CONFIG_HOME_NAME = '.tripwire';

const HOOK_SUFFIXES = [
  '/.agentvetter/hooks/pre-tool-use.sh',
  '/.tripwire/hooks/pre-tool-use.sh',
];

/**
 * Resolve AgentVetter config home under `homedir`.
 * Prefers `~/.agentvetter`; falls back to `~/.tripwire` with stderr warn when
 * only the legacy directory exists. Default for new installs is preferred.
 */
export function resolveConfigHome(homedir, { fs: fsImpl = fs, warn = console.error } = {}) {
  const preferred = path.join(homedir, CONFIG_HOME_NAME);
  const legacy = path.join(homedir, LEGACY_CONFIG_HOME_NAME);
  if (fsImpl.existsSync(preferred)) return preferred;
  if (fsImpl.existsSync(legacy)) {
    warn(
      'warning: using ~/.tripwire; migrate to ~/.agentvetter '
      + '(see docs/MIGRATION-AGENTVETTER.md).',
    );
    return legacy;
  }
  return preferred;
}

/** True when a Claude settings hook command points at our PreToolUse handler. */
export function isAgentVetterHookCommand(command, homedir) {
  if (typeof command !== 'string') return false;
  const expanded = command.startsWith('~/')
    ? path.join(homedir, command.slice(2))
    : command;
  return HOOK_SUFFIXES.some((suffix) => expanded.endsWith(suffix));
}

/** Env: prefer AGENTVETTER_*; fall back to TRIPWIRE_* for one minor. */
export function envPrefer(name, { env = process.env } = {}) {
  const primary = `AGENTVETTER_${name}`;
  const legacy = `TRIPWIRE_${name}`;
  if (env[primary] !== undefined && env[primary] !== '') return env[primary];
  if (env[legacy] !== undefined && env[legacy] !== '') return env[legacy];
  return env[primary];
}
