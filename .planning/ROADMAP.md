# Roadmap: SOSpermesso

## Overview

SOSpermesso transforms a forked Corso AI questionnaire codebase into a multilingual legal decision tree for migrants in Italy. v1.0 delivered the i18n foundation, decision tree engine, and outcome pages in Italian. v1.1 restyles the app to match sospermesso.it's visual identity, fixes navigation across all pages, translates all tree content into English as the first non-Italian language, and deploys to production on Netlify.

## Milestones

- **v1.0 MVP** - Phases 1-5 (foundation, tree engine, outcome pages, multilingual, analytics)
- **v1.1 Polish & Translation** - Phases 6-9 (restyle, navigation, English translation, deployment)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 MVP (Phases 1-5)</summary>

- [x] **Phase 1: i18n Foundation + Design System** - RTL-safe layout scaffold, visual identity, mobile-first responsive design
- [x] **Phase 2: Decision Tree Engine** - Branching navigation with ~40 questions, session persistence, Italian content
- [ ] **Phase 3: Outcome Pages** - 30 legal guidance pages with variable substitution, confidence indicators, shareable URLs
- [ ] **Phase 4: Multilingual Content** - AI-assisted translation into 5 languages, language selector, bidirectional text handling
- [ ] **Phase 5: Analytics + Launch Polish** - Admin dashboard, feedback collection, WhatsApp sharing, print-friendly outcomes, progress indicator

</details>

### v1.1 Polish & Translation

- [ ] **Phase 6: Visual Identity Restyle** - Restyle app to match sospermesso.it yellow/gold palette, header, and card styles
- [ ] **Phase 7: Navigation Fixes** - Back button working correctly on all pages (welcome, tree, outcome)
- [ ] **Phase 8: English Translation** - All tree content (questions, answers, outcomes, breadcrumbs) translated and functional in English
- [ ] **Phase 9: Production Deployment** - Deploy to Netlify on sospermesso.it subdomain

## Phase Details

<details>
<summary>v1.0 Phase Details (Phases 1-5)</summary>

### Phase 1: i18n Foundation + Design System
**Goal**: The application renders correctly in both LTR and RTL modes with a warm, mobile-first design identity that replaces the Corso AI aesthetic
**Depends on**: Nothing (first phase)
**Requirements**: I18N-02, UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. A test page renders correctly in both LTR (Italian) and RTL (Arabic) modes -- text alignment, spacing, and component layout all flip appropriately
  2. The application displays with SOSpermesso's warm, friendly visual identity (colors, typography, tone) -- not the Corso AI quiz aesthetic
  3. On a 320px mobile screen, all interactive elements have 48px+ touch targets and content is readable without horizontal scrolling
  4. All shadcn/ui components use CSS logical properties (ms-, me-, text-start) with zero physical direction properties (ml-, mr-, text-left) remaining in the codebase
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md -- i18n routing infrastructure + locale layout (next-intl, proxy.ts, [locale] segment, fonts, DirectionProvider)
- [x] 01-02-PLAN.md -- Visual identity + RTL component migration (yellow/black/white tokens, shadow removal, logical CSS properties)
- [x] 01-03-PLAN.md -- Layout components + welcome page + visual verification (StickyHeader, LanguageSelector, ContentColumn, welcome screen)

### Phase 2: Decision Tree Engine
**Goal**: A user in Italy can navigate the full Italian decision tree from entry question to a specific legal outcome, with correct branching, back navigation, and session resumption
**Depends on**: Phase 1
**Requirements**: TREE-01, TREE-02, TREE-03, TREE-04, TREE-05, TREE-06
**Success Criteria** (what must be TRUE):
  1. User enters their name (real or fictional) and navigates through branching yes/no and single-select questions -- each of the 8 main paths (minor, family, partner, fear, health, pregnancy, exploitation, born in Italy) reaches a specific outcome
  2. User can press back at any point and the previous question shows with their previous answer preserved -- back navigation correctly follows the branching path taken, not a flat index
  3. User who closes the browser mid-questionnaire can return and resume from where they left off with all previous answers intact
  4. All ~40 questions and ~25 terminal outcomes are seeded in Italian from the existing SOSpermesso content, with every path reachable and terminating correctly
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md -- Tree data foundation: types, Italian tree data (75 nodes from data.js), pure traversal engine, i18n messages
- [x] 02-02-PLAN.md -- Store + tree UI components: Zustand store with localStorage persist, AnswerCard, QuestionScreen, SlideTransition, TreePlayer
- [x] 02-03-PLAN.md -- Integration: /tree page route, welcome page name input, header back button, end-to-end verification

