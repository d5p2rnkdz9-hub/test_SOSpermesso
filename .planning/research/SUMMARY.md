# Project Research Summary

**Project:** Pre-training Assessment Platform for AI Courses (Italian Lawyers)
**Domain:** Branching questionnaire/adaptive assessment system
**Researched:** 2026-02-04
**Confidence:** HIGH

## Executive Summary

Pre-training assessment platforms in 2025-2026 follow a well-established architecture: data-driven branching logic, flexible data models, and rules-based evaluation engines. The research reveals strong consensus across all dimensions: Next.js 16 + Supabase represents the modern standard for full-stack questionnaire platforms, delivering both rapid development and production-ready scalability.

The recommended approach is a three-tier architecture with clear separation: presentation layer (React-based quiz player), business logic layer (survey engine + rules engine), and data persistence (PostgreSQL with JSON schema flexibility). The key technical decision is making branching logic and evaluation rules data-driven rather than hardcoded—this single choice determines whether the platform can evolve without constant developer intervention. For the Italian lawyers AI course use case (5-10 questions, custom proficiency rules, single admin), this architecture scales naturally from MVP to production without rewrites.

The primary risks are architectural decisions that must be made correctly in Phase 1: flexible database schema for question types, data-driven branching rules, session state management with auto-save, and separating rules evaluation from application logic. All four research documents agree that these cannot be easily retrofitted. The secondary risk is scope creep on question count—research shows completion rates drop dramatically beyond 10 questions, yet stakeholders typically push for "just one more question." Mitigation requires hard limits and per-question abandonment tracking from day one.

## Key Findings

### Recommended Stack

Next.js 16 with App Router provides the foundation for full-stack development, combining frontend React components with backend API routes and server actions in a single framework. This eliminates the need for separate backend services while maintaining clear architectural boundaries. The stack centers on type safety throughout: TypeScript for code, Zod for runtime validation, and React Hook Form for form state—reducing bugs in the complex branching logic that defines this domain.

**Core technologies:**
- **Next.js 16 + React 19**: Full-stack framework with App Router for server components, API routes, and excellent Vercel deployment
- **Supabase**: PostgreSQL database with auto-generated REST API, built-in auth (email/magic link), and real-time capabilities—better fit than Firebase for relational question-answer-rule data
- **shadcn/ui + Tailwind CSS v4**: Copy-paste UI components (own the code, not a dependency) built on accessible Radix primitives—provides production-ready forms, modals, and dropdowns
- **React Hook Form + Zod**: Performance-focused form management with TypeScript-native validation—essential for complex multi-step questionnaires with dynamic validation
- **Zustand**: Lightweight (1KB) client state for quiz session (current question, answers, branching path)—better performance than Context API for frequent state updates
- **Vercel**: Zero-config deployment platform built by Next.js creators—automatic preview deployments, edge functions, generous free tier

**Critical version notes:**
- Use `@supabase/ssr` (not deprecated `@supabase/auth-helpers-nextjs`) for Next.js App Router auth
- Tailwind v4 released with performance improvements
- React 19 brings concurrent features and TypeScript improvements
- All versions verified via npm registry as of 2026-02-04

**Deferred to post-MVP:**
- **next-intl**: i18n framework for multi-language support—start Italian-only, add framework when expanding languages
- **Vitest + Playwright**: Testing stack (Vitest for components, Playwright for E2E)—add after core functionality works
- **recharts**: Data visualization for admin analytics—defer until admin needs dashboard charts

### Expected Features

Pre-training assessment platforms in 2026 have clear feature expectations based on analysis of Typeform, SurveyMonkey, Qualtrics, and specialized adaptive testing systems. Research identified strong consensus on table stakes vs competitive differentiators.

**Must have (table stakes):**
- Multiple question types (multiple choice, multiple select, true/false)—industry standard for varied assessment
- Branching/skip logic—fundamental for adaptive assessments; without this, just a linear survey tool
- Mobile-responsive UI—2026 expectation; learners access from any device
- Progress indicators—reduces anxiety; shows completion percentage
- Admin dashboard—view/manage responses and settings
- Response data export (CSV minimum)—standard admin analysis requirement
- Session persistence—if user closes browser, don't lose progress
- Clear feedback delivery—learner receives level assignment with explanation
- Accessibility (WCAG 2.1)—legal requirement + educational tool expectation

