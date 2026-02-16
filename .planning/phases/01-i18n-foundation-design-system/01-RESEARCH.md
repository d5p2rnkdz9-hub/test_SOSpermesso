# Phase 1: i18n Foundation + Design System - Research

**Researched:** 2026-02-16
**Domain:** RTL-safe layout scaffold, visual identity (yellow/black/white), mobile-first responsive design, CSS logical properties
**Confidence:** HIGH

## Summary

This phase transforms the inherited Corso AI codebase into a design system foundation for SOSpermesso. The work spans three tightly coupled domains: (1) next-intl i18n routing with `[locale]` URL segments and RTL-aware document direction, (2) shadcn/ui component migration from physical CSS properties to logical equivalents, and (3) a new visual identity built on taxi-yellow/black/white with geometric sans-serif typography.

The standard approach is well-established: next-intl v4.x provides locale routing with `proxy.ts` (Next.js 16's rename of middleware.ts), shadcn/ui's January 2026 RTL release provides a one-command migration (`shadcn migrate rtl`) for existing components, and Tailwind v3.4's built-in logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`) handle all new RTL-safe styling. The visual identity uses CSS custom properties via Tailwind's theming layer -- the existing shadcn/ui variable system (`--primary`, `--background`, etc.) is repurposed for the yellow/black palette.

Key recommendations: Use **Inter** for Latin scripts (already configured) and **IBM Plex Sans Arabic** for Arabic (geometric design harmonizes with Inter, available on Google Fonts, 8 weights). Use `#FFC629` as the primary yellow (Bumble's exact yellow -- warm, friendly, high-contrast on black). Page transitions between questions should use lightweight CSS transitions (`transform` + `opacity`) via a custom wrapper component, not framer-motion (which has known issues with Next.js App Router and adds 30KB+ to the bundle for a feature that only needs simple slide animations).

**Primary recommendation:** Set up next-intl `[locale]` routing with Italian as default, run `shadcn migrate rtl` on all UI components, replace the Corso AI blue/green palette with yellow/black/white CSS variables, and build a test page that renders correctly in both LTR and RTL modes.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **next-intl** | ^4.8 | i18n framework: locale routing, message loading, `proxy.ts` middleware, Server Component support | De facto standard for Next.js App Router i18n. 930K+ weekly npm downloads. First-class support for Next.js 16 `proxy.ts`, `[locale]` routing, `setRequestLocale` for static rendering. v4.0 (March 2025) added ESM-only build and strict locale typing. |
| **shadcn/ui RTL mode** | latest CLI | RTL component transformation via `migrate rtl` command | shadcn/ui shipped first-class RTL in January 2026. `"rtl": true` in `components.json` + `pnpm dlx shadcn@latest migrate rtl` converts all physical CSS to logical equivalents. Already in the stack -- zero new dependencies. |
| **Tailwind CSS** | ^3.4.1 (existing) | RTL-safe spacing/positioning via logical properties | Tailwind v3.3+ natively supports `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `start-*`, `end-*`. Already installed. No plugin needed. |
| **@radix-ui/react-direction** | latest | DirectionProvider for Radix primitives | Wraps root layout to propagate `dir="rtl"` to all Radix-based shadcn components. Already a transitive dependency via shadcn/ui. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Inter** (Google Font) | via `next/font/google` | Latin script font (IT, FR, EN, ES) | Already referenced in Tailwind config. Optimize loading via `next/font/google`. |
| **IBM Plex Sans Arabic** (Google Font) | via `next/font/google` | Arabic script font | Load conditionally for Arabic locale. Geometric grotesque design harmonizes with Inter. 8 weights (Thin through Bold). Available on Google Fonts. |
| **next/font/google** | built-in Next.js | Font optimization and loading | Load Inter and IBM Plex Sans Arabic with automatic subsetting, self-hosting, and CSS variable injection. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| IBM Plex Sans Arabic | Cairo | Cairo is a variable font (200-1000 weight range) -- more flexible. But Cairo has a rounder, less geometric feel that pairs less naturally with Inter's sharp geometry. IBM Plex Sans Arabic has a grotesque+geometric construction closer to Inter's design DNA. |
| IBM Plex Sans Arabic | Noto Sans Arabic | Noto Sans Arabic is the "universal fallback" -- safe but generic. IBM Plex Sans Arabic has more personality and better matches the bold, graphic feel specified in the design decisions. |
| CSS transitions | framer-motion | framer-motion is more powerful but has known issues with Next.js App Router (AnimatePresence unmounting conflicts), adds 30KB+ to bundle, and is overkill for simple slide transitions. CSS `transform` + `opacity` transitions with `will-change` are zero-dependency and performant. |
| CSS transitions | next-view-transitions (View Transitions API) | Native browser API via experimental Next.js config (`experimental.viewTransition`). Marked "not recommended for production" as of Next.js 16.1.6. Could revisit in Phase 5 polish, but too experimental for foundational work. |

**Installation:**
```bash
npm install next-intl
# That's it for new runtime dependencies.
# shadcn/ui RTL is a CLI migration, not a package install.
# Fonts are loaded via next/font/google (built into Next.js).
```

**Total new runtime dependencies: 1 (next-intl).**

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope)

```
src/
├── i18n/
│   ├── routing.ts           # defineRouting({ locales: ['it','ar','fr','en','es'], defaultLocale: 'it' })
│   ├── request.ts           # getRequestConfig -- load messages per locale
│   └── navigation.ts        # createNavigation -- locale-aware Link, redirect, usePathname
├── app/
│   ├── [locale]/            # All pages under locale segment
│   │   ├── layout.tsx       # Dynamic lang + dir, font loading, DirectionProvider, NextIntlClientProvider
│   │   ├── page.tsx         # Welcome/start screen (Phase 1 test page)
│   │   └── not-found.tsx    # Locale-aware 404
│   └── layout.tsx           # Root layout (minimal -- just HTML skeleton)
├── components/
│   ├── ui/                  # shadcn/ui components (RTL-migrated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── direction.tsx    # DirectionProvider wrapper (from shadcn add direction)
│   │   └── ...
│   ├── layout/              # Layout components (Phase 1 scope)
│   │   ├── StickyHeader.tsx # Logo (left/start), back button, language selector (right/end)
│   │   ├── LanguageSelector.tsx  # Dropdown with native script names
│   │   └── ContentColumn.tsx     # Centered narrow column (max-w-[480px] to max-w-[600px])
│   └── demo/                # Test/demo components for Phase 1 validation
│       └── DesignSystemDemo.tsx  # Showcases all design tokens, components in LTR + RTL
├── lib/
│   └── utils.ts             # cn() utility (existing)
├── styles/
│   └── tokens.css           # Design token CSS variables (extracted from globals.css or inline)
proxy.ts                     # next-intl middleware (Next.js 16 naming)
messages/
├── it.json                  # Italian UI strings (source of truth)
├── ar.json                  # Arabic UI strings (Phase 1: navigation + layout only)
├── fr.json                  # French
├── en.json                  # English
└── es.json                  # Spanish
```

### Pattern 1: Locale-Aware Root Layout with RTL Direction

**What:** The `[locale]/layout.tsx` dynamically sets `lang`, `dir`, and font class on `<html>` based on the URL locale segment. Wraps children in `DirectionProvider` (for Radix) and `NextIntlClientProvider` (for client-side translations).

**When to use:** Every page in the application.

**Example:**
```tsx
// Source: next-intl official docs + shadcn/ui RTL docs (verified)
// src/app/[locale]/layout.tsx

import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { DirectionProvider } from '@/components/ui/direction';
import { routing } from '@/i18n/routing';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-arabic',
});

