# Phase 3: Outcome Pages - Research

**Researched:** 2026-03-01
**Domain:** Next.js dynamic routes, Radix accordion, breadcrumb navigation, content data architecture, CSS restyle
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- FAQ sections use accordion -- first section open by default, rest collapsed
- Page structure top-to-bottom: breadcrumbs -> title -> lawyer banner -> intro text (truncated) -> FAQ accordion -> links summary -> legal disclaimer
- Links appear both inline within relevant FAQ sections AND as a summary block at the bottom
- Legal disclaimer at bottom only (users already see one at quiz start)
- Intro text truncated after 5 lines with "Leggi di piu..." to expand; short intros (under 5 lines) show fully
- Lawyer-needed indicator is a full-width colored banner/strip between title and intro text
  - Green: "Puoi fare da solo" -- no lawyer needed
  - Orange/Red: "E meglio parlare con un consulente legale" -- lawyer recommended
  - NOT a certainty indicator -- answers "do I need a lawyer?"
- Full tree path breadcrumbs (clickable, each answer shown as a crumb to jump back to that question)
- Breadcrumbs truncated on mobile (show last 2 crumbs + "..." for the rest, expandable)
- Back button in header (same as tree pages)
- No restart button -- removed to reduce clutter
- Header same as tree pages: logo + language selector
- Each of the 25 schede has its own stable URL (e.g. /it/outcome/protezione-internazionale)
- No special handling for direct access without tree context -- page renders as-is
- Outcome pages link to relevant live sospermesso.it guide pages (inline + summary block)
- Restyle entire app (tree question pages + outcome pages) to match sospermesso.it visual identity -- included in Phase 3 scope

### Claude's Discretion
- Exact accordion animation/transition
- Link summary block styling -- skip if scheda has only 1-2 links (inline sufficient)
- Breadcrumb truncation breakpoint and expand behavior
- Mapping existing scheda "Mi serve un avvocato?" content to the two-level banner indicator
- URL slug naming convention for the 25 schede

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCHED-01 | Rich legal guidance per outcome (permit type, eligibility, how to apply, lawyer needed, duration, rights) | Existing `ResultSection[]` in tree-data.ts already contains this content in `sections` array. Accordion pattern renders each section as collapsible FAQ item. |
| SCHED-02 | Confidence indicators (certain vs uncertain outcomes) | User decided NOT to implement confidence indicators. Instead: lawyer-needed banner (green/orange) derived from "Mi serve un avvocato?" section content. See Pattern 3 below. |
| SCHED-03 | Legal disclaimer ("not legal advice") at start and on outcomes | Already shown at quiz start (WelcomeContent). Outcome pages add disclaimer at bottom of page. Simple static text component. |
| SCHED-04 | Links to sospermesso.it guides and legal aid centers | Existing `ResultLink[]` in tree-data.ts has `url`, `label`, `type` fields. Render inline within FAQ sections + summary block at bottom. |
| SCHED-05 | Variable substitution throughout ([Nome], [Parente selezionato]) | Already implemented in `src/lib/text-utils.ts`. `substituteVariables()` handles both placeholders. Used in TreeContent.tsx today for inline outcome rendering. |
| SCHED-06 | Structured FAQ-style sections (collapsible or clearly labeled) | Radix Accordion (via shadcn/ui) renders `ResultSection[]` as collapsible items. First item open by default. |
| SCHED-07 | Each outcome page has a stable, shareable URL | Next.js dynamic route `[locale]/outcome/[slug]/page.tsx` with static slug-to-nodeId mapping. `generateStaticParams` enables SSG. |
</phase_requirements>

## Summary

Phase 3 transforms the current inline outcome rendering (inside TreeContent.tsx) into standalone, richly structured outcome pages at stable URLs. The core data already exists: the tree has **30 result nodes** (not 25 as stated in requirements -- see Open Questions) with `title`, `introText`, `sections[]`, `links[]`, and `emergencyNumbers[]` fields. The primary work is: (1) create a new route `[locale]/outcome/[slug]`, (2) build an accordion-based page component, (3) add breadcrumb navigation showing the tree path, (4) implement the lawyer-needed banner, (5) handle intro text truncation, and (6) restyle the entire app to match sospermesso.it visual identity.

