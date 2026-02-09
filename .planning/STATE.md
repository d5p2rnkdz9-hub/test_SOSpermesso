# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-02-04)

**Core value:** Understand what each participant knows about AI before the course starts — enabling instructors to tailor content and participants to understand their starting point.

**Current focus:** Phase 1 - Foundation & Assessment Core

## Current Position

Phase: 2 of 4 (Adaptive Logic & Results) - **IN PROGRESS**
Plan: 1 of 2 in current phase (02-01) - **COMPLETE**
Status: **IN PROGRESS**
Last activity: 2026-02-09 - Completed 02-01-PLAN.md

Progress: [█████████████░░░░] 50% (Phase 2)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 7.0 min
- Total execution time: 35 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 4/4 | 29 min | 7.3 min |
| 02 | 1/2 | 6 min | 6.0 min |

**Recent Trend:**
- Last 4 plans: 01-02 (4 min), 01-03 (5 min), 01-04 (15 min), 02-01 (6 min)
- Trend: Stable, Phase 2 started efficiently

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Plan | Decision | Rationale |
|------|----------|-----------|
| 01-01 | Prisma 5.22.0 over 7.x | Prisma 7 breaking changes; v5 simpler setup |
| 01-01 | JSONB for question options/answers | Flexible storage without schema changes per type |
| 01-02 | Card-style selection UI | Clickable cards vs plain radio/checkbox for better UX |
| 01-02 | Click-to-rank (no drag-drop) | Simpler, works on all devices |
| 01-03 | Debounced auto-save (500ms) | Prevents excessive API calls while ensuring persistence |
| 01-03 | YES_NO as strings ("true"/"false") | Consistent comparison with showCondition values |
| 01-04 | Neon for PostgreSQL | User chose Neon over Supabase for database hosting |
| 01-04 | Claude Haiku for feedback | Cost-effective, fast Italian feedback generation |
| 01-04 | Single restart button | Clearer UX than separate home/restart buttons |
| 02-01 | Option-level nextQuestionId | Answer-specific branching for granular navigation |
| 02-01 | Question-level nextQuestionId | Unconditional path jumps for skip logic |
| 02-01 | questionPath for progress | Actual user path vs all visible questions |
| 02-01 | Three paths by awareness/usage | Not-aware (4q), aware-not-working (7q), aware-working (10q) |

### Pending Todos

None.

### Blockers/Concerns

**TECH DEBT:**
- [x] Verify Netlify DATABASE_URL matches local .env.local — VERIFIED: same Neon instance
- [x] Test production quiz flow end-to-end — WORKING after fresh deploy (2026-02-09)

**Resolved:**
- PostgreSQL schema design - DECIDED: JSONB for question types (flexible)
- Session management strategy - DECIDED: Debounced auto-save (500ms), resume token in localStorage
- Database setup - DONE: Neon PostgreSQL configured in .env.local and .env
- "Failed to create session" bug - FIXED: Session API working correctly
- Session restart - FIXED: "Ricomincia il test" button clears localStorage
- Next.js security vulnerability - FIXED: Updated to 16.1.6 (CVE-2025-55182)
- Netlify Suspense boundary - FIXED: Split quiz page for useSearchParams
- Netlify Prisma client - FIXED: Added postinstall script

**Timeline constraint:**
- Must be functional before Feb 25, 2025 course date
- Phase 1 complete, Phase 2 Plan 01 complete - on track

## Session Continuity

Last session: 2026-02-09
Stopped at: Completed 02-01-PLAN.md
Resume command: `/gsd:execute-phase 2` to continue with plan 02-02

**Phase 2 Plan 01 deliverables:**
- Adaptive questionnaire with 12 Italian questions
- Option-level and question-level branching
- Three distinct paths: not-aware (4q), aware-not-working (7q), aware-working (10q)
- Dynamic path tracking for accurate progress
- Session model extended with coursePrompts and facilitatorNotes

**Next steps:**
- Phase 2 Plan 02: Rules engine, enhanced feedback, course prompts, results UI
- Phase 3: Admin Dashboard (view responses, export)
- Phase 4: Production Readiness (polish, pre-launch validation)

---
*State initialized: 2026-02-04*
*Last updated: 2026-02-09*
