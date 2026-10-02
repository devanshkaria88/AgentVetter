# Slice 68 — Module Contract (parallel streams)

**Worktree:** `.worktrees/slice-68-workflow-run-triage-investigate`
**Branch:** `slice/68-workflow-run-triage-investigate`
**UI surface:** 1A — extend `prototypes/dc-dashboard/` only
**Commit only when orchestrator asks** — agents write code + tests; do not commit.

## Invariants
- Never colour-only status (pair colour with text/icon/`aria-current`)
- No findings ≠ safe
- Keyboard accessible (buttons, tabs, `aria-*`)
- Simple view default; Expert off hides jargon/raw judge IDs
- Slice 67 may not be landed — tolerate missing `judgePanel` fields with honest placeholders

## Files (one owner each — do not edit another stream's file)

| Stream | File | Owns |
|--------|------|------|
| A Stepper | `agentvetter-workflow-stepper.js` | Step ids, labels, `buildStepperView(state)`, current-step highlight helpers |
| B Run | `agentvetter-run-progress.js` | Scanner rows + judge progress `N of M answered` |
| C Triage | `agentvetter-triage.js` | Headline, tabs (to_fix / needs_review / dismissed), severity sort, coverage honesty |
| D Investigate | `agentvetter-investigate.js` | Ordered sections + collapsed "How we decided" |
| E Prefs | `agentvetter-workflow-prefs.js` | Expert toggle + triage decision persistence by stable finding id |
| F Tests | `test/agentvetter-workflow.test.js` | GWT-68.1–68.6 unit tests against A–E exports |
| G Wire | `AgentVetter.dc.html` + optional CSS in same file | Mount stepper chrome; call A–E; **only G edits HTML** |

## Shared state shape (passed into pure builders)

```js
{
  currentStep: 'run'|'triage'|'investigate'|'fix'|'verify'|'report',
  expertMode: boolean,           // default false
  selectedFindingId: string|null,
  scanners: [{ target, scanner, status, candidates, errors }],
  judges: { answered: number, total: number, slots: [{ slot, verdict, confidence, status }] },
  findings: [{
    id, title, severity,          // High|Medium|Low
    triageStatus: 'to_fix'|'needs_review'|'dismissed',
    evidenceHighlight, source, sink, explanation, verdictLine,
    attackPath, prerequisites, evidenceVerification,
    howWeDecided: { judges, final, rawIds }, // Expert
    agreement: string
  }],
  coverage: { discovered, scanned, failed, skipped },
  triageFilter: 'all'|'to_fix'|'needs_review'|'dismissed'|null
}
```

## Export requirements

### A `agentvetter-workflow-stepper.js`
- `WORKFLOW_STEPS` — frozen array of `{ id, label }` in order Run→…→Report
- `buildStepperView({ currentStep })` → `{ steps: [{ id, label, current, stateLabel }] }`
  - `stateLabel`: `'current'|'complete'|'upcoming'` (text, not colour-only)
  - `current` true only for `currentStep`

### B `agentvetter-run-progress.js`
- `buildRunProgressView({ scanners, judges })` →
  `{ scannerRows: [...], judgesSummary: 'N of M judges answered', judgeSlots: [...] }`

### C `agentvetter-triage.js`
- `buildTriageView({ findings, coverage, triageFilter })` →
  `{ headline, tabs, filteredFindings (severity-sorted), coverageHonesty }`
- headline summarises counts of to_fix / needs_review / dismissed

### D `agentvetter-investigate.js`
- `buildInvestigateView({ finding, expertMode })` →
  `{ sections: [{ id, title, body, collapsed? }], hiddenInSimple: string[] }`
- Section order: title_severity → evidence → source_sink → explanation → verdict → attack_path → prerequisites → evidence_verification → how_we_decided (collapsed default)
- When `expertMode===false`, omit jargon-heavy IDs/raw judges from visible sections

### E `agentvetter-workflow-prefs.js`
- `loadExpertMode(storage=sessionStorage)` / `saveExpertMode(bool, storage)`
- `stableFindingId(finding)` — use `finding.id` or hash of title+severity+evidence
- `loadTriageDecision(id, storage=localStorage)` / `saveTriageDecision(id, status, storage)`
- `applyPersistedTriage(findings, storage)` — overlay stored statuses

## GWT mapping (smoke)
1. Stepper always 6 steps; current not colour-alone → A
2. Run scanner rows + judges N of M → B
3. Triage headline/tabs/coverage → C
4. Investigate order + how_we_decided collapsed → D
5. Simple hides jargon → D+E
6. Persistence by stable id → E

## Style
- ESM `export` only; no inline imports
- Pure functions where possible; max ~20 lines/function
- Match existing dashboard tokens (`var(--text-*)`, `--font-mono`, etc.) when G wires UI
