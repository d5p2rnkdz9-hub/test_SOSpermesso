---
phase: 02-decision-tree-engine
plan: 03
subsystem: tree-integration
tags: [nextjs, zustand, hydration, routing, welcome-page, back-navigation]

# Dependency graph
requires:
  - phase: 02-01
    provides: tree types, tree data, engine functions
  - phase: 02-02
    provides: Zustand tree store, TreePlayer, AnswerCard, QuestionScreen, SlideTransition
  - phase: 01-i18n-foundation-design-system
    provides: StickyHeader, ContentColumn, i18n routing, locale layout
provides:
  - /[locale]/tree route with hydration-safe tree rendering
  - Welcome page with name input, skip option, and session start
  - Header back button with RTL arrow mirroring
  - End-to-end decision tree flow (welcome -> questions -> outcome -> session resume)
  - useTreeHydration() hook pattern for Zustand v5 + persist
affects:
  - Phase 3 (outcome pages will extend TreeContent outcome display)
  - Phase 4 (multilingual content will add tree translations)

# Tech tracking
tech-stack:
  added: []
  patterns: [useTreeHydration-hook, server-client-component-split, session-redirect-guard]

key-files:
  created:
    - src/app/[locale]/tree/page.tsx
    - src/app/[locale]/tree/TreeContent.tsx
    - src/app/[locale]/WelcomeContent.tsx
    - src/components/tree/BackButton.tsx
  modified:
    - src/app/[locale]/page.tsx
    - src/components/layout/StickyHeader.tsx
    - src/components/tree/index.ts
    - src/store/tree-store.ts
    - messages/ar.json
    - messages/en.json
    - messages/es.json
    - messages/fr.json

key-decisions:
  - "useTreeHydration() hook with useState + useEffect + persist.hasHydrated() for Zustand v5 client-only hydration tracking"
  - "Redirect guard uses sessionStartedAt === null (not userName) since name can be skipped"
  - "Server/client component split: page.tsx (server) renders WelcomeContent/TreeContent (client)"

patterns-established:
  - "useTreeHydration pattern: external hook for Zustand persist hydration detection, avoids in-store isHydrated flag that breaks with v5 useSyncExternalStore"
  - "Session redirect guard: sessionStartedAt as canonical session indicator"

# Metrics
duration: multi-session
completed: 2026-02-16
---

# Phase 2 Plan 3: Integration Summary

**Tree page route with Zustand v5 hydration fix, welcome page name input, header back button, and end-to-end decision tree flow from welcome to outcome with session persistence.**

## Performance

- **Duration:** Multi-session (debugging required across sessions)
- **Tasks:** 3/3 (2 auto tasks + 1 checkpoint, plus 2 bug fix deviations)
- **Files created:** 4
- **Files modified:** 8

## Accomplishments
- Wired tree engine, store, and UI components into a working end-to-end flow
- Created /[locale]/tree route with hydration guard, outcome display, and question rendering
- Built welcome page with name input, skip option, explainer text, legal disclaimer, and auto-resume
- Added back button to StickyHeader with RTL arrow mirroring
- Fixed Zustand v5 hydration bug (isHydrated permanently false due to useSyncExternalStore + persist middleware interaction)
- Fixed redirect guard (sessionStartedAt instead of userName for skipped-name sessions)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create tree page route and TreeContent orchestrator** - `865a0cc` (feat)
2. **Task 2: Update welcome page with name input and add back button to header** - `3d179f2` (feat)
3. **Bug fix: Redirect guard using wrong field** - `bb6445f` (fix)
4. **Bug fix: Zustand v5 hydration preventing first question render** - `186c00a` (fix)
5. **Task 3: Checkpoint (human-verify)** - Passed, user confirmed "it works!"

## Files Created/Modified

