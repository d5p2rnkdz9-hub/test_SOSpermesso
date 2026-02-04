# Technology Stack

**Project:** Pre-training Assessment Platform for AI Courses (Italian Lawyers)
**Researched:** 2026-02-04
**Overall Confidence:** HIGH

## Executive Summary

The 2025 standard for branching questionnaire platforms is a Next.js full-stack application with TypeScript, deployed on Vercel. The ecosystem has consolidated around:
- **Next.js 16** with App Router for full-stack React development
- **Supabase** for database, auth, and real-time subscriptions
- **shadcn/ui + Tailwind CSS v4** for UI components
- **React Hook Form + Zod** for form validation
- **Zustand** for client-side state management

This stack provides excellent DX, minimal boilerplate, type safety throughout, and scales from MVP to production without major rewrites.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 16.1.6 | Full-stack React framework | App Router provides file-based routing, server components, server actions, and API routes in one framework. Perfect for quiz platforms with both user-facing assessments and admin dashboards. Built-in SSR improves performance. Native Vercel deployment. |
| **React** | 19.2.4 | UI library | Latest stable version with improved concurrent features. React 19 brings performance improvements and better TypeScript support. Industry standard for interactive UIs. |
| **TypeScript** | 5.9.3 | Type safety | Essential for complex branching logic. Prevents runtime errors in rule engines. Excellent autocomplete for faster development. Type inference with Zod schemas eliminates duplication. |
| **Node.js** | 20.x LTS | Runtime | Required for Next.js. Use LTS version for stability. |

**Confidence:** HIGH - Verified via npm registry, official Next.js docs confirm App Router maturity.

**Why Next.js over alternatives:**
- **vs. Vite + React Router:** Next.js provides backend (API routes, server actions) + frontend in one framework. No need for separate Express server.
- **vs. Create React App:** CRA is deprecated. Next.js is the official React team recommendation.
- **vs. Remix:** Next.js has larger ecosystem, better Vercel integration, more mature component libraries (shadcn/ui).

---

### Database & Backend

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Supabase** | 2.94.1 | PostgreSQL database + Auth + Realtime | Open-source Firebase alternative. Provides dedicated PostgreSQL database with auto-generated REST API, authentication (email/magic link), Row Level Security for multi-tenancy, and real-time subscriptions (if admin wants live dashboard updates). Better fit than Firebase because quiz platforms need relational data (questions → answers → rules → levels). Postgres handles complex joins for reporting. Free tier: 500MB database, unlimited API requests. |
| **@supabase/ssr** | Latest | Supabase auth helpers for Next.js | Replaces deprecated `@supabase/auth-helpers-nextjs`. Provides cookie-based auth (secure, SSR-compatible). Exports `createBrowserClient` and `createServerClient` for proper client/server separation. |

**Confidence:** HIGH - Verified via npm registry. Official Supabase docs (2025) recommend `@supabase/ssr` for Next.js App Router.

**Why Supabase over alternatives:**
- **vs. Firebase:** Supabase uses PostgreSQL (relational), better for quiz platforms with structured data. SQL queries easier for complex reporting. Open-source, no vendor lock-in.
- **vs. PlanetScale/Neon/Vercel Postgres:** Supabase bundles database + auth + realtime + storage. Less integration work. Free tier more generous.
- **vs. Self-hosted Postgres:** Supabase provides auth, real-time, auto-generated API, admin UI. Saves weeks of development time.

---

### UI & Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | 4.1.18 (v4) | Utility-first CSS framework | Industry standard for 2025. V4 released with performance improvements. Faster than writing custom CSS. All Next.js templates use Tailwind. Responsive utilities (`sm:`, `md:`, `lg:`) simplify mobile-first design. |
| **shadcn/ui** | Latest | Copy-paste component library | NOT a dependency - you own the code. Built on Radix UI (accessible primitives) + Tailwind CSS. Updated for React 19 and Tailwind v4 in 2025. Provides production-ready components (forms, modals, dropdowns) that you can customize. Better than component libraries because you control the code. |
| **Radix UI** | Via shadcn/ui | Headless UI primitives | Accessible components (keyboard nav, ARIA labels, focus management). Used by shadcn/ui under the hood. |
| **clsx + tailwind-merge** | Latest | Conditional class utilities | `clsx` for conditional classes, `tailwind-merge` to prevent conflicts. Standard pattern in shadcn/ui components. |

