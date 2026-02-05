# Roadmap: Corso AI Pre-Training Screening

## Overview

This roadmap delivers a branching questionnaire system that assesses Italian lawyers' AI knowledge before course enrollment. Starting with core assessment functionality (multiple question types, session persistence), adding adaptive branching logic and personalized feedback, then enabling admin oversight through a dashboard for viewing and exporting participant responses. The journey prioritizes learner-facing value first, then operational tooling.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Assessment Core** - Database, quiz engine, basic question types
- [ ] **Phase 2: Adaptive Logic & Results** - Branching, rules engine, personalized feedback
- [ ] **Phase 3: Admin Dashboard** - Response viewing, export, analytics
- [ ] **Phase 4: Production Readiness** - Deployment, polish, pre-launch validation

## Phase Details

### Phase 1: Foundation & Assessment Core
**Goal**: Learners can complete a questionnaire with multiple question types, branching on Q2 (work usage), session persistence, and receive AI-generated personalized feedback via Claude Haiku

**Depends on**: Nothing (first phase)

**Requirements**: ASMNT-01, ASMNT-02, ASMNT-03, ASMNT-05 (plus ASMNT-04 branching and RSLT-01/02 feedback moved forward)

**Success Criteria** (what must be TRUE):
  1. User can answer multiple choice questions (select one option)
  2. User can answer multiple select questions (select all that apply)
  3. User can answer true/false questions
  4. User's answers persist across browser refresh or close (can resume where they left off)
  5. System stores all responses with timestamps in database
  6. Quiz branches on Q2 (Yes path vs No path)
  7. User receives AI-generated personalized feedback in Italian

**Plans:** 4 plans in 4 waves

Plans:
- [x] 01-01-PLAN.md - Project setup, database schema, TypeScript types
- [ ] 01-02-PLAN.md - UI components for all question types (shadcn/ui)
- [ ] 01-03-PLAN.md - Quiz engine, state management, session persistence, Italian questions
- [ ] 01-04-PLAN.md - Start screen, Haiku feedback API, results page, visual polish

### Phase 2: Adaptive Logic & Results
**Goal**: Questionnaire branches based on user answers and delivers personalized feedback upon completion

**Depends on**: Phase 1

**Requirements**: ASMNT-04, RSLT-01, RSLT-02

**Success Criteria** (what must be TRUE):
  1. Quiz flow branches based on user's previous answers (different users see different question paths)
  2. User receives personalized feedback based on their specific answer patterns (not generic templates)
  3. User receives actionable recommendations for what to focus on before the course starts
  4. Rules engine evaluates responses using custom logic (beyond simple score thresholds)

**Plans**: TBD

Plans:
- [ ] 02-01: TBD during planning
- [ ] 02-02: TBD during planning

### Phase 3: Admin Dashboard
**Goal**: Instructors can view all participant responses, analyze patterns, and export data for course preparation

**Depends on**: Phase 2

**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04

**Success Criteria** (what must be TRUE):
  1. Admin can view a list of all participants who have started or completed the assessment
  2. Admin can click into any participant to see their complete response details and feedback received
  3. Admin can export all responses as CSV for external analysis
  4. Admin can see key analytics (completion rates, question performance, common answer patterns)

**Plans**: TBD

Plans:
- [ ] 03-01: TBD during planning
- [ ] 03-02: TBD during planning

### Phase 4: Production Readiness
**Goal**: System is deployed to cloud hosting, tested end-to-end, and ready for Feb 25 course participants

**Depends on**: Phase 3

**Requirements**: None (polish phase)

**Success Criteria** (what must be TRUE):
  1. Application is deployed to cloud platform (Vercel/Netlify) with stable URL
  2. Italian language content is complete and grammatically correct
  3. System works correctly on mobile devices (iOS Safari, Android Chrome)
  4. Performance is acceptable (pages load in under 2 seconds)
  5. End-to-end test scenario completes successfully (enroll -> take assessment -> view feedback -> admin export)

**Plans**: TBD

Plans:
- [ ] 04-01: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Assessment Core | 1/4 | In progress | - |
| 2. Adaptive Logic & Results | 0/TBD | Not started | - |
| 3. Admin Dashboard | 0/TBD | Not started | - |
| 4. Production Readiness | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-04*
*Last updated: 2026-02-05 - Plan 01-01 complete*
