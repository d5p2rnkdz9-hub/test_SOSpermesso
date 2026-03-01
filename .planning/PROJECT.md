# SOSpermesso - Questionnaire Tool

## What This Is

A web-based legal decision tree that helps migrants in Italy determine whether they have the right to a residence permit (permesso di soggiorno). Through a series of branching questions about their situation — family, age, fear of return, health, exploitation — users are routed to one of ~25 specific legal outcome pages ("schede") with detailed guidance on which permit applies, how to apply, whether they need a lawyer, and links to free legal aid. Replaces the current Typeform-based version at sospermesso.it. Used by both migrants directly and legal aid workers screening clients.

## Core Value

Help migrants quickly understand whether they can get a residence permit and exactly what to do next — in their own language, with a friendly and reassuring tone.

## Current Milestone: v1.1 Polish & Translation

**Goal:** Make the questionnaire fully multilingual, visually match sospermesso.it, fix navigation, and deploy to production.

**Target features:**
- Full i18n for tree content (questions, answers, outcomes) in 5 languages
- CSS restyle to match sospermesso.it visual identity (yellow/gold palette, colored-border cards)
- Back button navigation everywhere (tree, outcome, all pages)
- Netlify deployment on sospermesso.it subdomain

## Requirements

### Validated

- ✓ Branching decision tree with ~40 questions across multiple paths — Phase 2
- ✓ Each path terminates at a specific "scheda" (legal outcome page) — Phase 2
- ✓ ~30 distinct outcome pages with permit type, lawyer level, intro text, links to sospermesso.it guides — Phase 3
- ✓ Variable substitution ([Nome], [Parente selezionato]) — Phase 2-3
- ✓ RTL (right-to-left) layout support for Arabic — Phase 1
- ✓ i18n routing infrastructure (5 locales, next-intl, UI chrome translated) — Phase 1
- ✓ Name collection at start — Phase 2
- ✓ Session persistence (resume if browser closed) — Phase 2
- ✓ Mobile-responsive — Phase 1

### Active

- [ ] Full tree content translation: questions, answers, outcome titles, intro text, FAQ sections in all 5 languages (IT, AR, FR, EN, ES)
- [ ] CSS restyle to match sospermesso.it visual identity (yellow/gold, white bg, colored-border FAQ cards, SOS Permesso header)
- [ ] Back button navigation on all pages (tree questions, outcome, welcome)
- [ ] Deploy to Netlify on sospermesso.it subdomain (e.g. test.sospermesso.it)

### Out of Scope

- Integration with sospermesso.it 11ty site (link to subdomain is sufficient) — different tech stacks
- User accounts/login for migrants — anonymous usage
- Payment processing — free tool
- Mobile app — web-first, responsive design sufficient
- Legal advice generation — tool provides information, not legal counsel
- Editing schede content via admin UI in v1 — content managed in code/data files

## Context

**Existing product:**
- SOSpermesso (sospermesso.it) is a live project helping migrants navigate Italian immigration bureaucracy
- Current questionnaire runs on Typeform — replacing to own the infrastructure and enable multi-language
- Main site runs on Netlify with 11ty (static site generator)
- All question logic, content, and outcome schede already designed and validated in production

**Forked from Corso AI:**
- Reuses the branching questionnaire infrastructure (Next.js + Supabase + Vercel stack)
- Core engine, UI components, session persistence, and database patterns carry over
- Different domain: Corso AI is knowledge assessment (quiz → level), SOSpermesso is legal decision tree (questions → specific legal outcome)

**Decision tree structure (from flowchart):**
- Entry: EU citizen? → Yes = done, No = continue
- Main branch: situation (minor, family, partner, fear, health, pregnancy, exploitation, born in Italy, none)
- Sub-branches drill into specifics: citizenship of relatives, age, dependency, marriage status, permit status
- Terminal nodes are schede with detailed legal information
- Any individual path is 3-8 questions deep

**Content characteristics:**
- Warm, friendly tone with emojis and reassuring language ("navigating turbulent bureaucratic waters")
- Confidence indicators on outcomes (sicuri/non siamo sicuri)
- Links to external resources (sospermesso.it guides, legal aid centers)
- FAQ-style structure in schede (quanto dura, come lo chiedo, mi serve un avvocato)

**Target users:**
- Migrants in Italy (self-service, may have limited Italian)
- Legal aid workers / lawyers (screening tool for clients)

**Languages for launch:**
- Italian (base content)
- Arabic (requires RTL support)
- French
- English
- Spanish
- Architecture must support 10+ languages

## Constraints

- **Tech stack**: Next.js + Netlify (migrated from Vercel)
- **i18n**: Must support RTL from day one (Arabic) — cannot be retrofitted
- **Content**: All question and scheda content already exists in Italian — translation is the task, not content creation
- **Hosting**: Netlify, served from subdomain of sospermesso.it (same platform as main site)
- **Design**: Friendly, warm, accessible — not a government form aesthetic

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fork Corso AI codebase | Reuse proven questionnaire infrastructure (engine, UI, DB, hosting) | -- Pending |
| Subdomain deployment (test.sospermesso.it) | Main site is 11ty/Netlify, questionnaire is Next.js/Vercel — clean separation | -- Pending |
| AI-assisted translations | 10+ languages needed, professional translation cost-prohibitive for legal content volume | -- Pending |
| RTL support from day one | Arabic is a launch language, RTL cannot be bolted on later | -- Pending |
| Decision tree not quiz/assessment | No scoring — route to specific legal outcome, not proficiency level | -- Pending |

| CSS restyle to sospermesso.it palette | Blue palette didn't match main site identity | -- Pending |
| Netlify instead of Vercel | Same platform as main 11ty site, simplifies deployment | -- Pending |

---
*Last updated: 2026-03-01 after milestone v1.1 start*
