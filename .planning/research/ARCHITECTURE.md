# Architecture Research

**Domain:** Multilingual legal decision tree on Next.js (forking Corso AI)
**Researched:** 2026-02-14
**Confidence:** HIGH (existing codebase analyzed, patterns verified with official docs)

## System Overview

```
+---------------------------------------------------------------+
|                     Next.js App Router                         |
|  /[locale]/                                                    |
|  +----------------------------------------------------------+ |
|  |  Layout (dir={rtl|ltr}, lang={locale})                    | |
|  |  +-----------+  +----------------+  +------------------+  | |
|  |  | TreePlayer|  | OutcomePage    |  | NameCollector    |  | |
|  |  | (engine)  |  | (scheda)       |  | (entry)          |  | |
|  |  +-----+-----+  +-------+--------+  +--------+---------+  | |
|  |        |                 |                    |            | |
|  +--------+-----------------+--------------------+------------+ |
|           |                 |                    |              |
+-----------|-----------------|--------------------|--------------+
|           v                 v                    v              |
|                    Zustand Store                                |
|  +----------------------------------------------------------+  |
|  | treeStore: currentNodeId, answers, history, sessionId     |  |
|  +----------------------------------------------------------+  |
|           |                                                     |
+-----------+-----------------------------------------------------+
|           v                                                     |
|  +------------------+  +-------------------+  +---------------+ |
|  | /api/session     |  | /api/tree         |  | /api/outcome  | |
|  | (CRUD+resume)    |  | (graph loader)    |  | (scheda data) | |
|  +--------+---------+  +---------+---------+  +-------+-------+ |
|           |                      |                    |         |
+-----------+----------------------+--------------------+---------+
|           v                      v                    v         |
|  +----------------------------------------------------------+  |
|  |              Supabase PostgreSQL                          |  |
|  |  tree_nodes  |  tree_edges  |  outcomes  |  sessions      |  |
|  |  (JSONB i18n)|  (graph)     |  (JSONB)   |  (answers)     |  |
|  +----------------------------------------------------------+  |
|                                                                 |
|  +----------------------------------------------------------+  |
|  |              JSON Translation Files                       |  |
|  |  /messages/it.json  /messages/ar.json  /messages/fr.json  |  |
|  |  (UI strings only -- questions/outcomes live in DB)        |  |
|  +----------------------------------------------------------+  |
+-----------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `[locale]` segment | URL-based locale detection, sets `dir` and `lang` on `<html>` | Next.js dynamic route segment via next-intl |
| `TreePlayer` | Renders current question node, handles navigation forward/back through graph | Client component, reads from Zustand store |
| `OutcomePage` | Renders rich legal outcome ("scheda") with variable substitution | Server component where possible, fetches outcome by ID+locale |
| `NameCollector` | Entry screen collecting user name for variable substitution | Client component, writes to store |
| `treeStore` (Zustand) | Client-side session state: current node, answer history, navigation stack | Zustand with `persist` middleware (localStorage) |
| `DirectionProvider` | Wraps app in Radix DirectionProvider for RTL-aware primitives | Layout-level, reads locale to set `dir` |
| API routes | Session CRUD, tree graph loading, outcome fetching | Next.js Route Handlers, Prisma queries |
| Supabase PostgreSQL | Persistent storage: tree structure, outcomes, sessions, answers | Prisma ORM with JSONB fields for i18n content |
| JSON message files | UI chrome translations (buttons, labels, navigation, error messages) | next-intl message files, one per locale |

## Recommended Project Structure

```
src/
+-- app/
|   +-- [locale]/                # Locale segment (it, ar, fr, en, es)
|   |   +-- layout.tsx           # Sets dir, lang, wraps DirectionProvider
|   |   +-- page.tsx             # Landing / name collector
|   |   +-- tree/
|   |   |   +-- page.tsx         # Decision tree player
|   |   |   +-- TreeContent.tsx  # Client component orchestrator
|   |   +-- outcome/
|   |       +-- [outcomeId]/
|   |           +-- page.tsx     # Scheda / outcome page (can be SSR)
|   +-- api/
|       +-- session/
|       |   +-- route.ts         # POST: create, GET: list
|       |   +-- [id]/route.ts    # GET: resume, PATCH: update
|       +-- tree/
|       |   +-- route.ts         # GET: load tree graph for current locale
|       +-- outcome/
|           +-- [id]/route.ts    # GET: fetch outcome content + locale
+-- components/
|   +-- tree/                    # Decision tree components
|   |   +-- TreePlayer.tsx       # Main orchestrator (like QuizPlayer)
|   |   +-- QuestionNode.tsx     # Renders a question with options
|   |   +-- NavigationButtons.tsx
|   |   +-- ProgressIndicator.tsx
|   |   +-- NameInput.tsx
|   |   +-- index.ts
|   +-- outcome/                 # Outcome / scheda components
|   |   +-- OutcomeCard.tsx      # Main outcome display
|   |   +-- RequirementsList.tsx
|   |   +-- ConfidenceIndicator.tsx
|   |   +-- ExternalLinks.tsx
|   |   +-- FeedbackSection.tsx
|   |   +-- index.ts
|   +-- ui/                      # shadcn/ui (RTL-converted)
|       +-- button.tsx
|       +-- card.tsx
|       +-- ...
+-- hooks/
|   +-- useTree.ts               # Tree navigation computed values
|   +-- useLocale.ts             # Locale/direction helpers
+-- store/
|   +-- tree-store.ts            # Zustand: tree state + navigation
+-- lib/
|   +-- db.ts                    # Prisma client
|   +-- tree-engine.ts           # Graph traversal logic
|   +-- variable-substitution.ts # Template variable replacement
|   +-- i18n/
|   |   +-- request.ts           # next-intl getRequestConfig
|   |   +-- routing.ts           # Locale routing config
|   |   +-- navigation.ts        # Locale-aware Link, redirect, etc.
|   +-- rtl.ts                   # RTL locale detection helpers
+-- messages/                    # UI translation strings (not DB content)
|   +-- it.json
|   +-- ar.json
|   +-- fr.json
|   +-- en.json
|   +-- es.json
+-- types/
|   +-- tree.ts                  # TreeNode, TreeEdge, Outcome, etc.
+-- prisma/
    +-- schema.prisma
    +-- seed.ts                  # Seeds tree graph + outcomes
    +-- migrations/
