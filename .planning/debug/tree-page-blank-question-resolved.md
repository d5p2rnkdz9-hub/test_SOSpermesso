---
status: verifying
trigger: "tree-page-blank-question: Tree page doesn't show first question after navigating from welcome page"
created: 2026-02-16T00:00:00Z
updated: 2026-02-16T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - Zustand persist's getInitialState() (used as getServerSnapshot) always returns pre-hydration state with isHydrated:false, preventing React components from ever seeing isHydrated:true during hydration.
test: Fix applied - replaced store-level isHydrated with useTreeHydration() hook using useEffect + persist.hasHydrated()
expecting: TypeScript compiles, build passes, question renders after client hydration
next_action: Verify fix - needs browser testing by user

## Symptoms

expected: After entering name (or skipping) on welcome page, navigating to tree page should show the first question of the decision tree
actual: Tree page appears but the first question is missing/blank - nothing renders in the question area
errors: Not yet checked - investigate browser-side behavior through code analysis
reproduction: Navigate from welcome page (enter name or skip) to tree page
started: Never worked - broken since initial implementation

## Eliminated

- hypothesis: Tree data or engine bug (missing start node, wrong node type)
  evidence: Verified via test script - getNode(italianTree, 'start') returns valid question node, getOptionsForNode returns 2 edges, TreePlayer would NOT return null
  timestamp: 2026-02-16

- hypothesis: Redirect guard redirecting user away from tree page
  evidence: After startSession, sessionStartedAt is non-null. The guard checks sessionStartedAt === null, which is false. No redirect occurs.
  timestamp: 2026-02-16

- hypothesis: CSS purging removes opacity-100 or translate-x-0 classes
  evidence: Checked generated CSS from dev server - all classes present (opacity-0, opacity-100, translate-x-0, translate-x-5, transition-all)
  timestamp: 2026-02-16

- hypothesis: SlideTransition initial render hides content
  evidence: On first mount, visible=true (opacity-100) and displayedChildren=children. No animation trigger on first render (nodeId matches previousNodeIdRef). Content should be visible immediately.
  timestamp: 2026-02-16

- hypothesis: Code logic error in TreeContent/TreePlayer render path
  evidence: Traced every branch: isHydrated guard -> redirect guard -> outcome check -> TreePlayer. For active session with currentNodeId='start', all guards pass, TreePlayer renders QuestionScreen with valid node and 2 options.
  timestamp: 2026-02-16

## Evidence

- timestamp: 2026-02-16
  checked: Server-rendered HTML of /it/tree page (via curl)
  found: HTML contains spinner (Loader2 with animate-spin class) but NOT the question text "Hai la cittadinanza". This confirms SSR renders the hydration guard spinner.
  implication: On SSR, isHydrated is false (expected). The question should appear after client-side hydration.

- timestamp: 2026-02-16
  checked: Zustand v5 source code (react.mjs line 6-9 and middleware.mjs line 376)
  found: useSyncExternalStore uses getInitialState() as getServerSnapshot (third arg). Persist middleware overrides api.getInitialState to return configResult (pre-hydration state). configResult always has isHydrated:false. Even though hydrate() updates actual state to isHydrated:true, getInitialState() is never updated. This is the root cause.
  implication: Store-level isHydrated flag is fundamentally incompatible with Zustand v5's useSyncExternalStore pattern. Components never see isHydrated:true during React hydration.

- timestamp: 2026-02-16
  checked: Zustand persist hydrate() synchronous execution with localStorage
  found: toThenable wraps sync localStorage reads in synchronous .then() chain. hydrate() completes synchronously during module evaluation. Store state has isHydrated:true before any React component renders.
  implication: The store IS hydrated, but getInitialState() doesn't reflect this.

- timestamp: 2026-02-16
  checked: Standard pattern for Zustand persist + Next.js (official docs, GitHub issues)
  found: Known issue. Recommended fix is component-level useEffect with persist.hasHydrated() / onFinishHydration.
  implication: Fix implemented using this pattern.

- timestamp: 2026-02-16
  checked: Fix verification - TypeScript and build
  found: npx tsc --noEmit passes. npx next build succeeds. No references to removed isHydrated store property remain in codebase.
  implication: Fix is structurally sound. Needs browser testing.

## Resolution

root_cause: Zustand v5's useSyncExternalStore (react.mjs) uses api.getInitialState() as the getServerSnapshot parameter. The persist middleware (middleware.mjs) overrides getInitialState to return the pre-hydration configResult object, which always has isHydrated:false. Even though hydrate() runs synchronously and updates the actual state (getState()) to isHydrated:true, getInitialState() is stale. During SSR and React hydration, components read isHydrated:false from getServerSnapshot. The transition from getServerSnapshot to getSnapshot after hydration should trigger a re-render, but this mechanism is unreliable with React 19 + Next.js 16 + Zustand v5, causing the spinner to persist indefinitely.

fix: Replaced store-level isHydrated/setHydrated/onRehydrateStorage with a component-level useTreeHydration() hook. The hook uses useState(false) + useEffect + persist.hasHydrated() + persist.onFinishHydration() to track hydration. This guarantees: (1) SSR renders false (matches server HTML, no mismatch), (2) client hydration renders false (matches server HTML), (3) useEffect fires client-only, checks hasHydrated() which is true (localStorage is sync), sets isHydrated=true, triggering clean re-render that shows the question.

verification: TypeScript passes, build passes. Needs human browser verification.

files_changed:
  - src/store/tree-store.ts (removed isHydrated/setHydrated from state and actions, removed onRehydrateStorage from persist config, added useTreeHydration hook)
  - src/app/[locale]/tree/TreeContent.tsx (replaced useTreeStore isHydrated selector with useTreeHydration hook)
  - src/app/[locale]/WelcomeContent.tsx (replaced useTreeStore isHydrated selector with useTreeHydration hook)
