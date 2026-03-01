---
phase: 03-outcome-pages
plan: 01
subsystem: ui
tags: [css, design-tokens, shadcn, accordion, radix, zustand, slug-mapping]

# Dependency graph
requires:
  - phase: 02-decision-tree-engine
    provides: "Tree data with 30 result nodes, tree store with history/answers state"
provides:
  - "Blue-toned design tokens replacing yellow palette (globals.css)"
  - "shadcn/ui Accordion component (Radix-based) for FAQ sections"
  - "Bidirectional slug <-> nodeId mapping for all 30 result nodes"
  - "Lawyer-level derivation from section emoji markers"
  - "goBackTo(nodeId) store action for breadcrumb navigation"
affects: [03-02-PLAN, outcome-pages, tree-components]

# Tech tracking
tech-stack:
  added: ["@radix-ui/react-accordion"]
  patterns: ["Blue-toned design tokens", "Slug-based outcome routing", "Emoji-marker content parsing"]

key-files:
  created:
    - "src/components/ui/accordion.tsx"
    - "src/lib/outcome-slugs.ts"
    - "src/lib/lawyer-level.ts"
  modified:
    - "src/app/globals.css"
    - "src/components/layout/StickyHeader.tsx"
    - "src/components/tree/AnswerCard.tsx"
    - "src/components/tree/QuestionScreen.tsx"
    - "src/components/tree/BackButton.tsx"
    - "src/components/layout/LanguageSelector.tsx"
    - "src/app/[locale]/WelcomeContent.tsx"
    - "src/store/tree-store.ts"

key-decisions:
  - "Blue header (bg-primary) with white text for strong nautical branding"
  - "AnswerCard selected state uses bg-primary (blue) instead of bg-foreground (was black)"
  - "QuestionScreen wrapper uses bg-card with shadow instead of bg-foreground/5"
  - "Lawyer level: 6 self, 24 recommended across 30 result nodes"

patterns-established:
  - "Design token swap: change :root CSS variables for full palette restyle"
  - "Static bidirectional slug mapping for stable URL routing"
  - "Emoji-marker parsing for content-driven UI classification"

requirements-completed: [SCHED-02, SCHED-04, SCHED-07]

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 3 Plan 1: Foundation Restyle and Utilities Summary

**Blue-toned sospermesso.it palette, Radix accordion, 30-slug outcome mapping, lawyer-level derivation, and goBackTo store action**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T12:31:54Z
- **Completed:** 2026-03-01T12:35:29Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Restyled entire app from yellow/black to blue-toned palette matching sospermesso.it visual identity
- Installed shadcn/ui Accordion component for FAQ sections in outcome pages
- Created bidirectional slug mapping covering all 30 result nodes for stable outcome URLs
- Created lawyer-level utility that derives self/recommended from section emoji markers (6 self, 24 recommended)
- Added goBackTo(nodeId) action to tree store for breadcrumb-driven back navigation
- Removed RestartButton per locked user decision

## Task Commits

Each task was committed atomically:

1. **Task 1: Restyle app to sospermesso.it visual identity and install accordion** - `1e66afe` (feat)
2. **Task 2: Create outcome slug mapping, lawyer-level utility, and goBackTo store action** - `808d02b` (feat)

## Files Created/Modified
- `src/app/globals.css` - Blue-toned design tokens replacing yellow palette
- `src/components/ui/accordion.tsx` - shadcn/ui Accordion component (Radix-based)
- `src/lib/outcome-slugs.ts` - Bidirectional slug <-> nodeId mapping for 30 result nodes
- `src/lib/lawyer-level.ts` - Lawyer-needed level derivation from section emoji markers
- `src/store/tree-store.ts` - Added goBackTo(nodeId) action for breadcrumb navigation
- `src/components/layout/StickyHeader.tsx` - Blue header, RestartButton removed
- `src/components/tree/AnswerCard.tsx` - Updated colors for blue palette
- `src/components/tree/QuestionScreen.tsx` - White card background with shadow
- `src/components/tree/BackButton.tsx` - White text for blue header
- `src/components/layout/LanguageSelector.tsx` - White text/border for blue header
- `src/app/[locale]/WelcomeContent.tsx` - Updated input and card styles
- `src/components/tree/RestartButton.tsx` - Deleted (per locked decision)
- `package.json` / `package-lock.json` - Added @radix-ui/react-accordion dependency
- `tailwind.config.ts` - Accordion animation keyframes

## Decisions Made
- Blue header (bg-primary) with white text gives a strong nautical feel matching sospermesso.it
- AnswerCard selected state uses bg-primary (blue) instead of bg-foreground -- clearer visual distinction
- QuestionScreen wrapper changed from bg-foreground/5 to bg-card with shadow for better contrast on blue-gray background
- BackButton and LanguageSelector colors updated to text-primary-foreground since they sit on the dark header (Rule 1 auto-fix)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed BackButton and LanguageSelector colors for dark header**
- **Found during:** Task 1 (Restyle app)
- **Issue:** Both components used text-foreground (dark color) which would be invisible on the new bg-primary (blue) header background
- **Fix:** Changed BackButton to text-primary-foreground, LanguageSelector to text-primary-foreground with border-primary-foreground/30
- **Files modified:** src/components/tree/BackButton.tsx, src/components/layout/LanguageSelector.tsx
- **Verification:** Build passes, visual inspection confirms white text on blue header
- **Committed in:** 1e66afe (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential for visual correctness -- dark text on dark background would be unreadable. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All foundation utilities ready for Plan 02 to consume
- outcome-slugs.ts provides generateStaticParams data for outcome route
- lawyer-level.ts ready for LawyerBanner component
- goBackTo(nodeId) ready for TreeBreadcrumbs component
- Accordion component installed and ready for FaqAccordion
- Blue palette applied across all existing pages

## Self-Check: PASSED

- FOUND: src/components/ui/accordion.tsx
- FOUND: src/lib/outcome-slugs.ts
- FOUND: src/lib/lawyer-level.ts
- CONFIRMED DELETED: src/components/tree/RestartButton.tsx
- FOUND commit: 1e66afe
- FOUND commit: 808d02b

---
*Phase: 03-outcome-pages*
*Completed: 2026-03-01*