**Confidence:** HIGH - shadcn/ui official docs confirm React 19 and Tailwind v4 support. WebSearch results show dominance in 2025 ecosystem.

**Why shadcn/ui over alternatives:**
- **vs. Material UI (MUI):** shadcn/ui is lighter (no runtime dependency), more customizable, Tailwind-native. MUI has opinionated design that's harder to customize.
- **vs. Chakra UI:** shadcn/ui uses Radix (more accessible), copy-paste approach gives full control. Chakra has runtime styling overhead.
- **vs. DaisyUI:** shadcn/ui provides TypeScript-first components with better type safety. DaisyUI is class-based only.
- **vs. Ant Design:** shadcn/ui is more modern, lightweight, and aligned with current React patterns.

---

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React Hook Form** | 7.71.1 | Form state management | Industry standard for React forms. Uncontrolled components = better performance (fewer re-renders). Integrates with Zod via `@hookform/resolvers/zod`. Supports complex forms with dynamic fields (needed for branching logic). |
| **Zod** | 4.3.6 | Schema validation | TypeScript-native validation. Define schema once, get runtime validation + TypeScript types via `z.infer<typeof schema>`. Better than writing validation logic manually. Validates question responses, admin inputs, API payloads. |
| **@hookform/resolvers** | Latest | Resolver for RHF + Zod | Bridge between React Hook Form and Zod. Allows Zod schemas as validation source. |

**Confidence:** HIGH - npm registry confirms versions. Official React Hook Form docs recommend Zod integration.

**Why React Hook Form + Zod over alternatives:**
- **vs. Formik:** React Hook Form has better performance (uncontrolled), smaller bundle size, more active development.
- **vs. Yup:** Zod is TypeScript-native (better type inference), more modern API, growing ecosystem.
- **vs. Native HTML validation:** Not enough for complex branching rules. Need custom validation logic for multi-step forms.

---

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zustand** | 5.0.11 | Client-side state management | Lightweight (1KB), minimal boilerplate. Manages quiz session state (current question index, answers, branching path). Better performance than Context API (only re-renders subscribed components). Supports middleware (persist answers to localStorage for recovery). Standard choice in 2025 for small-to-medium apps. |
| **React Server Components** | Built into Next.js 16 | Server-side data fetching | Use RSC for fetching questions from Supabase. Reduces client bundle size. Data never leaves server until needed. |

**Confidence:** HIGH - npm registry confirms version. 2025 WebSearch consensus: Zustand is the "versatile middle ground" for most projects.

**Why Zustand over alternatives:**
- **vs. Context API:** Context causes re-renders of all consuming components. Zustand only re-renders components that subscribe to changed state. Better performance for quiz apps with frequent state updates.
- **vs. Redux Toolkit:** Redux has more boilerplate (actions, reducers, slices). Zustand is simpler for small apps. Redux better for large enterprise apps with complex state interactions.
- **vs. Jotai/Recoil:** Zustand is more established, better documentation, simpler mental model.

**Pattern:** Use Zustand for **client state** (quiz session, UI state). Use Supabase + React Server Components for **server state** (questions, user data).

---

### Internationalization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **next-intl** | Latest | i18n for Next.js | De facto standard for Next.js i18n in 2025. Works with App Router. Type-safe translations. Supports Italian language (confirmed via real-world implementations). Simpler than `next-i18next` for App Router projects. |

**Confidence:** MEDIUM - WebSearch shows next-intl as 2025 standard, but not verified via Context7.

**Why next-intl over alternatives:**
- **vs. Built-in Next.js i18n routing:** Built-in routing doesn't handle translations, only locale detection. next-intl provides translation management.
- **vs. react-i18next:** next-intl designed specifically for Next.js App Router. Better SSR support.
- **vs. Custom solution:** next-intl handles pluralization, date formatting, number formatting out of box.

**Note:** For single-language Italian MVP, i18n can be deferred. Add when planning English expansion.

---

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vitest** | Latest | Test runner | Faster than Jest for Vite-based projects. Better TypeScript support. Compatible with Jest API (easy migration). 2025 standard for modern projects. |
| **React Testing Library** | Latest | Component testing | Tests components from user perspective (not implementation details). Works with Vitest. Standard for React testing. |
| **Playwright** | Latest | E2E testing | Tests full quiz flow (start → answer → branching → results). Better than Cypress for Next.js (official Next.js docs recommend Playwright). |

