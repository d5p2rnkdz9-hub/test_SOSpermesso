---
phase: 02-adaptive-logic-results
plan: 01
subsystem: assessment-engine
tags: [prisma, zustand, typescript, questionnaire, branching-logic]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Basic quiz engine with single branch on Q2, session persistence, question types
provides:
  - Fully adaptive questionnaire with 12 Italian questions across 3 distinct paths
  - Option-level nextQuestionId branching (answer-specific navigation)
  - Question-level nextQuestionId branching (path jumps)
  - Dynamic path tracking for accurate progress calculation
  - coursePrompts and facilitatorNotes fields in Session model
affects: [02-02-rules-engine, 03-admin-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Option-level branching: QuestionOption.nextQuestionId controls navigation based on selected answer"
    - "Question-level branching: Question.nextQuestionId for unconditional path jumps"
    - "Dynamic path tracking: questionPath computed based on user answers and branching logic"

key-files:
  created: []
  modified:
    - prisma/schema.prisma
    - prisma/seed.ts
    - src/types/quiz.ts
    - src/store/quiz-store.ts
    - src/hooks/useQuiz.ts

key-decisions:
  - "Option-level nextQuestionId for granular answer-based branching (Q1 No → Q1b)"
  - "Question-level nextQuestionId for path jumps (Q1b → Q5, Q2d → Q4)"
  - "questionPath replaces visibleQuestions for progress calculation to show actual path length"
  - "Three paths: not-aware (4q), aware-not-working (7q), aware-working (10q)"

patterns-established:
  - "Branching hierarchy: option-level checked first, then question-level, then scan-forward"
  - "Progress bar reflects user's actual path, not total question count"

# Metrics
duration: 6min
completed: 2026-02-09
---

# Phase 02 Plan 01: Adaptive Logic & Results Summary

**12-question adaptive Italian questionnaire with option-level and question-level branching across 3 distinct user paths**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-09T22:51:29Z
- **Completed:** 2026-02-09T22:58:15Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Replaced Phase 1 questions with 12 adaptive Italian questions covering experience, satisfaction, concerns, expectations
- Implemented option-level nextQuestionId for answer-specific navigation jumps
- Implemented question-level nextQuestionId for path skips (Q1b → Q5, Q2d → Q4)
- Added questionPath tracking for accurate progress bar reflecting actual user path
- Extended Session model with coursePrompts (Json) and facilitatorNotes (String) for Phase 2 rules engine

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema update + new adaptive question data** - `b9f1703` (feat)
2. **Task 2: Upgrade branching engine for nextQuestionId navigation** - `16f29d2` (feat)

## Files Created/Modified
- `prisma/schema.prisma` - Added coursePrompts (Json) and facilitatorNotes (String) to Session model
- `prisma/seed.ts` - Replaced 10 Phase 1 questions with 12 adaptive questions with branching logic
- `src/types/quiz.ts` - Added CoursePrompt interface, updated Session interface, added FeedbackWithPrompts type
- `src/store/quiz-store.ts` - Upgraded nextQuestion() to support option-level and question-level nextQuestionId jumps
- `src/hooks/useQuiz.ts` - Added questionPath computed value, updated progress/isLastQuestion to use actual path

## Decisions Made

**1. Option-level nextQuestionId for answer-specific branching**
- Rationale: Enables different paths based on which answer user selects (Q1 "No" → Q1b, Q1 "Yes" → Q1a)
- Implementation: QuestionOption.nextQuestionId checked first in navigation logic

**2. Question-level nextQuestionId for unconditional path jumps**
- Rationale: Some questions always jump regardless of answer (Q1b → Q5, Q2d → Q4)
- Implementation: Question.nextQuestionId checked as fallback after option-level

**3. questionPath replaces visibleQuestions for progress calculation**
- Rationale: visibleQuestions shows all potentially visible questions, not user's actual path
- Impact: Progress bar now shows 4/4 for short path instead of 4/10

**4. Three distinct paths based on awareness and work usage**
- Not aware: Q1(No) → Q1b → Q5 → Q6 (4 questions)
- Aware, not working: Q1(Yes) → Q1a → Q2(No) → Q2d → Q4 → Q5 → Q6 (7 questions)
- Aware, working: Q1(Yes) → Q1a → Q2(Yes) → Q2a → Q2b → Q2c → Q3 → Q4 → Q5 → Q6 (10 questions)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Delete answers before questions in seed**
- **Found during:** Task 1 (Running seed script)
- **Issue:** Foreign key constraint violation - can't delete questions with existing answers
- **Fix:** Added logic to find existing questions, delete their answers first, then delete questions
- **Files modified:** prisma/seed.ts
- **Verification:** Seed script runs successfully
- **Committed in:** b9f1703 (Task 1 commit)

**2. [Rule 3 - Blocking] TypeScript strict mode error in questionPath**
- **Found during:** Task 2 (Build verification)
- **Issue:** Implicit 'any' type on skipIdx variable due to circular reference
- **Fix:** Added explicit type annotation `const skipIdx: number`
- **Files modified:** src/hooks/useQuiz.ts
- **Verification:** Build passes without errors
- **Committed in:** 16f29d2 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes were necessary to unblock execution. No scope changes.

## Issues Encountered

**1. Foreign key constraint on question deletion**
- Problem: Seed script tried to delete questions with existing answers
- Solution: Query existing questions first, delete answers, then delete questions
- Result: Clean seed without data integrity violations

**2. TypeScript strict mode inference issue**
- Problem: Variable used in its own initializer through circular reference
- Solution: Explicit type annotation for intermediate variable
- Result: Build passes cleanly

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 2 Plan 02:**
- Adaptive questionnaire seeded and verified
- Branching engine handles all navigation patterns
- Session model extended with coursePrompts and facilitatorNotes fields
- Progress tracking reflects actual user paths

**No blockers.**

**Next steps:**
- Plan 02-02: Build rules engine to evaluate responses and generate personalized course prompts
- Enhance feedback generation to include actionable prompts and facilitator notes

---
*Phase: 02-adaptive-logic-results*
*Completed: 2026-02-09*
