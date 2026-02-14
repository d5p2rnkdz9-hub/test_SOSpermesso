# Stack Research: Multilingual i18n + RTL for SOSpermesso

**Domain:** Multilingual legal decision tree (Next.js App Router)
**Researched:** 2026-02-14
**Confidence:** HIGH (all core recommendations verified against official documentation)

## Existing Stack (inherited from Corso AI fork)

| Technology | Version | Role |
|------------|---------|------|
| Next.js | ^16.1.6 | App Router framework |
| React | ^19.0.0 | UI |
| Supabase (Prisma) | Prisma ^5.22.0 | Database |
| Tailwind CSS | ^3.4.1 | Styling |
| shadcn/ui | new-york style | Component library |
| Zustand | ^5.0.11 | Client state |
| Zod | ^4.3.6 | Validation |
| Vercel | -- | Hosting |

**Key observation:** The fork already has `components.json` with `"rtl": false`. shadcn/ui's January 2026 RTL release means we can flip this flag and migrate components with a single CLI command.

---

## Recommended Stack: i18n + RTL Layer

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **next-intl** | ^4.8 (latest 4.x) | i18n framework: routing, message loading, formatting | De facto standard for Next.js App Router i18n. 930K+ weekly npm downloads. First-class App Router support with Server Components, `[locale]` routing, ICU message syntax, strict TypeScript types. v4.0 (March 2025) added ESM-only build, strict locale typing, GDPR-compliant cookies. Actively maintained by @amannn. The only library that natively handles `proxy.ts` (Next.js 16 rename of middleware.ts). | HIGH |
| **shadcn/ui RTL mode** | latest CLI (Jan 2026 release) | RTL component transformation | shadcn/ui shipped first-class RTL support in January 2026. Setting `"rtl": true` in `components.json` + running `pnpm dlx shadcn@latest migrate rtl` converts all physical CSS classes (ml-4, text-left, left-*) to logical equivalents (ms-4, text-start, start-*). Icons auto-flip with `rtl:rotate-180`. This is the exact stack we already use -- zero new dependencies. | HIGH |
| **Tailwind CSS logical properties** | built-in since v3.3 | RTL-safe spacing/positioning | Tailwind v3.3+ natively supports `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`, `start-*`, `end-*`. These CSS logical properties auto-flip in RTL without any plugin. Since we're on Tailwind ^3.4.1, this works out of the box. No plugin needed. | HIGH |
| **Crowdin** | Cloud (free for open-source) | Translation management + AI pre-translation | Free for open-source projects. Native GitHub integration (auto-PRs with translation updates). Built-in AI pre-translation using OpenAI/Anthropic/Google models. Supports JSON message files natively. 700+ integrations. next-intl docs officially recommend Crowdin. The `crowdin.yml` config maps directly to next-intl's `messages/*.json` structure. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@radix-ui/react-direction** | latest | DirectionProvider for Radix primitives | Wrap root layout to propagate `dir="rtl"` to all Radix-based shadcn components (dialogs, popovers, dropdowns). Already a transitive dependency via shadcn/ui. | HIGH |
| **Noto Sans Arabic** (Google Font) | via `next/font/google` | Arabic font | Load conditionally for Arabic locale. Noto family recommended by shadcn/ui RTL docs. Use `next/font/google` for optimization. | HIGH |
| **Inter** (Google Font) | via `next/font/google` | Latin script font | Already used in Tailwind config. Keep as default for IT/FR/EN/ES. | HIGH |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Crowdin CLI** | Sync translations locally | `npm install -g @crowdin/cli`. Config: `crowdin.yml` at project root. Commands: `crowdin upload sources`, `crowdin download`. |
| **next-intl TypeScript plugin** | Compile-time message key validation | Built into next-intl 4.x. Catches missing translation keys at build time via augmented types. |
| **shadcn CLI** | RTL migration | `pnpm dlx shadcn@latest migrate rtl` -- one-time migration of all components. |

---

## Installation

```bash
# Core i18n
npm install next-intl

# That's it for new dependencies.
# shadcn/ui RTL is a CLI migration, not a package install.
# Crowdin is a cloud service + CLI tool.

# Dev tools (optional, for local Crowdin workflow)
npm install -g @crowdin/cli
```