```

### Structure Rationale

- **`[locale]` segment:** next-intl uses `app/[locale]/` as the standard pattern for locale-based routing. The URL is the source of truth for language: `/ar/tree` serves Arabic RTL, `/it/tree` serves Italian LTR. This was validated against next-intl official documentation.
- **`messages/` at src root:** UI chrome translations (button labels, navigation text, error messages) live in JSON files. These are ~200 strings total. Question and outcome content lives in the database because it has a different lifecycle (content editors vs code).
- **`tree/` vs `quiz/`:** Renamed from Corso AI's `quiz/` to `tree/` because this is a decision tree, not an assessment. The mental model matters for maintenance.
- **`outcome/[outcomeId]/`:** Each scheda is its own page with a URL, enabling direct linking, sharing, and SSR for SEO.
- **`lib/tree-engine.ts`:** Extracted from the Zustand store. In Corso AI the traversal logic is mixed into the store; here it should be a pure function for testability.

## Architectural Patterns

### Pattern 1: Directed Acyclic Graph (DAG) for Decision Tree

**What:** Model the decision tree as a graph with nodes (questions) and edges (transitions), not as a flat ordered list with `showCondition` (Corso AI's approach).

**When to use:** When the tree is a true graph with multiple entry points per node, shared subtrees, and option-specific routing -- exactly the SOSpermesso case.

**Trade-offs:**
- Pro: Accurately models the domain (a question like "C'e' decisione del Tribunale?" appears 5 times in Mermaid but is the same logical question with different parents)
- Pro: Adding/removing branches is a data change, not a code change
- Con: More complex to load and traverse than a flat array
- Con: Requires graph-aware back navigation (history stack, not index decrement)

**Database schema:**

```sql
-- Tree nodes (questions)
CREATE TABLE tree_nodes (
  id            TEXT PRIMARY KEY,        -- e.g. 'q_ue', 'minore_start'
  tree_id       TEXT NOT NULL,           -- groups nodes into a tree version
  node_type     TEXT NOT NULL,           -- 'question' | 'entry' | 'terminal'
  question_type TEXT,                    -- 'single_choice' | 'yes_no' | 'text_input'
  content       JSONB NOT NULL,          -- { "it": { "text": "...", "description": "..." }, "ar": {...} }
  metadata      JSONB,                   -- { "emoji": "...", "category": "minore|famiglia|..." }
  outcome_id    TEXT REFERENCES outcomes(id),  -- only for terminal nodes
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Tree edges (transitions between nodes)
CREATE TABLE tree_edges (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id       TEXT NOT NULL,
  from_node_id  TEXT NOT NULL REFERENCES tree_nodes(id),
  to_node_id    TEXT NOT NULL REFERENCES tree_nodes(id),
  option_key    TEXT NOT NULL,           -- 'yes', 'no', 'ita', 'ue', 'straniero'
  option_content JSONB NOT NULL,         -- { "it": { "label": "Si, e' italiano" }, "ar": {...} }
  sort_order    INT DEFAULT 0,
  UNIQUE(from_node_id, option_key)
);

-- Outcome pages (schede)
CREATE TABLE outcomes (
  id            TEXT PRIMARY KEY,        -- e.g. 'scheda_art30', 'scheda_msna'
  tree_id       TEXT NOT NULL,
  content       JSONB NOT NULL,          -- Full scheda content per locale (see below)
  metadata      JSONB,                   -- { "confidence": "high"|"low", "category": "famiglia" }
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id       TEXT NOT NULL,
  locale        TEXT NOT NULL DEFAULT 'it',
  user_name     TEXT,                    -- Collected at start for variable substitution
  current_node_id TEXT,
  answers       JSONB DEFAULT '{}',      -- { "q_ue": "no", "q_situazione": "minore" }
  history       JSONB DEFAULT '[]',      -- ["start", "q_ue", "q_situazione", "minore_start"]
  variables     JSONB DEFAULT '{}',      -- { "nome": "Ahmed", "parente": "fratello" }
  started_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  outcome_id    TEXT REFERENCES outcomes(id),
  resume_token  TEXT UNIQUE DEFAULT gen_random_uuid()
);
```

**Why not Corso AI's flat array approach:** Corso AI stores questions as a flat ordered array with `nextQuestionId` overrides and `showCondition` guards. This works for a linear quiz with 3 branches (11 questions). SOSpermesso has ~40 questions forming a directed acyclic graph where the same question node can be reached from 5 different parents (e.g., the "Tribunale Minorenni" question). A flat array cannot model shared subtrees without duplicating questions. The graph model is the natural fit.

### Pattern 2: JSONB Per-Locale Content Storage

**What:** Store translatable content as JSONB with locale keys directly in the database, rather than in separate translation tables or external files.

**When to use:** When content has a different lifecycle than UI strings (edited by content people, not developers), when content is structured (not just a string), and when the number of locales is moderate (5-15).

**Trade-offs:**
- Pro: Single query returns all locales for a node (no JOINs)
- Pro: Content editors can work in a spreadsheet/JSON, AI can translate in bulk
- Pro: Locale fallback is trivial: `content[locale] ?? content['it']`
- Con: Updating a single locale requires read-modify-write of the JSONB
- Con: No database-level constraint on "all locales present"

**Content structure for a question node:**

```json
{
  "it": {
    "text": "Hai la cittadinanza di un Paese dell'Unione Europea?",
    "description": null
  },
  "ar": {
    "text": "هل تحمل جنسية دولة من دول الاتحاد الأوروبي؟",
    "description": null
  },
  "fr": {
    "text": "Avez-vous la citoyennete d'un pays de l'Union europeenne?",
    "description": null
  },
  "en": {
    "text": "Do you have citizenship of an EU country?",
    "description": null
  },
  "es": {
    "text": "Tienes la ciudadania de un pais de la Union Europea?",
    "description": null
  }
}
```

**Content structure for an outcome (scheda):**

```json
{
  "it": {
    "title": "Protezione Internazionale - Asilo o Protezione Sussidiaria",
    "emoji": "shield",
    "description": "Puoi richiedere la protezione internazionale in Italia se...",
    "duration": "5 anni (rinnovabile)",
    "requirements": [
      "Presenza sul territorio italiano",
      "Domanda di protezione internazionale presso la Questura"
    ],
    "notes": "Durante l'esame della domanda riceverai un permesso temporaneo...",
    "link": "https://sospermesso.it/asilo-protezione-sussidiaria",
    "faq": [
      { "q": "Mi serve un avvocato?", "a": "E' consigliabile farsi assistere..." },
      { "q": "Quanto dura la procedura?", "a": "Generalmente 6-12 mesi..." }
    ]
  },
  "ar": {
    "title": "...",
    "emoji": "shield",
    "description": "...",
    "duration": "...",
    "requirements": ["..."],
    "notes": "...",
    "link": "https://sospermesso.it/asilo-protezione-sussidiaria",
    "faq": [...]
  }
}
```

### Pattern 3: Split Content Domains (DB Content vs UI Chrome)

**What:** Store decision tree content (questions, options, outcomes) in the database with JSONB locale fields. Store UI chrome (button labels, navigation, error messages) in JSON message files consumed by next-intl.

**When to use:** When content has two distinct lifecycles: tree content is edited by content/legal experts, UI strings are edited by developers.

**Trade-offs:**
- Pro: Tree content can be bulk-updated without code deploys (update DB rows)
- Pro: UI strings get TypeScript type safety via next-intl's type checking
- Pro: Clear separation of concerns
- Con: Two systems to maintain (but each is simpler than one combined system)

**UI message file example (`messages/it.json`):**

```json
{
  "common": {
    "next": "Avanti",
    "back": "Indietro",
    "startOver": "Ricomincia",
    "loading": "Caricamento...",
    "error": "Si e' verificato un errore"
  },
  "tree": {
    "title": "Verifica il tuo diritto al permesso di soggiorno",
    "subtitle": "Rispondi alle domande per scoprire quale permesso puoi richiedere",
    "progress": "Domanda {current} di circa {total}",
    "selectOption": "Seleziona una risposta"
  },
  "nameCollector": {
    "title": "Come ti chiami?",
    "subtitle": "Il tuo nome ci serve per personalizzare le informazioni",
    "placeholder": "Il tuo nome",
    "continue": "Inizia la verifica"
  },
  "outcome": {
    "yourResult": "Il tuo risultato",
    "duration": "Durata",
    "requirements": "Cosa serve",
    "notes": "Note importanti",
    "faq": "Domande frequenti",
    "moreInfo": "Maggiori informazioni",
    "lawyerNeeded": "Mi serve un avvocato?",
    "confidence": {
      "high": "Siamo ragionevolmente sicuri",
      "low": "Potrebbe essere possibile, ma serve verifica"
    },
    "restart": "Verifica un'altra situazione",
    "feedbackPrompt": "Questa informazione ti e' stata utile?"
  }
}
```

**Arabic equivalent (`messages/ar.json`):**

```json
{
  "common": {
    "next": "التالي",
    "back": "رجوع",
    "startOver": "ابدأ من جديد",
    "loading": "جارٍ التحميل...",
    "error": "حدث خطأ"
  }
}
```

### Pattern 4: Variable Substitution with Grammatical Context

**What:** Support `{variableName}` placeholders in translated content, where the variable's grammatical role can differ across languages.

**When to use:** When the same variable (e.g., a family member) needs to agree in gender/number across translations.

**Implementation:**

```typescript
// lib/variable-substitution.ts

interface SubstitutionContext {
  nome: string;                         // User's name
  parente?: string;                     // Selected relative type
  parente_articolo?: string;            // Gendered article for relative
  pronome_possessivo?: string;          // Possessive pronoun
  // ... additional grammatical variants
}

// Each locale defines its own grammatical map
const grammaticalMaps: Record<string, Record<string, Record<string, string>>> = {
  it: {
    fratello:  { parente: "fratello",  parente_articolo: "il",  pronome_possessivo: "tuo" },
    sorella:   { parente: "sorella",   parente_articolo: "la",  pronome_possessivo: "tua" },
    nonno:     { parente: "nonno",     parente_articolo: "il",  pronome_possessivo: "tuo" },
    nonna:     { parente: "nonna",     parente_articolo: "la",  pronome_possessivo: "tua" },
    figlio:    { parente: "figlio",    parente_articolo: "il",  pronome_possessivo: "tuo" },
    figlia:    { parente: "figlia",    parente_articolo: "la",  pronome_possessivo: "tua" },
    genitore:  { parente: "genitore",  parente_articolo: "il",  pronome_possessivo: "tuo" },
  },
  ar: {
    fratello:  { parente: "أخ",       parente_articolo: "",    pronome_possessivo: "ك" },
    sorella:   { parente: "أخت",      parente_articolo: "",    pronome_possessivo: "ك" },
    // Arabic has different possessive suffix forms but no articles in this context
  },
  fr: {
    fratello:  { parente: "frere",     parente_articolo: "le",  pronome_possessivo: "ton" },
    sorella:   { parente: "soeur",     parente_articolo: "la",  pronome_possessivo: "ta" },
  },
};

/**
 * Replace {variable} placeholders in text with context-aware values.
 * Falls back to raw variable name if no grammatical map entry exists.
 */
export function substituteVariables(
  text: string,
  variables: Record<string, string>,
  locale: string
): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    // Direct variable (e.g., {nome})
    if (variables[key]) return variables[key];

    // Grammatical variable (e.g., {parente_articolo} when parente="fratello")
    const baseKey = Object.keys(variables).find(k =>
      grammaticalMaps[locale]?.[variables[k]]?.[key] !== undefined
    );
    if (baseKey) {
      return grammaticalMaps[locale][variables[baseKey]][key];
    }

    return match; // Leave placeholder if no substitution found
  });
}
```

**Usage in outcome content:**

```json
{
  "it": {
    "description": "Come genitore di {pronome_possessivo} {parente} minorenne, {nome}, hai diritto..."
  },
  "ar": {
    "description": "{nome}، بصفتك والد {parente}{pronome_possessivo} القاصر..."
  }
}
```

**Why not ICU MessageFormat:** ICU MessageFormat (`{gender, select, male {his} female {her}}`) is powerful but:
1. Makes content authoring complex for non-technical legal content editors
2. The grammatical variations in this domain are predictable (family member types are a closed set)
3. A simpler `{variable}` system with per-locale grammatical maps is more maintainable for AI-assisted translation workflows

This is a pragmatic choice. If the variable set grows significantly or grammatical rules become more complex, migrating to ICU MessageFormat via next-intl's `t.rich()` is straightforward.

## Data Flow

### Decision Tree Navigation Flow

```
User taps option
    |
    v