**Confidence:** HIGH - Next.js official testing docs recommend Vitest + Playwright. WebSearch confirms 2025 adoption.

**Why this testing stack:**
- **vs. Jest:** Vitest is faster, better ESM support, native TypeScript. Jest has legacy config issues with Next.js App Router.
- **vs. Cypress:** Playwright is faster, better debugging tools, official Next.js recommendation.

---

### Deployment & Infrastructure

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vercel** | N/A | Hosting platform | Built by Next.js creators. Zero-config deployment. Automatic preview deployments for PRs. Edge functions for dynamic content. Free tier: 100GB bandwidth, unlimited deployments. Best Next.js performance (optimized edge network). |
| **Supabase Cloud** | N/A | Database hosting | Free tier: 500MB database, 2GB file storage, 50K monthly active users. Auto-scaling. Automatic backups. Database hosted on AWS (reliable). |

**Confidence:** HIGH - Vercel is the official Next.js deployment platform.

**Why Vercel over alternatives:**
- **vs. Netlify:** Vercel has better Next.js optimization (same company). Netlify requires adapter for full Next.js features.
- **vs. Railway/Render:** Vercel free tier more generous. Better CDN. Automatic image optimization.
- **vs. Self-hosted (VPS):** Vercel handles scaling, CDN, SSL, monitoring. Saves DevOps time.

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **date-fns** | Latest | Date utilities | If tracking quiz completion timestamps, expiration dates. Lighter than Moment.js. Tree-shakeable. |
| **recharts** | Latest | Data visualization | For admin dashboard charts (response distribution, completion rates). Built on React + D3. Lightweight. |
| **lucide-react** | Latest | Icon library | Modern, consistent icons. Tree-shakeable. Used by shadcn/ui. |
| **sonner** | Latest | Toast notifications | Accessible toast notifications. Used by shadcn/ui. Shows feedback after quiz submission. |

**Confidence:** MEDIUM - These are standard shadcn/ui ecosystem libraries but not critical path.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 16 | Remix | Smaller ecosystem, fewer component libraries, less Vercel integration |
| Framework | Next.js 16 | Astro | Better for content sites, not interactive apps. No built-in backend. |
| Database | Supabase | Firebase | NoSQL (Firestore) less suitable for relational quiz data. Vendor lock-in. |
| Database | Supabase | PlanetScale | No built-in auth or realtime. Requires additional services. |
| UI Library | shadcn/ui | Material UI (MUI) | Heavier bundle, harder to customize, opinionated design. |
| UI Library | shadcn/ui | Ant Design | Opinionated design, larger bundle, not Tailwind-native. |
| Forms | React Hook Form | Formik | Slower (controlled components), larger bundle, less active development. |
| Validation | Zod | Yup | Not TypeScript-native, weaker type inference. |
| State | Zustand | Redux Toolkit | Too much boilerplate for small app. Overkill for quiz state. |
| State | Zustand | Context API | Performance issues (re-renders all consumers). |
| Hosting | Vercel | Netlify | Requires adapter for full Next.js support. Slower deployments. |
| Testing | Vitest | Jest | Slower, worse TypeScript support, legacy config issues with Next.js. |
| E2E | Playwright | Cypress | Slower, less stable, not official Next.js recommendation. |

---

## Installation

### Initialize Next.js Project

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest quiz-platform \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd quiz-platform
```

### Core Dependencies

```bash
# Database & Auth
npm install @supabase/supabase-js @supabase/ssr

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# State Management
npm install zustand

# UI Components (via shadcn/ui CLI)
npx shadcn@latest init
# Then add components as needed:
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add radio-group
npx shadcn@latest add checkbox
npx shadcn@latest add card
npx shadcn@latest add toast

# Internationalization (if needed)
npm install next-intl

# Utilities
npm install clsx tailwind-merge
npm install lucide-react
npm install date-fns
```

### Dev Dependencies

```bash
# Testing
npm install -D vitest @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test

# TypeScript types
npm install -D @types/node @types/react @types/react-dom
```

### Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Analytics, monitoring
```

---

## Architecture Notes

### Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (quiz)/            # Quiz-taking interface
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes (if needed)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── quiz/              # Quiz-specific components
│   └── admin/             # Admin components
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── validations/       # Zod schemas
│   └── utils.ts           # Utility functions
├── stores/                # Zustand stores
│   └── quiz-store.ts      # Quiz session state
└── types/                 # TypeScript types
```

### Database Schema (Supabase)

```sql
-- questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'multiple_select', 'true_false'
  options JSONB NOT NULL,    -- Array of answer options
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- branching_rules table
CREATE TABLE branching_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id),
  condition JSONB NOT NULL,   -- { answer: 'A', next_question_id: 'uuid' }
  next_question_id UUID REFERENCES questions(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255),
  answers JSONB NOT NULL,     -- { question_id: answer }
  determined_level VARCHAR(50),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- levels table
CREATE TABLE levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,  -- 'beginner', 'intermediate', 'advanced'
  description TEXT,
  rules JSONB NOT NULL,       -- Custom rules for level determination
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Version Management

### Why These Versions?

- **Next.js 16.1.6:** Latest stable (verified 2026-02-04 via npm). App Router is production-ready.
- **React 19.2.4:** Latest stable. Performance improvements over v18.
- **TypeScript 5.9.3:** Latest stable. Improved type inference.
- **Tailwind CSS 4.1.18:** Latest v4 release. Performance improvements.
- **Supabase 2.94.1:** Latest stable client library.
- **React Hook Form 7.71.1:** Latest stable. Mature, battle-tested.
- **Zod 4.3.6:** Latest stable with TypeScript 5.x support.
- **Zustand 5.0.11:** Latest stable. Breaking changes from v4 are minor.

### Update Strategy

- **Lock versions** in `package.json` (no `^` or `~` for production)
- **Review changelogs** before updating Next.js (major versions can break builds)
- **Update quarterly** (security patches, bug fixes)
- **Test staging** before production updates

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Framework (Next.js + React) | **HIGH** | Verified via npm registry. Official Next.js docs confirm App Router maturity. WebSearch shows 2025 ecosystem consolidation around Next.js. |
| Database (Supabase) | **HIGH** | Official Supabase docs updated for 2025. Multiple WebSearch sources confirm PostgreSQL suitability for quiz platforms. npm registry confirms `@supabase/ssr` is current. |
| UI (shadcn/ui + Tailwind) | **HIGH** | shadcn/ui official site confirms React 19 + Tailwind v4 support. WebSearch shows dominance in 2025 React ecosystem. |
| Forms (RHF + Zod) | **HIGH** | npm registry confirms versions. Official docs show integration. WebSearch consensus for 2025 standard. |
| State (Zustand) | **HIGH** | npm registry confirms version. Multiple 2025 WebSearch sources position Zustand as standard for small-medium apps. |
| i18n (next-intl) | **MEDIUM** | WebSearch shows 2025 adoption, but not verified via Context7 or official Next.js docs. Real-world Italian implementations found. |
| Testing (Vitest + Playwright) | **HIGH** | Next.js official testing docs recommend both. WebSearch confirms 2025 best practices. |
| Deployment (Vercel) | **HIGH** | Official Next.js platform. WebSearch shows 2025 templates all deploy to Vercel. |

**Overall Stack Confidence: HIGH** - All critical path technologies verified via npm registry + official docs + 2025 WebSearch consensus.

---

## What NOT to Use

### Deprecated/Outdated

- **Create React App:** Officially deprecated. Use Next.js.
- **@supabase/auth-helpers-nextjs:** Replaced by `@supabase/ssr`.
- **Next.js Pages Router:** Use App Router for new projects.
- **Moment.js:** Deprecated. Use `date-fns` or `dayjs`.

### Overkill for This Project

- **Redux Toolkit:** Too much boilerplate for quiz state. Use Zustand.
- **tRPC:** Not needed with Supabase auto-generated API. Adds complexity.
- **GraphQL (Apollo Client):** Supabase REST API + PostgREST is sufficient. GraphQL adds learning curve.
- **Prisma:** Supabase generates database API automatically. Prisma adds ORM layer unnecessarily.
- **Docker/Kubernetes:** Vercel handles infrastructure. Local Docker not needed for development.

### Wrong Fit for Domain

- **MongoDB/Firestore:** NoSQL less suitable for relational quiz data (questions → rules → answers → levels).
- **Django/Flask:** Python backend adds complexity. Next.js API routes sufficient.
- **WordPress + Quiz Plugin:** Not a custom rules engine. Limited branching logic.

---

## Sources