const RTL_LOCALES = ['ar'] as const;

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = RTL_LOCALES.includes(locale as typeof RTL_LOCALES[number]) ? 'rtl' : 'ltr';
  const fontClass = dir === 'rtl' ? plexArabic.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${plexArabic.variable}`}>
      <body className={`antialiased font-sans ${fontClass}`}>
        <DirectionProvider direction={dir}>
          <NextIntlClientProvider>
            {children}
          </NextIntlClientProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
```

### Pattern 2: CSS Custom Properties for Yellow/Black Design Tokens

**What:** Replace the existing shadcn/ui neutral HSL variables with the SOSpermesso yellow/black/white palette. Use HSL format to maintain compatibility with shadcn/ui's `hsl(var(--...))` pattern.

**When to use:** Global styles in `globals.css`.

**Example:**
```css
/* Source: Tailwind CSS theming + shadcn/ui variable pattern */
@layer base {
  :root {
    /* SOSpermesso Yellow/Black/White palette */
    /* Primary yellow: #FFC629 = HSL(45, 100%, 56%) -- Bumble-like warm yellow */
    --background: 45 100% 56%;          /* Yellow dominant background */
    --foreground: 0 0% 0%;              /* Black text on yellow */

    --card: 0 0% 100%;                  /* White cards on yellow bg */
    --card-foreground: 0 0% 0%;         /* Black text on white cards */

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 0%;

    --primary: 0 0% 0%;                 /* Black -- buttons, interactive elements */
    --primary-foreground: 45 100% 56%;  /* Yellow text on black buttons */

    --secondary: 0 0% 100%;            /* White */
    --secondary-foreground: 0 0% 0%;   /* Black text on white */

    --muted: 45 40% 90%;               /* Light yellow tint for muted states */
    --muted-foreground: 0 0% 30%;      /* Dark gray for muted text */

    --accent: 45 100% 48%;             /* Darker yellow for hover states */
    --accent-foreground: 0 0% 0%;

    --destructive: 0 84% 60%;          /* Red for errors */
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 0%;                 /* Black borders (flat design) */
    --input: 0 0% 80%;                 /* Gray for input borders */
    --ring: 0 0% 0%;                   /* Black focus ring */

    --radius: 0.75rem;                 /* 12px -- rounded but not pill-shaped */

    /* Remove shadows -- flat design */
    /* All shadows removed from components via Tailwind overrides */
  }
}
```