TreePlayer.handleOptionSelect(nodeId, optionKey)
    |
    v
treeStore.selectOption(optionKey)
    |-- Push currentNodeId to history[]
    |-- Look up edge: (currentNodeId, optionKey) -> toNodeId
    |-- Set currentNodeId = toNodeId
    |-- Save answer: answers[fromNodeId] = optionKey
    |-- If toNodeId is terminal -> set outcomeId
    |-- Collect variables if answer implies them
    |
    v
Debounced API save: POST /api/session
    |-- { sessionId, currentNodeId, answers, history, variables }
    |
    v
TreePlayer re-renders with new node
    |-- Fetches node content for current locale
    |-- Renders question + options
    |
    v
If terminal node -> redirect to /[locale]/outcome/[outcomeId]
```

### Back Navigation Flow

```
User taps "Back"
    |
    v
treeStore.goBack()
    |-- Pop last entry from history[]
    |-- Set currentNodeId = popped value
    |-- Remove answer for popped node
    |
    v
Debounced API save
    |
    v
TreePlayer renders previous question (answer pre-filled from store)
```

### Session Resume Flow

```
User returns to URL with resumeToken
    |
    v
GET /api/session/[resumeToken]
    |-- Returns: { currentNodeId, answers, history, variables, locale }
    |
    v