**Should have (competitive advantage):**
- Custom rules engine—goes beyond score thresholds to enable "high on X AND low on Y = Level 2" logic; most platforms only use score ranges
- Personalized feedback paths—different feedback based on response patterns, not just final level
- Real-time analytics—live completion rates, answer patterns, rule effectiveness
- Multi-language support—architecture supports i18n from start (Italian initially)
- Question bank management—reusable question library with versioning

**Defer (v2+):**
- AI-powered question generation—validate core patterns first, then add AI assistance
- Response confidence indicators—learners mark "not sure"; adds UI complexity
- Automated fraud detection—start with session timeout; add pattern detection if abuse observed
- Comparative benchmarking—requires meaningful sample size (add after first cohort)
- Custom branding/white-label—use default professional styling initially

**Explicitly avoid (anti-features):**
- Complex gamification—distracts from serious assessment purpose
- Time limits per question—creates unnecessary stress in pre-training context
- Public leaderboards—inappropriate for placement assessments
- Social sharing features—violates educational privacy trust
- Native mobile apps—expensive; excellent mobile-web covers 95% of use cases
- Video/audio questions—increases complexity and review burden for 5-10 question assessment
- Open-ended essay questions—requires manual grading, defeats automated placement purpose

### Architecture Approach

Branching assessment systems follow a proven three-tier architecture with clear component boundaries. The pattern separates survey configuration (questions, rules) from response data (answers, session state) and business logic (navigation, evaluation). This separation enables versioning: historical responses reference the survey version they used, preventing data corruption when surveys change.

**Major components:**
1. **Survey Schema** (Data Layer)—stores question definitions as JSON with conditional navigation rules; questions reference next question IDs for branching; separate from response data
2. **Survey Engine** (Business Logic)—navigates question flow by evaluating conditional rules; tracks session state; determines next question based on answers; stateless (session stored in database)
3. **Rules Engine** (Evaluation Logic)—evaluates complex conditions to determine proficiency level; separate from application code; rules stored as JSON data structures with condition-action pairs
4. **Quiz Player** (Presentation)—renders questions, captures answers, handles user interaction; only loads current question (not entire survey); saves each answer immediately
5. **Response Storage** (Data Layer)—persists answers with timestamps; tracks completion status; stores evaluation results; immutable after completion
6. **Admin Panel** (Management)—views responses, configures surveys, manages rules; operates on draft versions that become immutable when published
7. **Result Generator** (Business Logic)—generates personalized feedback from rules engine output; formats recommendations based on response patterns

**Key architectural patterns:**
- **JSON schema definition**: Survey structure stored as JSON, decoupled from rendering logic—enables portability and version control
- **Data-driven branching**: Conditional navigation via foreign key references (next_question_id), not hardcoded if/else statements
- **Separation of concerns**: Survey configuration tables vs response data tables—allows survey changes without corrupting historical data
- **Rules as data**: Evaluation logic stored as JSON condition-action structures, not application code—enables non-developers to modify rules
- **Auto-save session state**: Save answers to backend after each submission, not at completion—supports resume capability

**Database schema approach:**
- Use JSONB (PostgreSQL) for flexible question options and rule definitions
- Separate schemas: `surveys` + `questions` + `question_options` for config; `respondents` + `responses` + `answers` for data
- Foreign key branching: `question_options.next_question_id` references `questions.id`
- Version tracking: `responses.survey_version` references which survey schema was used
- Immutable responses: No UPDATE operations on answer records after submission

### Critical Pitfalls

Research identified five pitfalls that require Phase 1 architectural decisions. Retrofitting later is expensive or impossible.

1. **Hardcoded branching logic becomes unmaintainable**—branching starts simple but grows into spaghetti; "just one more branch" requests compound complexity; question wording changes break branches silently. Prevention: Design full branching tree before implementation (flowchart), limit depth to 3 levels max, use rules engine with visual representation, store branching rules as data (JSON), implement branch validation (every path reaches terminal node).

2. **Rigid database schema assumes fixed question types**—schema defines columns per question type (multiple_choice_answer, true_false_answer); adding new types requires migration; analytics become 50-line UNION queries. Prevention: Use flexible JSONB schema for answer payloads, store question metadata as configuration not columns, design for "unknown future question types" from day one.

