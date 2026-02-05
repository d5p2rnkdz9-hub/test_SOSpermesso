---
phase: 01-foundation-assessment-core
plan: 03
subsystem: state-management
tags: [zustand, nextjs-api, prisma, quiz-engine, branching-logic, italian]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js foundation, Prisma schema, TypeScript types
  - phase: 01-02
    provides: Quiz UI components (SingleChoice, MultipleChoice, YesNo, etc.)
provides:
  - Zustand store for client-side quiz state management
  - API routes for session creation, resumption, and answer persistence
  - QuizPlayer component orchestrating quiz flow
  - Seed data with 10 Italian questions and branching logic
  - Complete quiz page with initialization and completion screens
affects: [01-04]

# Tech tracking
tech-stack:
  added: [tsx]
  patterns: [Zustand persist middleware, Debounced auto-save, Branching logic via showCondition]

key-files:
  created:
    - src/store/quiz-store.ts
    - src/hooks/useQuiz.ts
    - src/app/api/session/route.ts
    - src/app/api/session/[id]/route.ts
    - src/app/api/answers/route.ts
    - src/components/quiz/QuizPlayer.tsx
    - src/components/quiz/NavigationButtons.tsx
    - src/app/quiz/page.tsx
    - src/app/quiz/layout.tsx
    - prisma/seed.ts
  modified:
    - src/types/quiz.ts
    - src/components/quiz/index.ts
    - package.json

key-decisions:
  - "Debounced auto-save (500ms) for answer persistence"
  - "Resume token stored in localStorage for session continuity"
  - "Branching logic evaluates showCondition at render time"
  - "YES_NO answers stored as 'true'/'false' strings for consistent comparison"

patterns-established:
  - "Quiz state management: Zustand store with persist middleware"
  - "API routes: POST for create/update, GET for resume, PATCH for completion"
  - "Branching: showCondition with questionId and operator comparison"
  - "Navigation: currentIndex tracks position, visible questions computed dynamically"

# Metrics
duration: 5min
completed: 2026-02-05
---

# Phase 01 Plan 03: Quiz Engine Summary

**Zustand quiz store with debounced auto-save, API routes for session persistence, and 10 Italian questions with Q2 branching logic**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-05T09:15:49Z
- **Completed:** 2026-02-05T09:21:15Z
- **Tasks:** 2/2
- **Files modified:** 12

## Accomplishments

- Zustand store manages quiz state with localStorage persistence for resume capability
- API routes handle session creation (POST /api/session), resumption (GET /api/session/[id]), and answer saving (POST /api/answers)
- QuizPlayer orchestrates rendering of 6 question types with proper answer handling
- 10 Italian questions seeded with branching: Q2=Si shows Q2a/Q2b/Q2c, Q2=No shows Q2d
- Complete quiz page with loading, error, and completion states

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zustand store and API routes** - `f3fd897` (feat)
2. **Task 2: Build QuizPlayer component and seed Italian questions** - `0d5f28e` (feat)

## Files Created/Modified

- `src/store/quiz-store.ts` - Zustand store with session state, answers, navigation, debounced save
- `src/hooks/useQuiz.ts` - Hook exposing computed values (progress, canGoBack, canGoNext, visibleQuestions)
- `src/app/api/session/route.ts` - POST endpoint for new session creation
- `src/app/api/session/[id]/route.ts` - GET for resume, PATCH for completion
- `src/app/api/answers/route.ts` - POST for answer upsert and currentIndex updates
- `src/components/quiz/QuizPlayer.tsx` - Main quiz orchestrator rendering questions
- `src/components/quiz/NavigationButtons.tsx` - Indietro/Avanti/Completa navigation
- `src/app/quiz/page.tsx` - Quiz entry point with init/resume/completion logic
- `src/app/quiz/layout.tsx` - Clean layout with DigiCrazy Lab branded background
- `prisma/seed.ts` - Seed script with 10 Italian questions
- `src/types/quiz.ts` - Updated ShowCondition to support boolean values
- `src/components/quiz/index.ts` - Exported new components
- `package.json` - Added db:seed script and prisma seed config

## Decisions Made

1. **Debounced auto-save (500ms)** - Prevents excessive API calls while ensuring answers persist before navigation
2. **Resume token in localStorage** - Enables session resumption even without URL parameter
3. **YES_NO as strings** - Store "true"/"false" strings for consistent comparison with showCondition values
4. **Visible questions computed dynamically** - Branching evaluated on each render based on current answers

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated ShowCondition type to include boolean**
- **Found during:** Task 1 (Zustand store creation)
- **Issue:** TypeScript errors when comparing boolean showCondition values
- **Fix:** Added `boolean` to ShowCondition.value union type
- **Files modified:** src/types/quiz.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** f3fd897

**2. [Rule 3 - Blocking] Fixed Prisma JSON null handling in seed**
- **Found during:** Task 2 (seed script)
- **Issue:** Prisma doesn't accept `null` for nullable JSON fields
- **Fix:** Used `Prisma.JsonNull` for showCondition and options
- **Files modified:** prisma/seed.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 0d5f28e

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were necessary for TypeScript compilation. No scope creep.

## Issues Encountered

**DATABASE_URL not configured** - As expected per plan instructions, `prisma db push` and `npm run db:seed` could not be run because DATABASE_URL is not set in `.env.local`. This is documented as required user setup, not a code issue.

## User Setup Required

**External service configuration required.** Before the quiz can be used:

1. **Set up Supabase database:**
   - Create new project at supabase.com
   - Go to Project Settings > Database > Connection string (URI)
   - Copy the connection string

2. **Configure environment:**
   ```bash
   # Edit .env.local
   DATABASE_URL="postgresql://..."  # Paste Supabase connection string
   ```

3. **Push schema and seed data:**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Verify:**
   - Start dev server: `npm run dev`
   - Visit http://localhost:3000/quiz
   - Should see first question: "Quali strumenti AI hai usato?"

## Next Phase Readiness

- Quiz engine complete: state management, API routes, UI components
- Ready for Plan 01-04: AI feedback generation with Claude Haiku
- Requires user to configure DATABASE_URL and run seed before testing

---
*Phase: 01-foundation-assessment-core*
*Completed: 2026-02-05*
