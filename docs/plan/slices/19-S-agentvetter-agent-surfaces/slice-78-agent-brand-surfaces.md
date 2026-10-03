# Slice 78: Agent brand surfaces → AgentVetter / av-*

> Scenario: Brownfield | MoSCoW: **Must**
> Wave: S — AgentVetter agent surfaces (ADR-0018 follow-through)
> Depends on: ADR-0018 Accepted; Wave H skills installed as `av-*`
> Branch: `slice/78-agent-brand-surfaces`
> Trigger: USER 2026-10-03 — coding agents still hardcode Tripwire/`tw-*` paths while products install `av-*`

## Session bootstrap
> Re-read CLAUDE.md before starting — use values there, not hardcoded commands here.
- **Runtime source**: → CLAUDE.md § Environment
- **Test source**: → CLAUDE.md § Testing
- **Load first**: CLAUDE.md → docs/plan/invariants.md → this stub → [ADR-0018](../../../adr/0018-agentvetter-rebrand.md) → [MIGRATION-AGENTVETTER.md](../../../MIGRATION-AGENTVETTER.md)

## Context
> Read before any implementation. Do not rely on conversation history alone.
- **Stage objective**: Make live agent-facing surfaces (skills, hook remedies, setup messages, global gallery skill examples) prefer **AgentVetter** / **`/av-*`** as primary identity, while keeping permanent `tw-*` SKILL.md aliases and `~/.tripwire` config fallback per ADR-0018.
- **Depends on**:
  - ADR-0018: brand policy (primary `av-*`; permanent `tw-*` aliases; preserve historical slices/gate-evidence)
  - Wave H install path: `setup-agent-hooks` copies `agent-hooks/skills/av-*` → `~/.claude/skills/av-*`
- **Global invariants**: → `docs/plan/invariants.md`

## Non-goals
> Out of scope for this slice — do not implement here.
- Renaming historical `docs/plan/slices/**` filenames or rewriting immutable `gate-evidence/**` original text
- Removing `tw-*` SKILL.md aliases or the `tripwire` CLI shim
- Removing `~/.tripwire` config read-fallback
- Full Graphiti / private-reference rewrite
- Closing Wave H formal Must gates 23–32

## Output contract
> Observable shape of completion (shape only — not exact file paths).
- **Baseline**: `av-self-check` lists `~/.claude/skills/tw-*` (missing on disk); remedies/setup logs say `/tw-*`; capture-app-gallery examples still say Tripwire
- After: (1) self-check scopes five installed `av-*` dirs; (2) operator remedies + setup copy prefer `/av-*`; (3) skill prose prefers `/av-*` while frontmatter keeps `aliases: [tw-*]`; (4) gallery skill examples use AgentVetter/`agentvetter`; (5) targeted guard/cli tests green

## Slice Workflow Bundle
- Slice name: slice-78-agent-brand-surfaces
- Files:
  - `agent-hooks/skills/av-*/SKILL.md`
  - `agent-hooks/README.md` (if drift)
  - `guard/entry.py`, `guard/verify.py`, `guard/guard_hook.py`, `guard/status.py` (comments/remedies)
  - `cli/src/setupAgentHooks.js`
  - matching tests under `guard/tests/`, `cli/test/`
  - global `~/.cursor/skills/capture-app-gallery/SKILL.md` (+ Claude twin if linked)
- Exit criteria:
  - [x] `/av-self-check` instructions reference `~/.claude/skills/av-*` only for install loci
  - [x] Block/remedy strings prefer `/av-scan` / `/av-disable` (aliases remain documented in frontmatter)
  - [x] `setup-agent-hooks` post-install copy prefers `/av-*`
  - [x] capture-app-gallery examples say AgentVetter
  - [x] Targeted tests pass
  - [x] Historical slices + gate-evidence untouched
  - [ ] code review passed

## Branch
`slice/78-agent-brand-surfaces`

## Spec (GWT / User Story)

**Story:** As an operator using Claude Code / Cursor skills against this repo, I want AgentVetter/`av-*` as the primary names so agents stop looking for Tripwire/`tw-*` install paths that no longer exist.

### GWT-78.1 — Self-check loci
- **Given** `setup-agent-hooks` installed the five `av-*` skills under `~/.claude/skills/`
- **When** an agent follows `/av-self-check`
- **Then** it queries exactly those five `av-*` directories (not `tw-*` dirs)

### GWT-78.2 — Primary remedies
- **Given** the guard denies a call or verify reports stale/unscanned
- **When** the operator reads the reason/note
- **Then** in-session remedies name `/av-scan` / `/av-disable` (not `/tw-*` as primary)

### GWT-78.3 — Setup copy
- **Given** `agentvetter setup-agent-hooks` finishes
- **When** the operator reads the summary lines
- **Then** Verify/Disable/Enable guidance uses `/av-*`

### GWT-78.4 — Compat retained
- **Given** ADR-0018 alias policy
- **When** skill frontmatter is inspected
- **Then** each `av-*` skill still declares permanent `aliases: [tw-*]` and config docs still mention `~/.tripwire` fallback

## Before-Checks
- [x] On branch `slice/78-agent-brand-surfaces` (not `main`)
- [x] ADR-0018 + migration doc still describe primary `av-*` + permanent aliases
- [x] Confirm installed skills are `av-*` under `~/.claude/skills/`

## TDD Execution
1. RED: assert self-check SKILL.md lists `av-*` paths; assert remedy strings contain `/av-scan`
2. GREEN: update skill MD + guard/cli strings + tests
3. REFACTOR: keep comments consistent; no behaviour change beyond brand primary

## After-Checks
- [x] GWT-78.1–78.4 satisfied
- [x] `uv run --extra guard pytest` for touched guard tests green
- [x] CLI setupAgentHooks tests for message strings green (if present)
- [ ] Re-sync `~/.claude/skills/av-*` from repo after merge/install
- [x] No edits under `gate-evidence/` or completed historical slice filenames

## Doc Audit
- [x] MIGRATION-AGENTVETTER.md skill table still accurate (primary + alias)
- [x] agent-hooks/README.md matches av-* primary wording
- [x] Do not rewrite PROGRESS historical Tripwire rows beyond adding this slice

## Gate Status
| Gate | Status |
|------|--------|
| Spec | ✅ |
| Impl | ✅ |
| Tests | ✅ |
| Review | 🔀 |