treeStore.hydrate(sessionData)
    |
    v
TreePlayer renders current question
```

### Key Data Flows

1. **Tree graph loading:** On first render, fetch the full tree graph (nodes + edges) for the session's tree_id. Cache in Zustand store. The graph is small (~40 nodes, ~80 edges) -- fits comfortably in memory and avoids per-question API calls.
2. **Locale switching:** When user changes locale, the URL changes (`/it/tree` -> `/ar/tree`). The tree graph is already loaded with all locales in JSONB. The component simply reads `node.content[locale]` instead of `node.content['it']`. No re-fetch needed.
3. **Variable collection:** When certain answers imply a variable (e.g., selecting "Fratello/Sorella" in `min_parenti` sets `parente=fratello`), the edge metadata includes `{ "setsVariable": { "parente": "fratello" } }`. The store accumulates these in `variables`.
4. **Outcome rendering:** Terminal nodes have an `outcome_id`. The outcome page fetches `outcomes` by ID, extracts content for the current locale, runs variable substitution, and renders.

## RTL Rendering Strategy

### Layer 1: Document Direction

```tsx
// app/[locale]/layout.tsx
import { getLocale } from 'next-intl/server';
import { DirectionProvider } from '@radix-ui/react-direction';

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

export default async function LocaleLayout({ children, params }) {
  const locale = (await params).locale;
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        <DirectionProvider dir={dir}>
          {children}
        </DirectionProvider>
      </body>
    </html>
  );
}
```

### Layer 2: CSS Logical Properties (Tailwind v4)

The existing codebase uses Tailwind CSS v3.4. Tailwind v4 has built-in logical property support. Whether you upgrade to v4 or stay on v3 with the `rtl:` variant, the principle is the same: **use logical properties everywhere**.

**Migration checklist for existing shadcn/ui components:**

| Physical (break RTL) | Logical (RTL-safe) | Notes |
|---|---|---|
| `ml-4` | `ms-4` | margin-inline-start |
| `mr-4` | `me-4` | margin-inline-end |
| `pl-4` | `ps-4` | padding-inline-start |
| `pr-4` | `pe-4` | padding-inline-end |
| `left-0` | `start-0` | inset-inline-start |
| `right-0` | `end-0` | inset-inline-end |
| `text-left` | `text-start` | text-align |
| `text-right` | `text-end` | text-align |
| `border-l-4` | `border-s-4` | border-inline-start |
| `rounded-l-lg` | `rounded-s-lg` | border-radius-start |
| `float-left` | `float-start` | float |

**shadcn/ui supports this natively:** When installing components with `rtl: true` in `components.json`, the shadcn CLI auto-converts physical classes to logical equivalents. For the existing forked components, a manual pass is needed.

### Layer 3: Component-Level RTL Awareness

Most components need zero RTL-specific code if logical properties are used. The exceptions:

**Icons that imply direction:**
```tsx
// Arrow icons need flipping in RTL
<ChevronRight className="rtl:rotate-180" />  // "next" arrow
<ChevronLeft className="rtl:rotate-180" />   // "back" arrow
<ArrowLeft className="rtl:rotate-180" />      // "back to start"
```

**Progress bar direction:**
```tsx
// ProgressBar.tsx -- uses CSS logical properties
// No special handling needed if using Tailwind logical utils
// The browser handles direction automatically via dir="rtl"
<div className="w-full bg-muted rounded-full">
  <div
    className="bg-primary rounded-full h-2 transition-all"
    style={{ width: `${progress}%` }}
    // width percentage works the same in RTL -- browser starts from inline-end
  />