The technical approach is straightforward. Next.js App Router dynamic routes with `generateStaticParams` provide stable, SSG-friendly URLs. The shadcn/ui Accordion component (backed by Radix UI) handles collapsible FAQ sections. The existing `substituteVariables()` utility already handles `[Nome]` and `[Parente selezionato]` replacement. The lawyer-needed indicator is derived by parsing the content of the "Mi serve un avvocato?" section for emoji markers that already exist in the source data.

The CSS restyle is the most subjective part of this phase. The sospermesso.it website uses a blue/nautical theme with a lighthouse logo. The app currently uses a yellow background with black text. The restyle should adopt sospermesso.it's color palette and typography while maintaining the existing mobile-first, card-based layout architecture.

**Primary recommendation:** Use Next.js dynamic routes + shadcn/ui Accordion + a static slug mapping. No new state management needed -- outcome pages read from tree-data.ts directly (static data) and get user context (name, answers, history) from the existing Zustand store when available.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.6 | Dynamic routes `[locale]/outcome/[slug]` | Already in project, provides SSG via generateStaticParams |
| @radix-ui/react-accordion | ^2.1.x | Collapsible FAQ sections | Accessible, composable, shadcn/ui supported |
| shadcn/ui Accordion | latest | Pre-styled accordion component | Project already uses shadcn/ui (new-york style) |
| next-intl | 4.8.3 | i18n routing for outcome pages | Already in project, handles locale prefixing |
| zustand | 5.0.11 | Read user context (name, answers, history) for variable substitution and breadcrumbs | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icons for accordion triggers, external links, phone | Already in project |
| tailwindcss-animate | 1.0.7 | Accordion open/close animations | Already in project |
| clsx + tailwind-merge | current | Conditional class composition | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Radix Accordion | HTML `<details>/<summary>` | Native HTML, zero JS, but no animation control, no "only first open" mode, inconsistent cross-browser styling |
| Radix Accordion | Custom disclosure with useState | Full control but re-invents accessibility (keyboard nav, ARIA states). Not worth it. |

**Installation:**
```bash
npx shadcn@latest add accordion
```
This installs `@radix-ui/react-accordion` and creates `src/components/ui/accordion.tsx`.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/[locale]/outcome/
│   ├── [slug]/
│   │   └── page.tsx              # Server component: slug -> nodeId lookup, setRequestLocale
│   └── OutcomeContent.tsx        # Client component: renders full outcome page
├── components/outcome/
│   ├── OutcomePage.tsx            # Main layout orchestrator
│   ├── LawyerBanner.tsx          # Green/orange lawyer-needed indicator
│   ├── IntroText.tsx             # Truncatable intro with "Leggi di piu..."
│   ├── FaqAccordion.tsx          # Accordion wrapper for sections[]
│   ├── LinksSummary.tsx          # Bottom links summary block
│   ├── LegalDisclaimer.tsx       # "Non e consulenza legale" footer
│   └── TreeBreadcrumbs.tsx       # Clickable path breadcrumbs
├── lib/
│   ├── outcome-slugs.ts          # Static slug <-> nodeId mapping + lookup functions
│   └── lawyer-level.ts           # Parse "Mi serve un avvocato?" content -> green/orange
```

### Pattern 1: Static Slug Mapping
**What:** A bidirectional map from URL slugs to tree node IDs, kept as a static TypeScript object.
**When to use:** Route resolution and `generateStaticParams`.
**Why not derive from node data:** Slugs must be stable URLs that survive tree restructuring. Manual mapping gives full control.

```typescript
// src/lib/outcome-slugs.ts

/** Bidirectional map: slug <-> result node ID */
export const OUTCOME_SLUGS: Record<string, string> = {
  'cittadino-ue': 'end_ue',
  'protezione-internazionale': 'end_asilo',
  'calamita-naturale': 'end_calam',
  'sfruttamento-lavorativo': 'end_sfrut',
  'vittime-tratta': 'end_tratta',
  'violenza-domestica': 'end_viol',
  'cure-mediche': 'end_cure_salute',
  'cure-mediche-gravidanza': 'end_cure_gravidanza',
  'cittadinanza': 'end_citt',
  'nessun-permesso': 'end_neg_gen',
  'famiglia-minore': 'end_min_fam',
  'art-19-familiare-italiano': 'end_art19',
  'minore-affidato': 'end_aff',
  'minore-non-accompagnato': 'end_msna',
  'art-30-genitore-minore-italiano': 'end_art30',
  'famit-coniuge-italiano': 'end_famit',
  'zambrano': 'end_zamb',
  'carta-familiare-ue': 'end_carta_ue',
  'art-31-assistenza-minore': 'end_art31',
  'genitore-a-carico': 'end_art30_gen',
  'famiglia-genitore': 'end_famit_gen',
  'famiglia-incerto': 'end_fam_inc',
  'famiglia-invalido': 'end_fam_inv',
  'residenza-elettiva': 'end_res_el',
  'parente-lontano': 'end_neg_par',
  'partner-convivente': 'end_famit_part',
  'coniuge-rifugiato': 'end_con_rif',
  'coniuge-lungosoggiornante': 'end_carta_con',
  'conversione-famiglia': 'end_conv_fam',
  'conversione-famiglia-negativa': 'end_conv_neg',
};

