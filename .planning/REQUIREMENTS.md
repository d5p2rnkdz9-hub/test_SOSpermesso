# Requirements: SOSpermesso Questionnaire

**Defined:** 2026-02-14
**Core Value:** Help migrants quickly understand whether they can get a residence permit and exactly what to do next -- in their own language

## v1.0 Requirements (Completed)

### Decision Tree Core

- [x] **TREE-01**: Branching decision tree with ~40 questions across 8 main paths -- Phase 2
- [x] **TREE-02**: Each path terminates at a specific outcome ("scheda") -- Phase 2
- [x] **TREE-03**: Questions are yes/no or single-select multiple choice -- Phase 2
- [x] **TREE-04**: Back button follows navigation history -- Phase 2
- [x] **TREE-05**: Session persistence -- user can resume if browser closes -- Phase 2
- [x] **TREE-06**: Name collection at start (real or fictional) -- Phase 2

### i18n & RTL (Foundation)

- [x] **I18N-02**: RTL layout support for Arabic -- Phase 1
- [x] **I18N-03**: Language selector accessible from any page -- Phase 1

### Outcome Pages (Schede)

- [x] **SCHED-02**: Confidence indicators (certain vs uncertain outcomes) -- Phase 3
- [x] **SCHED-04**: Links to sospermesso.it guides and legal aid centers -- Phase 3
- [x] **SCHED-07**: Each outcome page has a stable, shareable URL -- Phase 3

### UX & Design

- [x] **UX-01**: Mobile-first responsive design -- Phase 1
- [x] **UX-02**: Warm, friendly, non-bureaucratic visual design -- Phase 1
- [x] **UX-03**: Large touch targets (48px+), one question per screen -- Phase 1

## v1.1 Requirements

Requirements for milestone v1.1 (Polish & Translation). Each maps to roadmap phases.

### Translation

- [ ] **I18N-10**: All 46 tree questions display in English when locale is EN -- Phase 8
- [ ] **I18N-11**: All answer options display in English when locale is EN -- Phase 8
- [ ] **I18N-12**: All 30 outcome page titles display in English when locale is EN -- Phase 8
- [ ] **I18N-13**: All outcome intro text and FAQ sections display in English when locale is EN -- Phase 8
- [ ] **I18N-14**: Breadcrumbs show translated question labels and answer labels when locale is EN -- Phase 8
- [ ] **I18N-15**: Variable substitution ([Nome], [Parente selezionato]) works correctly in English content -- Phase 8

### Navigation

- [ ] **NAV-01**: User can navigate back from the outcome page to the last tree question -- Phase 7
- [ ] **NAV-02**: User can navigate back during tree questions to the previous question with answer preserved -- Phase 7
- [ ] **NAV-03**: Back button is visible and functional on all pages (welcome, tree, outcome) -- Phase 7

### Visual Identity

- [x] **CSS-01**: App uses sospermesso.it yellow/gold color palette instead of current blue -- Phase 6
- [ ] **CSS-02**: Outcome FAQ sections use colored left-border cards matching sospermesso.it style -- Phase 6
- [x] **CSS-03**: Header matches sospermesso.it style (white background, logo, consistent nav) -- Phase 6
- [x] **CSS-04**: Answer cards and interactive elements restyled to match sospermesso.it identity -- Phase 6

### Deployment

- [ ] **DEPL-01**: App deploys successfully on Netlify with Next.js adapter -- Phase 9
- [ ] **DEPL-02**: App is accessible on a subdomain of sospermesso.it (e.g. test.sospermesso.it) -- Phase 9

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Translation -- Additional Languages

- **I18N-20**: All tree content translated into Arabic (AR)
- **I18N-21**: All tree content translated into French (FR)
- **I18N-22**: All tree content translated into Spanish (ES)
- **I18N-23**: Arabic content with embedded Italian legal terms displays correct reading order
- **I18N-24**: AI-assisted translation pipeline with locked glossary for Italian legal terms

### Analytics & Feedback

- **ADMN-01**: Admin dashboard with usage analytics (completion rates, outcome distribution)
- **ADMN-02**: Drop-off point tracking (where users abandon)
- **ADMN-03**: Session/response tracking
- **TREE-07**: Feedback/rating section at end

### Sharing & Polish

- **UX-04**: Progress indication appropriate for branching paths
- **SCHED-08**: WhatsApp share button on outcome pages
- **SCHED-09**: Print-friendly outcome pages

### Enhanced UX

- **UX-05**: Legal aid worker mode (?mode=operatore)
- **UX-06**: "I don't know" option with guidance
- **UX-07**: Path-aware progress ("2 more questions" instead of percentage)

### Content Management

- **ADMN-04**: Content editing via admin UI
- **ADMN-05**: Content versioning with "last reviewed" dates

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts/login for migrants | Privacy risk for vulnerable population, anonymous sessions sufficient |
| AI chatbot for follow-up questions | Liability risk, AI hallucination in legal domain is dangerous |
| Automatic legal advice generation | Crosses information to advice line, creates liability |
| Real-time law change updates | Requires human legal review, wrong info worse than no info |
| Offline mode / PWA | Complexity vs value, outcome pages need internet for links |
| Mobile native app | Web responsive is sufficient for this use case |
| Admin content editing UI (v1.1) | Content managed in code/data files with version control |
| Embedding in sospermesso.it via iframe | X-Frame-Options: DENY on main site |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CSS-01 | Phase 6 | Complete |
| CSS-02 | Phase 6 | Pending |
| CSS-03 | Phase 6 | Complete |
| CSS-04 | Phase 6 | Complete |
| NAV-01 | Phase 7 | Pending |
| NAV-02 | Phase 7 | Pending |
| NAV-03 | Phase 7 | Pending |
| I18N-10 | Phase 8 | Pending |
| I18N-11 | Phase 8 | Pending |
| I18N-12 | Phase 8 | Pending |
| I18N-13 | Phase 8 | Pending |
| I18N-14 | Phase 8 | Pending |
| I18N-15 | Phase 8 | Pending |
| DEPL-01 | Phase 9 | Pending |
| DEPL-02 | Phase 9 | Pending |

**Coverage:**
- v1.1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-02-14*
*Last updated: 2026-03-01 after v1.1 roadmap creation*