**Total new runtime dependencies: 1 (next-intl).** Everything else is either already in the stack, a dev tool, or a cloud service.

---

## Architecture Changes to Corso AI Fork

### 1. File Structure Transformation

**Before (current Corso AI):**
```
src/
  app/
    layout.tsx          ← hardcoded lang="it"
    page.tsx
    quiz/
      page.tsx
      results/page.tsx
```

**After (SOSpermesso with i18n):**
```
messages/
  it.json               ← Italian (source of truth)
  ar.json               ← Arabic (from Crowdin)
  fr.json               ← French
  en.json               ← English
  es.json               ← Spanish
src/
  i18n/
    routing.ts           ← defineRouting({ locales, defaultLocale })
    request.ts           ← getRequestConfig (load messages per locale)
    navigation.ts        ← createNavigation (locale-aware Link, redirect)
  app/
    [locale]/            ← NEW: all pages move under [locale] segment
      layout.tsx         ← dynamic lang + dir, NextIntlClientProvider
      page.tsx
      questionnaire/
        page.tsx
        results/page.tsx
proxy.ts                 ← NEW: replaces middleware.ts (Next.js 16 naming)
crowdin.yml              ← NEW: Crowdin source/translation file mapping
```

### 2. Root Layout Changes

**Current:**
```tsx
<html lang="it">
  <body className="antialiased">{children}</body>
</html>
```

**Required:**
```tsx
import { NextIntlClientProvider } from 'next-intl';
import { DirectionProvider } from '@/components/ui/direction';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body className="antialiased">
        <DirectionProvider direction={direction}>
          <NextIntlClientProvider>
            {children}
          </NextIntlClientProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
```

### 3. next.config.ts Change

**Current:** Empty config.
**Required:**
```tsx
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

### 4. proxy.ts (NEW file)

```tsx
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
```

**Critical Next.js 16 note:** This file is `proxy.ts`, NOT `middleware.ts`. Next.js 16 renamed middleware to proxy. The proxy runs on Node.js runtime (NOT edge). next-intl's latest docs already reflect this.

### 5. components.json Change

**Current:** `"rtl": false`
**Required:** `"rtl": true`

Then run: `pnpm dlx shadcn@latest migrate rtl`

This one command converts all existing shadcn components from physical to logical CSS classes.

### 6. crowdin.yml (NEW file)

```yaml
files:
  - source: /messages/it.json
    translation: /messages/%locale%.json
```

---

## Translation Pipeline: AI-Assisted Workflow

### How It Works

```
1. Write content in Italian (messages/it.json)
   |
2. Push to GitHub (main branch)
   |
3. Crowdin syncs source file automatically (GitHub integration)
   |
4. Crowdin AI pre-translates to AR, FR, EN, ES
   |  - Uses OpenAI/Anthropic models configured in Crowdin
   |  - Respects glossary (legal terms: permesso di soggiorno, etc.)
   |  - Respects context from TM (translation memory)
   |
5. Human review in Crowdin editor (optional but recommended for legal)
   |