</div>
```

**Text input direction:**
```tsx
// Arabic text input should remain RTL even when the user types a name in Latin script
// The 'dir="auto"' attribute handles this automatically
<input dir="auto" ... />
```

### Layer 4: Font Loading for Arabic

```tsx
// app/[locale]/layout.tsx
import { Noto_Sans_Arabic } from 'next/font/google';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'] });

// Apply font based on locale
const fontClass = RTL_LOCALES.includes(locale)
  ? notoArabic.className
  : inter.className;
```

## Translation Content Management for AI-Assisted Workflow

### Practical Workflow

The project requires translating ~40 questions, ~80 option labels, and ~25 outcome pages (500-1000 words each) into 5 languages. Professional translation is cost-prohibitive. The architecture must support AI-assisted translation.

**Recommended workflow:**

1. **Author content in Italian** in a structured format (seed script or JSON files)
2. **Export to a flat translation sheet** (one row per translatable string, columns per locale)
3. **AI translates** using Claude or similar, with legal domain context and glossary
4. **Human review** by native speakers (volunteer or paid per-language)
5. **Import back** to database via seed script or admin API

**Why this works with JSONB storage:** The seed script can read a CSV/JSON translation file and build the JSONB objects. No CMS needed in v1.

**Seed script approach:**

```typescript
// prisma/translations/questions.ts
// One file per content type, exported as locale-keyed objects

