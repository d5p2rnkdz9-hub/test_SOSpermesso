# Requirements: SOSpermesso Questionnaire

**Defined:** 2026-02-14
**Core Value:** Help migrants quickly understand whether they can get a residence permit and exactly what to do next -- in their own language

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Decision Tree Core

- [ ] **TREE-01**: Branching decision tree with ~40 questions across 8 main paths (minor, family, partner, fear, health, pregnancy, exploitation, born in Italy)
- [ ] **TREE-02**: Each path terminates at a specific outcome ("scheda") -- ~25 distinct outcomes
- [ ] **TREE-03**: Questions are yes/no or single-select multiple choice
- [ ] **TREE-04**: Back button follows navigation history (correct for branching paths)
- [ ] **TREE-05**: Session persistence -- user can resume if browser closes
- [ ] **TREE-06**: Name collection at start (real or fictional)
- [ ] **TREE-07**: Feedback/rating section at end

### i18n & RTL

- [ ] **I18N-01**: Full content translation -- all questions, options, and outcome pages in 5 languages (IT, AR, FR, EN, ES)
- [ ] **I18N-02**: RTL layout support for Arabic
- [ ] **I18N-03**: Language selector accessible from any page without restarting questionnaire
- [ ] **I18N-04**: Bidirectional text handling (Italian legal terms embedded in Arabic text)
- [ ] **I18N-05**: AI-assisted translation pipeline with locked glossary for Italian legal terms

### Outcome Pages (Schede)

- [ ] **SCHED-01**: Rich legal guidance per outcome (permit type, eligibility, how to apply, lawyer needed, duration, rights)
- [ ] **SCHED-02**: Confidence indicators (certain vs uncertain outcomes)
- [ ] **SCHED-03**: Legal disclaimer ("not legal advice") at start and on outcomes
- [ ] **SCHED-04**: Links to sospermesso.it guides and legal aid centers
- [ ] **SCHED-05**: Variable substitution throughout ([Nome], [Parente selezionato])
- [ ] **SCHED-06**: Structured FAQ-style sections (collapsible or clearly labeled)
- [ ] **SCHED-07**: Each outcome page has a stable, shareable URL
- [ ] **SCHED-08**: WhatsApp share button on outcome pages
- [ ] **SCHED-09**: Print-friendly version of outcome pages

### UX & Design

- [ ] **UX-01**: Mobile-first responsive design
- [ ] **UX-02**: Warm, friendly, non-bureaucratic visual design
- [ ] **UX-03**: Large touch targets (48px+), one question per screen
- [ ] **UX-04**: Progress indication appropriate for branching paths

### Admin

- [ ] **ADMN-01**: Admin dashboard with usage analytics (completion rates, outcome distribution)
- [ ] **ADMN-02**: Drop-off point tracking (where users abandon)
- [ ] **ADMN-03**: Session/response tracking

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced UX

- **UX-05**: Legal aid worker mode (?mode=operatore) -- condensed flow, skip reassuring text
- **UX-06**: "I don't know" option with guidance on relevant questions
- **UX-07**: Path-aware progress ("2 more questions" instead of percentage)

### Content Management

- **ADMN-04**: Content editing via admin UI (questions, schede, translations)
- **ADMN-05**: Content versioning with "last reviewed" dates

### Languages

- **I18N-06**: Additional languages beyond launch 5 (Bangla, Urdu, Chinese, etc.)
- **I18N-07**: Audio narration for low-literacy users

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts/login for migrants | Privacy risk for vulnerable population, anonymous sessions sufficient |
| AI chatbot for follow-up questions | Liability risk, AI hallucination in legal domain is dangerous |
| Automatic legal advice generation | Crosses information to advice line, creates liability |
| Real-time law change updates | Requires human legal review, wrong info worse than no info |
| Offline mode / PWA | Complexity vs value, outcome pages need internet for links |
| WCAG AAA compliance | AA is realistic target, AAA conflicts with legal precision |
| Mobile native app | Web responsive is sufficient for this use case |
| Admin content editing UI (v1) | Content managed in code/data files with version control |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TREE-01 | Phase 2 | Pending |
| TREE-02 | Phase 2 | Pending |
| TREE-03 | Phase 2 | Pending |
| TREE-04 | Phase 2 | Pending |
| TREE-05 | Phase 2 | Pending |
| TREE-06 | Phase 2 | Pending |
| TREE-07 | Phase 5 | Pending |
| I18N-01 | Phase 4 | Pending |
| I18N-02 | Phase 1 | Complete |
| I18N-03 | Phase 4 | Pending |
| I18N-04 | Phase 4 | Pending |
| I18N-05 | Phase 4 | Pending |
| SCHED-01 | Phase 3 | Pending |
| SCHED-02 | Phase 3 | Pending |
| SCHED-03 | Phase 3 | Pending |
| SCHED-04 | Phase 3 | Pending |
| SCHED-05 | Phase 3 | Pending |
| SCHED-06 | Phase 3 | Pending |
| SCHED-07 | Phase 3 | Pending |
| SCHED-08 | Phase 5 | Pending |
| SCHED-09 | Phase 5 | Pending |
| UX-01 | Phase 1 | Complete |
| UX-02 | Phase 1 | Complete |
| UX-03 | Phase 1 | Complete |
| UX-04 | Phase 5 | Pending |
| ADMN-01 | Phase 5 | Pending |
| ADMN-02 | Phase 5 | Pending |
| ADMN-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-02-14*
*Last updated: 2026-02-14 after roadmap creation*
