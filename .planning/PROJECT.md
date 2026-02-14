# SOSpermesso - Questionnaire Tool

## What This Is

A web-based legal decision tree that helps migrants in Italy determine whether they have the right to a residence permit (permesso di soggiorno). Through a series of branching questions about their situation — family, age, fear of return, health, exploitation — users are routed to one of ~25 specific legal outcome pages ("schede") with detailed guidance on which permit applies, how to apply, whether they need a lawyer, and links to free legal aid. Replaces the current Typeform-based version at sospermesso.it. Used by both migrants directly and legal aid workers screening clients.

## Core Value

Help migrants quickly understand whether they can get a residence permit and exactly what to do next — in their own language, with a friendly and reassuring tone.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Branching decision tree with ~40 questions across multiple paths (minor, family, partner, fear, health, exploitation, born in Italy)
- [ ] Each path terminates at a specific "scheda" (legal outcome page) with detailed guidance
- [ ] ~25 distinct outcome pages with: permit type, confidence level, how to apply, lawyer needed, duration/rights, links to legal aid
- [ ] Variable substitution throughout ([Nome], [Parente selezionato], dynamic text based on earlier answers)
- [ ] Multi-language support: Italian (base), Arabic, French, English, Spanish at launch — architecture for 10+ languages
- [ ] RTL (right-to-left) layout support for Arabic
- [ ] AI-assisted translation pipeline
- [ ] Name collection at start
- [ ] Feedback/rating section at end
- [ ] Friendly, warm design — reassuring tone, not clinical/bureaucratic
- [ ] Session persistence (resume if browser closed)
- [ ] Mobile-responsive
- [ ] Admin dashboard: usage analytics, outcome distribution, drop-off points
- [ ] Hosted on subdomain (e.g. test.sospermesso.it) via Vercel

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

- **Tech stack**: Next.js + Supabase + Vercel (inherited from Corso AI fork)
- **i18n**: Must support RTL from day one (Arabic) — cannot be retrofitted
- **Content**: All question and scheda content already exists in Italian — translation is the task, not content creation
- **Hosting**: Vercel, served from subdomain of sospermesso.it
- **Design**: Friendly, warm, accessible — not a government form aesthetic

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fork Corso AI codebase | Reuse proven questionnaire infrastructure (engine, UI, DB, hosting) | -- Pending |
| Subdomain deployment (test.sospermesso.it) | Main site is 11ty/Netlify, questionnaire is Next.js/Vercel — clean separation | -- Pending |
| AI-assisted translations | 10+ languages needed, professional translation cost-prohibitive for legal content volume | -- Pending |
| RTL support from day one | Arabic is a launch language, RTL cannot be bolted on later | -- Pending |
| Decision tree not quiz/assessment | No scoring — route to specific legal outcome, not proficiency level | -- Pending |

---
*Last updated: 2026-02-14 after initialization*
