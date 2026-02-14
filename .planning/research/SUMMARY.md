# Project Research Summary

**Project:** SOSpermesso - Multilingual Legal Eligibility Decision Tree
**Domain:** Legal information delivery + i18n/RTL web application
**Researched:** 2026-02-14
**Confidence:** HIGH

## Executive Summary

SOSpermesso is a multilingual legal decision tree helping migrants in Italy navigate residence permit eligibility. The project requires replacing a broken Typeform implementation with a custom Next.js tool supporting 5+ languages (Italian, Arabic, French, English, Spanish) with full RTL support for Arabic. Research confirms this is achievable by extending the existing Corso AI fork with a focused i18n layer rather than building from scratch.

The recommended approach leverages next-intl (the de facto Next.js i18n standard), shadcn/ui's new RTL mode (January 2026 release), and Crowdin's AI-assisted translation workflow. The architecture uses a directed acyclic graph (DAG) model for the decision tree with JSONB-based multilingual content storage, keeping UI translations separate from legal content. This separation allows legal experts to manage content while developers handle infrastructure.

Critical risks center on AI translation quality for legal content (17-88% hallucination rate in research), RTL retrofitting complexity (35x cost multiplier if delayed), and bidirectional text handling for mixed Arabic-Italian content. These are mitigated through: (1) glossary-locked Italian legal terms preserved across all translations, (2) CSS logical properties enforced from day one, and (3) explicit BiDi markup for mixed-script content. The project is well-researched with clear implementation patterns and realistic scope.

## Key Findings

### Recommended Stack

The existing Corso AI codebase provides 80% of the foundation: Next.js App Router, React 19, Supabase/Prisma, Tailwind CSS, shadcn/ui, and Zustand. The i18n layer adds exactly one new runtime dependency (next-intl) plus tooling.

**Core technologies:**
- **next-intl (^4.8)**: De facto standard for Next.js App Router i18n — 930K+ weekly downloads, first-class Server Components support, `[locale]` routing, ICU message syntax, strict TypeScript types. The only library with native Next.js 16 `proxy.ts` support.
- **shadcn/ui RTL mode (January 2026 CLI)**: Zero new dependencies. Setting `"rtl": true` in `components.json` + running `pnpm dlx shadcn@latest migrate rtl` converts all components from physical CSS (ml-4, text-left) to logical equivalents (ms-4, text-start). This is the exact stack already in use.
- **Tailwind CSS logical properties (built-in v3.3+)**: Native `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end` classes auto-flip in RTL without any plugin. Already supported on Tailwind ^3.4.1.
- **Crowdin (free for open-source)**: Translation management with native GitHub integration, built-in AI pre-translation (OpenAI/Anthropic/Google), and glossary enforcement for legal terms. Officially recommended by next-intl documentation.

**Critical version requirement:** next-intl v4.0+ is required for Next.js 16's `proxy.ts` naming (renamed from `middleware.ts`). ESM-only, TypeScript 5+, React 19 compatible.

### Expected Features

Research across comparable legal information tools (A2J Author, Docassemble, LawHelp Interactive, UNHCR Digital Gateway, refugee.info) reveals clear feature tiers.

**Must have (table stakes):**
- Full content translation (5 languages minimum) with RTL layout for Arabic
- Language selector accessible from any page, preserves session state
- Legal disclaimer ("non costituisce consulenza") on start and all outcome pages
- Confidence indicators ("siamo sicuri" / "non siamo sicuri") from existing schede
- Variable substitution ([Nome], [Parente selezionato]) working across all languages
- Back button with correct branching-aware history (not naive index decrement)
- Session persistence via resume token (anonymous, no login)
- Mobile-first responsive (320px screens, 48px touch targets)
- One question per screen with clear visual hierarchy
- Links to legal aid resources and next steps on all outcomes

