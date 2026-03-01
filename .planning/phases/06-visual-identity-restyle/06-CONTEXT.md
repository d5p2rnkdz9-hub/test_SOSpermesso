# Phase 6: Visual Identity Restyle - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Restyle the app to match sospermesso.it's visual identity: yellow/gold color palette, white backgrounds, colored-border FAQ cards, and consistent header with logo. No new functionality — purely visual changes to make the app feel like part of the sospermesso.it product.

</domain>

<decisions>
## Implementation Decisions

### Color Palette
- Primary color: Gold `#FFD700` / `rgb(255, 215, 0)` replacing current blue `HSL 210 70% 45%`
- Background: Warm white `#FAF9F5` replacing current blue-gray `HSL 210 40% 96%`
- Text on gold backgrounds: Dark text (dark brown/black) — white on gold fails WCAG contrast
- Primary-foreground must be a dark color, not white
- Secondary/accent/border colors: Shift to gold/amber tones (gold-tinted secondaries throughout)
- Focus ring color: Gold instead of blue
- Semantic colors (green for success, orange for warning) stay unchanged

### Header Design
- Simplified header: White background, logo image, language selector, back button only
- No full site navigation links (this is a focused questionnaire app)
- Use the actual SOS Permesso logo image from sospermesso.it (yellow lightbulb logo)
- No bottom border — subtle shadow for depth when scrolled
- Logo is a link to sospermesso.it (opens main site)

### FAQ Card Style
- Colored left-border cards replacing current plain accordion
- Left border width: ~4px (sospermesso.it uses 3.75px)
- Border colors rotate through sections: blue `#42A5F5` → gold `#FFD700` → red `#FF5252` → repeat
- Open cards with all content visible — no accordion collapse/expand behavior
- Card border-radius: 24px (matching sospermesso.it), distinct from app's 12px global radius
- Subtle box shadow: `0px 4px 20px rgba(0,0,0,0.08)` matching sospermesso.it
- No highlight/glow effect on any card — all cards equally styled

### Interactive Elements
- Answer cards (tree questions): Gold background + dark text when selected, white + gray border when unselected, light gold tint on hover
- CTA buttons ("Leggi la guida completa", "Inizia"): Gold background + dark text
- LawyerBanner: Keep existing green-100/orange-100 hardcoded colors — semantic meaning more important than brand consistency
- Input fields: Gold focus ring, neutral gray border when unfocused

### Claude's Discretion
- Exact dark text color on gold (could be near-black, dark brown, etc. — whatever passes WCAG AA)
- Secondary/muted/accent HSL values that complement gold primary
- Shadow intensity and behavior (static vs scroll-triggered)
- How to source/host the SOS Permesso logo image
- Transition/animation adjustments if any look off with new colors

</decisions>

<specifics>
## Specific Ideas

- The gold color #FFD700 is extracted directly from sospermesso.it's footer and active card glow
- sospermesso.it's CTA buttons are actually dark/black (#1A1A1A), but user chose gold CTAs for stronger brand unity
- The FAQ card rotating border colors (blue/gold/red) come directly from sospermesso.it's permit page cards
- sospermesso.it background is a warm off-white (#FAF9F5) — not pure white, not gray
- The app should feel like a sub-app of sospermesso.it, not a standalone product

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `globals.css` CSS custom properties (`:root` vars) — changing these cascades to all components automatically
- `tailwind.config.ts` reads from CSS vars — no hardcoded colors in config
- `StickyHeader.tsx` — header component to restyle (currently blue bg, text logo)
- `FaqAccordion.tsx` — currently wraps shadcn Accordion, needs redesign to open cards with left borders
- `AnswerCard.tsx` — uses `border-primary bg-primary` for selected state, will auto-update with new primary
- `LawyerBanner.tsx` — hardcoded green-100/orange-100, intentionally NOT changing

### Established Patterns
- All colors via CSS custom properties → Tailwind semantic tokens (bg-primary, text-foreground, etc.)
- Components use `text-start` / logical properties for RTL support
- `ContentColumn.tsx` provides max-width constraint (520px)
- shadcn/ui components (Button, Accordion, Card) all reference theme vars

### Integration Points
- `globals.css :root` — single source of truth for the color palette swap
- `StickyHeader.tsx` — logo image needs to be added (currently text-only)
- `FaqAccordion.tsx` — structural change from accordion to open cards with colored borders
- `OutcomePage.tsx` — CTA button and card wrapper use primary colors
- `WelcomeContent.tsx` — start button and input field reference theme colors
- Focus styles in `globals.css` `:focus-visible` rule references blue HSL directly (hardcoded, not var)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-visual-identity-restyle*
*Context gathered: 2026-03-01*