6. Crowdin creates PR with updated messages/*.json files
   |
7. Merge PR → deploy via Vercel
```

### Why Crowdin Over Alternatives

| Criterion | Crowdin | Tolgee | Lokalise |
|-----------|---------|--------|----------|
| **Price for this project** | Free (open source) | Free tier: 1,000 keys (may be tight with 40 questions + 25 schede) | $140/mo minimum |
| **AI pre-translation** | Built-in, multi-model (OpenAI, Anthropic, Google) | Basic MT only | Built-in AI |
| **GitHub auto-sync** | Native, battle-tested | Via CLI only | Native |
| **JSON format support** | Native, including ICU | Native | Native |
| **Glossary/TM** | Full support (critical for legal terms) | Basic | Full |
| **Community translation** | Built for it (good if volunteers help) | Possible | Not oriented |
| **next-intl recommendation** | Officially listed in next-intl docs | Not mentioned | Not mentioned |

**Verdict:** Crowdin is the clear choice. Free for open source, officially recommended by next-intl, AI pre-translation with legal glossary support, and battle-tested GitHub integration. SOSpermesso qualifies for the free open-source plan since it's a nonprofit legal aid tool.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| **next-intl** | next-i18next | next-i18next is NOT compatible with App Router. It was built for Pages Router and has no clean integration with Server Components or `[locale]` routing. The maintainer has stated it's designed for older Next.js patterns. |
| **next-intl** | react-intl (FormatJS) | Lower-level, no built-in routing/middleware for Next.js. You'd need to build locale routing, message loading, and middleware from scratch. next-intl wraps ICU (same spec as react-intl) with Next.js-specific conveniences. |
| **next-intl** | Paraglide (Inlang) | Interesting compiler-based approach but much smaller ecosystem (newer project). Less community support, fewer examples. Would be higher risk for a legal tool that needs to be reliable. |
| **next-intl** | next-intlayer | Newer project, smaller community. next-intl has 5x+ the downloads and mature documentation. |
| **Crowdin** | Tolgee (self-hosted) | Good OSS alternative but free cloud tier is limited (1,000 keys may not suffice for 40 questions + 25 schede x 5 sections each). GitHub sync requires CLI rather than native integration. Weaker AI translation. |
| **Crowdin** | Manual JSON files + Claude API | Tempting for an AI course project, but: no translation memory, no glossary enforcement, no review UI, no PR automation, no collaborative editing. You'd build a worse version of what Crowdin offers free. |
| **Tailwind logical properties** | tailwindcss-rtl plugin | Unnecessary -- Tailwind v3.3+ has native logical property support. The plugin adds complexity for zero benefit on our version. |
| **Tailwind logical properties** | tailwindcss-flip plugin | Automatically flips ALL utilities -- too aggressive. Logical properties are surgical and intentional. Flip can break things that should stay physical (e.g., a logo position). |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **next-i18next** | Incompatible with App Router. Designed for Pages Router. Would require fighting the framework. | next-intl |
| **i18next (raw)** | Generic React library, not Next.js-aware. No routing, no middleware, no Server Component support. Requires heavy custom wiring. | next-intl (which uses ICU internally) |
| **tailwindcss-flip** | Brute-force approach that flips ALL directional utilities. Causes bugs when some things (logos, icons, specific layouts) should NOT flip. | Tailwind's native logical properties (ms-, me-, ps-, pe-, text-start, etc.) |
| **tailwindcss-rtl** (plugin) | Redundant since Tailwind v3.3 has built-in logical properties. Adds an unnecessary dependency. | Built-in ms-/me-/ps-/pe- classes |
| **DIY translation pipeline** | Building your own AI translation system sounds fun but produces a fragile, unmaintainable workflow without glossaries, TM, review UI, or PR automation. | Crowdin (free for OSS, does all of this) |
| **Google Translate API direct** | No context awareness, no glossary, no review workflow, inconsistent quality for legal content. Crowdin wraps this AND better models. | Crowdin AI pre-translation |
| **Storing translations in Supabase** | Over-engineering for static legal content. JSON files with next-intl are simpler, faster (no DB round-trip), cacheable, and work with SSG. Database translations make sense for user-generated content, not fixed legal text. | File-based messages/\*.json |
| **middleware.ts** | Renamed to `proxy.ts` in Next.js 16. Using the old name will not work. | proxy.ts |

---

## Stack Patterns by Variant

**If adding a new language later (e.g., Bengali, Chinese):**
1. Add locale code to `routing.ts` locales array
2. Add font (if new script) via `next/font/google`
3. If RTL: no extra work needed (logical properties already in place)
4. Crowdin auto-detects new target language
5. Run AI pre-translation in Crowdin
6. Merge PR with new `messages/bn.json`

**If content changes (new question or scheda):**
1. Update `messages/it.json` (source)
2. Push to GitHub
3. Crowdin syncs, shows "new untranslated strings"
4. Run AI pre-translation for new strings only
5. Review, approve, merge PR

**If legal terms need consistent translation (e.g., "permesso di soggiorno"):**
1. Add term to Crowdin glossary with translations per language
2. AI pre-translation respects glossary entries
3. Translators see glossary hints in editor

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next-intl ^4.8 | Next.js 14, 15, 16 | v4.0+ supports `proxy.ts` naming for Next.js 16. ESM-only. |
| next-intl ^4.8 | TypeScript 5+ | Required for augmented types and strict locale typing. |
| next-intl ^4.8 | React 19 | Server Components fully supported. |
| shadcn/ui RTL | Tailwind ^3.3+ | Logical properties require Tailwind v3.3 minimum. We have ^3.4.1. |
| shadcn/ui RTL | components.json | Requires `"rtl": true` in components.json. Our fork already has this field (set to false). |
| Crowdin | next-intl JSON format | Direct compatibility. `messages/%locale%.json` maps 1:1. |

---

## RTL Implementation: Concrete Approach

RTL is not "just add `dir=rtl`". Here is the complete approach:

### Layer 1: HTML Direction (automatic via next-intl)
- Root layout sets `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>` dynamically
- All CSS logical properties respond to this automatically

### Layer 2: Component RTL (shadcn/ui migration)
- Run `shadcn migrate rtl` once to convert all components
- `DirectionProvider` wraps the app for Radix primitives
- Three components need manual attention: Calendar, Pagination, Sidebar

### Layer 3: Custom CSS (Tailwind logical properties)
- All new code uses `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`
- Never write `ml-*`, `mr-*`, `pl-*`, `pr-*`, `text-left`, `text-right`
- Use `rtl:` variant for exceptions (e.g., `rtl:rotate-180` for directional icons)

### Layer 4: Typography
- Arabic locale loads Noto Sans Arabic via `next/font/google`
- Latin locales use Inter (already configured)
- Font loaded conditionally per locale in layout

### Layer 5: Content Direction
- ICU message format handles RTL text interpolation correctly
- No special handling needed for mixed LTR/RTL content within messages -- browsers handle bidi natively with `dir` attribute

### What You Don't Need to Do
- No per-component RTL conditionals (logical properties handle this)
- No separate RTL stylesheet (CSS logical properties are a single set of rules)
- No RTL testing plugin (just set browser to Arabic and verify visually)

---

## Sources

### HIGH Confidence (Official Documentation)
- [next-intl official docs: App Router setup](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl official docs: Routing setup](https://next-intl.dev/docs/routing/setup)
- [next-intl official docs: Proxy/middleware](https://next-intl.dev/docs/routing/middleware)
- [next-intl 4.0 release blog](https://next-intl.dev/blog/next-intl-4-0)
- [next-intl Crowdin integration docs](https://next-intl.dev/docs/workflows/localization-management)
- [shadcn/ui RTL documentation](https://ui.shadcn.com/docs/rtl)
- [shadcn/ui RTL changelog (January 2026)](https://ui.shadcn.com/docs/changelog/2026-01-rtl)
- [shadcn/ui Next.js RTL setup](https://ui.shadcn.com/docs/rtl/next)
- [Tailwind CSS v3.3 logical properties](https://tailwindcss.com/blog/tailwindcss-v3-3)
- [Crowdin GitHub integration](https://support.crowdin.com/github-integration/)
- [Crowdin AI pre-translation](https://support.crowdin.com/pre-translation/)
- [Crowdin open source program](https://crowdin.com/product/for-open-source)
- [next-intl npm (v4.8.2 current)](https://www.npmjs.com/package/next-intl)

### MEDIUM Confidence (Verified with multiple sources)
- [Crowdin pricing (free for OSS, Pro from $59/mo)](https://crowdin.com/pricing)
- [Tolgee pricing and comparison](https://tolgee.io/pricing)
- [RTL implementation patterns (Flowbite guide)](https://flowbite.com/docs/customize/rtl/)
- [shadcn/ui RTL issue discussion](https://github.com/shadcn-ui/ui/issues/2759)

### LOW Confidence (Single source, needs validation)
- Tolgee free tier exact key limit (reported as 1,000 keys in comparison articles, but could not verify on pricing page due to JS-rendered content)
- Crowdin AI pre-translation claiming "95% publish-ready" quality (marketing claim, real-world legal content quality needs testing)

---
*Stack research for: SOSpermesso multilingual i18n + RTL*
*Researched: 2026-02-14*