**Should have (competitive advantage):**
- Shareable outcome page URLs (stable URLs per scheda, printable, WhatsApp-ready)
- Warm, emoji-using, non-bureaucratic design (distinguishes from government forms)
- Structured outcome sections (FAQ-style: "What is this?", "How do I apply?", "Do I need a lawyer?")
- "I'm not sure" options with guidance for ambiguous questions
- Print-friendly outcome summaries for legal aid appointments
- Path-aware progress ("2 more questions" not misleading percentage)

**Defer (v2+):**
- Legal aid worker mode (faster flow, multi-client, summary view — needs user research first)
- PDF export of outcomes (requires design work)
- Additional languages beyond launch 5 (architecture supports it, content is bottleneck)
- Audio narration (expensive to produce/maintain in 5+ languages, TTS quality poor for Arabic)
- Admin UI for content editing (v1 uses version-controlled data files with PR review)

**Anti-features (commonly requested, problematic):**
- User accounts/login for migrants (creates barriers, privacy concerns for vulnerable populations)
- AI chatbot for follow-up questions (liability risk, hallucination danger for legal guidance)
- Automatic legal advice generation (crosses line from information to advice, creates legal liability)
- Full WCAG AAA compliance (unrealistic, conflicts with legal precision; target AA instead)

### Architecture Approach

The architecture extends Corso AI's quiz pattern to a directed acyclic graph (DAG) decision tree with multilingual content stored in database JSONB fields while UI translations live in JSON files.

**Major components:**
1. **Directed Acyclic Graph (DAG) Model** — Store decision tree as `tree_nodes` (questions) and `tree_edges` (transitions between nodes), not as flat array with `showCondition`. Same logical question can be reached from 5 different parents without duplication. Graph traversal handles branching, back navigation uses history stack.

2. **JSONB Per-Locale Content Storage** — Question text, options, and outcomes stored as `{ "it": {...}, "ar": {...}, "fr": {...} }` directly in database. Single query returns all locales. Enables AI bulk translation workflows. UI chrome (button labels, navigation) separate in next-intl JSON files.

3. **Variable Substitution with Grammatical Context** — Support `{variableName}` placeholders where grammatical role differs by language. Per-locale grammatical maps handle gender/article agreement (Italian: "il fratello"/"la sorella", Arabic possessive suffixes). Falls back to ICU MessageFormat for complex cases.

4. **RTL Rendering Strategy (4 layers)**:
   - Layer 1: Document direction (`<html dir={locale === 'ar' ? 'rtl' : 'ltr'}>`)
   - Layer 2: Component RTL (shadcn migrate rtl + DirectionProvider for Radix primitives)
   - Layer 3: Custom CSS (Tailwind logical properties: ms-*, me-*, text-start)
   - Layer 4: Typography (Noto Sans Arabic loaded conditionally for Arabic locale)

5. **Split Content Domains** — Decision tree content (questions, outcomes) in database with JSONB locale fields, managed by legal/content experts. UI strings in next-intl JSON files, managed by developers. Different lifecycles, different systems.

**File structure transformation:**
```
Before (Corso AI):               After (SOSpermesso):
src/app/                         src/app/[locale]/
  quiz/page.tsx                    tree/page.tsx
                                   outcome/[outcomeId]/page.tsx
                                 src/i18n/routing.ts, request.ts
                                 messages/it.json, ar.json, fr.json
                                 proxy.ts (Next.js 16 middleware)
```

**Suggested build order (interleaved to avoid rework):**
1. Foundation: i18n + RTL scaffold (next-intl routing, dir attribute, convert shadcn to logical properties)
2. Decision tree engine: DAG model, graph traversal, Italian content only
3. Outcome pages: Variable substitution, rich scheda rendering, Italian only
4. Multi-language content: AI translate all content, add UI chrome translations, locale switcher
5. Arabic RTL polish: Font loading, directional icons, BiDi testing, cross-browser
6. Session persistence + analytics: Resume tokens, feedback, admin dashboard

