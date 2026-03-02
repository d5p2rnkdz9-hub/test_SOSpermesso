---
phase: 06-visual-identity-restyle
plan: 02
subsystem: ui
tags: [css, faq-cards, rainbow-hover, visual-identity]

# Dependency graph
requires:
  - phase: 06-visual-identity-restyle
    plan: 01
    provides: Gold palette tokens, white header, pill buttons
provides:
  - Open FAQ cards with colored left borders (blue/gold/red rotating)
  - Rainbow hover effect on cards (gradient top bar + yellow border + lift)
  - Sito_Nuovo shadow and transition system in globals.css
affects: [outcome-pages]

# Tech tracking
tech-stack:
  added: []
  patterns: [card-hover-rainbow, faq-open-cards, sito-nuovo-shadows]

key-files:
  modified:
    - src/components/outcome/FaqAccordion.tsx
    - src/app/globals.css

key-decisions:
  - "Removed Radix accordion -- FAQ sections always open (no expand/collapse)"
  - "Rainbow hover uses ::before pseudo-element with gradient, yellow border, -4px lift"
  - "Inline borderInlineStart for colored left borders (RTL-safe), CSS class for hover effect"

patterns-established:
  - "card-hover class: rainbow top bar + yellow border + translateY(-4px) + gold shadow on hover"
  - "FAQ card border rotation: #42A5F5 (blue) → #FFD700 (gold) → #FF5252 (red)"

requirements-completed: [CSS-02]

# Metrics
duration: 5min
completed: 2026-03-01
---

# Phase 06 Plan 02: FAQ Cards + Visual Verification Summary

**Open FAQ cards with colored left borders and rainbow hover effect matching sospermesso.it**

## Performance

- **Duration:** ~5 min (including checkpoint verification with user)
- **Tasks:** 2 (1 auto + 1 visual checkpoint)
- **Files modified:** 2

## Accomplishments
- Replaced Radix accordion with always-open cards (no collapse/expand)
- Each card has colored left border rotating: blue (#42A5F5) → gold (#FFD700) → red (#FF5252)
- Cards use 24px (rounded-3xl) border-radius and Sito_Nuovo shadow system
- Added `.card-hover` class with rainbow gradient top bar on hover
- User-requested CSS refinements during checkpoint:
  - Matched exact Sito_Nuovo shadow/transition/color tokens
  - Logo increased from h-[36px] to h-14/h-16
  - Buttons use gradient (FFF9C4→FFD700) instead of flat gold
  - Answer cards use shadow system with hover lift
  - Sito_Nuovo --shadow-sm/md/lg/xl and --transition-fast/base/slow vars added
  - Reduced motion support added

## Task Commits

1. **Task 1: Replace accordion with open colored-border FAQ cards** — `d6d1197`
2. **Post-checkpoint CSS fixes** — `8fa465b` (match full Sito_Nuovo design system)
3. **Rainbow hover effect** — `8bc23c0`

## Files Modified
- `src/components/outcome/FaqAccordion.tsx` — Open cards with colored left borders, card-hover class
- `src/app/globals.css` — card-hover class, Sito_Nuovo shadow/transition vars, reduced motion

## Deviations from Plan

### User-Directed Changes

**1. Logo size too small**
- Plan specified h-[36px], user said too small
- Fixed to h-14 (56px) mobile / h-16 (64px) desktop

**2. CSS didn't match sospermesso.it**
- Plan used flat gold, Sito_Nuovo uses gradients
- Thoroughly researched all Sito_Nuovo CSS files (9 files, full design system)
- Updated buttons, cards, shadows, transitions, colors to exact Sito_Nuovo tokens

**3. Rainbow hover effect (user request)**
- Not in original plan, user saw sospermesso.it cards have rainbow contour on hover
- Implemented card-hover class matching Sito_Nuovo .card::before pattern

## Issues Encountered
- Dev server lock file from executor agent blocked user's browser (fixed by cleaning .next/dev/lock)

## Self-Check: PASSED

Both modified files verified on disk. Commits d6d1197, 8fa465b, 8bc23c0 found in git log.

---
*Phase: 06-visual-identity-restyle*
*Completed: 2026-03-01*