/** Reverse map: nodeId -> slug */
export const NODE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(OUTCOME_SLUGS).map(([slug, nodeId]) => [nodeId, slug]),
);

/** Get node ID from slug, or undefined */
export function getNodeIdFromSlug(slug: string): string | undefined {
  return OUTCOME_SLUGS[slug];
}

/** Get slug from node ID, or undefined */
export function getSlugFromNodeId(nodeId: string): string | undefined {
  return NODE_TO_SLUG[nodeId];
}
```

### Pattern 2: Server/Client Component Split for Outcome Pages
**What:** Server component resolves slug and sets locale; client component renders interactive content.
**When to use:** Same pattern already used for tree pages (tree/page.tsx + TreeContent.tsx).

```typescript
// src/app/[locale]/outcome/[slug]/page.tsx (Server Component)
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { OUTCOME_SLUGS } from '@/lib/outcome-slugs';
import OutcomeContent from '../OutcomeContent';

export function generateStaticParams() {
  return Object.keys(OUTCOME_SLUGS).map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function OutcomePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const nodeId = OUTCOME_SLUGS[slug];
  if (!nodeId) notFound();

  return <OutcomeContent nodeId={nodeId} />;
}
```

```typescript
// src/app/[locale]/outcome/OutcomeContent.tsx (Client Component)
'use client';

import { italianTree } from '@/lib/tree-data';
import { getNode } from '@/lib/tree-engine';
import { substituteVariables } from '@/lib/text-utils';
import { useTreeStore } from '@/store/tree-store';
// ... renders full outcome page with accordion, breadcrumbs, etc.
```

### Pattern 3: Lawyer-Needed Level Derivation
**What:** Parse the existing "Mi serve un avvocato?" section content for emoji markers to determine the lawyer banner color.
**When to use:** On every outcome page to render the lawyer banner.

The existing tree data uses emoji patterns in the "Mi serve un avvocato?" sections:
- `🟢` = Green ("No, puoi fare da solo") -- no lawyer needed
- `🟠` = Orange ("Consulta un esperto") -- lawyer recommended
- `🆘` = Red/urgent ("Ti consigliamo di chiedere aiuto legale") -- lawyer strongly recommended

Some result nodes have no "Mi serve un avvocato?" section at all (e.g., `end_sfrut`, `end_tratta`, `end_viol` have empty sections but their intro text implies urgency). For these, a fallback heuristic or manual mapping is needed.

```typescript
// src/lib/lawyer-level.ts
import type { ResultSection } from '@/types/tree';

export type LawyerLevel = 'self' | 'recommended';

/**
 * Derive lawyer-needed level from sections.
 * Checks for the "Mi serve un avvocato?" section and its emoji marker.
 * Falls back to 'recommended' if no clear green marker found.
 */
export function getLawyerLevel(sections: ResultSection[]): LawyerLevel {
  const lawyerSection = sections.find(
    (s) => s.heading.toLowerCase().includes('avvocato'),
  );

  if (!lawyerSection) return 'recommended'; // no section = assume complex

  if (lawyerSection.content.includes('\u{1F7E2}')) return 'self'; // 🟢
  return 'recommended'; // 🟠 or 🆘 or anything else
}
```

### Pattern 4: Intro Text Truncation
**What:** Show first 5 lines of intro text, with "Leggi di piu..." expand button.
**When to use:** Outcome pages with long intro text.

```typescript
// src/components/outcome/IntroText.tsx
'use client';
import { useRef, useState, useEffect } from 'react';

interface IntroTextProps {
  text: string;
}