3. **Rules engine hardcodes business logic**—proficiency determination is `if score >= 8 then "Advanced"` in code; rule changes require deployment; no audit trail of "why this level?"; non-developers can't modify criteria. Prevention: Design rules as declarable JSON data from start, separate rule evaluation engine from business logic, version rules with timestamps, make rules composable, build rule tester into admin interface.

4. **Session state management loses incomplete responses**—user completes 7 of 10 questions, browser crashes, loses all progress; or partial responses create duplicate records. Prevention: Auto-save after every question answered (not on navigation), use stable session identifiers (user_id + assessment_id), store progress percentage and last_question_id, define "incomplete" vs "abandoned" thresholds, allow resume via unique link.

5. **"Personalized feedback" is actually generic templates**—feedback is three pre-written templates (one per level); users notice identical feedback for same level; no reference to specific answers or patterns. Prevention: Define feedback granularity requirements upfront (level 1: generic template, level 2: dynamic variables like score/weak areas, level 3: question-specific guidance, level 4: learning path recommendations), store response analysis metadata (which categories struggled, which questions wrong), design feedback templates with variable substitution.

**Additional important pitfalls:**
- **Survey scope creep kills completion rate**: "5-10 questions" becomes 18; completion drops from 85% to 45%. Mitigation: Set HARD question limit (10 max), every new question must justify which existing question to remove, track per-question abandonment.
- **Simple score thresholds miss nuance**: Leveling is just `score < 5 = Beginner` but doesn't account for getting foundation questions wrong while guessing advanced correctly. Mitigation: Interview stakeholders on what "Advanced" actually means, use multi-dimensional proficiency (foundation knowledge + application ability), weight questions differently.
- **Localization as afterthought**: Italian content but US date formats (MM/DD/YYYY); string interpolation breaks grammar; text expansion breaks UI. Mitigation: Use i18n library from day one even for single language, never concatenate strings, test with 30% longer text, store all user-facing text in translation files.

## Implications for Roadmap

Based on research, the natural phase structure follows dependency chains in the architecture. Components have clear "must build first" relationships that inform sequencing.

### Phase 1: Foundation & Data Model
**Rationale:** Database schema and rules architecture must be decided first. These decisions are nearly impossible to change later without full rewrites. Research shows that flexible data models (JSONB for questions/answers) and data-driven rules (JSON rule definitions) are prerequisites for maintainability. Hardcoded approaches require rewrites when requirements change.

**Delivers:** Database schema, basic survey engine for linear navigation, simple rules engine for evaluation, API foundation

**Addresses (from FEATURES.md):**
- Database design for multiple question types
- Session state management infrastructure
- Rules engine foundation

**Avoids (from PITFALLS.md):**
- Pitfall #2: Rigid database schema (use JSONB from start)
- Pitfall #3: Hardcoded rules (separate rule evaluation)
- Pitfall #4: Session state issues (design auto-save architecture)

**Technical decisions required:**
- PostgreSQL schema with separation: survey config vs response data
- JSONB for question options and rule definitions
- Session management strategy (where state lives)
- Rules engine data structure (condition-action JSON format)

**Build order within phase:**
1. Database schema (surveys, questions, question_options, conditional_rules, respondents, responses, answers)
2. Survey Engine for linear navigation (loads questions, tracks state)
3. Basic Rules Engine (evaluates simple conditions, determines level)
4. Session management (auto-save answers, resume capability)

**Research flag:** Standard patterns—skip research-phase. Database design and rules engine patterns well-documented in ARCHITECTURE.md sources.

### Phase 2: MVP User Experience
**Rationale:** With foundation in place, build end-to-end learner flow. This delivers immediate value: learners can complete assessments and receive level assignments. Research shows that session persistence and clear feedback are table stakes—users expect not to lose progress and to receive clear results. This phase validates the core value proposition.

**Delivers:** Quiz player UI, response capture, results display, basic feedback system

**Addresses (from FEATURES.md):**
- Multiple question types (MC, multiple select, T/F)
- Mobile-responsive UI
- Progress indicators
- Instant submission confirmation
- Clear feedback delivery

**Uses (from STACK.md):**
- React Hook Form + Zod for question rendering and validation
- shadcn/ui components (form, radio-group, checkbox, card)
- Zustand for client state (current question, answers array)
- Supabase client for saving responses

