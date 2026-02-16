# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-14)

**Core value:** Help migrants quickly understand whether they can get a residence permit and exactly what to do next -- in their own language
**Current focus:** Phase 2 in progress -- building decision tree engine

## Current Position

Phase: 2 of 5 (Decision Tree Engine)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-16 -- Completed 02-02-PLAN.md

Progress: [################--------] 5/7 plans (Phase 1: 3/3, Phase 2: 2/3)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 6min
- Total execution time: 28min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-i18n-foundation-design-system | 3/3 | 18min | 6min |
| 02-decision-tree-engine | 2/3 | 10min | 5min |

**Recent Trend:**
- Last 5 plans: 01-02 (8min), 01-03 (3min), 02-01 (5min), 02-02 (5min)
- Trend: Consistent pace

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: RTL/i18n foundation must be Phase 1 (35x retrofitting cost avoidance)
- [Roadmap]: Validate tree engine in Italian only before adding multilingual (reduce debugging complexity)
- [Roadmap]: Arabic RTL polish folded into Phase 4 (needs real translated content to test BiDi)
- [01-01]: Root layout returns children only -- [locale] layout owns HTML skeleton with lang/dir
- [01-01]: DirectionProvider wrapped in client component (providers.tsx) to avoid SSR createContext error
- [01-01]: Fonts loaded as CSS variables (--font-sans, --font-arabic) via next/font/google
- [01-02]: Primary color is black with yellow foreground; single color mode (no .dark)
- [01-02]: All CSS uses logical properties (ms-/me-/ps-/pe-/text-end/end-/start-)
- [01-02]: Border radius standardized to 0.75rem (12px) via --radius
- [01-03]: Header has logo + language selector only (back button deferred to Phase 2)
- [01-03]: LanguageSelector uses native <select> for mobile compatibility
- [01-03]: ContentColumn is opt-in per page, not enforced at layout level
- [02-01]: Engine functions are fully pure -- take TreeData as parameter, no module-level state
- [02-01]: optionKey values are short snake_case identifiers derived from Italian answer text
- [02-01]: resultDescription field name used to disambiguate from question description
- [02-02]: Downstream discard uses set-based approach (preserved = history + current node), not indexOf
- [02-02]: Category grouping for q_situazione detected by options.length > 5
- [02-02]: No framer-motion; CSS translate + opacity sufficient for slide transitions
- [02-02]: 200ms tap delay before advancing to show selected card state

### Pending Todos

None yet.

### Blockers/Concerns

- Tree graph has no loops -- validated via BFS reachability (all 75 nodes reachable, pure DAG)
- Research flags Phase 4 may need research for Crowdin API integration specifics
- AI translation hallucination risk for legal terms (17-88% rate) -- mitigated by locked glossary approach in Phase 4
- Quiz pages still at root level (not under [locale]) -- will need migration in future plan

## Session Continuity

Last session: 2026-02-16
Stopped at: Completed 02-02-PLAN.md (tree store + UI components)
Resume file: None
