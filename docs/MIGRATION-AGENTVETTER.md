# Migrating from Tripwire to AgentVetter

**Status:** DECIDED / IMPLEMENTED (in-repo) · Modal + rollup **VERIFIED** (maintainer
workspace 2026-10-02) · Pages demo path live; sync-script casing follow-up
[neomatrix369.github.io#21](https://github.com/neomatrix369/neomatrix369.github.io/pull/21)
**ADR:** [ADR-0018](adr/0018-agentvetter-rebrand.md)

This guide covers clone URLs, packages, CLI, skills, env vars, config home,
Modal secrets, and Pages.

## Clone and remote

```bash
git remote set-url origin git@github.com:neomatrix369/AgentVetter.git
# or
git clone git@github.com:neomatrix369/AgentVetter.git
```

Old slug `neomatrix369/tripwire` redirects only if GitHub still has a redirect;
prefer the new URL.

## Packages (breaking hard-cut)

| Ecosystem | Old | New |
|-----------|-----|-----|
| PyPI | `tripwire` | `agentvetter` |
| npm | `tripwire-cli` | `agentvetter-cli` |

Uninstall the old package names and install the new ones. There is no dual-publish
period for packages.

## CLI

Primary command:

```bash
agentvetter --help
agentvetter scan …
```

Deprecated shim (one minor): `tripwire` prints a deprecation warning on stderr
and execs `agentvetter` with the same argv.

## Skills

| Primary | Permanent alias |
|---------|-----------------|
| `/av-scan` | `/tw-scan` |
| `/av-verify` | `/tw-verify` |
| `/av-enable` | `/tw-enable` |
| `/av-disable` | `/tw-disable` |
| `/av-self-check` | `/tw-self-check` |
| `/sync-agentvetter-pages` | `/sync-tripwire-pages` |

Prefer `av-*` in new docs and habit. Aliases remain permanent via SKILL.md
`aliases:` frontmatter.

## Environment variables

Prefer `AGENTVETTER_*` over `TRIPWIRE_*`. Examples:

| Old | New |
|-----|-----|
| `TRIPWIRE_JUDGE_PANEL` | `AGENTVETTER_JUDGE_PANEL` |
| Other `TRIPWIRE_*` | Matching `AGENTVETTER_*` |

Update `.env`, CI secrets, and shell profiles. Until code drops dual-read,
document both in CHANGELOG if a dual-read window exists; otherwise migrate
before upgrade.

## Config home

| Preference | Path |
|------------|------|
| Primary | `~/.agentvetter` |
| Read-fallback | `~/.tripwire` (stderr warn when used) |

Recommended one-time migrate:

```bash
mv ~/.tripwire ~/.agentvetter
# or copy hooks/settings if you need both during transition
```

## Modal secrets (operator)

Rename secrets **before** deploying under the new names:

| Old | New |
|-----|-----|
| `tripwire-supabase` | `agentvetter-supabase` |
| `tripwire-scan-secrets` | `agentvetter-scan-secrets` |

Deployed app name is **`agentvetter-scan`** (`modal.App("agentvetter-scan")` in
`sandbox/scan_app.py`). Prefer `./scripts/setup-modal.sh` (creates/forces the new
secret names from `.env`, then deploys).

Steps (Modal dashboard or CLI you already use):

1. Create `agentvetter-supabase` / `agentvetter-scan-secrets` with the same
   key material as `tripwire-supabase` / `tripwire-scan-secrets` (or run `./scripts/setup-modal.sh`).
2. Confirm deploy scripts / app references use the new secret names (in-repo already).
3. Redeploy sandbox/app (`agentvetter-scan`).
4. After verifying a Live scan, stop the old `tripwire-scan` app and delete unused
   `tripwire-*` secrets.

**VERIFIED (2026-10-02, maintainer workspace):** `./scripts/setup-modal.sh
--non-interactive` created `agentvetter-supabase` + `agentvetter-scan-secrets` and
deployed `agentvetter-scan`; smoke `agentvetter scan
./fixtures/skills/safe-csv-cleaner --no-defaults --force` completed with
`failed_targets: []` after rollup apply; `tripwire-scan` stopped;
`tripwire-supabase` / `tripwire-scan-secrets` deleted.

Do not invent Modal API calls in CI without credentials; this is an operator step.

## GitHub Pages / demo path

If the public demo used `…/demos/tripwire-dashboard/`, rename that path to
`…/demos/agentvetter-dashboard/` (or the path committed in sync-agentvetter-pages)
in the same change window as Modal, then re-run the Pages sync skill.

**VERIFIED:** live demo answers at
https://neomatrix369.github.io/demos/agentvetter-dashboard/ (HTTP 200);
`…/demos/tripwire-dashboard/` returns 404. Sync wrapper path defaults for the
renamed local folder `AgentVetter` are in
[neomatrix369.github.io#21](https://github.com/neomatrix369/neomatrix369.github.io/pull/21).

Meterian and other badge URLs: re-link after the GitHub slug is confirmed as
`neomatrix369/AgentVetter`.

## Dashboard localStorage (prototype)

Hard-cut: keys are `agentvetter-*`. Clear old `tripwire-*` keys in the browser
(or use a fresh profile). No automatic migration.

## Database rollup function

Live code calls `agentvetter_rollup_item` (CLI, Modal sandbox, reconcile script).
`db/schema.sql` defines **`agentvetter_rollup_item`** as the primary function and
keeps **`tripwire_rollup_item`** as a thin compat alias that `perform`s the new name.

**Operator action:** re-apply `db/schema.sql` (via `agentvetter setup --force` /
first-scan bootstrap, or SQL editor) so the new function exists on Supabase. Until
then, Live rollup RPCs fail if only `tripwire_rollup_item` is present
(PostgREST hints `tripwire_rollup_item`).

**VERIFIED (2026-10-02, maintainer workspace):** `agentvetter_rollup_item` +
compat alias `tripwire_rollup_item` applied to live Supabase (direct SQL when
`agentvetter setup --force` failed on pooler TLS self-signed chain). Subsequent
Modal smoke scan rollup succeeded.

**Deferred:** dropping the `tripwire_rollup_item` alias is a separate operator
migration after all environments have applied the new schema. Do not rename or
drop the alias mid-flight without confirming no external callers remain.

## Rollback (high level)

| After | Rollback |
|-------|----------|
| In-repo rename only | Reset/revert `chore/rename-agentvetter` |
| GitHub rename | `gh repo rename tripwire --repo neomatrix369/AgentVetter` + fix remotes |
| Local folder mv | `mv AgentVetter tripwire`; reopen Cursor |
| Modal/Pages | Restore prior secret/path names from this doc |

## Checklist for operators

Maintainer workspace ticks (**VERIFIED 2026-10-02**) where noted; leave unchecked
on a machine that has not completed that step.

- [x] Origin URL is `neomatrix369/AgentVetter`
- [ ] Packages installed as `agentvetter` / `agentvetter-cli`
- [x] `agentvetter --help` works; `tripwire` shim acceptable if needed
- [x] Skills resolve as `av-*` (aliases `tw-*` still work)
- [ ] Env vars use `AGENTVETTER_*` (prefer over `TRIPWIRE_*`)
- [x] Config under `~/.agentvetter` (migrated from `~/.tripwire`; `enable` left false)
- [x] Modal secrets renamed and deploy verified (`agentvetter-scan`; old `tripwire-*` removed)
- [x] Pages/demo path is `…/demos/agentvetter-dashboard/` (old path 404); sync-script
      `AgentVetter` path casing → [Pages PR #21](https://github.com/neomatrix369/neomatrix369.github.io/pull/21)
- [ ] Dashboard localStorage cleared / new keys in use (browser-local)
- [x] Supabase has `agentvetter_rollup_item` (compat alias `tripwire_rollup_item` kept)