### Framework & Core Technologies
- [Next.js Official Docs](https://nextjs.org/docs)
- [React Official Docs](https://react.dev)
- [npm registry](https://registry.npmjs.org) (version verification)
- [Building a Quiz App with Next.js (2025)](https://arnab-k.medium.com/building-a-quiz-app-with-next-js-c27e5498ec45)
- [Next.js Quiz Platform Architecture](https://github.com/yusha0123/Quiz-App)

### Database & Backend
- [Supabase vs. Firebase: Which is best? (2025)](https://zapier.com/blog/supabase-vs-firebase/)
- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js + Supabase Cookie-Based Auth (2025 Guide)](https://the-shubham.medium.com/next-js-supabase-cookie-based-auth-workflow-the-best-auth-solution-2025-guide-f6738b4673c1)

### UI & Components
- [shadcn/ui Official Site](https://www.shadcn.io)
- [Tailwind v4 - shadcn/ui Docs](https://ui.shadcn.com/docs/tailwind-v4)
- [14 Best React UI Component Libraries (2026)](https://www.untitledui.com/blog/react-component-libraries)

### Forms & Validation
- [React Hook Form Official Docs](https://react-hook-form.com)
- [Zod Official Docs](https://zod.dev)
- [Learn Zod validation with React Hook Form](https://www.contentful.com/blog/react-hook-form-validation-zod/)

### State Management
- [React State Management in 2025: Context API vs Zustand](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m)
- [State Management in 2025: When to Use Context, Redux, Zustand, or Jotai](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)

### Branching Logic
- [Branching Logic for Quizzes - Interact](https://help.tryinteract.com/en/articles/1193999-branching-logic-for-quizzes)
- [Skip Logic - Definition, Examples, Best Practices (2025)](https://qualaroo.com/blog/skip-logic-survey/)
- [Branching Logic - SurveyJS](https://surveyjs.io/survey-creator/documentation/end-user-guide/branching-logic)

### Testing
- [Testing Next.js Applications (2025 Guide)](https://trillionclues.medium.com/testing-next-js-applications-a-complete-guide-to-catching-bugs-before-qa-does-a1db8d1a0a3b)
- [React & Next.js in 2025 - Modern Best Practices](https://strapi.io/blog/react-and-nextjs-in-2025-modern-best-practices)
- [Next.js Official Testing Docs](https://nextjs.org/docs/pages/guides/testing)

### Internationalization
- [next-intl Official Docs](https://next-intl.dev/)
- [Internationalization (i18n) in Next.js: A Complete Guide](https://arnab-k.medium.com/internationalization-i18n-in-next-js-a-complete-guide-f62989f6469b)
- [next-intl Guide: Add i18n to Next.js 15 (2025)](https://www.buildwithmatija.com/blog/nextjs-internationalization-guide-next-intl-2025)

### Deployment
- [Vercel Next.js Deployment](https://vercel.com/frameworks/nextjs)
- [Mastering Next.js in 2025: Deployment to Vercel](https://medium.com/@ahmedazier/mastering-next-js-in-2025-installation-setup-and-deployment-to-vercel-macos-windows-5bac44cfe3b5)

### Admin Dashboards
- [21+ Best Next.js Admin Dashboard Templates (2025)](https://nextjstemplates.com/blog/admin-dashboard-templates)
- [React Dashboard Libraries: Which One To Use in 2025?](https://www.luzmo.com/blog/react-dashboard)

---

## Next Steps for Implementation

### Phase 1: Foundation Setup
1. Initialize Next.js 16 project with TypeScript + Tailwind
2. Set up Supabase project (database + auth)
3. Install shadcn/ui and configure theme
4. Create basic folder structure

### Phase 2: Database Schema
1. Design Supabase tables (questions, branching_rules, sessions, levels)
2. Set up Row Level Security policies
3. Seed initial questions

### Phase 3: Quiz Flow
1. Build question display components
2. Implement React Hook Form + Zod validation
3. Create Zustand store for quiz state
4. Implement branching logic engine

### Phase 4: Admin Dashboard
1. Build admin authentication
2. Create question management interface
3. Implement rules engine configuration
4. Build response viewing dashboard

### Phase 5: Polish & Deploy
1. Add Italian localization (next-intl)
2. Implement tests (Vitest + Playwright)
3. Deploy to Vercel
4. Connect custom domain

---

**RECOMMENDATION:** Start with this stack as-is. It represents the 2025 standard for quiz platforms and scales from MVP to production without rewrites. All technologies are mature, well-documented, and have large communities for support.