- `src/app/[locale]/tree/page.tsx` - Server component for /tree route with setRequestLocale
- `src/app/[locale]/tree/TreeContent.tsx` - Client orchestrator: hydration guard, redirect guard, outcome display, TreePlayer rendering
- `src/app/[locale]/WelcomeContent.tsx` - Client component: name input, skip option, explainer, disclaimer, auto-resume for returning users
- `src/app/[locale]/page.tsx` - Simplified to server wrapper rendering WelcomeContent
- `src/components/tree/BackButton.tsx` - Header back button with RTL arrow rotation, hidden when at first question
- `src/components/layout/StickyHeader.tsx` - Updated layout to include BackButton before logo
- `src/components/tree/index.ts` - Added BackButton export
- `src/store/tree-store.ts` - Removed in-store isHydrated; added useTreeHydration() hook
- `messages/ar.json` - Tree UI strings (Arabic)
- `messages/en.json` - Tree UI strings (English)
- `messages/es.json` - Tree UI strings (Spanish)
- `messages/fr.json` - Tree UI strings (French)

## Decisions Made

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | useTreeHydration() hook instead of in-store isHydrated | Zustand v5 uses useSyncExternalStore which calls getInitialState() for server snapshot; persist middleware never updates getInitialState after hydrate(), so in-store isHydrated was permanently false during React hydration |
| 2 | sessionStartedAt as session indicator | userName can be null when user skips name entry; sessionStartedAt is always set on startSession |
| 3 | Server/client split for welcome and tree pages | Next.js App Router requires setRequestLocale in server components; interactive content extracted to client components |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Redirect guard used wrong session indicator**
- **Found during:** Checkpoint verification (Task 3)
- **Issue:** TreeContent redirect guard checked `userName === null` to detect no session, but userName is legitimately null when user skips name entry. This caused immediate redirect back to welcome after skipping name.
- **Fix:** Changed guard to `sessionStartedAt === null` which is always set on startSession regardless of name.
- **Files modified:** `src/app/[locale]/tree/TreeContent.tsx`
- **Verification:** Skip name flow now correctly navigates to /tree without redirecting
- **Committed in:** `bb6445f`

**2. [Rule 1 - Bug] Zustand v5 hydration preventing first question render**
- **Found during:** Post-checkpoint debugging (page showed loading spinner indefinitely)
- **Issue:** Zustand v5 switched to useSyncExternalStore internally. This uses getInitialState() as the server snapshot, but persist middleware never updates getInitialState after hydrate(). The in-store `isHydrated` flag was permanently `false` during React hydration, causing the loading spinner to never resolve.
- **Fix:** Removed in-store `isHydrated` state and `setHydrated` action. Created `useTreeHydration()` hook using `useState(false)` + `useEffect` + `persist.hasHydrated()` and `persist.onFinishHydration()` for purely client-side hydration tracking that bypasses useSyncExternalStore.
- **Files modified:** `src/store/tree-store.ts`, `src/app/[locale]/tree/TreeContent.tsx`, `src/app/[locale]/WelcomeContent.tsx`
- **Verification:** First question renders immediately after startSession; returning users see resumed question
- **Committed in:** `186c00a`

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes essential for basic operation. Bug 1 broke skip-name flow. Bug 2 broke all tree rendering. No scope creep.

## Issues Encountered

- **Zustand v5 + persist + useSyncExternalStore interaction:** This was a non-obvious framework-level issue. The standard Zustand persist pattern of setting isHydrated in onRehydrateStorage worked in v4 but breaks in v5 because useSyncExternalStore's server snapshot (getInitialState) is never updated. The fix establishes a new pattern (useTreeHydration hook) documented in MEMORY.md for future reference.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 (Decision Tree Engine) is fully complete
- All 8 main paths reachable and terminating at correct outcomes
- Session persistence, back navigation, and downstream discard all verified
- Outcome display is minimal (title, description, requirements) -- Phase 3 will build rich outcome pages
- Tree UI is Italian-only -- Phase 4 will add multilingual content
- useTreeHydration pattern established for any future Zustand persist usage

---
*Phase: 02-decision-tree-engine*
*Completed: 2026-02-16*