export const questions = {
  q_ue: {
    it: { text: "Hai la cittadinanza di un Paese dell'Unione Europea?" },
    ar: { text: "هل تحمل جنسية دولة من دول الاتحاد الأوروبي؟" },
    fr: { text: "Avez-vous la citoyennete d'un pays de l'Union europeenne?" },
    en: { text: "Do you have citizenship of an EU country?" },
    es: { text: "Tienes la ciudadania de un pais de la Union Europea?" },
  },
  // ...
};
```

### Content Update Process

For v1 (no admin UI):
1. Edit translation files in `prisma/translations/`
2. Run `npm run db:seed` to rebuild database
3. Deploy (or just re-seed in production)

For v2 (with admin):
- Admin UI with inline editing per locale
- Export/import CSV for bulk translation
- "Missing translations" dashboard

## Anti-Patterns

### Anti-Pattern 1: Duplicating Question Nodes for Shared Subtrees

**What people do:** Copy the "Tribunale Minorenni" question 5 times (once for each relative type) as separate database rows, because that's how it appears in the flowchart.

**Why it's wrong:** When the legal text changes, you must update 5 rows. When you add a language, you translate the same text 5 times. Bugs from inconsistency.

**Do this instead:** One `tree_node` row for the question, multiple `tree_edge` rows pointing to it from different parents. The graph model handles this naturally. If the question text needs slight variation per context, use variable substitution: "C'e' una decisione del Tribunale per i Minorenni che ti affida a {pronome_possessivo} {parente}?"

### Anti-Pattern 2: Storing Translations in Separate Tables per Locale

**What people do:** Create `tree_nodes_it`, `tree_nodes_ar` tables, or a `tree_node_translations` junction table with (node_id, locale, text).

**Why it's wrong:** For this scale (~40 nodes, 5-10 locales), the join overhead and query complexity is not worth it. It also makes the seed script more complex and the AI translation workflow harder (need to match foreign keys).

**Do this instead:** JSONB with locale keys. At 10 locales and 40 nodes, the JSONB approach is simpler, faster, and easier to maintain. If you reach 50+ locales or 1000+ nodes, revisit.

### Anti-Pattern 3: Retrofitting RTL After LTR is "Done"

**What people do:** Build the entire UI in LTR, then add `rtl:` overrides everywhere.

**Why it's wrong:** RTL is not a skin. It affects component structure, icon semantics, and user mental models. Retrofitting means touching every component.

**Do this instead:** From the first component, use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`). Install shadcn/ui components with `rtl: true`. Add `dir` attribute to layout from day one. Test in Arabic on every PR.

