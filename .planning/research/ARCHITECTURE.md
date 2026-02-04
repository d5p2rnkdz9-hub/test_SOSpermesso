# Architecture Patterns: Branching Assessment/Quiz Systems

**Domain:** Pre-training assessment/screening tool
**Researched:** 2026-02-04
**Confidence:** HIGH

## Recommended Architecture

Branching assessment systems follow a three-tier architecture with clear separation between presentation, business logic, and data persistence. For the Italian lawyers AI course pre-training assessment, the recommended structure is:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Quiz Player  │  │ Admin Panel │  │ Results Display  │   │
│  │ (Learner)    │  │ (Dashboard) │  │ (Feedback)       │   │
│  └──────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ JSON/REST API
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Survey Engine │  │ Rules Engine │  │ Result         │  │
│  │ (Navigation)  │  │ (Evaluation) │  │ Generator      │  │
│  └───────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ Database Queries
┌─────────────────────────────────────────────────────────────┐
│                     DATA PERSISTENCE LAYER                   │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Survey Schema │  │ Response     │  │ Rules          │  │
│  │ (Questions)   │  │ Storage      │  │ Configuration  │  │
│  └───────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | Build Priority |
|-----------|----------------|-------------------|----------------|
| **Survey Schema** | Store question definitions, types, options, conditional logic rules | Survey Engine (read), Admin Panel (write) | Phase 1 (Foundation) |
| **Survey Engine** | Navigate question flow, apply conditional branching, track session state | Quiz Player (UI), Rules Engine (evaluation), Survey Schema (read) | Phase 1 (Foundation) |
| **Quiz Player** | Render questions, capture answers, handle user interaction | Survey Engine (state), Response Storage (save) | Phase 2 (MVP UI) |
| **Response Storage** | Persist learner answers, track completion status | Quiz Player (write), Rules Engine (read), Admin Panel (read) | Phase 2 (MVP UI) |
| **Rules Engine** | Evaluate custom conditions, determine proficiency level, calculate results | Survey Engine (navigation), Response Storage (read), Result Generator (output) | Phase 3 (Intelligence) |
| **Result Generator** | Generate personalized feedback, format recommendations | Rules Engine (input), Results Display (output) | Phase 3 (Intelligence) |
| **Admin Panel** | View responses, manage surveys, configure rules | Survey Schema (CRUD), Response Storage (read), Rules Engine (configure) | Phase 4 (Operations) |
| **Results Display** | Show feedback to learners, display proficiency level | Result Generator (input) | Phase 2 (MVP UI) |

### Data Flow

**Learner Journey (Read Path):**
```
1. Quiz Player requests first question → Survey Engine
2. Survey Engine retrieves question definition → Survey Schema
3. Survey Engine returns question + options → Quiz Player
4. Learner submits answer → Quiz Player
5. Quiz Player saves answer → Response Storage
6. Quiz Player requests next question → Survey Engine
7. Survey Engine evaluates conditional logic → Rules Engine (optional)
8. Survey Engine determines next question → Survey Schema
9. Repeat steps 3-8 until survey complete
10. Survey Engine triggers evaluation → Rules Engine
11. Rules Engine processes all answers → Response Storage
12. Rules Engine calculates proficiency level → Result Generator
13. Result Generator creates feedback → Results Display
14. Results Display shows personalized report → Learner
```

**Admin Journey (Write Path):**
```
1. Admin creates/edits survey → Admin Panel
2. Admin Panel saves configuration → Survey Schema
3. Admin configures rules → Admin Panel
4. Admin Panel saves rule definitions → Rules Engine
5. Admin views responses → Admin Panel
6. Admin Panel queries submissions → Response Storage
```

## Patterns to Follow