### Phase 3: Outcome Pages
**Goal**: When a user reaches a legal outcome, they see a rich, structured guidance page with personalized content, confidence level, next steps, and a stable URL they can bookmark or share
**Depends on**: Phase 2
**Requirements**: SCHED-01, SCHED-02, SCHED-03, SCHED-04, SCHED-05, SCHED-06, SCHED-07
**Success Criteria** (what must be TRUE):
  1. Each outcome page displays structured legal guidance: permit type, eligibility summary, how to apply, whether a lawyer is needed, duration/rights -- organized in clearly labeled FAQ-style collapsible sections
  2. Outcome pages show a confidence indicator (certain vs. uncertain) and a legal disclaimer ("this is not legal advice") appears at the start of the questionnaire and on every outcome page
  3. User's name and selected family member (variable substitution) appear correctly throughout the outcome text -- "[Nome]" and "[Parente selezionato]" are replaced with actual values from earlier answers
  4. Each outcome page has a stable URL (e.g., /outcome/protezione-internazionale) that can be bookmarked and directly accessed, and includes working links to relevant sospermesso.it guides and legal aid resources
  5. All 25 schede are populated with complete Italian content matching the existing SOSpermesso material
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md -- CSS restyle to sospermesso.it visual identity, accordion install, slug mapping, lawyer-level utility, goBackTo store action
- [ ] 03-02-PLAN.md -- Outcome page components (LawyerBanner, FaqAccordion, IntroText, TreeBreadcrumbs, etc.), dynamic route, redirect from tree, i18n keys, visual checkpoint

### Phase 4: Multilingual Content
**Goal**: Users can navigate the entire decision tree and read outcome pages in any of 5 languages (Italian, Arabic, French, English, Spanish), switching language at any time without losing progress
**Depends on**: Phase 3
**Requirements**: I18N-01, I18N-03, I18N-04, I18N-05
**Success Criteria** (what must be TRUE):
  1. All ~40 questions, all answer options, and all 25 outcome pages display fully translated content in each of the 5 launch languages (IT, AR, FR, EN, ES) -- no untranslated strings visible
  2. User can switch language from any page via a language selector, and the questionnaire continues from the same position without restarting -- all previous answers are preserved
  3. Italian legal terms (permesso di soggiorno, questura, fotosegnalamento, etc.) are preserved in Italian across all translations with an inline explanation in the target language
  4. Arabic content containing embedded Italian legal terms and numbers displays with correct reading order -- no scrambled text, reversed numbers, or broken punctuation in mixed-script content
**Plans**: TBD

### Phase 5: Analytics + Launch Polish
**Goal**: The tool is launch-ready with usage tracking for continuous improvement, user feedback collection, and practical features (sharing, printing, progress) that support real-world use by migrants and legal aid workers
**Depends on**: Phase 4
**Requirements**: UX-04, TREE-07, SCHED-08, SCHED-09, ADMN-01, ADMN-02, ADMN-03
**Success Criteria** (what must be TRUE):
  1. An admin can view a dashboard showing completion rates, outcome distribution across the 25 schede, drop-off points (which questions users abandon at), and language distribution -- all updating from real usage data
  2. User sees a progress indicator during the questionnaire that appropriately reflects position in a branching path (not a misleading linear percentage)
  3. After reaching an outcome, user can tap a WhatsApp share button that opens WhatsApp with a pre-filled message containing the outcome page URL, and can print the outcome page in a clean, readable format
  4. After reaching an outcome, user can rate their experience and leave optional feedback that is stored and visible in the admin dashboard