### Critical Pitfalls

1. **AI Translation Hallucinating Legal Terms** — LLMs fabricate plausible but incorrect legal terminology (17-88% hallucination rate). "Permesso di soggiorno" becomes generic "residence permit" losing Italian legal specificity. **Avoid:** Maintain locked glossary of untranslatable Italian legal terms preserved across all languages, two-pass workflow (AI draft + human review), automated term-checking, Italian original shown alongside translations.

2. **Hardcoded LTR Assumptions in Forked Codebase** — Corso AI has pervasive `ml-`, `mr-`, `text-left`, fixed icon positions. Retrofitting RTL is 35x more expensive than building it in from start. **Avoid:** Full LTR audit before any feature work, replace all physical CSS with logical properties (ms-, me-, ps-, pe-, text-start), use `rtl:rotate-180` for directional icons, test every component in both LTR and RTL.

3. **Bidirectional (BiDi) Text Corruption** — Arabic content contains Italian legal terms, numbers, URLs. Unicode BiDi algorithm mishandles neutral characters causing scrambled order. "Art. 5, comma 2 del D.Lgs. 286/1998" in Arabic may display with reversed numbers or broken punctuation. **Avoid:** Wrap all embedded LTR content in `<bdi>` or `<span dir="ltr">`, create markup convention for "LTR islands" in translation system, use ICU placeholders with explicit `dir="ltr"` wrappers, test with real mixed-script content.

4. **Variable Substitution Breaking Across Languages** — "Devi andare alla Questura di {city} con il tuo {document_type}" requires grammatical agreement in target language (Arabic possessive forms, French articles, gendered adjectives). **Avoid:** Use ICU MessageFormat `{gender, select, ...}` for grammar-affecting variables, prefer full sentence variants over interpolation when possible, have translators flag impossible interpolations, test with actual substituted values not placeholders.

5. **AI Translation Quality Collapse for Low-Resource Languages** — Arabic, Bangla, Urdu show dramatic quality degradation. Arabic diglossia (MSA vs. dialects), sparse legal domain training data, cultural nuances lost. **Avoid:** Tier languages by reliability (Tier 1: AI + light review for FR/ES/EN, Tier 2: AI + heavy review for AR/BN/UR), build translation memory to lock correct phrases, run back-translation tests, user testing with 3-5 native speakers before each language launch.

6. **Untranslatable Italian Legal Procedures Rendered as Generic Equivalents** — "Fotosegnalamento" becomes "identification", "Nulla Osta al Lavoro" becomes "work permit", losing procedural specificity. Users cannot act on translated terms at Italian government offices. **Avoid:** Preserve all Italian bureaucratic terms in Italian across translations with inline target-language explanation, create visual glossary, mark Italian legal terms with `<keep>` tag in translation workflow, outcome pages show "What you will see" section with Italian terms.

7. **Emoji and Tone Loss in Cross-Cultural Translation** — Warm Italian tone with emojis translates poorly. Thumbs-up offensive in Middle East, praying hands have no Islamic connotation, AI defaults to overly formal or casual register. **Avoid:** Per-language emoji policy (avoid hand gestures, use neutral symbols), separate emoji from translation strings, tone guide per language specifying formality level, test with actual target demographic.

## Implications for Roadmap

Based on research, suggested phase structure prioritizes RTL foundation before content work (retrofitting is 35x more expensive), validates tree engine in one language before adding translation complexity, and sequences multilingual work to catch integration issues early.

### Phase 1: RTL Foundation + i18n Scaffold
**Rationale:** RTL is a layout concern touching every component. Retrofitting after building in LTR costs 35x more (Shopify research). Must be first to avoid rework.

**Delivers:**
- next-intl configured with `[locale]` routing (Italian only initially)
- `dir` attribute on `<html>` set from locale
- All shadcn/ui components migrated to logical properties (ms-, me-, text-start)
- DirectionProvider wrapping layout for Radix primitives
- Verified: one test component renders correctly in both LTR and RTL modes

