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
- Primary color: Gold `#FFD700` (--taxi-yellow in Sito_Nuovo) replacing current blue `HSL 210 70% 45%`
- Primary button gradient: `linear-gradient(135deg, #FFF9C4 0%, #FFD700 100%)` with border `1.5px solid #FFC107`
- Primary-foreground (text on gold): Dark brown `#5D4E00` — the exact color from Sito_Nuovo's `.btn-primary`
- Background: Warm off-white `#FAF9F5` replacing current blue-gray `HSL 210 40% 96%`
- Secondary/accent/border colors: Shift to gold/amber tones (gold-tinted secondaries throughout)
- Focus ring color: Gold instead of blue
- Link color inside content: Teal `#1A6B5F` (matches Sito_Nuovo content links)
- List bullet markers: Gold `--taxi-yellow-dark` (#FFC107)
- Semantic colors (green `#66BB6A` for success, orange `#FFA726` for warning) stay unchanged
- Full Sito_Nuovo palette reference available in `Sito_Nuovo/src/styles/main.css` lines 6-104

### Header Design
- Simplified header: White background, logo image, language selector, back button only
- No full site navigation links (this is a focused questionnaire app)
- Logo file: `Sito_Nuovo/IMAGES/logo-full.png` — 180px height desktop, 90px height mobile
- Header bottom border: 1px solid rgba(0,0,0,0.08), adds box-shadow `0 2px 12px rgba(0,0,0,0.08)` on scroll
- Logo links to sospermesso.it (opens main site)
- Logo hover: scale(1.02) with drop-shadow effect

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
- CTA buttons ("Leggi la guida completa", "Inizia"): Gold gradient background + dark brown text `#5D4E00`
- Button border-radius: pill shape (9999px) matching Sito_Nuovo `.btn` pattern
- Button hover: translateY(-2px) with enhanced shadow; active: scale(0.98)
- LawyerBanner: Keep existing green-100/orange-100 hardcoded colors — semantic meaning more important than brand consistency
- Input fields: Gold focus ring, neutral gray border when unfocused

### Typography (from Sito_Nuovo source)
- Heading font: Poppins (weight 700) — Sito_Nuovo uses `--font-heading: 'Poppins'`
- Body font: Inter (already matches our app)
- Note: Adding Poppins for headings is optional — assess if it improves brand consistency vs. added font load

### Claude's Discretion
- Whether to add Poppins for headings (brand match vs. performance tradeoff)
- Secondary/muted/accent HSL values that complement gold primary
- How to copy/host the logo image from Sito_Nuovo into our app's public/ directory
- Transition/animation adjustments if any look off with new colors
- Whether answer cards should also use pill radius or keep current rounded-xl

</decisions>

<specifics>
## Specific Ideas

- The gold color #FFD700 is `--taxi-yellow` in Sito_Nuovo's design system (source of truth: `Sito_Nuovo/src/styles/main.css`)
- Sito_Nuovo primary button uses a gradient (#FFF9C4 → #FFD700), not flat gold — user chose gold CTAs
- The FAQ card rotating border colors (blue #42A5F5, gold #FFD700, red #FF5252) come directly from Sito_Nuovo's card system
- Sito_Nuovo also defines: --taxi-yellow-light (#FFF176), --taxi-yellow-dark (#FFC107), --taxi-yellow-bright (#FFEB3B)
- Background is warm off-white #FAF9F5 (Sito_Nuovo uses #FAFAFA as --off-white)
- Sito_Nuovo card shadows: `--shadow-sm: 0 2px 4px rgba(0,0,0,0.1)` through `--shadow-xl: 0 12px 24px rgba(0,0,0,0.18)`
- The app should feel like a sub-app of sospermesso.it, not a standalone product
- Full design token reference: `Sito_Nuovo/src/styles/main.css` (colors, spacing, radius, shadows, typography)

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

### Sito_Nuovo Source of Truth
- Design tokens: `Sito_Nuovo/src/styles/main.css` (CSS vars for colors, spacing, radius, shadows, fonts)
- Card styles: `Sito_Nuovo/src/styles/main.css` (`.card`, colored border variants)
- Button styles: `Sito_Nuovo/src/styles/main.css` (`.btn`, `.btn-primary` gradient)
- Header styles: `Sito_Nuovo/src/styles/main.css` (`.header`, `.logo`, `.logo-image`)
- Logo image: `Sito_Nuovo/IMAGES/logo-full.png`
- RTL support: `Sito_Nuovo/src/styles/rtl.css`
- Document page cards: `Sito_Nuovo/src/styles/document-page.css`

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