**Implements (from ARCHITECTURE.md):**
- Quiz Player component (presentation layer)
- Response Storage (saves answers immediately)
- Results Display (shows level + basic feedback)

**Avoids (from PITFALLS.md):**
- Pitfall #6: Scope creep (enforce 10 question max)
- Pitfall #11: Leading questions (peer review for neutrality)
- Pitfall #12: No "I don't know" option (provide for knowledge questions)
- Pitfall #13: Inaccurate progress (handle branching estimates)

**Build order within phase:**
1. Quiz Player UI (render questions based on type)
2. Form validation and submission (React Hook Form + Zod schemas)
3. Progress tracking and display
4. Response persistence (auto-save after each answer)
5. Results page (fetch evaluation, display level)
6. Basic feedback templates (one per level initially)

**Research flag:** Standard patterns—skip research-phase. Form handling and UI components are well-established Next.js patterns covered in STACK.md.

### Phase 3: Adaptive Intelligence
**Rationale:** MVP works for linear assessments; now add the core differentiator: branching logic and custom rules. Research emphasizes that branching should be added after linear flow works—it's backward compatible and less risky to implement incrementally. This phase transforms the platform from "survey tool" to "adaptive assessment system." The custom rules engine enables nuanced proficiency determination beyond simple score thresholds.

**Delivers:** Conditional branching navigation, advanced rules engine with complex conditions, enhanced feedback based on patterns

**Addresses (from FEATURES.md):**
- Branching/skip logic (core differentiator)
- Custom rules engine (competitive advantage)
- Personalized feedback paths

**Implements (from ARCHITECTURE.md):**
- Enhanced Survey Engine with conditional logic evaluation
- Advanced Rules Engine (complex condition-action pairs)
- Result Generator with pattern-based feedback

**Avoids (from PITFALLS.md):**
- Pitfall #1: Unmaintainable branching (visualize full tree, limit depth to 3 levels)
- Pitfall #8: Skip logic breaks on back navigation (decide navigation model, test back-button scenarios)
- Pitfall #9: Simple score thresholds miss nuance (involve domain experts, multi-dimensional criteria)

**Technical implementation:**
- Conditional navigation: Evaluate `next_question_id` based on answer value
- Rules engine: Parse JSON rule definitions, evaluate conditions, execute actions
- Branch validation: Every path must reach terminal node
- Enhanced feedback: Store response analysis metadata (categories struggled, questions wrong)

**Build order within phase:**
1. Branching logic in Survey Engine (evaluate conditional_rules table)
2. Branch validation (detect infinite loops, missing terminal nodes)
3. Advanced Rules Engine (compound conditions with AND/OR logic)
4. Response pattern analysis (categorize answers for feedback)
5. Dynamic feedback generation (variable substitution in templates)

**Research flag:** Needs research-phase. Branching logic implementation has nuances (back navigation handling, validation strategies) that may need deeper investigation. Rules engine libraries (json-rules-engine) should be evaluated for fit.

### Phase 4: Administrative Operations
**Rationale:** System works for learners; now add management tools. Admin panel comes last because it reads from existing components (response storage, rules engine). Research shows that admin analytics should focus on actionable metrics, not vanity metrics—define key questions before building dashboards.

**Delivers:** Admin dashboard to view responses, survey editor to manage questions and rules, analytics for completion rates and answer patterns

**Addresses (from FEATURES.md):**
- Admin dashboard access
- Response data export (CSV)
- Question bank management (defer complex versioning to v2)

**Implements (from ARCHITECTURE.md):**
- Admin Panel (views responses, manages surveys)
- Survey Editor (configure questions, options, branching rules)
- Analytics Dashboard (aggregated metrics)

**Avoids (from PITFALLS.md):**
- Pitfall #5: Lock surveys once responses received (draft/published workflow)
- Pitfall #7: Vanity metrics (focus on actionable: abandonment points, question discrimination)

**Technical implementation:**
- Admin authentication (Supabase auth with admin role check)
- Response viewing with filtering (by date, completion status, level)
- CSV export (responses with question text, not just IDs)
- Survey editor (CRUD for questions, options, rules)
- Analytics queries (completion rate, per-question abandonment, answer distribution)