**Plans**: TBD

</details>

### Phase 6: Visual Identity Restyle
**Goal**: The app visually matches sospermesso.it's identity -- yellow/gold palette, white backgrounds, colored-border cards, and consistent header -- so it feels like part of the same product
**Depends on**: Phase 3 (outcome page components must exist to restyle)
**Requirements**: CSS-01, CSS-02, CSS-03, CSS-04
**Success Criteria** (what must be TRUE):
  1. The app uses a yellow/gold color palette (primary buttons, accents, highlights) instead of the current blue, matching sospermesso.it's visual identity
  2. Outcome FAQ sections display as cards with colored left borders matching sospermesso.it's card style, visually distinguishing each section
  3. The header shows a white background with the SOS Permesso logo and navigation consistent with the main sospermesso.it site
  4. Answer cards during tree questions and all interactive elements (buttons, selections, hover states) use the sospermesso.it yellow/gold visual language
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Navigation Fixes
**Goal**: Users can navigate backward from any page in the app -- outcome back to last question, question back to previous question, and a visible back button on every page including welcome
**Depends on**: Phase 6 (restyle should be done so navigation elements match new visual identity)
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. User on an outcome page can tap back and return to the last tree question they answered, with their previous answer still selected
  2. User navigating tree questions can tap back to return to the previous question with their answer preserved, correctly following the branching path taken (not a flat index)
  3. A visible, functional back button appears on every page: welcome page (browser back or disabled), tree questions (previous question), and outcome page (last question)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: English Translation
**Goal**: A user with locale set to EN sees the entire tree experience -- questions, answers, outcome pages, breadcrumbs, and variable substitutions -- fully in English with no untranslated Italian strings
**Depends on**: Phase 6 (visual components finalized before translating content that references them)
**Requirements**: I18N-10, I18N-11, I18N-12, I18N-13, I18N-14, I18N-15
**Success Criteria** (what must be TRUE):
  1. All 46 tree questions and all answer options display in English when the locale is set to EN -- no Italian text leaks through
  2. All 30 outcome page titles, intro text paragraphs, and FAQ section content display in English when locale is EN
  3. Breadcrumbs on outcome pages show translated question labels and answer labels in English, reflecting the path the user took
  4. Variable substitution works correctly in English content -- [Nome] is replaced with the user's entered name and [Parente selezionato] is replaced with the English label of their selected family member
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: Production Deployment
**Goal**: The app is live and accessible to real users on a subdomain of sospermesso.it, deployed via Netlify
**Depends on**: Phase 8 (deploy the complete, translated, restyled app)
**Requirements**: DEPL-01, DEPL-02
**Success Criteria** (what must be TRUE):
  1. The Next.js app builds and deploys successfully on Netlify using the Next.js adapter with no build errors
  2. The app is accessible at a sospermesso.it subdomain (e.g. test.sospermesso.it) with DNS properly configured and HTTPS working
  3. All routes work in production -- locale switching, tree navigation, outcome pages, and static assets load correctly on Netlify
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 6 -> 7 -> 8 -> 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. i18n Foundation + Design System | v1.0 | 3/3 | Complete | 2026-02-16 |
| 2. Decision Tree Engine | v1.0 | 3/3 | Complete | 2026-02-16 |
| 3. Outcome Pages | v1.0 | 0/2 | Planned | - |
| 4. Multilingual Content | v1.0 | 0/TBD | Not started | - |
| 5. Analytics + Launch Polish | v1.0 | 0/TBD | Not started | - |
| 6. Visual Identity Restyle | v1.1 | 0/TBD | Not started | - |
| 7. Navigation Fixes | v1.1 | 0/TBD | Not started | - |
| 8. English Translation | v1.1 | 0/TBD | Not started | - |
| 9. Production Deployment | v1.1 | 0/TBD | Not started | - |