### Pattern 3: Logical Properties for All New CSS

**What:** Every directional CSS property uses logical equivalents. Physical properties (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`) are banned from new code.

**When to use:** Always. No exceptions for new code.

**Mapping reference:**

| Physical (BANNED) | Logical (USE THIS) | CSS Property |
|---|---|---|
| `ml-4` | `ms-4` | `margin-inline-start` |
| `mr-4` | `me-4` | `margin-inline-end` |
| `pl-4` | `ps-4` | `padding-inline-start` |
| `pr-4` | `pe-4` | `padding-inline-end` |
| `left-0` | `start-0` | `inset-inline-start` |
| `right-0` | `end-0` | `inset-inline-end` |
| `text-left` | `text-start` | `text-align: start` |
| `text-right` | `text-end` | `text-align: end` |
| `border-l-4` | `border-s-4` | `border-inline-start-width` |
| `border-r-4` | `border-e-4` | `border-inline-end-width` |
| `rounded-l-lg` | `rounded-s-lg` | `border-start-start-radius` + `border-end-start-radius` |
| `rounded-r-lg` | `rounded-e-lg` | `border-start-end-radius` + `border-end-end-radius` |
| `float-left` | `float-start` | `float: inline-start` |
| `float-right` | `float-end` | `float: inline-end` |

**Icon direction flipping:**
```tsx
// Directional icons MUST use rtl:rotate-180
<ChevronRight className="h-4 w-4 rtl:rotate-180" />  // "next" arrow
<ChevronLeft className="h-4 w-4 rtl:rotate-180" />   // "back" arrow
<ArrowLeft className="h-4 w-4 rtl:rotate-180" />      // "go back"
```

### Pattern 4: Sticky Header Layout with Language Selector

**What:** Fixed header bar with logo (inline-start), back button (center or context), and language selector (inline-end). Content area scrolls below.

**When to use:** All pages in the application.

**Example:**
```tsx
// StickyHeader.tsx
function StickyHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[600px] items-center justify-between px-4">
        {/* Logo - inline start */}
        <a href="https://sospermesso.it" className="flex items-center">
          <Logo className="h-8" />
        </a>

        {/* Back button - center or hidden when not applicable */}
        <BackButton />

        {/* Language selector - inline end */}
        <LanguageSelector />
      </div>
    </header>
  );
}
```

### Pattern 5: Centered Narrow Column Layout

**What:** Content is constrained to a narrow column (480-600px max-width), centered on all screen sizes. This creates a mobile-first experience that looks consistent on desktop too.

**When to use:** All content pages.

**Example:**
```tsx
// ContentColumn.tsx
function ContentColumn({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[520px] px-4 py-6">
      {children}
    </main>
  );
}
```

### Pattern 6: Slide Transitions Between Questions (CSS-Only)

**What:** Lightweight CSS transitions for question-to-question navigation. Questions slide in from the inline-end and out to the inline-start (forward), or reverse for back navigation.

**When to use:** Tree player question transitions (Phase 2 will use this foundation).

**Example:**
```css
/* globals.css -- transition classes */
.slide-enter {
  opacity: 0;
  transform: translateX(30px);
}
[dir="rtl"] .slide-enter {
  transform: translateX(-30px);
}
.slide-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.slide-exit {
  opacity: 1;
  transform: translateX(0);
}
.slide-exit-active {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 200ms ease-in, transform 200ms ease-in;
}
[dir="rtl"] .slide-exit-active {
  transform: translateX(30px);
}
```

**Alternative (Tailwind-based):**
```tsx
// Use Tailwind transition utilities with a state variable
<div className={cn(
  "transition-all duration-300 ease-out",
  isEntering && "translate-x-0 opacity-100",
  isExiting && "-translate-x-8 opacity-0 rtl:translate-x-8"
)}>
  {/* Question content */}