**Build order within phase:**
1. Admin authentication and role-based access
2. Response viewing interface (list, filter, detail view)
3. CSV export functionality
4. Survey editor (manage questions and options)
5. Rules editor (configure evaluation rules)
6. Analytics dashboard (key metrics only)

**Research flag:** Standard patterns—skip research-phase. Admin CRUD and analytics dashboards are well-documented patterns. Focus on implementation based on FEATURES.md requirements.

### Phase Ordering Rationale

The sequence follows strict dependency chains identified in ARCHITECTURE.md:

1. **Foundation before UI**: Cannot build Quiz Player without database schema and session management. Cannot implement branching without rules engine architecture.

2. **Linear before adaptive**: MVP delivers linear questionnaires first, then adds branching. This is backward compatible—branching rules can return null to indicate "next in sequence." Reduces risk by validating core flow before adding complexity.

3. **User-facing before admin**: Learners are primary users; admin is operational tooling. Building admin first creates temptation to over-engineer before validating core value with learners.

4. **Data collection before analytics**: Phase 1 must instrument response metadata (timestamps, categories, patterns) even if Phase 4 displays it. Retrofitting analytics data collection is painful.

The research reveals that pitfalls requiring Phase 1 decisions (flexible schema, data-driven rules, session management) drive phase sequencing. Get foundation right, then iterate upward through the stack.

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 3 (Adaptive Intelligence)**: Branching logic implementation details need investigation—specifically handling back navigation (re-evaluate all downstream branching? warn user? disable back button?). Rules engine libraries (json-rules-engine, easy-rules) should be evaluated for fit vs custom implementation. ARCHITECTURE.md provides patterns but implementation choices need validation.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Foundation)**: Database schema patterns are well-documented in ARCHITECTURE.md with PostgreSQL examples. Session management follows standard Next.js + Supabase patterns from STACK.md.

- **Phase 2 (MVP UI)**: Form handling with React Hook Form + Zod is thoroughly documented in STACK.md. shadcn/ui components for quiz interfaces follow established patterns.

- **Phase 4 (Admin Operations)**: CRUD operations, authentication, and CSV export are standard Next.js API patterns. No domain-specific complexity requiring additional research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core technologies verified via npm registry (versions current as of 2026-02-04), Next.js + Supabase recommended in official docs, shadcn/ui confirmed React 19 + Tailwind v4 support, React Hook Form + Zod integration documented, Zustand positioned as 2025 standard for small-medium apps |
| Features | MEDIUM-HIGH | Table stakes features show consensus across Capterra, Research.com, Mentimeter reviews of assessment platforms; differentiators validated through comparison of Typeform, SurveyMonkey, Qualtrics; anti-features inferred from platform engineering anti-patterns and survey best practices |
| Architecture | HIGH | Three-tier architecture confirmed across SurveyJS documentation, multiple database design sources (Redgate, Vertabelo), rules engine patterns from Nected; JSON schema pattern and conditional navigation via foreign keys well-documented; component boundaries match real-world implementations |
| Pitfalls | MEDIUM-HIGH | Branching complexity and data model rigidity show strong consensus across survey platform sources; rules engine and session management pitfalls validated through multiple consistent sources; some pitfalls (personalized feedback, localization) partially inferred from general patterns |

**Overall confidence:** HIGH

All critical path decisions (stack, architecture, data model) have high-confidence sources. Feature research has medium-high confidence due to reliance on market analysis vs direct technical documentation. Pitfalls research is solid but some prevention strategies are best-practice inference rather than documented anti-patterns.

### Gaps to Address

**1. Branching complexity limits**—research recommends "3 levels max" but doesn't quantify when complexity becomes unmaintainable. During Phase 3 planning, evaluate: How many branch points before visualization tools become necessary? When does manual testing become impractical?

**2. Rules engine implementation**—research identifies the pattern (JSON rule definitions, separate evaluation engine) but doesn't prescribe library vs custom implementation. Phase 3 should evaluate: json-rules-engine library fit, performance at scale (100+ rules?), debugging/testing approaches for rule logic.

**3. Personalized feedback granularity**—research defines levels (1: generic, 2: variables, 3: question-specific, 4: learning paths) but doesn't provide implementation guidance. Phase 2 should validate: What level of personalization is viable for 5-10 question assessment? What response metadata must be captured?

