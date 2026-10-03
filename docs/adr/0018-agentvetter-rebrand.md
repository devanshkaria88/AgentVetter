# ADR-0018: AgentVetter rebrand (unified product + repo identity)

- **Status:** Accepted (amended 2026-10-03 — hard-cut residual legacy product names)
- **Date:** 2026-10-02
- **Deciders:** Human maintainer (Accept owner); AgentVetter maintainers
- **Tags:** branding, packaging, cli, skills, migration, breaking

## Context

README badges, clone URLs, and banner assets already point at
`neomatrix369/AgentVetter` while prose, packages, CLI bins, skills, and config
still use prior names — a half-renamed state that must close atomically. The
GitHub remote slug is already `AgentVetter`; remaining work is in-repo identity,
operator runbooks, and (amended) removal of residual compat shims.

## Decision

Use a **single brand** everywhere live: **AgentVetter** / **agentvetter** /
**AGENTVETTER**. No short form "AgentVet". No live functional surface or
operator doc may use the prior product name.

| Surface | Policy |
|---------|--------|
| Packages | Hard-cut: PyPI `agentvetter`, npm `agentvetter-cli` |
| CLI | Single bin `agentvetter` (no prior-name shim) |
| Skills | Primary `av-*` (+ `sync-agentvetter-pages`); permanent `tw-*` aliases in SKILL.md frontmatter only |
| Config home | `~/.agentvetter` only |
| Env | `AGENTVETTER_*` only |
| Modal secrets | `agentvetter-*` (operator runbook) |
| localStorage | Hard-cut keys to `agentvetter-*` (prototype; no migration) |
| Schema | `agentvetter_rollup_item` only |
| Historical | Preserve completed `docs/plan/slices/**` filenames and `gate-evidence/**` original text |

Migration details: [docs/MIGRATION-AGENTVETTER.md](../MIGRATION-AGENTVETTER.md).

## Alternatives considered

- Keep short brand "AgentVet" — rejected; dual naming prolongs confusion.
- Dual PyPI/npm packages forever — rejected; hard-cut with CHANGELOG + migration doc.
- Hard-cut skills with no `tw-*` aliases — rejected; agents and muscle memory still use `/tw-*`.
- Keep prior-name CLI shim / config / env dual-read for one minor — rejected 2026-10-03 (USER); residual dual identity caused agents and docs to keep inventing the old name.
- Full history rewrite (slices + gate-evidence) — rejected; audit trail must stay immutable.

## Consequences

- Old clones and package installs break until remotes/packages update.
- Operators with a pre-rebrand config directory must move it to `~/.agentvetter`
  before upgrade (see migration guide).
- Cursor workspace path may change when the local folder is renamed to `AgentVetter`
  (reopen required).
- Only permanent compat surface: `tw-*` skill frontmatter aliases.
