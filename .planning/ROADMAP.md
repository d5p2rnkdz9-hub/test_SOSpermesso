# Roadmap: SOSpermesso

## Overview

SOSpermesso transforms a forked Corso AI questionnaire codebase into a multilingual legal decision tree for migrants in Italy. The roadmap sequences work to avoid the 35x cost of RTL retrofitting (foundation first), validates the complex branching logic in Italian before adding translation complexity, builds rich outcome pages with variable substitution, then layers in 5-language support with Arabic RTL polish, and finishes with analytics and shareability features. Every phase delivers a testable, coherent capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: i18n Foundation + Design System** - RTL-safe layout scaffold, visual identity, mobile-first responsive design
- [ ] **Phase 2: Decision Tree Engine** - Branching navigation with ~40 questions, session persistence, Italian content
- [ ] **Phase 3: Outcome Pages** - 25 legal guidance pages with variable substitution, confidence indicators, shareable URLs
- [ ] **Phase 4: Multilingual Content** - AI-assisted translation into 5 languages, language selector, bidirectional text handling
- [ ] **Phase 5: Analytics + Launch Polish** - Admin dashboard, feedback collection, WhatsApp sharing, print-friendly outcomes, progress indicator

## Phase Details

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
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

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
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

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

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

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

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. i18n Foundation + Design System | 3/3 | Complete | 2026-02-16 |
| 2. Decision Tree Engine | 0/TBD | Not started | - |
| 3. Outcome Pages | 0/TBD | Not started | - |
| 4. Multilingual Content | 0/TBD | Not started | - |
| 5. Analytics + Launch Polish | 0/TBD | Not started | - |