export function IntroText({ text }: IntroTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      // Compare scrollHeight vs 5-line height (line-height 1.6 * 16px * 5 = 128px)
      const lineHeight = parseFloat(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * 5;
      setNeedsTruncation(textRef.current.scrollHeight > maxHeight + 2);
    }
  }, [text]);

  return (
    <div>
      <p
        ref={textRef}
        className={`whitespace-pre-line text-foreground/80 ${
          !expanded && needsTruncation ? 'line-clamp-5' : ''
        }`}
      >
        {text}
      </p>
      {needsTruncation && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1 text-sm font-medium underline"
        >
          Leggi di piu...
        </button>
      )}
    </div>
  );
}
```

**Note:** `line-clamp-5` is a Tailwind utility (requires Tailwind 3.3+, which this project has). It applies `-webkit-line-clamp: 5` with `overflow: hidden`.

### Pattern 5: Breadcrumbs from Tree History
**What:** Reconstruct the user's path through the tree from the Zustand store's `history[]` + `answers{}`.
**When to use:** Outcome pages when accessed through the tree (store has history context).
**Not shown when:** Direct URL access (no store history) -- breadcrumbs simply don't appear.

```typescript
// Each breadcrumb = { nodeId, label (the answer text they chose), link (back to that question) }
// The history array contains question nodeIds in traversal order.
// answers[nodeId] gives the optionKey chosen.
// The edge label for that optionKey is the breadcrumb text.

interface BreadcrumbItem {
  nodeId: string;
  label: string; // The answer text chosen at this node
}

function buildBreadcrumbs(
  history: string[],
  answers: Record<string, string>,
  tree: TreeData,
): BreadcrumbItem[] {
  return history.map((nodeId) => {
    const optionKey = answers[nodeId];
    const edge = tree.edges.find(
      (e) => e.from === nodeId && e.optionKey === optionKey,
    );
    return {
      nodeId,
      label: edge?.label ?? '...',
    };
  });
}
```

### Pattern 6: Redirect on Tree Completion
**What:** When the tree engine reaches a result node, redirect to `/outcome/[slug]` instead of rendering inline.
**When to use:** Replace the current inline outcome rendering in TreeContent.tsx.

```typescript
// In TreeContent.tsx, replace the inline outcome rendering block with:
useEffect(() => {
  if (outcomeId && isTerminalNode(italianTree, outcomeId)) {
    const slug = getSlugFromNodeId(outcomeId);
    if (slug) {
      router.replace(`/outcome/${slug}`);
    }
  }
}, [outcomeId, router]);
```

### Anti-Patterns to Avoid
- **Storing outcome content in locale JSON files:** The outcome content is legal Italian text with specific formatting. It lives in `tree-data.ts` and should stay there. i18n translation of outcome content is Phase 4 scope, not Phase 3.
- **Using dynamic route params for node IDs:** URLs like `/outcome/end_asilo` expose internal identifiers. Use human-readable slugs.
- **Computing breadcrumbs on the server:** Breadcrumbs depend on the user's Zustand store state (client-only). They must be a client component.
- **Using CSS text-overflow for intro truncation:** `text-overflow: ellipsis` only works on single lines. Use `line-clamp-5` for multi-line truncation.
- **Hard-coding lawyer level per outcome:** Derive it from the existing section content to stay in sync with tree data changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible FAQ sections | Custom disclosure with useState | shadcn/ui Accordion (Radix) | Handles keyboard navigation, ARIA attributes, animation, multiple open modes |
| Multi-line text truncation | Custom JS height calculation | Tailwind `line-clamp-5` | Built into Tailwind 3.3+, CSS-only, no layout shift |
| URL slug routing | Manual string matching in middleware | Next.js `[slug]` dynamic route + `generateStaticParams` | SSG, type-safe, automatic 404 for unknown slugs |

**Key insight:** The outcome page is a presentation layer for existing data. All content already exists in `tree-data.ts`. The work is rendering, routing, and styling -- not data modeling.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch on Outcome Pages
**What goes wrong:** Outcome page reads from Zustand store (client) for userName/answers, but server renders with empty values. This causes hydration mismatch warnings.
**Why it happens:** SSG pages render at build time without Zustand state.
**How to avoid:** Use the same `useTreeHydration()` pattern from Phase 2. Show a loading skeleton until hydrated, then render personalized content. For direct URL access, render without personalization (no name substitution).
**Warning signs:** React console warnings about text content mismatch.

### Pitfall 2: Breadcrumb Click Loses Forward State
**What goes wrong:** User clicks a breadcrumb to go back to question 3, answers differently, and the old outcome page is still in browser history.
**Why it happens:** Using `router.push` for breadcrumb navigation creates history entries.
**How to avoid:** Breadcrumb clicks should call `goBack()` multiple times (popping history to that point) then use `router.replace('/tree')` to send the user back to the tree without creating extra history entries.
**Warning signs:** Browser back button creates confusing loops.

### Pitfall 3: Accordion Default Open State
**What goes wrong:** All sections render collapsed, or all render open.
**Why it happens:** Radix Accordion's `defaultValue` must match the first item's `value` prop.
**How to avoid:** Set `defaultValue` to the first section's key (e.g., `"section-0"`).
**Warning signs:** First FAQ section is collapsed on page load.

### Pitfall 4: Variable Substitution on Direct Access
**What goes wrong:** User bookmarks `/outcome/protezione-internazionale` and visits later. Page shows "[Nome]" literally because no session exists.
**Why it happens:** Zustand store has no userName when accessed directly.
**How to avoid:** When `userName` is null and `sessionStartedAt` is null (no session), substitute `[Nome]` with empty string (already handled by `substituteVariables`). The text reads naturally without the name. Verify all 30 result nodes read well without name substitution.
**Warning signs:** Literal `[Nome]` or `[Parente selezionato]` visible on page.

### Pitfall 5: CSS Logical Properties Regression
**What goes wrong:** During restyle, developer uses `ml-4`, `mr-4`, `text-left` instead of logical properties.
**Why it happens:** Muscle memory from non-RTL projects.
**How to avoid:** Project convention (from Phase 1): always use `ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, `start-`, `end-`. Grep for physical property usage in new files before committing.
**Warning signs:** Arabic layout has reversed padding/margins.

