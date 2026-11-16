# Phase 3: Outcome Pages - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build 25 legal guidance pages ("schede") that display when the decision tree terminates. Each scheda shows structured legal information with variable substitution, a lawyer-needed indicator, and a stable shareable URL. Also restyle the entire app (tree + outcome pages) to match sospermesso.it visual identity.

</domain>

<decisions>
## Implementation Decisions

### Section layout
- FAQ sections use accordion — first section open by default, rest collapsed
- Page structure top-to-bottom: breadcrumbs → title → lawyer banner → intro text (truncated) → FAQ accordion → links summary → legal disclaimer
- Links appear both inline within relevant FAQ sections AND as a summary block at the bottom
- Legal disclaimer at bottom only (users already see one at quiz start)

### Intro text truncation
- Intro text truncated after 5 lines with "Leggi di più..." to expand
- Short intros (under 5 lines) show fully — no truncation

### Lawyer-needed indicator
- Full-width colored banner/strip between title and intro text
- Two levels:
  - Green: "Puoi fare da solo" — no lawyer needed
  - Orange/Red: "È meglio parlare con un consulente legale" — lawyer recommended
- NOT a certainty indicator — it answers "do I need a lawyer?"

### Navigation
- Full tree path breadcrumbs (clickable, each answer shown as a crumb to jump back to that question)
- Breadcrumbs truncated on mobile (show last 2 crumbs + "..." for the rest, expandable)
- Back button in header (same as tree pages)
- No restart button — removed to reduce clutter
- Header same as tree pages: logo + language selector

### Direct URL access
- Each of the 25 schede has its own stable URL (e.g. /it/outcome/protezione-internazionale)
- No special handling for direct access without tree context — page renders as-is

### Links to sospermesso.it
- Outcome pages link to relevant live sospermesso.it guide pages
- Links appear inline in relevant FAQ sections + in the summary block at bottom

### CSS restyle
- Restyle entire app (tree question pages + outcome pages) to match sospermesso.it visual identity
- Included in Phase 3 scope, not deferred

### Claude's Discretion
- Exact accordion animation/transition
- Link summary block styling — skip if scheda has only 1-2 links (inline sufficient)
- Breadcrumb truncation breakpoint and expand behavior
- Mapping existing scheda "Mi serve un avvocato?" content to the two-level banner indicator
- URL slug naming convention for the 25 schede

</decisions>

<specifics>
## Specific Ideas

- Lawyer banner inspired by the existing emoji indicators in scheda content (🟢 "No, puoi fare tutto da solo" / 🟠 "Puoi fare tutto da solo, ma prima... consulta un esperto")
- Breadcrumbs show the actual path through the tree, not a site structure breadcrumb
- "Leggi di più..." on truncated intros — not a separate page, just an expand-in-place

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-outcome-pages*
*Context gathered: 2026-03-01*