### Anti-Pattern 4: Using next-intl for Database Content

**What people do:** Put all 25 outcome pages (500-1000 words each) into next-intl JSON message files.

**Why it's wrong:** next-intl messages are designed for UI strings (short, developer-maintained). Outcome pages are long-form legal content maintained by content editors. Mixing them creates a 10,000-line JSON file that is impossible to diff, review, or hand to a translator.

**Do this instead:** Use the split domain pattern. next-intl for ~200 UI strings. Database JSONB for ~25 rich outcome pages and ~40 question texts.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is sufficient. Single tree version, all content in JSONB, Zustand client state. Vercel hobby or pro plan. |
| 1k-100k users | Add Vercel Edge caching for tree graph endpoint (content rarely changes). Consider pre-rendering outcome pages with ISR (Incremental Static Regeneration). Add analytics tracking. |
| 100k+ users | Move tree graph and outcomes to edge cache (Vercel KV or similar). Session writes may bottleneck Supabase -- consider batching or moving to a lighter session store. Multiple tree versions (A/B testing paths). |

### Scaling Priorities

1. **First bottleneck:** Database reads for the tree graph on every page load. Solution: Cache the tree graph aggressively (it changes only when content is updated). The full graph is ~50KB of JSON -- trivially cacheable.
2. **Second bottleneck:** Session writes on every answer. Solution: Already addressed by debounced saves in Corso AI architecture. For very high traffic, batch writes or use Vercel KV for session state.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase PostgreSQL | Prisma ORM via `@prisma/client` | Inherited from Corso AI. JSONB fields for i18n content. |
| Vercel | Next.js deployment, edge functions | Subdomain deployment at test.sospermesso.it |
| next-intl | npm package, middleware + message files | Locale routing, UI string translations, formatting |
| Radix DirectionProvider | npm package, layout wrapper | RTL direction for all Radix-based shadcn/ui primitives |
| sospermesso.it (11ty) | Outbound links only | Outcome pages link to detailed guides on main site. No API integration. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Tree engine <-> Store | Function calls (pure functions) | `tree-engine.ts` exports pure functions, store calls them |
| Store <-> API | HTTP (fetch) with debouncing | Same pattern as Corso AI, but graph-aware |
| API <-> Database | Prisma queries | Standard Prisma patterns, JSONB field access |
| Layout <-> Components | React context (locale, direction) | Via next-intl provider and Radix DirectionProvider |
| Outcome page <-> Variable substitution | Function call | `substituteVariables(content, variables, locale)` |

## Suggested Build Order

The decision tree, i18n, and RTL are deeply intertwined. Building them sequentially (all tree first, then all i18n, then RTL) means rework. Building them simultaneously is complex. The recommended order interleaves them:

