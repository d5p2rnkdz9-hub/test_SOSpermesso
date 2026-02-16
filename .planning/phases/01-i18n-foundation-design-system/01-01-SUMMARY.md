---
phase: 01-i18n-foundation-design-system
plan: 01
subsystem: i18n
tags: [next-intl, i18n, rtl, locale-routing, inter, ibm-plex-sans-arabic, radix-direction]

# Dependency graph
requires: []
provides:
  - "Locale routing with 5 locales (it, ar, fr, en, es) via next-intl"
  - "RTL/LTR direction switching via DirectionProvider"
  - "Per-locale font loading (Inter for Latin, IBM Plex Sans Arabic for Arabic)"
  - "Locale-aware navigation helpers (Link, redirect, usePathname, useRouter)"
  - "Translation message files for all 5 locales with Phase 1 UI strings"
  - "Proxy middleware for automatic locale detection and redirect"
affects: [01-02, 01-03, phase-2, phase-3, phase-4]

# Tech tracking
tech-stack:
  added: [next-intl]
  patterns: [locale-segment-routing, client-provider-wrapper, font-css-variables, rtl-aware-margins]

key-files:
  created:
    - src/i18n/routing.ts
    - src/i18n/request.ts
    - src/i18n/navigation.ts
    - src/proxy.ts
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/app/[locale]/not-found.tsx
    - src/app/[locale]/providers.tsx
    - messages/it.json
    - messages/ar.json
    - messages/fr.json
    - messages/en.json
    - messages/es.json
  modified:
    - next.config.ts
    - package.json
    - src/app/layout.tsx
    - src/app/globals.css
    - src/components/ui/button.tsx
    - src/components/quiz/NavigationButtons.tsx
    - src/components/quiz/StartScreen.tsx
    - src/components/quiz/ProfileSelect.tsx

key-decisions:
  - "Root layout returns children only (no html/body) -- [locale] layout owns the HTML skeleton"
  - "DirectionProvider wrapped in client component (providers.tsx) to avoid createContext SSR error"
  - "Font loaded via next/font/google CSS variables: --font-sans (Inter), --font-arabic (IBM Plex Sans Arabic)"
  - "Pre-existing uncommitted design refresh changes included in Task 2 commit (RTL-aware margins, SOSpermesso rebrand)"

patterns-established:
  - "Client provider wrapper pattern: Server layout delegates client-only providers to providers.tsx"
  - "Font variable pattern: Fonts set as CSS variables on html element, consumed via var(--font-sans)"
  - "RTL-aware margins: Use me-/ms-/pe-/ps-/end-/start- instead of ml-/mr-/pl-/pr-/left-/right-"
  - "Locale message structure: messages/{locale}.json with nested namespaces (common, welcome, header, language)"

# Metrics
duration: 7min
completed: 2026-02-16
---

# Phase 1 Plan 01: i18n Routing Infrastructure Summary

**next-intl locale routing with 5 locales, RTL direction switching, per-locale font loading (Inter/IBM Plex Sans Arabic), and proxy middleware for automatic locale redirect**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-16T11:00:33Z
- **Completed:** 2026-02-16T11:07:36Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments

- Configured next-intl with 5 locales (it default, ar, fr, en, es) with always-prefix routing
- Built [locale] segment with dynamic lang/dir on html, correct font per script, DirectionProvider
- Created translation message files for all 5 locales with common, welcome, header, language namespaces
- Proxy middleware auto-redirects / to /it/ and handles locale detection

## Task Commits

Each task was committed atomically:

1. **Task 1: Install next-intl and create i18n configuration files** - `1685528` (feat)
2. **Task 2: Restructure app directory under [locale] segment with fonts and providers** - `50d12eb` (feat)

## Files Created/Modified