</div>
```

### Anti-Patterns to Avoid

- **Physical CSS properties in new code:** Never write `ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`. Always use logical equivalents. Add an ESLint rule or grep check to CI.
- **Shadows on components:** The design specifies flat/no-shadows. Remove `shadow`, `shadow-sm`, `shadow-lg` from all shadcn/ui components.
- **Dark mode variables:** The design is single-mode (yellow/black/white). Remove `.dark` class variables from globals.css. No dark mode toggle.
- **`middleware.ts` filename:** Next.js 16 renamed it to `proxy.ts`. Using `middleware.ts` will silently fail or break.
- **Loading all fonts for all locales:** Load IBM Plex Sans Arabic only when `locale === 'ar'`. For LTR locales, only Inter is needed. Both are declared as CSS variables but the `body` class switches which is active.
- **framer-motion for simple transitions:** Adds 30KB+ bundle size and has App Router compatibility issues. Use CSS transitions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale routing + middleware | Custom locale detection from URL/cookies | next-intl `defineRouting` + `createMiddleware` | Handles locale negotiation, redirects, alternate links for SEO, cookie-based persistence. Edge cases (trailing slashes, nested routes, locale prefix stripping) are subtle. |
| RTL component transformation | Manual find-replace of CSS classes | `pnpm dlx shadcn@latest migrate rtl` | One CLI command converts all existing shadcn/ui components. Catches animation classes (`slide-in-from-right` -> `slide-in-from-end`) that manual search would miss. |
| Direction-aware Radix primitives | Custom RTL context/provider | `@radix-ui/react-direction` DirectionProvider (via shadcn `add direction`) | Popovers, dropdowns, and dialogs need to know direction for positioning. Radix handles this natively when DirectionProvider is present. |
| Font loading + optimization | Manual `<link>` tags or CSS `@font-face` | `next/font/google` | Automatic subsetting, self-hosting (no external Google Fonts request), CSS variable injection, zero layout shift. Built into Next.js. |
| Language selector dropdown | Custom dropdown from scratch | shadcn/ui Select or DropdownMenu (RTL-migrated) | Already has proper keyboard navigation, RTL positioning, focus management, and ARIA attributes. |
| CSS custom property theming | Custom theme system | shadcn/ui's built-in CSS variable pattern | The existing `hsl(var(--primary))` pattern is already wired into all components. Change the variable values, not the system. |

**Key insight:** This phase is primarily a **configuration and migration** task, not a greenfield build. The tools already exist -- next-intl, shadcn RTL CLI, Tailwind logical properties. The risk is in the migration quality (missing a physical property, wrong variable value) not in architectural decisions.

## Common Pitfalls

### Pitfall 1: Incomplete Physical-to-Logical CSS Migration

**What goes wrong:** After running `shadcn migrate rtl`, developers assume all physical properties are gone. But custom components (quiz components, layout wrappers) and inline styles still use `ml-`, `mr-`, etc. The app "mostly works" in RTL but has subtle spacing bugs.
**Why it happens:** `shadcn migrate rtl` only transforms files in the `ui/` directory. Custom components outside `ui/` are not touched. Inline `style={{ marginLeft: '8px' }}` is never caught.
**How to avoid:** After running the CLI migration, run a grep audit: `grep -rn 'ml-\|mr-\|pl-\|pr-\|left-\|right-\|text-left\|text-right\|border-l-\|border-r-\|rounded-l-\|rounded-r-\|float-left\|float-right\|marginLeft\|marginRight\|paddingLeft\|paddingRight' src/`. Fix every hit. Add this grep to CI as a lint check.
**Warning signs:** RTL page looks "almost right" but icons/spacing have subtle asymmetry.

### Pitfall 2: Shadow Removal Inconsistency

**What goes wrong:** The design specifies flat/no-shadows, but shadcn/ui components come with `shadow`, `shadow-sm` by default. Some components get shadows removed, others don't, creating visual inconsistency.
**Why it happens:** Shadows are baked into shadcn/ui component variants (e.g., `buttonVariants` has `shadow`, Card has `shadow`). Developers forget to audit all component files.
**How to avoid:** After running `shadcn migrate rtl`, do a second pass to remove all `shadow*` classes from component files. grep: `grep -rn 'shadow' src/components/ui/`. Replace with empty string or `border` equivalent as the design uses borders for definition.
**Warning signs:** Some cards have subtle drop shadows while others don't.

### Pitfall 3: Yellow Background + Accessibility

**What goes wrong:** Yellow (#FFC629) as a dominant background creates accessibility issues. White text on yellow fails WCAG AA contrast (ratio ~1.5:1). Black text on yellow passes (ratio ~15:1). But intermediate elements (muted text, disabled states, borders) fall into an ambiguous zone.
**Why it happens:** Yellow is a notoriously difficult background color for accessibility. It works with black text but not with most other colors.
**How to avoid:** Define a strict color usage rule: (1) All text on yellow backgrounds MUST be black, (2) No gray text on yellow backgrounds, (3) White cards/containers provide a neutral surface for any text color, (4) Muted/disabled states use opacity on black rather than gray colors on yellow. Test all color combinations with a contrast checker (target 4.5:1 minimum for AA).
**Warning signs:** Chrome Lighthouse accessibility audit flags contrast issues. Users on low-brightness mobile screens can't read muted text.

### Pitfall 4: proxy.ts Location and src/ Directory

**What goes wrong:** `proxy.ts` is placed in the wrong directory. With a `src/` directory structure, it must be at `src/proxy.ts`, not at the project root.
**Why it happens:** Next.js documentation examples show `proxy.ts` at root for projects without `src/`. The existing project uses `src/`.
**How to avoid:** Place `proxy.ts` at `src/proxy.ts`. Verify by checking that locale prefixing works: navigating to `/` should redirect to `/it/` (the default locale).
**Warning signs:** Locale middleware silently does nothing. URLs work without locale prefix.

### Pitfall 5: Font Loading for Arabic Creates Layout Shift

**What goes wrong:** Arabic font loads after initial render, causing text to jump from fallback font to IBM Plex Sans Arabic. On slow connections, Arabic text is invisible (FOIT) or renders in the wrong font (FOUT) for 1-3 seconds.
**Why it happens:** Arabic font files are larger than Latin (more glyphs). Without proper `next/font` configuration, the font loads asynchronously.
**How to avoid:** Use `next/font/google` with explicit weight subsets and the `display: 'swap'` option. Declare both fonts as CSS variables in the layout. The font switch happens via class/variable, not via dynamic import.
**Warning signs:** Flash of unstyled text when switching to Arabic. Arabic text appearing in Inter fallback momentarily.

### Pitfall 6: Language Selector Not Preserving Scroll/State

**What goes wrong:** User switches language and gets redirected to the same path but with a different locale prefix. The page reloads from the top, losing scroll position and any client-side state.
**Why it happens:** Language switching via full navigation (`router.push('/ar/...')`) triggers a full page load. next-intl's `Link` component with a different locale does a soft navigation, but if the language selector uses `window.location` or `router.push`, state is lost.
**How to avoid:** Use next-intl's locale-aware `Link` or `useRouter` from `@/i18n/navigation` for language switching. These perform soft client-side navigation that preserves React state. For Phase 1, this is about setting up the pattern correctly -- Phase 2 (tree state) will benefit.
**Warning signs:** Full page reload visible when switching language. Flash of loading state.

## Code Examples

### next-intl Routing Configuration
```typescript
// Source: next-intl official docs (https://next-intl.dev/docs/routing/setup)
// src/i18n/routing.ts

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['it', 'ar', 'fr', 'en', 'es'],
  defaultLocale: 'it',
  // Italian users coming from sospermesso.it land on /it/
  // Other languages: /ar/, /fr/, /en/, /es/
});
```

### next-intl Request Configuration
```typescript
// Source: next-intl official docs (https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing)
// src/i18n/request.ts

