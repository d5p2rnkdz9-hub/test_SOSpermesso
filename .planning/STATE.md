# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Help migrants quickly understand whether they can get a residence permit and exactly what to do next -- in their own language
**Current focus:** Milestone v1.1 — Polish & Translation

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-01 — Milestone v1.1 started

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 7
- Average duration: ~5min
- Total execution time: ~36min (phases 1-3)

**By Phase (v1.0):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-i18n-foundation-design-system | 3/3 | 18min | 6min |
| 02-decision-tree-engine | 3/3 | ~15min | ~5min |
| 03-outcome-pages | 1/2 | 3min | 3min |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Key decisions from v1.0 affecting v1.1:

- [01-01]: Root layout returns children only -- [locale] layout owns HTML skeleton with lang/dir
- [01-01]: DirectionProvider wrapped in client component (providers.tsx) to avoid SSR createContext error
- [01-02]: All CSS uses logical properties (ms-/me-/ps-/pe-/text-end/end-/start-)
- [02-01]: Engine functions are fully pure -- take TreeData as parameter, no module-level state
- [02-01]: optionKey values are short snake_case identifiers derived from Italian answer text
- [02-03]: useTreeHydration() hook for Zustand v5 + persist hydration tracking
- [02-03]: sessionStartedAt as canonical session indicator (userName can be null when skipped)
- [03-01]: Lawyer level derived from emoji markers: 6 self, 24 recommended across 30 nodes
- Tree data content hardcoded in Italian in tree-data.ts — needs locale-aware loading for v1.1
- sospermesso.it has X-Frame-Options: DENY — cannot iframe

### Pending Todos

None yet.

### Blockers/Concerns

- Tree graph has no loops -- validated via BFS reachability (all 75 nodes reachable, pure DAG)
- Quiz pages still at root level (not under [locale]) -- will need migration in future plan
- Back button missing/broken on multiple pages — v1.1 scope

## Session Continuity

Last session: 2026-03-01
Stopped at: Milestone v1.1 initialization
Resume with: Complete requirements definition and roadmap creation
