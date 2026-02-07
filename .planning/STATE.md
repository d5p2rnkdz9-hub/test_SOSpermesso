# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-02-04)

**Core value:** Understand what each participant knows about AI before the course starts — enabling instructors to tailor content and participants to understand their starting point.

**Current focus:** Phase 1 - Foundation & Assessment Core

## Current Position

Phase: 1 of 4 (Foundation & Assessment Core)
Plan: 4 of 4 in current phase (01-04)
Status: **DEBUGGING** - checkpoint verification failed
Last activity: 2026-02-07 - Plan 01-04 Tasks 1-2 complete, hitting "Failed to create session" error

Progress: [████████░░] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 3 (01-04 in progress)
- Average duration: 4.7 min
- Total execution time: 14 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3/4 | 14 min | 4.7 min |

**Recent Trend:**
- Last 5 plans: 01-01 (5 min), 01-02 (4 min), 01-03 (5 min)
- Trend: Stable

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

### Pending Todos

None.

### Blockers/Concerns

**ACTIVE BUG:**
- **"Failed to create session" error** when clicking "Inizia" on start screen
- Database is configured (Neon PostgreSQL) and seeded (10 Italian questions)
- `npx prisma db push` and `npm run db:seed` both succeeded
- Error occurs in POST /api/session route

**Debug next steps:**
1. Check terminal/console for actual error message
2. Inspect `src/app/api/session/route.ts` for issues
3. Test API directly: `curl -X POST http://localhost:3000/api/session -H "Content-Type: application/json" -d '{"surveyId":"ai-screening-v1"}'`
4. Check if Prisma client is connecting properly

**Resolved:**
- PostgreSQL schema design - DECIDED: JSONB for question types (flexible)
- Session management strategy - DECIDED: Debounced auto-save (500ms), resume token in localStorage
- Database setup - DONE: Neon PostgreSQL configured in .env.local and .env

**Timeline constraint:**
- Must be functional before Feb 25, 2025 course date

## Session Continuity

Last session: 2026-02-07
Stopped at: Plan 01-04 checkpoint - debugging "Failed to create session" error
Resume command: `/gsd:debug` or manually investigate POST /api/session

**Files to check:**
- `src/app/api/session/route.ts` - session creation endpoint
- `src/store/quiz-store.ts` - initSession function
- `src/app/quiz/page.tsx` - where session is initiated

---
*State initialized: 2026-02-04*
*Last updated: 2026-02-07*
