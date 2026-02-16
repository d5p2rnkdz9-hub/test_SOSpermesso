---
phase: 02-decision-tree-engine
plan: 02
subsystem: tree-player
tags: [zustand, state-management, components, transitions, localStorage]
requires:
  - phase: 02-01
    provides: tree types, tree data, engine functions
provides:
  - useTreeStore Zustand store with persist middleware
  - TreePlayer orchestrator component
  - AnswerCard, QuestionScreen, SlideTransition UI components
  - Barrel exports from components/tree/
affects: [02-03 page route integration, Phase 3 result screen]
tech-stack:
  added: []
  patterns: [zustand-persist-localStorage, tap-to-advance, downstream-discard, CSS-slide-transitions]
key-files:
  created:
    - src/store/tree-store.ts
    - src/components/tree/AnswerCard.tsx
    - src/components/tree/QuestionScreen.tsx
    - src/components/tree/SlideTransition.tsx
    - src/components/tree/TreePlayer.tsx
    - src/components/tree/index.ts
  modified: []
key-decisions:
  - "Downstream discard uses set-based approach: preserved nodes = history + current, everything else deleted"
  - "Category grouping for q_situazione detected by options.length > 5, hardcoded category-to-optionKey map"
  - "SlideTransition uses CSS translate + opacity (no framer-motion), 200ms out + 300ms in"
  - "TreePlayer disables all answer cards during 200ms transition to prevent double-tap"
duration: 5min
completed: 2026-02-16
---

# Phase 2 Plan 2: Tree Store and UI Components Summary

Zustand store with localStorage persistence and 4 tree UI components for interactive decision tree traversal with slide transitions and tap-to-advance behavior.

## What Was Built

### Task 1: Zustand Tree Store (tree-store.ts)

Created `useTreeStore` with `persist` middleware storing session under `sospermesso-tree-session` localStorage key.

**State shape:** `currentNodeId`, `answers` (nodeId -> optionKey), `history` (back-navigation stack), `userName`, `outcomeId`, `sessionStartedAt`, `isHydrated`.

**Key actions:**
- `selectOption(optionKey)`: Records answer, pushes to history, advances to next node. If user changed their mind after going back, silently discards all downstream answers using set-based comparison (any answered node not in history and not current gets deleted).
- `goBack()`: Pops from history, restores previous node. Preserves the answer at that node so it appears highlighted.
- `startSession(userName)`: Resets all state, records session start timestamp.
- `setHydrated()`: Called from `onRehydrateStorage` callback after localStorage restore completes.

**Downstream discard verified:** Simulated path start -> q_situazione -> minore_start -> min_parenti -> min_par_ita1 -> min_affido1, went back to min_parenti, changed answer from "fratello" to "nonno". Confirmed min_par_ita1 answer was correctly discarded while upstream answers preserved.

### Task 2: Tree UI Components

**AnswerCard.tsx** (49 lines): Full-width button with `min-h-[48px]` touch target, `rounded-xl border-2 border-foreground`, selected state uses `bg-foreground text-primary-foreground` (black bg/yellow text). `active:scale-[0.98]` for press feedback. `text-start` for RTL compatibility.

**QuestionScreen.tsx**: Renders question heading + vertical answer card stack. For `q_situazione` (detected by `options.length > 5`), groups options under 4 category headings: "La tua situazione personale", "Famiglia e relazioni", "Protezione e sicurezza", "Altro". Category headings are non-interactive `<h3>` elements.

**SlideTransition.tsx**: CSS transition wrapper using `translate-x-5`/`-translate-x-5` with `rtl:` variants for RTL mirroring. 200ms fade-out, then content swap on next animation frame, then 300ms ease-out fade-in. Uses `useRef` to track previous nodeId and avoid re-animating when only children content changes (e.g. selection state).

**TreePlayer.tsx**: Orchestrator that reads `currentNodeId` and `answers` from store, renders `<SlideTransition>` wrapping `<QuestionScreen>`. 200ms delay on `handleSelect` to show selected card state before advancing. `isTransitioning` flag prevents double-tap. Detects `goBack()` by subscribing to store and comparing history length to set direction to 'back'.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed downstream discard logic**
- **Found during:** Task 1 verification
- **Issue:** Original implementation looked for `currentNodeId` in history via `indexOf()`, but after `goBack()` the current node is popped OFF the history stack, so `indexOf` returned -1 and discard was skipped entirely.
- **Fix:** Changed to set-based approach: build a `preservedNodes` set from history + current node, delete answers for any node not in this set.
- **Files modified:** `src/store/tree-store.ts`
- **Commit:** 721e627

## Decisions Made

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Set-based downstream discard (preserved = history + current) | After goBack, current node is NOT in history array; indexOf-based approach fails silently |
| 2 | Category grouping detected by options.length > 5 | Only q_situazione has 9 options; avoids hardcoding node IDs in component |
| 3 | No framer-motion for transitions | CSS translate + opacity sufficient, avoids adding 30KB+ dependency |
| 4 | 200ms tap delay before advancing | Shows selected card state briefly for visual feedback before slide animation |

## Verification Results

- TypeScript: `npx tsc --noEmit` passes cleanly
- Store exports: `useTreeStore` function confirmed
- Component exports: AnswerCard, QuestionScreen, SlideTransition, TreePlayer all export
- No physical direction CSS: zero matches for text-left, ml-, mr-, pl-, pr-, left-, right-
- Downstream discard: Verified with 6-step minor path simulation
- Touch targets: min-h-[48px] confirmed on AnswerCard

## Commits

| Hash | Message |
|------|---------|
| 721e627 | feat(02-02): create Zustand tree store with persist and history stack |
| dadb171 | feat(02-02): create tree UI components with slide transitions |

## Next Phase Readiness

Plan 02-03 (page route integration) can wire `<TreePlayer>` into a route. The store and components are fully self-contained. The parent page will need to:
1. Check `outcomeId` from store to switch between TreePlayer and result display
2. Provide a back button that calls `useTreeStore.getState().goBack()`
3. Check `isHydrated` before rendering to avoid flash of initial state