**Addresses:**
- Pitfall #2 (Hardcoded LTR Assumptions)
- Feature: RTL layout for Arabic (table stakes)
- Architecture: Layer 1-3 of RTL rendering strategy

**Avoids:**
- 35x cost multiplier from retrofitting
- Every subsequent component inherits RTL-safe patterns

**Research flag:** Standard patterns, skip `/gsd:research-phase`. shadcn RTL migration is documented in January 2026 changelog with clear CLI commands.

### Phase 2: Decision Tree Engine (Italian Only)
**Rationale:** Tree engine is complex (graph traversal, branching logic, back navigation). Must validate in one language before adding translation layer.

**Delivers:**
- Prisma schema: `tree_nodes`, `tree_edges`, `outcomes`, `sessions` with JSONB locale fields
- `tree-engine.ts`: pure functions for graph traversal, next node calculation, back navigation
- `tree-store.ts`: Zustand store adapted from quiz-store with history stack
- TreePlayer + QuestionNode components
- Full Italian decision tree seeded from existing data.js
- All 40+ paths tested end-to-end in Italian

**Uses:**
- Existing Corso AI quiz patterns (Zustand, session persistence, debounced saves)
- PostgreSQL JSONB for future multilingual expansion
- DAG architecture from ARCHITECTURE.md

**Implements:**
- Architecture Component #1 (DAG Model)
- Feature: Decision tree branching logic, back button, session persistence

**Research flag:** May need `/gsd:research-phase` for graph traversal algorithm validation if complex loops or multiple entry points discovered in decision tree structure.

### Phase 3: Outcome Pages + Variable Substitution (Italian Only)
**Rationale:** Variable substitution logic must work correctly in Italian before handling grammatical variations in other languages. Outcome pages are the most content-heavy component.

**Delivers:**
- OutcomeCard component with structured sections (FAQ-style)
- Variable substitution engine: `{nome}`, `{parente}` placeholders
- All 25 schede seeded in Italian with full content
- `outcome/[outcomeId]` page with SSR
- NameCollector component for entry flow
- Confidence indicators displayed on outcomes
- Legal disclaimer on start and outcome pages

**Implements:**
- Architecture Component #3 (Variable Substitution)
- Features: Confidence indicators, legal disclaimer, next steps, structured outcomes
- Features: Variable substitution/personalization

**Avoids:**
- Pitfall #4 (Variable Substitution Breaking) — validate Italian grammar patterns before multilingual

**Research flag:** Standard patterns. Variable substitution is well-documented in i18n libraries.

### Phase 4: Content Architecture + Translation Infrastructure
**Rationale:** Must design translation workflow and glossary system before any AI translation begins. Pitfall #1 (AI hallucination) and #6 (untranslatable terms) are prevented here.

**Delivers:**
- Locked glossary of 30+ untranslatable Italian legal terms
- Translation workflow: AI draft → automated glossary check → human review → approval
- Per-locale grammatical maps for variable substitution
- Crowdin integration with GitHub auto-sync
- Per-language emoji policy and tone guide
- Back-translation validation system
- Language tiering: Tier 1 (FR/ES/EN), Tier 2 (AR/BN/UR)
- Export/import scripts for translation files

**Addresses:**
- Pitfall #1 (AI Translation Hallucinating)
- Pitfall #6 (Untranslatable Italian Legal Procedures)
- Pitfall #7 (Emoji and Tone Loss)
- Architecture Component #2 (JSONB Per-Locale Content Storage)

**Avoids:**
- AI translating legal terms without constraints
- Inconsistent terminology across outcome pages
- Cultural offense from inappropriate emojis

**Research flag:** Needs `/gsd:research-phase` for Crowdin API integration specifics and glossary enforcement automation. Moderate complexity.

### Phase 5: Multilingual Content Translation
**Rationale:** With infrastructure in place, execute bulk translation with quality gates. Content work, not engineering.