import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

### next-intl Navigation Utilities
```typescript
// Source: next-intl official docs (https://next-intl.dev/docs/routing/navigation)
// src/i18n/navigation.ts

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### Proxy Configuration (Next.js 16)
```typescript
// Source: next-intl official docs (https://next-intl.dev/docs/routing/middleware)
// src/proxy.ts -- NOTE: proxy.ts, NOT middleware.ts (Next.js 16 rename)

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
```

### next.config.ts with next-intl Plugin
```typescript
// Source: next-intl official docs
// next.config.ts

import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
```

### Language Selector Component
```tsx
// LanguageSelector.tsx
// Native script names, no flags (per design decision)

'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LANGUAGE_NAMES: Record<string, string> = {
  it: 'Italiano',
  ar: 'العربية',
  fr: 'Français',
  en: 'English',
  es: 'Español',
};

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleLanguageChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <select
      value={locale}
      onChange={(e) => handleLanguageChange(e.target.value)}
      className="bg-transparent border border-border rounded-md px-2 py-1 text-sm"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {LANGUAGE_NAMES[loc]}
        </option>
      ))}
    </select>
  );
}
```

### Answer Option Card (Design Decision Implementation)
```tsx
// Outlined card on yellow, fills black on selection
// Per design: black border on yellow, rounded corners (12-16px), no shadows