### Pitfall 6: 30 Result Nodes vs "25 Schede" Discrepancy
**What goes wrong:** Implementation targets only 25 outcomes, missing 5 result nodes.
**Why it happens:** Requirements doc says "~25 distinct outcomes" but tree-data.ts has 30 result nodes.
**How to avoid:** Map ALL 30 result nodes to slugs. The slug mapping in this research covers all 30.
**Warning signs:** Some tree paths lead to un-styled or missing outcome pages.

## Code Examples

### shadcn/ui Accordion Usage
```typescript
// After: npx shadcn@latest add accordion
// Creates src/components/ui/accordion.tsx with AccordionItem, AccordionTrigger, AccordionContent

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FaqAccordionProps {
  sections: { heading: string; content: string }[];
  substituteVars: (text: string) => string;
}

export function FaqAccordion({ sections, substituteVars }: FaqAccordionProps) {
  if (sections.length === 0) return null;

  return (
    <Accordion type="single" collapsible defaultValue="section-0">
      {sections.map((section, index) => (
        <AccordionItem key={index} value={`section-${index}`}>
          <AccordionTrigger>{section.heading}</AccordionTrigger>
          <AccordionContent>
            <p className="whitespace-pre-line text-foreground/80">
              {substituteVars(section.content)}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

**Note on Accordion type:** Use `type="single" collapsible` so one item is open at a time (cleaner for mobile) and the user can collapse everything. The `defaultValue="section-0"` opens the first item on load. If the user expects multiple items open simultaneously, use `type="multiple"` with `defaultValue={["section-0"]}` instead.

### Generating Static Params for All Locales + Slugs
```typescript
// In src/app/[locale]/outcome/[slug]/page.tsx
import { routing } from '@/i18n/routing';
import { OUTCOME_SLUGS } from '@/lib/outcome-slugs';

export function generateStaticParams() {
  const slugs = Object.keys(OUTCOME_SLUGS);
  // Next.js with next-intl: locale params are handled by the [locale] layout's generateStaticParams
  // This function only needs to return slug params
  return slugs.map((slug) => ({ slug }));
}
```

### Lawyer Banner Component
```typescript
'use client';
import type { LawyerLevel } from '@/lib/lawyer-level';

interface LawyerBannerProps {
  level: LawyerLevel;
}