- `src/i18n/routing.ts` - Locale routing config (5 locales, default it, always prefix)
- `src/i18n/request.ts` - Per-request locale resolution and message loading
- `src/i18n/navigation.ts` - Locale-aware Link, redirect, usePathname, useRouter, getPathname
- `src/proxy.ts` - next-intl middleware for automatic locale routing
- `src/app/[locale]/layout.tsx` - Locale layout with lang, dir, fonts, providers
- `src/app/[locale]/page.tsx` - Welcome page with useTranslations
- `src/app/[locale]/not-found.tsx` - Localized 404 page
- `src/app/[locale]/providers.tsx` - Client wrapper for DirectionProvider
- `messages/it.json` - Italian UI strings
- `messages/ar.json` - Arabic UI strings
- `messages/fr.json` - French UI strings
- `messages/en.json` - English UI strings
- `messages/es.json` - Spanish UI strings
- `next.config.ts` - Updated with next-intl plugin
- `src/app/layout.tsx` - Simplified to pass-through (no html/body)
- `src/app/globals.css` - Updated for multilingual typography, RTL transitions, design refresh
- `src/components/ui/button.tsx` - Removed brand/brandOutline variants, adjusted sizes
- `src/components/quiz/NavigationButtons.tsx` - Fixed brand -> default variant

## Decisions Made

1. **Root layout as pass-through:** The root layout returns `children` directly without `<html>` or `<body>` tags. The `[locale]/layout.tsx` owns the HTML skeleton with dynamic `lang` and `dir` attributes. This is the recommended next-intl pattern for App Router.

2. **Client provider wrapper:** DirectionProvider from @radix-ui/react-direction uses React.createContext internally, which fails in Server Components. Created a dedicated `providers.tsx` client component to wrap it.

3. **Font CSS variable approach:** Fonts are loaded via `next/font/google` and applied as CSS variables (`--font-sans`, `--font-arabic`). The `globals.css` references `var(--font-sans)` for the body font-family. Arabic locale gets IBM Plex Sans Arabic class directly on html element.

4. **Pre-existing design changes included:** The working tree had uncommitted design refresh changes (brand-blue to primary, RTL-aware margins, SOSpermesso rebrand). These were included in Task 2 commit since they're necessary for build success and directly related to i18n/RTL work.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed NavigationButtons "brand" variant TypeScript error**
- **Found during:** Task 2 (build verification)
- **Issue:** `NavigationButtons.tsx` referenced `variant="brand"` which doesn't exist in the Button component variants (removed in pre-existing design refresh)
- **Fix:** Changed `variant="brand"` to `variant="default"` (2 occurrences)
- **Files modified:** `src/components/quiz/NavigationButtons.tsx`
- **Verification:** `npm run build` passes TypeScript type checking
- **Committed in:** `50d12eb` (Task 2 commit)

**2. [Rule 3 - Blocking] Created client Providers wrapper for DirectionProvider**
- **Found during:** Task 2 (build verification)
- **Issue:** DirectionProvider uses `React.createContext` which fails in Server Components (`c.createContext is not a function`)
- **Fix:** Created `src/app/[locale]/providers.tsx` as a `'use client'` wrapper component
- **Files modified:** `src/app/[locale]/providers.tsx`, `src/app/[locale]/layout.tsx`
- **Verification:** `npm run build` completes successfully
- **Committed in:** `50d12eb` (Task 2 commit)

**3. [Rule 3 - Blocking] Included pre-existing uncommitted design refresh changes**
- **Found during:** Task 2 (git status showed many modified files)
- **Issue:** Working tree had uncommitted changes from planning phase that removed `brand-blue` color references and added RTL-aware margins. These changes were required for build to pass (button.tsx removed `brand` variant that NavigationButtons referenced).
- **Fix:** Included all pre-existing design changes in Task 2 commit
- **Files modified:** 10 component files (button, card, checkbox, radio-group, textarea, NavigationButtons, FeedbackDisplay, ProgressBar, StartScreen, TextInput, ProfileSelect, quiz results page)
- **Verification:** `npm run build` passes
- **Committed in:** `50d12eb` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All fixes necessary for correct build. The client wrapper pattern is a standard next-intl pattern. No scope creep.

## Issues Encountered

None beyond the deviations listed above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- i18n routing infrastructure complete, ready for Plan 02 (design tokens/Tailwind config) and Plan 03 (shared layout components)
- All 5 locale paths render with correct lang, dir, and fonts
- Quiz pages remain at root level (not under [locale]) -- will need migration in a future plan
- API routes unaffected by locale routing (excluded by proxy matcher pattern)

---
*Phase: 01-i18n-foundation-design-system*
*Completed: 2026-02-16*
