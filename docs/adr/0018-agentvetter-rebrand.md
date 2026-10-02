# ADR-0018: AgentVetter rebrand (unified product + repo identity)

- **Status:** Accepted
- **Date:** 2026-10-02
- **Deciders:** Human maintainer (Accept owner); AgentVetter maintainers
- **Tags:** branding, packaging, cli, skills, migration, breaking

## Context

The product formerly shipped as **Tripwire**. README badges, clone URLs, and
banner assets already point at `neomatrix369/AgentVetter` while prose, packages,
CLI bins, skills, and config still say Tripwire — a half-renamed state that must
close atomically. The GitHub remote slug is already `AgentVetter`; remaining
work is in-repo identity, operator runbooks, and compat shims.

## Decision

Use a **single brand** everywhere live: **AgentVetter** / **agentvetter** /
**AGENTVETTER**. No short form "AgentVet".

| Surface | Policy |
|---------|--------|
| Packages | Hard-cut: PyPI `agentvetter`, npm `agentvetter-cli` |
| CLI | Primary bin `agentvetter`; thin `tripwire` shim warns and execs `agentvetter` for one minor |
| Skills | Primary `av-*` (+ `sync-agentvetter-pages`); permanent `tw-*` / `sync-tripwire-pages` aliases in SKILL.md frontmatter |
| Config home | Prefer `~/.agentvetter`; read-fallback to `~/.tripwire` with stderr warn |
| Env | Prefer `AGENTVETTER_*`; document migration from `TRIPWIRE_*` |
| Modal secrets | Rename to `agentvetter-*` (operator runbook) |
| localStorage | Hard-cut keys to `agentvetter-*` (prototype; no migration) |
| Historical | Preserve completed `docs/plan/slices/**` filenames and `gate-evidence/**` Tripwire-era text |

Migration details: [docs/MIGRATION-AGENTVETTER.md](../MIGRATION-AGENTVETTER.md).

## Alternatives considered

- Keep short brand "AgentVet" — rejected; dual naming prolongs confusion.
- Dual PyPI/npm packages forever — rejected; hard-cut with CHANGELOG + migration doc.
- Hard-cut skills with no `tw-*` aliases — rejected; agents and muscle memory still use `/tw-*`.
- Full history rewrite (slices + gate-evidence) — rejected; audit trail must stay immutable.

## Consequences

- Old clones and package installs break until remotes/packages update.
- Operators must rename Modal secrets and may need Pages/demo path updates.
- Cursor workspace path may change when the local folder is renamed to `AgentVetter`
  (reopen required).
- `tripwire` CLI and `tw-*` skill names remain as compatibility surfaces only.