**Delivers:**
- All JSONB content expanded from `{ "it": {...} }` to include ar, fr, en, es
- AI pre-translation via Crowdin for all 40 questions, 80 options, 25 outcomes
- Human review completed for all Tier 2 languages (Arabic primary focus)
- UI chrome translations (messages/*.json for button labels, navigation, errors)
- Language selector component added to layout
- All paths tested in all 5 languages

**Uses:**
- Crowdin AI pre-translation (from Phase 4 setup)
- Glossary enforcement (from Phase 4)
- JSONB schema (from Phase 2)

**Implements:**
- Features: Full content translation, language selector
- Stack: Crowdin translation management

**Avoids:**
- Pitfall #5 (AI Quality Collapse) — Tier 2 languages get heavy human review
- Pitfall #7 (Emoji/Tone) — per-language policy enforced during review

**Research flag:** Skip research. Content translation execution with established workflow.

### Phase 6: Arabic RTL Polish + BiDi Testing
**Rationale:** RTL foundation built in Phase 1, but Arabic-specific refinements require all content present. BiDi issues only visible with real mixed-script content.

**Delivers:**
- Noto Sans Arabic font loaded conditionally for Arabic locale
- All directional icons tested and fixed (chevrons with `rtl:rotate-180`)
- BiDi markup (`<bdi>`, `dir="ltr"`) applied to all Italian legal terms in Arabic content
- Variable substitution tested with Arabic grammatical maps
- Cross-browser testing (Safari, Chrome, Firefox) in RTL mode
- Actual Arabic outcome pages with Italian terms display correctly

**Uses:**
- RTL foundation from Phase 1
- Arabic translated content from Phase 5
- BiDi markup system from Phase 4 content architecture

**Implements:**
- Architecture Layer 4 (Typography)
- Features: RTL layout for Arabic (final polish)

**Addresses:**
- Pitfall #3 (BiDi Text Corruption) — now testable with real content

**Avoids:**
- Shipping Arabic with broken number/URL display
- Icons pointing wrong direction in RTL

**Research flag:** May need `/gsd:research-phase` for BiDi edge cases if complex legal term patterns discovered. Test-heavy phase.

### Phase 7: Session Persistence + Analytics
**Rationale:** Additive features that don't affect core flow. Can be built after multilingual content is validated.

**Delivers:**
- Session save/resume via token (adapt from Corso AI implementation)
- Resume URL generation and handling
- Feedback/rating section at end of questionnaire
- Admin analytics dashboard: completion rate, drop-off points, outcome distribution, language distribution
- "Last reviewed" dates on outcome pages
- Usage tracking (privacy-conscious, no PII)

**Uses:**
- Existing Corso AI session persistence patterns
- Supabase for analytics data storage

**Implements:**
- Features: Session persistence, admin analytics
- Features: "Last reviewed" dates

**Research flag:** Standard patterns, skip research. Analytics dashboards are well-documented.

### Phase 8: Launch Enhancements
**Rationale:** Features that improve shareability and real-world usability, added after core tool validated.

**Delivers:**
- Shareable outcome page URLs (stable routes per scheda)
- WhatsApp share button on outcomes
- Print-friendly CSS for outcome pages
- "I'm not sure" options for ambiguous questions
- Path-aware progress indicator (replace misleading percentage)

**Implements:**
- Features: Shareable outcomes, WhatsApp share, print-friendly, path-aware progress

**Research flag:** Skip research. All are standard web patterns.

### Phase Ordering Rationale

1. **RTL Foundation must be Phase 1** because retrofitting costs 35x more and every subsequent component inherits the patterns. Building LTR-first and converting later touches every file.

2. **Decision tree engine before multilingual (Phase 2 before 4-5)** because graph traversal is complex and needs testing in one language. Adding translation on top of unvalidated branching logic compounds debugging difficulty.

3. **Outcome pages before multilingual (Phase 3 before 4-5)** because variable substitution must work in Italian first. Grammatical variations in other languages are extensions of the base pattern.

4. **Content architecture before translation (Phase 4 before 5)** because AI hallucination and legal term preservation are prevented by workflow design, not fixed in post-production. Translating without glossary constraints creates unrecoverable errors.

5. **Arabic RTL polish after translation (Phase 6 after 5)** because BiDi issues are only visible with real mixed-script content (Italian legal terms embedded in Arabic text). Testing with placeholder content misses the actual rendering bugs.

6. **Session persistence and analytics late (Phase 7)** because they are additive and don't affect core user flow. Can be developed in parallel with Phase 6 if resources allow.

7. **Launch enhancements last (Phase 8)** because they improve an already-functional product. Shareable URLs and WhatsApp share are valuable but not blocking launch.

### Research Flags

**Phases needing `/gsd:research-phase`:**
- **Phase 2 (Decision Tree Engine):** If graph traversal reveals complex loops or multiple entry points not documented in existing flowchart. Estimated: low probability, but graph algorithms can have edge cases.
- **Phase 4 (Content Architecture):** Crowdin API integration and automated glossary enforcement. Moderate complexity, API-specific patterns. Recommended research target.
- **Phase 6 (Arabic RTL Polish):** BiDi edge cases with complex nested legal terms. Test-driven, may uncover Unicode rendering subtleties. Optional research if issues arise.

**Phases with standard patterns (skip research):**
- **Phase 1 (RTL Foundation):** shadcn RTL migration is documented in official changelog, next-intl setup has official docs, CSS logical properties are standard.
- **Phase 3 (Outcome Pages):** Variable substitution is well-documented in i18n libraries, component patterns are standard React.
- **Phase 5 (Translation):** Execution of established workflow, content work not engineering research.
- **Phase 7 (Session/Analytics):** Corso AI already has session persistence, analytics dashboards are commodity patterns.
- **Phase 8 (Launch Enhancements):** WhatsApp share is URL construction, print CSS is standard, all well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core technologies verified against official documentation. next-intl is the documented Next.js i18n standard. shadcn RTL migration confirmed in January 2026 release. Tailwind logical properties are built-in v3.3+. Crowdin officially recommended by next-intl. |
| Features | MEDIUM | Feature expectations derived from comparable legal information tools (A2J Author, Docassemble, LawHelp Interactive, UNHCR Digital Gateway, refugee.info) which are different domains but similar user needs. No single identical competitor exists. MVP definition is inference from research, not validated with actual SOSpermesso users. |
| Architecture | HIGH | Existing Corso AI codebase analyzed directly. DAG model is standard for decision trees. JSONB multilingual storage is documented PostgreSQL pattern. next-intl App Router setup verified in official docs. Build order based on cost-of-retrofitting research from Shopify Engineering. |
| Pitfalls | HIGH | AI hallucination rates from Stanford HAI research (peer-reviewed). RTL retrofitting cost multiplier from Shopify Engineering (production experience). BiDi issues documented in W3C standard. Legal translation risks from multiple authoritative sources (Stanford Justice Innovation, peer-reviewed legal MT research). |

**Overall confidence:** HIGH

Research is comprehensive with primary sources (official docs, codebase analysis) and authoritative secondary sources (Stanford research, W3C standards, production experience from major companies). Feature expectations are the weakest link (inferred from similar tools rather than direct competitor analysis) but are well-reasoned.

### Gaps to Address

1. **User testing assumptions:** Feature priorities assume migrant user needs based on comparable tools, not direct user research with SOSpermesso's actual demographic. Recommendation: Plan for user testing after Phase 3 (Italian-only functional prototype) to validate feature prioritization before full multilingual investment.

2. **Arabic dialect vs. MSA:** Research confirms MSA is the safe choice for written legal content, but actual migrant population in Italy includes North African Arabic speakers (Moroccan, Tunisian, Egyptian) who may find MSA difficult. Recommendation: Conduct small-scale testing with 5-10 Arabic speakers from diverse origins after Phase 5 translation to validate MSA accessibility.

3. **Crowdin free tier limits:** Research confirms Crowdin is free for open-source projects, but actual approval process and feature limits for free tier not verified. Recommendation: Apply for Crowdin open-source program early in Phase 4 to confirm eligibility and feature access.

4. **Variable substitution in Bangla/Urdu:** Grammatical complexity of Bangla (7 cases) and Urdu (Perso-Arabic script with different possessive constructions) may exceed what simple grammatical maps can handle. Recommendation: If Bangla/Urdu are added later (v2+), budget for full ICU MessageFormat migration or sentence variants rather than simple interpolation.

5. **Translation memory effectiveness:** Research recommends translation memory to lock correctly-reviewed phrases, but effectiveness depends on phrase-level matching which may be poor for legal text with high variability. Recommendation: Monitor translation memory hit rate in Phase 5; if <40% reuse, consider glossary-only approach without full TM investment.

6. **Performance at scale:** Architecture assumes tree graph (~40 nodes, ~80 edges) is small enough to load fully and cache. If decision tree expands significantly (100+ nodes), caching strategy may need revision. Recommendation: Monitor bundle size and load times during Phase 2; if tree data exceeds 100KB, implement lazy loading per branch.

## Sources

Research synthesized from:

### Stack Research
- next-intl official documentation (App Router setup, routing, middleware, Crowdin integration, v4.0 release)
- shadcn/ui RTL documentation (RTL mode, January 2026 changelog, Next.js RTL setup)
- Tailwind CSS v3.3 logical properties announcement
- Crowdin documentation (GitHub integration, AI pre-translation, open-source program)
- Next.js 16 proxy.ts documentation
- Radix DirectionProvider official docs

### Features Research
- A2J Author accessibility documentation
- Docassemble overview and multilingual support docs
- LawHelp Interactive program description
- UNHCR Digital Gateway overview
- Refugee.info Italy platform
- Typeform community posts (multilingual limitations confirmed)

### Architecture Research
- Corso AI codebase analysis (direct examination of Prisma schema, quiz-store, types, seed data)
- SOSpermesso decision tree (flowchart_permessi.mermaid, data.js analyzed directly)
- next-intl App Router official setup guide
- Radix Direction Provider docs
- CSS Logical Properties overview (verified against MDN)
- PostgreSQL hierarchical data modeling patterns

### Pitfalls Research
- Stanford HAI: "Hallucinating Law: Legal Mistakes with LLMs" (hallucination rates)
- Stanford Justice Innovation: "AI, Machine Translation, and Access to Justice" (legal translation risks)
- Shopify Engineering: "i18n Best Practices for Front-End Developers" (retrofitting cost multiplier)
- W3C: "Inline Markup and Bidirectional Text in HTML" (BiDi standard)
- Localazy: "8 LLM Arabic Models Tested" (Arabic translation benchmarks)
- ACM: "Actionable UI Design Guidelines for Low-Literate Users" (accessibility research)
- ResearchGate: "Machine Translation in the Field of Law" (peer-reviewed legal MT research)
- ACL: "LLMs for Low-Resource Dialect Translation" (Bangla/Urdu quality issues)

**Confidence breakdown:**
- HIGH confidence sources: Official documentation (next-intl, shadcn/ui, Tailwind, W3C), peer-reviewed research (Stanford, ACM, ACL), direct codebase analysis
- MEDIUM confidence sources: Industry blogs with production experience (Shopify, Localazy), community resources (Typeform forums, ProZ translator discussions)
- LOW confidence sources: Single-source claims (Crowdin AI pre-translation quality percentages, Tolgee exact key limits)

---
*Research completed: 2026-02-14*
*Ready for roadmap: yes*