interface OptionCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function OptionCard({ label, selected, onSelect }: OptionCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        // Base: outlined card, no shadow, rounded corners
        "w-full rounded-xl border-2 border-foreground px-4 py-4",
        "text-start text-lg font-medium",
        "transition-colors duration-150",
        "min-h-[48px]", // 48px+ touch target
        // Selected: fill black
        selected
          ? "bg-foreground text-primary-foreground"
          : "bg-transparent text-foreground hover:bg-foreground/10",
      )}
    >
      {label}
    </button>
  );
}
```

### Minimal UI Message File Structure
```json
// messages/it.json -- Phase 1 scope (layout + navigation only)
{
  "common": {
    "back": "Indietro",
    "next": "Avanti",
    "start": "Inizia",
    "loading": "Caricamento...",
    "error": "Si è verificato un errore"
  },
  "welcome": {
    "title": "Verifica il tuo diritto al permesso di soggiorno",
    "subtitle": "Rispondi ad alcune domande per scoprire quale permesso puoi richiedere",
    "start": "Inizia la verifica",
    "disclaimer": "Questo strumento fornisce informazioni generali, non consulenza legale."
  },
  "header": {
    "backToStart": "Torna all'inizio"
  },
  "language": {
    "selectLanguage": "Seleziona lingua"
  }
}
```

### Arabic Equivalent
```json
// messages/ar.json
{
  "common": {
    "back": "رجوع",
    "next": "التالي",
    "start": "ابدأ",
    "loading": "جارٍ التحميل...",
    "error": "حدث خطأ"
  },
  "welcome": {
    "title": "تحقق من حقك في تصريح الإقامة",
    "subtitle": "أجب عن بعض الأسئلة لمعرفة أي تصريح يمكنك التقدم للحصول عليه",
    "start": "ابدأ الفحص",
    "disclaimer": "تقدم هذه الأداة معلومات عامة وليست استشارة قانونية."
  },
  "header": {
    "backToStart": "العودة إلى البداية"
  },
  "language": {
    "selectLanguage": "اختر اللغة"
  }
}
```

## Claude's Discretion Recommendations

These are areas explicitly left to Claude's discretion in the CONTEXT.md decisions.

### Arabic Typeface Selection: IBM Plex Sans Arabic

**Recommendation:** Use **IBM Plex Sans Arabic** from Google Fonts.

**Rationale:**
- **Geometric construction** matches Inter's design DNA. Both have grotesque roots with geometric influences -- sharp terminals, consistent stroke width, rationalist proportions. This creates visual harmony across scripts.
- **8 weights available** (Thin 100, ExtraLight 200, Light 300, Regular 400, Text 450, Medium 500, SemiBold 600, Bold 700) -- enough for the heading/body hierarchy specified in design decisions.
- **Available on Google Fonts** -- can be loaded via `next/font/google` with automatic optimization.
- **Designed by IBM/Bold Monday** for global digital products -- specifically intended for UI use, not just display.

**Runner-up:** Cairo (variable font, weight range 200-1000). Cairo has a rounder, more "friendly" Arabic aesthetic. If testing reveals IBM Plex Sans Arabic feels too "corporate," Cairo would be the warm alternative. Cairo is a variable font which means better weight flexibility but slightly larger file size.

**Confidence:** MEDIUM -- Font pairing quality is inherently subjective. Both IBM Plex Sans Arabic and Cairo are strong choices. The recommendation should be validated visually with real Arabic text once implemented.

### Yellow Hex Value and Tint Variations

**Recommendation:**

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| **Primary Yellow** | `#FFC629` | `45 100% 56%` | Dominant background color, large surfaces |
| **Yellow Hover** | `#FFD04D` | `45 100% 65%` | Lighter tint for hover states on yellow |
| **Yellow Active/Pressed** | `#E6B224` | `45 80% 52%` | Darker tint for active/pressed states |
| **Yellow Muted** | `#FFF5D6` | `45 100% 92%` | Very light yellow for muted backgrounds, disabled areas |
| **Yellow Surface** | `#FFFAEB` | `45 100% 96%` | Near-white yellow tint for secondary surfaces |

**Rationale:**
- `#FFC629` is Bumble's primary yellow. It hits the "friendly but bold" brief exactly -- warm like Bumble, high-contrast like IKEA (IKEA's `#FBD914` is cooler/greener).
- The tint scale provides 5 stops: full saturation for primary, lighter for hover, darker for active, near-white for muted areas.
- All tints maintain WCAG AA contrast ratio (4.5:1+) with black text.

**Confidence:** HIGH -- Color values are based on Bumble's actual brand color (verified via multiple brand color databases) and tested for contrast compliance.

### Spacing System

**Recommendation:** Use Tailwind's built-in 4px grid spacing scale. No custom tokens needed.

| Tailwind Class | Value | Usage |
|----------------|-------|-------|
| `gap-1` / `p-1` | 4px | Tight spacing (icon-to-text) |
| `gap-2` / `p-2` | 8px | Compact spacing (within components) |
| `gap-3` / `p-3` | 12px | Default internal padding |
| `gap-4` / `p-4` | 16px | Standard spacing between elements |
| `gap-6` / `p-6` | 24px | Section spacing |
| `gap-8` / `p-8` | 32px | Large section breaks |
| `gap-12` / `p-12` | 48px | Page-level vertical spacing |

**Key rules:**
- Content column horizontal padding: `px-4` (16px) on mobile, no increase on desktop (column is already narrow).
- Card internal padding: `p-4` (16px) on mobile.
- Space between answer option cards: `gap-3` (12px) -- tight enough to see multiple options, loose enough for distinct touch targets.
- Header height: `h-14` (56px) -- provides 48px+ touch target for all header elements with internal padding.