**Phase 1: Foundation (i18n + RTL scaffold)**
- Install next-intl, configure `[locale]` routing with Italian only
- Set `dir` attribute on `<html>` from locale
- Add Radix DirectionProvider to layout
- Convert forked shadcn/ui components to logical properties
- Verify one component renders correctly in both LTR and RTL
- This phase produces a working app shell that is i18n-ready but only has Italian content

**Phase 2: Decision Tree Engine (Italian only)**
- Design and implement Prisma schema (tree_nodes, tree_edges, outcomes, sessions)
- Build tree-engine.ts (graph traversal, back navigation)
- Build tree-store.ts (Zustand, adapted from quiz-store)
- Build TreePlayer + QuestionNode components
- Seed database with full Italian decision tree from existing data.js
- Test all paths end-to-end

**Phase 3: Outcome Pages (Italian only)**
- Build OutcomeCard component with rich content rendering
- Implement variable substitution
- Seed all 25 schede in Italian
- Build outcome/[outcomeId] page with SSR
- Add NameCollector and variable collection through tree traversal

**Phase 4: Multi-Language Content**
- Add JSONB locale fields to seed data (expand from `{ "it": {...} }` to include ar, fr, en, es)
- AI-translate all question text, option labels, and outcome content
- Add UI chrome translations (messages/*.json)
- Build locale switcher component
- Test full paths in all 5 languages

**Phase 5: Arabic RTL Polish**
- Load Arabic font (Noto Sans Arabic)
- Test every component in RTL
- Fix directional icons (chevrons, arrows)
- Fix any remaining physical CSS properties
- Test variable substitution in Arabic (suffix-based possessives)
- Cross-browser testing (Safari, Chrome, Firefox) in RTL

**Phase 6: Session Persistence + Analytics**
- Implement session save/resume (adapted from Corso AI)
- Add feedback/rating section at end
- Add basic analytics (completion rate, drop-off points, outcome distribution)
- Admin dashboard for usage data

**Phase ordering rationale:**
- Phase 1 first because RTL is a layout concern that touches everything. Retrofitting is expensive.
- Phase 2 before Phase 4 because the tree engine is complex and needs testing in one language before adding translation complexity.
- Phase 3 before Phase 4 because variable substitution logic must work in Italian before handling grammatical variations in other languages.
- Phase 4 before Phase 5 because Arabic RTL polish requires all content to be present.
- Phase 6 last because it is additive and does not affect the core user flow.

## Sources

- Corso AI codebase: `/Users/albertopasquero/Desktop/TECH/corso_ai/` (Prisma schema, quiz store, types, seed data) -- analyzed directly
- SOSpermesso decision tree: `/Users/albertopasquero/Desktop/TECH/SOSpermesso/TYPEFORM_CLONE/flowchart_permessi.mermaid` and `data.js` -- analyzed directly
- SOSpermesso PROJECT.md: `/Users/albertopasquero/Desktop/TECH/SOSpermesso/app/.planning/PROJECT.md` -- analyzed directly
- [next-intl App Router setup](https://next-intl.dev/docs/getting-started/app-router) -- official documentation, HIGH confidence
- [next-intl rendering translations](https://next-intl.dev/docs/usage/translations) -- official documentation for t.rich() and t.markup(), HIGH confidence
- [Next.js official i18n guide](https://nextjs.org/docs/app/guides/internationalization) -- confirms [locale] segment pattern, HIGH confidence
- [Radix Direction Provider](https://www.radix-ui.com/primitives/docs/utilities/direction-provider) -- official docs, HIGH confidence
- [shadcn/ui Direction component](https://ui.shadcn.com/docs/components/radix/direction) -- confirms RTL auto-conversion in CLI, HIGH confidence
- [Tailwind CSS v4 logical properties](https://tailwindcss.com/blog/tailwindcss-v4) -- confirms built-in logical property support, HIGH confidence
- [CSS Logical Properties overview](https://lapidist.net/articles/2025/from-margin-left-to-margin-inline-why-logical-css-properties-matter/) -- MEDIUM confidence (blog post, verified against MDN)
- [ICU Message Format guide](https://simplelocalize.io/blog/posts/what-is-icu/) -- MEDIUM confidence (third-party guide, cross-referenced with Unicode docs)
- [PostgreSQL hierarchical data modeling](https://leonardqmarcq.com/posts/modeling-hierarchical-tree-data) -- MEDIUM confidence (blog, verified against PostgreSQL docs)

---
*Architecture research for: Multilingual legal decision tree (SOSpermesso)*
*Researched: 2026-02-14*
