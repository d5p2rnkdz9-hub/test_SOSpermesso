# Phase 1: i18n Foundation + Design System - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

RTL-safe layout scaffold with CSS logical properties, visual identity replacing the Corso AI aesthetic, and mobile-first responsive design. This phase delivers the design system foundation — not content, not the decision tree, not outcome pages.

</domain>

<decisions>
## Implementation Decisions

### Color palette
- Taxi yellow, black, white — bold, high-contrast identity
- Yellow is the dominant background color (large surfaces, primary feel)
- Black buttons/interactive elements on yellow for maximum contrast
- Flat design, no shadows — elements defined by borders and color contrast
- Reference feel: IKEA / Bumble — friendly but bold, consumer-friendly warmth despite high contrast

### Typography
- Geometric sans-serif for Latin script (Inter, Poppins family)
- Large, generous text sizing — one question fills the screen, calming, impossible to miss
- Bold headings, regular weight body text — clear visual hierarchy
- Multi-script: Arabic typeface harmonizing with Latin choice (Claude's discretion on specific font)

### Component personality
- Answer options: outlined cards (black border on yellow), filling black on selection
- Rounded corners (12-16px) — friendly, approachable, Bumble-like
- Flat / no shadows — clean, graphic feel
- Smooth slide transitions between questions — guided flow feeling

### Mobile layout & navigation
- Sticky header + scrollable content area
- Header contains: SOSpermesso logo (left), back button, language selector (right)
- Logo links to sospermesso.it (matching language page)
- Back button on first question goes to welcome/start screen
- Centered narrow column on desktop/tablet (max-width ~480-600px) — mobile-first, consistent experience
- Welcome screen: minimal — logo, one line explanation, big "Start" button

### Language selector
- Language names displayed in native script ("Italiano", "العربية", "Français", etc.) — no flags
- Dropdown menu interaction (tap current language → dropdown with all 5 options)
- Language encoded in URL path (e.g., /en/, /ar/, /it/) — users land from corresponding sospermesso.it language pages

### Claude's Discretion
- Exact Arabic typeface selection (must pair with Latin geometric sans-serif)
- Exact yellow hex value and tint variations for hover/active states
- Spacing system and grid details
- Error state visual treatment
- Loading skeleton design
- Exact transition timing and easing curves

</decisions>

<specifics>
## Specific Ideas

- "IKEA / Bumble feel" — friendly but bold yellow + black, consumer-friendly warmth
- Language URLs should match sospermesso.it structure — users land from /en, /fr pages on the main site
- Each outcome page should link to the relevant sospermesso.it page for that specific permit type (Phase 3 implementation, but design system should account for external link patterns)

</specifics>

<deferred>
## Deferred Ideas

- Contextual links from outcome pages to specific sospermesso.it permit pages — Phase 3 (Outcome Pages)

</deferred>

---

*Phase: 01-i18n-foundation-design-system*
*Context gathered: 2026-02-16*