export function LawyerBanner({ level }: LawyerBannerProps) {
  const isGreen = level === 'self';

  return (
    <div
      className={`w-full rounded-[0.75rem] px-4 py-3 font-semibold ${
        isGreen
          ? 'bg-green-100 text-green-900'
          : 'bg-orange-100 text-orange-900'
      }`}
    >
      {isGreen
        ? 'Puoi fare da solo'
        : 'E meglio parlare con un consulente legale'}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `getStaticPaths` | App Router `generateStaticParams` | Next.js 13+ (2023) | Same SSG capability, but works with server components |
| Manual `<details>` HTML | Radix Accordion via shadcn/ui | shadcn/ui 2023+ | Full accessibility, animation support, composable |
| CSS `-webkit-line-clamp` hack | Tailwind `line-clamp-*` utilities | Tailwind 3.3 (2023) | First-class utility, no custom CSS needed |

**Deprecated/outdated:**
- `getStaticPaths` / `getStaticProps`: Pages Router only. This project uses App Router.
- Manual ARIA management for accordions: Radix handles this automatically.

## Open Questions

1. **30 result nodes vs "~25 schede" in requirements**
   - What we know: tree-data.ts has exactly 30 result nodes. Requirements say "~25 distinct outcomes."
   - What's unclear: Whether 5 nodes are considered duplicates or minor variants. For example, `end_cure_salute` and `end_cure_gravidanza` are both "Cure Mediche" variants; `end_art30` and `end_art30_gen` are both Art. 30 variants.
   - Recommendation: Map all 30 to unique slugs and outcome pages. The "~25" was an estimate. No harm in covering all 30.

2. **sospermesso.it restyle scope**
   - What we know: User decided to restyle the entire app to match sospermesso.it visual identity. The site uses blue tones, a lighthouse logo, and a light/white design.
   - What's unclear: Exact color values, whether to use sospermesso.it's actual CSS colors or an inspired interpretation. The current app uses yellow background (`45 100% 56%`) with black text -- a complete color shift is needed.
   - Recommendation: Extract primary colors from sospermesso.it (blues, whites, accent colors) and update `globals.css` CSS variables. Keep the existing Tailwind/shadcn architecture -- just swap the color tokens. The restyle should be done first (as its own plan) so outcome pages are built with the final design.

3. **Some result nodes have empty sections**
   - What we know: `end_sfrut` (sfruttamento lavorativo), `end_tratta` (tratta), `end_viol` (violenza domestica) have `sections: []` -- empty FAQ content.
   - What's unclear: Whether this is intentional (these are urgent situations pointing to helplines, not FAQ-style guidance) or content gaps.
   - Recommendation: Treat empty sections as intentional. These pages show intro text + emergency numbers + links. The accordion simply doesn't render when sections are empty. The lawyer banner defaults to 'recommended' for these.

4. **Breadcrumb interaction with goBack()**
   - What we know: Breadcrumbs should be clickable and jump back to any previous question.
   - What's unclear: Whether clicking a breadcrumb should call `goBack()` N times or set state directly to that point.
   - Recommendation: Implement a new store action `goBackTo(nodeId)` that pops history to the target node. This is cleaner than calling `goBack()` in a loop and avoids intermediate renders.

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: `src/lib/tree-data.ts`, `src/types/tree.ts`, `src/store/tree-store.ts`, `src/lib/tree-engine.ts`, `src/lib/text-utils.ts` -- all read directly
- `src/app/[locale]/tree/TreeContent.tsx` -- current inline outcome rendering code
- `package.json` -- verified library versions (Next.js 16.1.6, Zustand 5.0.11, next-intl 4.8.3)
- `components.json` -- shadcn/ui config (new-york style, RTL enabled)

### Secondary (MEDIUM confidence)
- shadcn/ui Accordion documentation -- installation via `npx shadcn@latest add accordion`
- Radix UI Accordion API -- `type="single"`, `collapsible`, `defaultValue` props
- Next.js App Router `generateStaticParams` -- verified pattern for dynamic routes with SSG

### Tertiary (LOW confidence)
- sospermesso.it visual design -- WebFetch extraction only; exact hex values not confirmed. Restyle colors will need human judgment.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project or standard shadcn/ui additions
- Architecture: HIGH -- follows exact patterns established in Phase 1 and 2 (server/client split, Zustand store, ContentColumn layout)
- Pitfalls: HIGH -- identified from direct codebase analysis (hydration, RTL, variable substitution patterns)
- Content mapping: MEDIUM -- 30 vs 25 node count needs confirmation; empty section handling is assumption
- CSS restyle: LOW -- sospermesso.it color extraction is approximate; design direction needs user input

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (stable domain -- no fast-moving dependencies)