### Pattern 1: JSON Schema Definition
**What:** Store survey structure as JSON schema with framework-independent definitions
**When:** Defining questions, options, and conditional logic
**Why:** Enables portability, version control, and decoupling from rendering logic
**Example:**
```typescript
// Survey schema stored in database
{
  "surveyId": "ai-course-pretest-v1",
  "title": "AI Course Pre-Training Assessment",
  "questions": [
    {
      "id": "q1",
      "type": "multipleChoice",
      "text": "What is your experience with programming?",
      "options": [
        { "value": "none", "label": "No experience", "nextQuestion": "q2" },
        { "value": "beginner", "label": "Basic knowledge", "nextQuestion": "q3" },
        { "value": "intermediate", "label": "Some experience", "nextQuestion": "q4" }
      ],
      "required": true,
      "order": 1
    },
    {
      "id": "q2",
      "type": "boolean",
      "text": "Are you willing to learn programming basics?",
      "conditionalDisplay": {
        "questionId": "q1",
        "operator": "equals",
        "value": "none"
      },
      "order": 2
    }
  ]
}
```

**Source:** [SurveyJS Architecture](https://surveyjs.io/documentation/surveyjs-architecture) - MEDIUM confidence

### Pattern 2: Separate Rules from Application Logic
**What:** Extract evaluation logic into standalone rules engine component
**When:** Implementing custom proficiency determination (not just score thresholds)
**Why:** Enables non-developers to modify rules, centralizes decision logic, supports auditing
**Example:**
```typescript
// Rule definition stored separately from code
interface Rule {
  id: string;
  conditions: Condition[];
  action: Action;
}

interface Condition {
  questionId: string;
  operator: "equals" | "greaterThan" | "lessThan" | "contains";
  value: any;
}

interface Action {
  type: "assignLevel" | "skipTo" | "terminate";
  value: string;
}

// Example rule
{
  "id": "advanced-level-rule",
  "conditions": [
    { "questionId": "q1", "operator": "equals", "value": "intermediate" },
    { "questionId": "q4", "operator": "greaterThan", "value": 3 },
    { "questionId": "q6", "operator": "contains", "value": "machine-learning" }
  ],
  "action": { "type": "assignLevel", "value": "advanced" }
}
```

**Source:** [Rules Engine Design Pattern (Nected)](https://www.nected.ai/blog/rules-engine-design-pattern) - HIGH confidence

### Pattern 3: Conditional Navigation via Foreign Keys
**What:** Use foreign key references to specify next question based on answer
**When:** Implementing branching logic (answer determines next question)
**Why:** Maintains referential integrity, prevents invalid question chains, simple to implement
**Example:**
```typescript
// Database schema for conditional navigation
CREATE TABLE question_order (
  survey_id INT,
  question_id INT,
  order_position INT,
  PRIMARY KEY (survey_id, question_id)
);

CREATE TABLE conditional_order (
  survey_id INT,
  question_id INT,
  response_to_question INT,
  positive_response_next_question INT,
  negative_response_next_question INT,
  FOREIGN KEY (survey_id, response_to_question)
    REFERENCES question_order(survey_id, question_id),
  FOREIGN KEY (survey_id, positive_response_next_question)
    REFERENCES question_order(survey_id, question_id),
  FOREIGN KEY (survey_id, negative_response_next_question)
    REFERENCES question_order(survey_id, question_id)
);
```

**Source:** [Database Model for Online Survey Part 3 (Redgate)](https://www.red-gate.com/blog/a-database-model-for-an-online-survey-part-3/) - HIGH confidence

### Pattern 4: Separation of Survey Configuration from Response Data
**What:** Use separate database schemas for survey definitions vs learner responses
**When:** Designing database structure
**Why:** Allows survey changes without affecting historical data, supports multiple survey versions, simplifies analytics
**Example:**
```typescript
// Survey configuration tables (versioned)
- surveys (id, title, version, created_at, active)
- questions (id, survey_id, type, text, order)
- question_options (id, question_id, value, label, next_question_id)

// Response data tables (historical)
- respondents (id, email, name, started_at)
- responses (id, respondent_id, survey_id, survey_version, completed_at)
- answers (id, response_id, question_id, answer_value)
- answer_options (id, answer_id, option_id)
```

**Source:** [Database Design for Survey Systems (Redgate)](https://www.red-gate.com/blog/database-design-survey-system/) - HIGH confidence

### Pattern 5: Frontend/Backend Separation via REST API
**What:** Decouple presentation layer from business logic using REST API with JSON payloads
**When:** Building cloud-hosted application (Vercel/Netlify frontend, backend API)
**Why:** Independent deployment, technology flexibility, improved security, better scalability
**Example:**
```typescript
// API endpoints
GET  /api/surveys/:id                    // Fetch survey definition
POST /api/surveys/:id/start              // Initialize new response session
GET  /api/surveys/:id/questions/:qId     // Fetch specific question
POST /api/responses/:id/answers          // Submit answer
POST /api/responses/:id/complete         // Finalize and evaluate
GET  /api/responses/:id/results          // Retrieve personalized results

// Admin endpoints
GET    /api/admin/responses              // List all responses
GET    /api/admin/responses/:id          // View individual response
PUT    /api/surveys/:id                  // Update survey configuration
GET    /api/admin/analytics              // Aggregated statistics
```

**Source:** Multiple sources on headless architecture patterns - MEDIUM confidence

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hardcoding Question Flow in Application Logic
**What:** Writing if/else statements in code to determine next question based on answers
**Why bad:**
- Requires code changes for survey modifications
- Prevents non-technical admin from managing surveys
- Makes testing difficult (must test all code paths)
- Violates Open/Closed Principle
**Consequences:** Every survey change requires developer intervention, deployment delays, increased maintenance cost
**Instead:** Use data-driven navigation where question order and conditional logic are stored in database/JSON configuration
**Detection Warning Signs:**
- Functions like `getNextQuestion(currentQ, answer)` with switch/case statements
- Hardcoded question IDs in business logic
- Survey changes require code deployment

### Anti-Pattern 2: Mixing Survey Version in Response Data
**What:** Updating survey definition tables that responses reference, losing historical context
**Why bad:**
- Cannot reproduce what learner actually saw
- Analytics become meaningless (comparing different survey versions)
- Audit trail breaks
- Violates data integrity
**Consequences:** Cannot answer "What questions did this learner answer?" after survey changes
**Instead:**
- Version survey schemas (surveys_v1, surveys_v2)
- Store survey_version in response record
- Keep immutable snapshots of survey definitions
**Detection Warning Signs:**
- Single surveys table without versioning
- UPDATE queries on question definitions
- Responses don't store survey version reference

### Anti-Pattern 3: Simple Score Thresholds for Complex Evaluations
**What:** Using only total_score >= 80 ? "advanced" : "intermediate" logic
**Why bad:**
- Cannot express complex rules (e.g., "strong in Python BUT weak in statistics = intermediate")
- Ignores question dependencies
- All questions weighted equally
- No way to handle skill combinations
**Consequences:** Inaccurate proficiency assignments, learners misplaced in wrong course level
**Instead:** Implement rules engine that evaluates multiple conditions per rule
**Detection Warning Signs:**
- Single score field in results
- Simple comparison operators only
- No concept of skill domains/categories

### Anti-Pattern 4: Monolithic Frontend State Management
**What:** Storing entire survey state (all questions, all answers) in frontend memory
**Why bad:**
- Page refresh loses all progress
- Concurrent sessions on different devices impossible
- No recovery from crashes
- Large surveys cause performance issues
**Consequences:** Poor user experience, data loss, frustrated learners
**Instead:**
- Save answers to backend after each submission
- Server maintains session state
- Frontend only loads current question
- Resume capability from any point
**Detection Warning Signs:**
- localStorage as primary data store
- No API calls during survey (only at end)
- "Progress will be lost if you refresh" warnings

### Anti-Pattern 5: Admin Panel Directly Modifying Production Survey
**What:** Allowing survey edits while learners are actively taking it
**Why bad:**
- Learners mid-survey see different questions than earlier respondents
- Conditional logic breaks if referenced question removed
- Responses become inconsistent
- Data analysis impossible
**Consequences:** Survey data corruption, angry users, unreliable results
**Instead:**
- Draft/Published workflow (edit drafts, publish creates new version)
- Lock surveys once first response received
- Create new version for changes
**Detection Warning Signs:**
- No draft mode
- Direct UPDATE on question definitions
- No "active responses" check before edits

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Response Storage** | Simple relational DB (PostgreSQL). Store full response history. | Same approach, add database indexes on survey_id, respondent_id, completed_at. Partition by date if needed. | Consider NoSQL (MongoDB) for raw answers. Keep metadata in SQL. Archive old responses to cold storage. |
| **Rules Engine** | Execute rules synchronously after survey completion. Simple JavaScript evaluation. | Cache compiled rule definitions. Execute rules in background job queue. | Distribute rule execution across workers. Pre-compile rules to bytecode. Consider rules as a microservice. |
| **Survey Schema Loading** | Load full survey JSON on every request. No caching. | Cache survey definitions in Redis. TTL = 1 hour. Invalidate on admin updates. | CDN for survey JSON files. Version-based URLs for cache busting. Lazy load question definitions. |
| **Admin Analytics** | Real-time queries on responses table. Compute on demand. | Materialized views for common queries. Refresh hourly. | Separate analytics database (read replica). Pre-aggregate metrics. Use time-series DB for trends. |
| **Conditional Logic** | Evaluate conditions in application code on each navigation. | Cache branching decisions per response. Memoize next question lookups. | Pre-compute entire question tree. Store as directed graph. Use graph database for complex branching. |

**For Italian lawyers AI course assessment (5-10 questions, single admin, small cohorts):**
- Start with **100 users column** approach
- Add caching when > 50 concurrent sessions
- Monitoring will reveal actual bottlenecks before scaling concerns

## Build Order Dependencies

The components have clear dependency chains that inform phase structure:

### Foundation Phase (Must Build First)
```
Survey Schema → Survey Engine → Rules Engine (basic)
```
**Rationale:** Cannot navigate questions without schema; cannot evaluate without basic rules. These are core infrastructure.

**Components:**
1. Database schema for surveys, questions, options
2. Survey Engine for linear navigation (no conditional logic yet)
3. Basic Rules Engine for simple evaluation (score thresholds)

**Exit Criteria:** Can define survey, navigate linearly, compute basic score

### MVP Phase (User-Facing)
```
Foundation → Quiz Player + Response Storage → Results Display
```
**Rationale:** Learners need to take survey and see results. This delivers end-to-end value.

**Components:**
1. Frontend Quiz Player (render questions, capture answers)
2. Response Storage (save answers to database)
3. Results Display (show proficiency level + basic feedback)
4. API endpoints for survey flow

**Exit Criteria:** Learner can complete survey, receive level assignment

### Intelligence Phase (Branching & Custom Rules)
```
MVP → Conditional Navigation + Advanced Rules Engine
```
**Rationale:** Basic survey works; now add sophistication. Branching changes navigation but not data model.

**Components:**
1. Conditional logic in Survey Engine (branching navigation)
2. Advanced Rules Engine (complex conditions, custom evaluations)
3. Enhanced Result Generator (personalized feedback based on patterns)

**Exit Criteria:** Survey branches based on answers, custom rules determine levels

### Operations Phase (Admin Capabilities)
```
Intelligence → Admin Panel + Analytics
```
**Rationale:** System works for learners; now add management tools. Admin panel is last because it reads from existing components.

**Components:**
1. Admin Panel (view responses, manage surveys)
2. Analytics Dashboard (aggregated metrics)
3. Survey Editor (configure questions, rules)

**Exit Criteria:** Admin can view responses, modify surveys, analyze results

**Critical Dependency Notes:**
- Rules Engine must exist before Admin Panel (admin configures rules)
- Response Storage must exist before Admin Panel (admin views responses)
- Conditional Navigation can be built after MVP (backward compatible with linear surveys)
- Results Display depends on Rules Engine output (loose coupling via JSON)

## Database Schema Reference

Based on research synthesis, the recommended minimal schema for branching assessment:

```sql
-- Survey Configuration (versioned)
CREATE TABLE surveys (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  version INT NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  survey_id INT NOT NULL REFERENCES surveys(id),
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'multipleChoice', 'boolean', 'multiSelect'
  order_position INT NOT NULL,
  required BOOLEAN DEFAULT true,
  UNIQUE(survey_id, order_position)
);

CREATE TABLE question_options (
  id SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_value VARCHAR(255) NOT NULL,
  option_label TEXT NOT NULL,
  next_question_id INT REFERENCES questions(id), -- For conditional branching
  order_position INT NOT NULL
);

CREATE TABLE conditional_rules (
  id SERIAL PRIMARY KEY,
  survey_id INT NOT NULL REFERENCES surveys(id),
  question_id INT NOT NULL REFERENCES questions(id),
  condition_type VARCHAR(50) NOT NULL, -- 'show_if', 'skip_if', 'terminate_if'
  depends_on_question INT NOT NULL REFERENCES questions(id),
  depends_on_value VARCHAR(255),
  operator VARCHAR(20) DEFAULT 'equals' -- 'equals', 'notEquals', 'contains', 'greaterThan'
);

-- Response Data (historical, immutable)
CREATE TABLE respondents (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  respondent_id INT NOT NULL REFERENCES respondents(id),
  survey_id INT NOT NULL REFERENCES surveys(id),
  survey_version INT NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  assigned_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  evaluation_score JSONB -- Flexible storage for rule engine results
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  response_id INT NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id),
  answer_value TEXT, -- For open-ended
  answered_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE answer_options (
  id SERIAL PRIMARY KEY,
  answer_id INT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  option_id INT NOT NULL REFERENCES question_options(id)
);

-- Rules Engine Configuration
CREATE TABLE evaluation_rules (
  id SERIAL PRIMARY KEY,
  survey_id INT NOT NULL REFERENCES surveys(id),
  rule_name VARCHAR(255) NOT NULL,
  rule_definition JSONB NOT NULL, -- Stores condition-action structure
  priority INT DEFAULT 0, -- Higher priority rules evaluated first
  active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_responses_survey ON responses(survey_id, completed_at);
CREATE INDEX idx_answers_response ON answers(response_id);
CREATE INDEX idx_questions_survey ON questions(survey_id, order_position);
```

**Schema Design Rationale:**
- **Two-schema separation:** Survey configuration vs response data enables versioning
- **JSONB for rules:** Flexibility for complex rule conditions without schema changes
- **Foreign key branching:** next_question_id provides simple conditional navigation
- **Audit trail:** Timestamps on all response actions, immutable answer records

## Technology-Specific Recommendations

For the Italian lawyers AI course use case (cloud-hosted, Vercel/Netlify):

**Frontend (Vercel/Netlify):**
- Use React/Vue/Svelte with form library (React Hook Form, Formik)
- SurveyJS library provides pre-built quiz player component (consider for rapid prototyping)
- Store minimal state in frontend (current question only)
- Progressive enhancement: works without JavaScript for basic navigation

**Backend (API):**
- Next.js API Routes (if using Vercel) or Netlify Functions
- Alternatively: Separate Express/Fastify API (better for complex rules engine)
- PostgreSQL for relational data (Supabase, Neon, or Railway)
- Redis for session/caching (Upstash if serverless)

**Rules Engine:**
- Start simple: JavaScript evaluation with json-rules-engine library
- For complex needs: Consider Nected API or similar hosted rules service
- Store rules as JSON in database, compile to functions at runtime

**Hosting:**
- Frontend: Vercel or Netlify (static + API routes)
- Database: Managed PostgreSQL (Supabase recommended for free tier + auth)
- File storage: Not needed for this use case

## Sources

**HIGH Confidence:**
- [SurveyJS Architecture Guide](https://surveyjs.io/documentation/surveyjs-architecture) - Official documentation on separation of concerns, JSON schema patterns
- [Database Design for Survey Systems (Redgate)](https://www.red-gate.com/blog/database-design-survey-system/) - Database schema patterns for surveys
- [Database Model for Online Survey Part 3 (Redgate)](https://www.red-gate.com/blog/a-database-model-for-an-online-survey-part-3/) - Conditional logic implementation in database
- [Rules Engine Design Pattern (Nected)](https://www.nected.ai/blog/rules-engine-design-pattern) - Rules engine architecture and components

**MEDIUM Confidence:**
- [Frontend Architecture Patterns 2026 (DEV)](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo) - Frontend/backend separation trends
- Web search results on adaptive testing architecture - Multiple sources agreeing on layered architecture approach
- Web search results on branching questionnaire patterns - Community patterns verified across sources

**LOW Confidence (flagged for validation):**
- Specific scalability thresholds (100 users vs 10K users) - Based on general web application patterns, not assessment-specific research
- Graph database recommendation for 1M+ users - Theoretical, not verified with production examples
