---
phase: 01-i18n-foundation-design-system
plan: 03
subsystem: ui
tags: [next-intl, layout, rtl, language-selector, welcome-page]

requires:
  - phase: 01-01
    provides: "i18n routing, locale-aware navigation, message files"
  - phase: 01-02
    provides: "SOSpermesso design tokens, RTL-safe components, button variants"
provides:
  - "StickyHeader with logo and language selector"
  - "LanguageSelector with native script names and soft locale switching"
  - "ContentColumn centered narrow wrapper (520px)"
  - "Welcome/start page with translated content in 5 locales"
affects: [decision-tree-engine, outcome-pages]

tech-stack:
  added: []
  patterns:
    - "Layout components in src/components/layout/"
    - "Server components with setRequestLocale for static rendering"
    - "Client islands for interactive elements (LanguageSelector)"

key-files:
  created:
    - "src/components/layout/StickyHeader.tsx"
    - "src/components/layout/LanguageSelector.tsx"
    - "src/components/layout/ContentColumn.tsx"
  modified:
    - "src/app/[locale]/layout.tsx"
    - "src/app/[locale]/page.tsx"

key-decisions:
  - "Header has logo + language selector only (no back button until Phase 2)"
  - "LanguageSelector uses native <select> for maximum mobile compatibility"
  - "ContentColumn is opt-in per page, not enforced at layout level"
  - "Start button links to /tree (Phase 2) -- 404 is expected for now"

duration: 3min
completed: 2026-02-16
---

# Phase 1 Plan 03: Layout Components + Welcome Page Summary

**StickyHeader with language selector, ContentColumn wrapper, and translated welcome page -- verified in LTR, RTL, and 320px mobile**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-16T11:12:00Z
- **Completed:** 2026-02-16T11:15:00Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 5

## Accomplishments
- StickyHeader with SOSpermesso logo and LanguageSelector -- auto-mirrors in RTL via flexbox
- LanguageSelector shows native script names (Italiano, العربية, Français, English, Español) with soft locale switching
- ContentColumn constrains content to centered 520px column with mobile padding
- Welcome page with translated title, subtitle, Start button, and disclaimer in all 5 locales
- Human verification passed: visual identity, RTL mirroring, 320px mobile, language switching all confirmed

## Task Commits

Each task was committed atomically:

1. **Task 1: Build layout components** - `9075d07` (feat)
2. **Task 2: Build welcome/start page** - `4ceabb9` (feat)
3. **Task 3: Visual verification checkpoint** - human-approved

**Plan metadata:** (this commit)

## Files Created/Modified
- `src/components/layout/StickyHeader.tsx` - Sticky header with logo and language selector
- `src/components/layout/LanguageSelector.tsx` - Locale-switching dropdown with native script names
- `src/components/layout/ContentColumn.tsx` - Centered narrow content column (max-w-[520px])
- `src/app/[locale]/layout.tsx` - Updated to include StickyHeader
- `src/app/[locale]/page.tsx` - Welcome page with translated content

## Decisions Made
- Header shows logo + language selector only for Phase 1 (back button added in Phase 2 with tree navigation)
- LanguageSelector uses native `<select>` element for maximum accessibility and mobile compatibility
- ContentColumn is used per-page, not enforced at layout level -- individual pages choose their layout
- Start button href="/tree" will 404 until Phase 2 builds the decision tree -- acceptable for Phase 1

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 complete: i18n routing, visual identity, RTL support, layout components, welcome page all working
- Ready for Phase 2: Decision Tree Engine
- /tree route needs to be created in Phase 2

---
*Phase: 01-i18n-foundation-design-system*
*Completed: 2026-02-16*