**Confidence:** HIGH -- Tailwind's 4px scale is the industry standard. No custom values needed.

### Error State Visual Treatment

**Recommendation:** Red (`--destructive`) on white card, with black text. Never red on yellow (poor contrast, visually jarring).

```tsx
// Error states always render in a white card container
<div className="rounded-xl border-2 border-destructive bg-card p-4">
  <p className="text-destructive font-medium">Error title</p>
  <p className="text-card-foreground">Error description</p>
</div>
```

**Confidence:** HIGH -- Standard pattern.

### Loading Skeleton Design

**Recommendation:** Pulse animation on muted yellow (`--muted` = `45 40% 90%`) blocks. Match the shape of the content they replace.

```tsx
// Skeleton for an answer option card
<div className="w-full rounded-xl border-2 border-muted p-4 animate-pulse">
  <div className="h-5 w-3/4 rounded bg-muted" />
</div>
```

**Confidence:** HIGH -- Standard pattern using shadcn/ui's existing Skeleton component approach.

### Transition Timing and Easing Curves

**Recommendation:**

| Transition | Duration | Easing | CSS |
|-----------|----------|--------|-----|
| Question slide-in | 300ms | ease-out | `transition: transform 300ms ease-out, opacity 300ms ease-out` |
| Question slide-out | 200ms | ease-in | `transition: transform 200ms ease-in, opacity 200ms ease-in` |
| Button hover/active | 150ms | ease | `transition: background-color 150ms ease, color 150ms ease` |
| Card selection fill | 150ms | ease | `transition: background-color 150ms ease, color 150ms ease` |
| Dropdown open/close | 200ms | ease-out | Built into Radix primitives |

**Rationale:**
- Slide-in is slower (300ms) to let users perceive the movement and direction. Slide-out is faster (200ms) to feel responsive.
- Interactive state changes (hover, active, selection) are quick (150ms) for immediate feedback.
- All durations are under 400ms to avoid feeling sluggish on mobile.

**Confidence:** HIGH -- Standard animation timing patterns.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 (2025) | File must be renamed. `proxy.ts` runs on Node.js runtime (not Edge). |
| Physical CSS (`ml-4`, `text-left`) | Logical CSS (`ms-4`, `text-start`) | Tailwind v3.3 (2023), shadcn RTL (Jan 2026) | All directional properties must use logical equivalents. |
| `tailwindcss-rtl` plugin | Tailwind native logical properties | Tailwind v3.3+ | No plugin needed. Built-in support. |
| `unstable_setRequestLocale` | `setRequestLocale` | next-intl v4.0 (March 2025) | API stabilized. Still required for static rendering but no longer "unstable" prefix. |
| `router.locale` (Pages Router) | `[locale]` segment + `useLocale()` | Next.js App Router + next-intl v3+ | Locale is URL-based, not router property. |
| framer-motion page transitions | CSS View Transitions API (experimental) | React Canary + Next.js 16 experimental | Not production-ready yet. Use CSS transitions for now. |

**Deprecated/outdated:**
- `middleware.ts` filename: Renamed to `proxy.ts` in Next.js 16.
- `tailwindcss-rtl` plugin: Redundant since Tailwind v3.3.
- `tailwindcss-flip` plugin: Too aggressive -- flips everything including things that shouldn't flip.
- Dark mode in this project: Single-mode design (yellow/black). Remove `.dark` CSS variables.

## Existing Codebase: Physical CSS Audit

The current codebase contains these physical CSS properties that **must be converted** to logical equivalents:

| File | Physical Property | Replacement |
|------|-------------------|-------------|
| `src/components/quiz/ProgressBar.tsx:34` | `text-right` | `text-end` |
| `src/components/quiz/FeedbackDisplay.tsx:58` | `ml-2` | `ms-2` |
| `src/components/quiz/StartScreen.tsx:62` | `mr-2` | `me-2` |
| `src/components/quiz/TextInput.tsx:54` | `text-right` | `text-end` |
| `src/components/quiz/ProfileSelect.tsx:53` | `right-4` | `end-4` |
| `src/components/quiz/ProfileSelect.tsx:58` | `pr-8` | `pe-8` |
| `src/app/quiz/results/page.tsx:158` | `mr-2` (ArrowLeft icon) | `me-2` + `rtl:rotate-180` on icon |
| `src/app/quiz/results/page.tsx:220` | `mr-2` | `me-2` |

These files are inherited from Corso AI and will be either migrated or replaced. The audit ensures no physical properties survive.

## Open Questions