**4. Multi-language expansion timing**—research recommends i18n library from day one but defers actual Italian localization details. Before Phase 2, validate: Italian translation approach (professional vs AI-assisted?), text expansion impact on UI (Italian is ~17% longer than English), date/number formatting requirements.

**5. Admin analytics metrics**—research emphasizes "actionable not vanity" but doesn't define specific metrics for pre-training assessments. Phase 4 should define: Which metrics inform question quality? How to measure rule effectiveness? What thresholds indicate problems?

**6. Proficiency level criteria**—research warns against simple score thresholds but doesn't provide domain-specific guidance for AI course leveling. Before Phase 1 completion, interview stakeholders: What makes someone "Advanced" in AI for lawyers? Are there must-pass foundation questions? How to handle domain expertise (legal) vs technical knowledge (AI)?

## Sources

### Primary (HIGH confidence)

**Stack research:**
- npm registry (https://registry.npmjs.org)—verified versions for Next.js 16.1.6, React 19.2.4, TypeScript 5.9.3, Supabase 2.94.1, React Hook Form 7.71.1, Zod 4.3.6, Zustand 5.0.11
- Next.js Official Docs (https://nextjs.org/docs)—App Router maturity, testing recommendations
- Supabase Official Docs (https://supabase.com/docs)—@supabase/ssr for Next.js App Router auth
- shadcn/ui Official Site (https://ui.shadcn.com)—React 19 + Tailwind v4 support confirmation
- React Hook Form Docs (https://react-hook-form.com)—Zod integration patterns

**Architecture research:**
- SurveyJS Architecture Guide (https://surveyjs.io/documentation/surveyjs-architecture)—separation of concerns, JSON schema patterns
- Database Design for Survey Systems (https://vertabelo.com/blog/database-design-survey-system/)—schema patterns
- Database Model for Online Survey Part 3 (https://www.red-gate.com/blog/a-database-model-for-an-online-survey-part-3/)—conditional logic via foreign keys
- Rules Engine Design Pattern (https://www.nected.ai/blog/rules-engine-design-pattern)—rules as data architecture

**Pitfalls research:**
- Best Practices for Using Branching Logic (https://support.cultureamp.com/en/articles/7048353)—complexity warnings
- Database Design Anti-patterns (https://www.sqlservercentral.com/forums/topic/survey-db-schema)—rigid schema issues
- Continuing Incomplete Surveys (https://surveyjs.io/form-library/documentation/how-to-save-and-restore-incomplete-survey)—session persistence

### Secondary (MEDIUM confidence)

**Features research:**
- Best Assessment Software 2026 (https://www.capterra.com/assessment-software/)—market analysis
- 21 Best Assessment Software (https://research.com/software/best-assessment-software)—feature comparison
- Survey Logic Features (https://www.surveymonkey.com/product/features/survey-logic/)—branching patterns
- Pre-Training Assessment Best Practices (https://www.coursebox.ai/blog/pre-training-assessment)

**Stack research:**
- State Management in 2025 (https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m)—Zustand recommendations
- Testing Next.js Applications 2025 (https://trillionclues.medium.com/testing-next-js-applications-a-complete-guide-to-catching-bugs-before-qa-does-a1db8d1a0a3b)—Vitest + Playwright
- Internationalization in Next.js (https://arnab-k.medium.com/internationalization-i18n-in-next-js-a-complete-guide-f62989f6469b)—next-intl patterns

**Pitfalls research:**
- Survey Abandonment Guide (https://qualaroo.com/blog/survey-abandonment-guide-causes-impact-solutions/)—completion rate factors
- Dashboard Anti-patterns (https://medium.com/@egarbugli/everything-wrong-with-analytics-dashboards-and-our-plan-to-fix-it-b5f873b9e679)—vanity metrics
- Personalized Recommendations at Scale (https://pointerpro.com/blog/personalized-recommendations-at-scale/)—feedback strategies

### Tertiary (LOW confidence, needs validation)

- Scalability thresholds (100 users vs 10K users in ARCHITECTURE.md)—based on general web patterns, not assessment-specific
- Graph database for 1M+ users (ARCHITECTURE.md)—theoretical, not verified with production examples
- AI question generation complexity (FEATURES.md)—2026 trend identified but implementation details sparse

---

*Research completed: 2026-02-04*
*Ready for roadmap: yes*