1. **shadcn/ui `migrate rtl` scope with new-york style**
   - What we know: The docs say automatic RTL is available for projects using new styles (`base-nova`, `radix-nova`). The existing project uses `new-york` style.
   - What's unclear: Whether `migrate rtl` works on `new-york` style or only on newer style variants.
   - Recommendation: Try running `pnpm dlx shadcn@latest migrate rtl` and verify output. If it doesn't transform `new-york` components, do a manual find-replace using the logical property mapping table.

2. **next-intl localePrefix mode for default locale**
   - What we know: next-intl supports `localePrefix: 'always' | 'as-needed' | 'never'`. The design decision says URLs should encode language in path (`/it/`, `/ar/`).
   - What's unclear: Whether the default locale (Italian) should show the prefix or not. `/it/tree` vs `/tree` (with Italian being the implicit default).
   - Recommendation: Use `localePrefix: 'always'` so ALL URLs have a locale prefix. This matches the sospermesso.it structure (users land from `/en`, `/fr` pages on the main site) and avoids ambiguity. Every URL is explicit: `/it/`, `/ar/`, `/en/`.

3. **IBM Plex Sans Arabic or Cairo -- visual validation needed**
   - What we know: IBM Plex Sans Arabic has better geometric/grotesque alignment with Inter. Cairo is warmer and more friendly.
   - What's unclear: How each actually looks alongside Inter in the yellow/black design at the text sizes specified (large, generous).
   - Recommendation: Implement with IBM Plex Sans Arabic first. If it feels too corporate/cold during visual review, swap to Cairo (same loading pattern, just change the import).

## Sources

### Primary (HIGH confidence)
- [next-intl App Router with i18n routing](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) -- complete setup guide with all files
- [next-intl routing setup](https://next-intl.dev/docs/routing/setup) -- routing.ts, navigation.ts configuration
- [next-intl proxy/middleware](https://next-intl.dev/docs/routing/middleware) -- proxy.ts setup for Next.js 16
- [next-intl routing configuration](https://next-intl.dev/docs/routing/configuration) -- localePrefix modes, localeDetection
- [shadcn/ui RTL documentation](https://ui.shadcn.com/docs/rtl) -- RTL support overview, CLI migrate command
- [shadcn/ui RTL Next.js setup](https://ui.shadcn.com/docs/rtl/next) -- DirectionProvider, font loading for Arabic
- [shadcn/ui January 2026 RTL changelog](https://ui.shadcn.com/docs/changelog/2026-01-rtl) -- RTL release details
- [Tailwind CSS v3.3 logical properties](https://tailwindcss.com/blog/tailwindcss-v3-3) -- native ms-/me-/ps-/pe- support
- [Next.js 16 proxy.ts](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) -- middleware renamed to proxy
- [Next.js viewTransition experimental](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition) -- experimental flag, not production-ready
- [IBM Plex Sans Arabic on Google Fonts](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic) -- font specimen, weights
- [Cairo on Google Fonts](https://fonts.google.com/specimen/Cairo) -- variable font, weight range 200-1000

### Secondary (MEDIUM confidence)
- [Bumble brand color #FFC629](https://www.schemecolor.com/bumble-logo-color.php) -- verified via multiple brand color databases
- [IKEA brand color #FBD914](https://www.brandcolorcode.com/ikea) -- reference for yellow comparison
- [Taxi cab yellow #FDB813](https://colorcodes.io/yellow/taxi-cab-yellow-color-codes/) -- reference
- [Flowbite RTL guide](https://flowbite.com/docs/customize/rtl/) -- RTL implementation patterns with Tailwind
- [10 Arabic Fonts Every UX Designer Should Know (2025)](https://ahmedelramlawy.com/10-arabic-fonts-every-ux-designer-should-know-in-2025/) -- Arabic font recommendations
- [27 Best Free Modern Geometric Arabic Fonts](https://fontadvice.com/font-collections/modern-geometric-arabic-fonts/) -- geometric Arabic font listing
- [next-view-transitions npm](https://www.npmjs.com/package/next-view-transitions) -- alternative transition approach

### Tertiary (LOW confidence)
- Specific download statistics and "930K+ weekly" for next-intl -- from prior project research, not independently re-verified in this session
- IBM Plex Sans Arabic "harmonizes with Inter" -- subjective design assessment based on type classification (both grotesque/geometric), not visual A/B testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified against official documentation. next-intl, shadcn RTL, Tailwind logical properties are well-documented and mature.
- Architecture: HIGH -- File structure follows next-intl official examples. Locale layout pattern is documented with code examples.
- Design tokens: MEDIUM -- Yellow hex value is based on Bumble brand research. Tint variations are calculated, not tested in production. Arabic font recommendation is informed but not visually validated.
- Pitfalls: HIGH -- Physical CSS audit done against actual codebase. Migration risks are concrete and verifiable.

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days -- stable domain, libraries unlikely to change)
