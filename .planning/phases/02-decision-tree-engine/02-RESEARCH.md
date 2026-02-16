# Phase 2: Decision Tree Engine - Research

**Researched:** 2026-02-16
**Domain:** Client-side decision tree engine with DAG traversal, session persistence, slide transitions, Italian content seeding
**Confidence:** HIGH

## Summary

This phase builds the interactive decision tree engine that replaces the existing Typeform-based questionnaire at SOSpermesso. The core challenge is modeling a directed acyclic graph (DAG) with 46 question nodes and 29 outcome nodes, where many outcomes are shared across multiple paths (e.g., `end_msna` reachable from 12 paths, `end_neg_gen` from 11). The existing Corso AI codebase provides a branching quiz engine using Zustand + Prisma, but its flat-array-with-showConditions model cannot represent shared subtrees without duplicating question nodes. Phase 2 replaces this with a proper graph model.

The standard approach is: (1) model the tree as a JSON/TypeScript data structure with nodes and edges stored client-side (the full graph is ~75 nodes and ~100 edges -- small enough to load in a single request and hold in memory), (2) use Zustand with `persist` middleware for client-side state (current node, answer history, navigation stack, user name) with `localStorage` as the storage backend, (3) build a `TreePlayer` client component that renders one question at a time with CSS slide transitions, and (4) seed the complete Italian decision tree from the existing `data.js` file.

Key architectural decisions: The tree data structure should be a static TypeScript file (not database-seeded) for Phase 2, because the content is known and stable, and avoiding the database simplifies development and testing. The Prisma/PostgreSQL schema changes (tree_nodes, tree_edges, outcomes tables from the architecture research) should be deferred to Phase 3/4 when outcome pages and multilingual content require database storage. For Phase 2, a `src/lib/tree-data.ts` file with the full Italian tree and a `src/lib/tree-engine.ts` with pure traversal functions is the right approach.

**Primary recommendation:** Build the decision tree as a client-side TypeScript data structure with pure function traversal, Zustand store for session state persisted to localStorage, CSS slide transitions between questions, and a back button in the sticky header using the navigation history stack pattern already proven in the existing quiz-store.ts.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **zustand** | ^5.0.11 (installed) | Client-side tree state: current node, answers, history, name | Already in use. `persist` middleware handles localStorage. v5.0.10+ fixes SSR hydration inconsistencies. Navigation history stack pattern already proven in existing `quiz-store.ts`. |
| **next-intl** | ^4.8.3 (installed) | UI string translations (button labels, headers, loading states) | Already configured. Tree content is Italian-only in Phase 2 (hardcoded in data file), but UI chrome uses next-intl for all button/label text. |
| **React 19** | ^19.0.0 (installed) | Component framework | Already installed. `useTransition` can be used for non-blocking state updates during navigation. |
| **Tailwind CSS** | ^3.4.1 (installed) | Styling with logical properties | Already configured with the yellow/black/white design system from Phase 1. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **lucide-react** | ^0.563.0 (installed) | Icons for back button, chevrons | ArrowLeft (with `rtl:rotate-180`) for the back button in sticky header. |
| **class-variance-authority** | ^0.7.1 (installed) | Answer card variants (selected/unselected/hover) | Already used by shadcn/ui button component. Use for answer option card styling variants. |
| **zod** | ^4.3.6 (installed) | Validation of tree data structure at build/seed time | Validate that every edge target exists as a node, every node is reachable from start, no orphaned nodes. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static TS data file for tree | Prisma/PostgreSQL seeded tree | Database adds complexity for Phase 2 where tree is Italian-only and static. Move to DB in Phase 3/4 when outcomes need structured JSONB content and multilingual support. |
| localStorage via Zustand persist | sessionStorage | localStorage persists across browser sessions (critical for TREE-05 resume requirement). sessionStorage dies with the tab. |
| CSS slide transitions | framer-motion AnimatePresence | Phase 1 research established: framer-motion adds 30KB+, has App Router compatibility issues, and is overkill for simple slide transitions. CSS transitions are already set up in globals.css from Phase 1. |
| Custom graph traversal | `question-tree-core` npm package | Package is unmaintained (last publish years ago), has minimal API, and SOSpermesso's tree is simple enough for a ~50-line traversal function. No benefit to adding a dependency. |

**Installation:**
```bash
# No new packages needed -- everything is already installed.
```

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)
```
src/
+-- app/
|   +-- [locale]/
|   |   +-- tree/
|   |   |   +-- page.tsx         # Server component, renders TreeContent
|   |   |   +-- TreeContent.tsx  # Client component orchestrator
|   |   +-- page.tsx             # Welcome page (modified: add name input)
+-- components/
|   +-- tree/                    # New: decision tree components
|   |   +-- TreePlayer.tsx       # Main orchestrator (renders question or redirect to outcome)
|   |   +-- QuestionScreen.tsx   # Single question with answer options
|   |   +-- AnswerCard.tsx       # Tappable answer option card with optional description
|   |   +-- BackButton.tsx       # Back button for sticky header
|   |   +-- SlideTransition.tsx  # Wrapper for CSS slide enter/exit animations
|   |   +-- index.ts             # Barrel exports
|   +-- layout/
|       +-- StickyHeader.tsx     # Modified: add BackButton slot
+-- lib/
|   +-- tree-data.ts             # Static Italian decision tree (nodes + edges)
|   +-- tree-engine.ts           # Pure functions: getNextNode, getPreviousNode, isTerminal
+-- store/
|   +-- tree-store.ts            # Zustand store with persist middleware
+-- types/
|   +-- tree.ts                  # TreeNode, TreeEdge, TreeAnswer, TreeSession types
+-- messages/
    +-- it.json                  # Extended with tree.* keys
```

### Pattern 1: Static Tree Data as TypeScript Module

**What:** The decision tree is defined as a typed TypeScript object with nodes (questions and outcomes) and edges (answer options that connect nodes). No database involved in Phase 2.

**When to use:** When tree content is static, single-language, and small enough to bundle (~10KB for 75 nodes).

**Example:**
```typescript
// src/types/tree.ts
export interface TreeNode {
  id: string;
  type: 'question' | 'result';
  // Question properties
  question?: string;
  description?: string;
  // Result properties
  title?: string;
  resultDescription?: string;
  duration?: string;
  requirements?: string[];
  notes?: string;
  link?: string;
}

export interface TreeEdge {
  from: string;
  to: string;
  label: string;        // Answer text displayed to user
  description?: string; // Optional explanation under the answer
  optionKey: string;    // Unique key within the question (e.g., 'yes', 'no', 'minore')
}

export interface TreeData {
  nodes: Record<string, TreeNode>;
  edges: TreeEdge[];
  startNodeId: string;
}
```

```typescript
// src/lib/tree-data.ts
import type { TreeData } from '@/types/tree';

export const italianTree: TreeData = {
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'question',
      question: "Hai la cittadinanza di un Paese dell'Unione Europea?",
    },
    q_situazione: {
      id: 'q_situazione',
      type: 'question',
      question: 'In che situazione ti trovi?',
    },
    end_ue: {
      id: 'end_ue',
      type: 'result',
      title: 'Cittadino UE - Non serve permesso di soggiorno',
      resultDescription: 'Come cittadino dell\'Unione Europea...',
      // ... full content
    },
    // ... all 75 nodes
  },
  edges: [
    { from: 'start', to: 'end_ue', label: 'Si, sono cittadino UE', optionKey: 'si_ue' },
    { from: 'start', to: 'q_situazione', label: 'No, non sono cittadino UE', optionKey: 'no_ue' },
    // ... all edges
  ],
};
```

### Pattern 2: Graph Traversal as Pure Functions

**What:** All tree navigation logic is extracted into pure functions that take the tree data and current state as input and return the next state. No side effects, easy to test.

**When to use:** Always. The store calls these functions; the functions do not call the store.

**Example:**
```typescript
// src/lib/tree-engine.ts
import type { TreeData, TreeEdge, TreeNode } from '@/types/tree';

/** Get all outgoing edges from a node, sorted by order in the edges array */
export function getOptionsForNode(tree: TreeData, nodeId: string): TreeEdge[] {
  return tree.edges.filter(e => e.from === nodeId);
}

/** Get the node a specific option leads to */
export function getNextNodeId(tree: TreeData, currentNodeId: string, optionKey: string): string | null {
  const edge = tree.edges.find(e => e.from === currentNodeId && e.optionKey === optionKey);
  return edge?.to ?? null;
}

/** Check if a node is a terminal (result) node */
export function isTerminalNode(tree: TreeData, nodeId: string): boolean {
  return tree.nodes[nodeId]?.type === 'result';
}

/** Get the node object */
export function getNode(tree: TreeData, nodeId: string): TreeNode | undefined {
  return tree.nodes[nodeId];
}

/** Validate tree integrity: all edge targets exist, start node exists, no unreachable nodes */
export function validateTree(tree: TreeData): string[] {
  const errors: string[] = [];
  // ... validation logic
  return errors;
}
```

### Pattern 3: Zustand Store with Persist and History Stack

**What:** The tree store maintains session state: current node, answer record, navigation history stack, user name, and outcome. Persisted to localStorage for session resumption (TREE-05).

**When to use:** Single Zustand store for all tree session state.

**Example:**
```typescript
// src/store/tree-store.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { italianTree } from '@/lib/tree-data';
import { getNextNodeId, isTerminalNode } from '@/lib/tree-engine';

interface TreeState {
  // Session data
  currentNodeId: string;
  answers: Record<string, string>;  // nodeId -> optionKey
  history: string[];                // Stack of nodeIds for back navigation
  userName: string | null;
  outcomeId: string | null;
  sessionStartedAt: string | null;

  // Actions
  startSession: (userName: string | null) => void;
  selectOption: (optionKey: string) => void;
  goBack: () => void;
  reset: () => void;
}

export const useTreeStore = create<TreeState>()(
  persist(
    (set, get) => ({
      currentNodeId: italianTree.startNodeId,
      answers: {},
      history: [],
      userName: null,
      outcomeId: null,
      sessionStartedAt: null,

      startSession: (userName) => {
        set({
          userName,
          sessionStartedAt: new Date().toISOString(),
          currentNodeId: italianTree.startNodeId,
          answers: {},
          history: [],
          outcomeId: null,
        });
      },

      selectOption: (optionKey) => {
        const { currentNodeId, answers, history } = get();
        const nextNodeId = getNextNodeId(italianTree, currentNodeId, optionKey);
        if (!nextNodeId) return;

        const newAnswers = { ...answers, [currentNodeId]: optionKey };
        const newHistory = [...history, currentNodeId];

        // If user went back and changed an answer, discard downstream answers
        // by removing answers for nodes no longer in the history path
        // (The silent discard behavior from CONTEXT.md decisions)

        if (isTerminalNode(italianTree, nextNodeId)) {
          set({
            currentNodeId: nextNodeId,
            answers: newAnswers,
            history: newHistory,
            outcomeId: nextNodeId,
          });
        } else {
          set({
            currentNodeId: nextNodeId,
            answers: newAnswers,
            history: newHistory,
          });
        }
      },

      goBack: () => {
        const { history } = get();
        if (history.length === 0) return;

        const newHistory = [...history];
        const previousNodeId = newHistory.pop()!;

        set({
          currentNodeId: previousNodeId,
          history: newHistory,
          outcomeId: null,
        });
      },

      reset: () => {
        set({
          currentNodeId: italianTree.startNodeId,
          answers: {},
          history: [],
          userName: null,
          outcomeId: null,
          sessionStartedAt: null,
        });
      },
    }),
    {
      name: 'sospermesso-tree-session',
      storage: createJSONStorage(() => localStorage),
      // Persist everything needed to resume
      partialize: (state) => ({
        currentNodeId: state.currentNodeId,
        answers: state.answers,
        history: state.history,
        userName: state.userName,
        outcomeId: state.outcomeId,
        sessionStartedAt: state.sessionStartedAt,
      }),
    }
  )
);
```

### Pattern 4: CSS Slide Transitions Between Questions

**What:** Questions slide in from the right (forward) or left (back) using the CSS transition classes already defined in `globals.css` from Phase 1. A wrapper component manages the transition state.

**When to use:** Every question-to-question navigation.

**Example:**
```tsx
// src/components/tree/SlideTransition.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SlideTransitionProps {
  nodeId: string;  // Key to detect changes
  direction: 'forward' | 'back';
  children: React.ReactNode;
}

export function SlideTransition({ nodeId, direction, children }: SlideTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const prevNodeId = useRef(nodeId);

  useEffect(() => {
    if (nodeId !== prevNodeId.current) {
      // Exit old content
      setIsVisible(false);

      const timeout = setTimeout(() => {
        setDisplayedChildren(children);
        prevNodeId.current = nodeId;
        // Enter new content
        requestAnimationFrame(() => setIsVisible(true));
      }, 200); // Match exit duration

      return () => clearTimeout(timeout);
    } else {
      setIsVisible(true);
    }
  }, [nodeId, children]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible
          ? 'translate-x-0 opacity-100'
          : direction === 'forward'
            ? 'translate-x-5 opacity-0 rtl:-translate-x-5'
            : '-translate-x-5 opacity-0 rtl:translate-x-5'
      )}
    >
      {displayedChildren}
    </div>
  );
}
```

### Pattern 5: Back Button in Sticky Header

**What:** The back button is conditionally rendered in the sticky header when the user has navigation history. It uses the `goBack` action from the tree store.

**When to use:** On all tree pages when history.length > 0.

**Example:**
```tsx
// src/components/tree/BackButton.tsx
'use client';

import { ArrowLeft } from 'lucide-react';
import { useTreeStore } from '@/store/tree-store';
import { useTranslations } from 'next-intl';

export function BackButton() {
  const history = useTreeStore((s) => s.history);
  const goBack = useTreeStore((s) => s.goBack);
  const t = useTranslations('common');

  if (history.length === 0) return null;

  return (
    <button
      onClick={goBack}
      className="flex items-center gap-1 text-sm font-medium text-foreground"
      aria-label={t('back')}
    >
      <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
      <span className="hidden sm:inline">{t('back')}</span>
    </button>
  );
}
```

### Pattern 6: Tap-to-Advance Answer Cards

**What:** Selecting an answer immediately advances to the next question (no confirm button). Cards show the selected state briefly before transitioning.

**When to use:** All question screens.

**Example:**
```tsx
// src/components/tree/AnswerCard.tsx
'use client';

import { cn } from '@/lib/utils';

interface AnswerCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

export function AnswerCard({ label, description, selected, onSelect }: AnswerCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border-2 border-foreground px-4 py-4',
        'text-start text-lg font-medium',
        'transition-colors duration-150',
        'min-h-[48px]',
        'active:scale-[0.98]',
        selected
          ? 'bg-foreground text-primary-foreground'
          : 'bg-card text-card-foreground hover:bg-foreground/10'
      )}
    >
      <span>{label}</span>
      {description && (
        <span className="mt-1 block text-sm font-normal opacity-80">
          {description}
        </span>
      )}
    </button>
  );
}
```

### Pattern 7: First Question Category Grouping

**What:** The `q_situazione` question (which has 9 options mapping to 8 main paths + "none") groups options into 3-4 higher-level categories to avoid overwhelming users.

**When to use:** Only for the main branching question.

**Example grouping:**
```typescript
// Category grouping for q_situazione
const categories = [
  {
    label: 'La tua situazione personale',
    description: 'Eta, nascita, salute',
    options: [
      { text: 'Ho meno di 18 anni', next: 'minore_start' },
      { text: 'Sono nato in Italia e sempre vissuto qui', next: 'end_citt' },
      { text: 'Ho problemi gravi di salute', next: 'end_cure' },
      { text: 'Aspetto/ho avuto un figlio in Italia', next: 'end_cure' },
    ],
  },
  {
    label: 'Famiglia e relazioni',
    description: 'Parenti, partner',
    options: [
      { text: 'In Italia c e qualcuno della mia famiglia', next: 'famiglia_start' },
      { text: 'In Italia ho trovato l amore', next: 'coniuge_start' },
    ],
  },
  {
    label: 'Protezione e sicurezza',
    description: 'Paura, violenza, sfruttamento',
    options: [
      { text: 'Ho paura di tornare nel mio Paese', next: 'paura_start' },
      { text: 'Sono in una brutta situazione', next: 'brutta_start' },
    ],
  },
  {
    label: 'Nessuna di queste',
    options: [
      { text: 'Nessuna di queste', next: 'end_neg_gen' },
    ],
  },
];
```

**Implementation:** The category grouping can be a special rendering mode for nodes with many options (>5). The TreePlayer detects when the current node is `q_situazione` and renders grouped cards instead of flat cards. Each category is a collapsible/expandable section, or categories are displayed as a first-level selection that then shows the specific options.

### Pattern 8: Silent Downstream Answer Discard

**What:** When a user goes back and changes an answer on a node that branches, all answers for nodes that were on the old path but not on the new path are silently removed. No warning dialog.

**When to use:** Every time `selectOption` is called on a node that already has an answer.

**Example:**
```typescript
selectOption: (optionKey) => {
  const { currentNodeId, answers, history } = get();

  // If this node already has an answer and user is changing it,
  // discard all downstream answers (nodes after this one in history)
  const existingAnswer = answers[currentNodeId];
  let cleanedAnswers = { ...answers };

  if (existingAnswer && existingAnswer !== optionKey) {
    // Find index of current node in history
    const currentIdx = history.indexOf(currentNodeId);
    if (currentIdx !== -1) {
      // Remove answers for all nodes after this point
      const nodesToRemove = history.slice(currentIdx + 1);
      for (const nodeId of nodesToRemove) {
        delete cleanedAnswers[nodeId];
      }
    }
  }

  cleanedAnswers[currentNodeId] = optionKey;
  // ... proceed with navigation
},
```

### Anti-Patterns to Avoid

- **Flat array with showConditions for a DAG:** The existing quiz-store.ts uses `questions[currentIndex]` with `showCondition` guards. This pattern cannot model shared subtrees (e.g., `end_msna` reachable from 12 paths). Use a graph (nodes + edges) instead.
- **Storing tree data in Prisma/PostgreSQL for Phase 2:** The tree is static Italian content. Adding database CRUD, seeding, and API routes triples the implementation surface for zero Phase 2 benefit. Defer to Phase 3/4.
- **Server-side graph traversal via API routes:** The full graph is ~10KB. Loading it once and traversing client-side eliminates network latency on every question tap. API calls per question would make tap-to-advance feel sluggish.
- **Framer-motion for slide transitions:** 30KB+ bundle size, App Router compatibility issues, overkill for translateX + opacity transitions.
- **Confirm button after answer selection:** CONTEXT.md explicitly requires tap-to-advance. No confirm step.
- **Using `currentIndex` for navigation:** Graph traversal requires node IDs and a history stack, not array indices.
- **Warning dialog on downstream discard:** CONTEXT.md explicitly says silent discard with no warning.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence | Custom localStorage read/write with JSON serialization, migration, error handling | Zustand `persist` middleware with `createJSONStorage` | Handles serialization, migration (via `version` + `migrate`), partial persistence (`partialize`), hydration lifecycle (`onRehydrateStorage`). Already used in existing `quiz-store.ts`. |
| SSR hydration mismatch | Custom `useEffect` + `useState` pattern to defer localStorage reads | Zustand persist's built-in hydration handling (v5.0.10+ fix) | Zustand v5.0.10+ (January 2026) fixed persist middleware state inconsistencies. The store already handles this. For UI that depends on persisted state, wrap in a client component with `'use client'`. |
| Tree data validation | Manual checking of edge targets and node reachability | Zod schema validation in a build-time check | Define a Zod schema for TreeData that validates referential integrity (all edge targets exist as nodes, start node exists). Run as a test, not at runtime. |
| Answer option card accessibility | Custom ARIA attributes and keyboard handlers | `<button>` elements with proper focus styling | Native `<button>` elements get keyboard navigation (Enter/Space), focus rings, and screen reader announcements for free. The existing `focus-visible` outline in globals.css handles focus styling. |
| Slide transition direction tracking | Manual ref tracking of previous vs current question | Single `direction` state in store or component (`'forward' | 'back'`) set by `selectOption` (forward) and `goBack` (back) | Simple boolean/enum is cleaner than comparing node IDs or indices. |

**Key insight:** Phase 2 is primarily a **data modeling + UI orchestration** task. The tree structure is well-defined in existing `data.js`, the traversal is straightforward (no cycles, no complex conditions -- just follow edges), and the UI patterns (one question per screen, tappable cards, slide transitions) are established from Phase 1. The risk is in getting the back navigation + downstream discard behavior correct, not in complex engineering.

## Common Pitfalls

### Pitfall 1: History Stack Gets Out of Sync with Answers

**What goes wrong:** User goes back, changes an answer, creating a fork. The history stack still contains nodes from the old branch. Next forward navigation appends to a stale history.
**Why it happens:** `goBack` pops from history but doesn't trim the answers record. `selectOption` on a revisited node doesn't clean up the old path.
**How to avoid:** When `selectOption` is called on a node that already has a different answer: (1) trim history to only include nodes up to and including current, (2) remove all answers for nodes that are being discarded (nodes in history after current position + the old answer trail). Test with the "minor path" which has 5 similar affidamento branches -- changing the relative type at `min_parenti` must correctly discard the old relative's sub-path.
**Warning signs:** After going back and changing path, the history grows longer than the actual path depth. Back button goes to unexpected questions.

### Pitfall 2: Tap-to-Advance Fires Before Transition Completes

**What goes wrong:** User taps an answer, `selectOption` fires and changes the current node. The slide transition starts but the new question is already rendered (flash of next question at old position). Or double-tap on mobile sends user two questions ahead.
**Why it happens:** State update is synchronous but CSS transition is asynchronous. React re-renders before the transition animation completes.
**How to avoid:** Add a brief delay (150-200ms) between selecting the option and advancing to the next question. During this delay, show the selected card in its filled/selected state (visual feedback that the tap registered). Use a `isTransitioning` flag to prevent additional taps during the transition. Implementation: `selectOption` first highlights the card, then after a timeout triggers the node change.
**Warning signs:** Flickering between questions. User accidentally skips a question on mobile.

### Pitfall 3: Category Grouping Creates Confusion About Back Navigation

**What goes wrong:** The first question (`q_situazione`) shows grouped categories. User selects "Famiglia e relazioni" category, then selects "In Italia c'e qualcuno della mia famiglia." User presses back. Should they go back to the category view or back to the EU citizenship question?
**Why it happens:** Category grouping is a UI-only concept -- the graph doesn't have a "category selection" node. If categories are implemented as a two-step selection, the back button behavior is ambiguous.
**How to avoid:** Implement category grouping as a **visual presentation of a single question**, not as a two-step process. All 9 options of `q_situazione` are visible on one screen, just grouped visually under category headings. Selecting any option immediately navigates to the corresponding next node. Back always goes to the previous graph node (EU citizenship question). No intermediate "category selected" state.
**Warning signs:** Back button takes user to an intermediate state that isn't a real graph node.

### Pitfall 4: Session Resume Shows Stale UI on First Render

**What goes wrong:** User returns to the app. Zustand hydrates from localStorage (showing question 5 from last session). But the initial server-side render shows the start/welcome screen (initial state). Flash of wrong content.
**Why it happens:** SSR renders with initial store state (no localStorage on server). Client hydration replaces with persisted state, causing a visual flash.
**How to avoid:** Use a `isHydrated` flag in the store. On first render, show a loading skeleton (not the welcome screen). Once Zustand hydration completes (`onRehydrateStorage` callback), set `isHydrated = true` and render the actual content. The tree page should show a brief loading state (~100-200ms) while hydration happens.
**Warning signs:** Flash of welcome screen before jumping to mid-session question. Hydration mismatch warnings in console.

### Pitfall 5: Welcome Page Name Input Creates Routing Confusion

**What goes wrong:** Name input is on the welcome page (`/[locale]/`), but the tree is at `/[locale]/tree`. After entering name and clicking start, the user navigates to `/tree` but the name is stored in the tree store. If user goes directly to `/tree` without visiting welcome, name is null.
**Why it happens:** Name collection and tree navigation are on different routes but share state.
**How to avoid:** Two approaches: (A) The welcome page stores the name in the tree store before navigating to `/tree`. The tree page checks if session exists (hydrated from localStorage) -- if not, redirect to welcome. (B) Merge name input into the first tree question as a special "name collection" node before `start`. Approach A is cleaner and matches CONTEXT.md ("name input merged into existing welcome screen").
**Warning signs:** Name is `null` when rendering outcome pages. Direct URL to `/tree` shows first question without name collection.

### Pitfall 6: The min_affido Question Nodes Look Duplicated But Aren't

**What goes wrong:** Developer notices min_affido1 through min_affido5 all have the same question text ("C'e' una decisione del Tribunale...") and merges them into a single node to "DRY it up." This breaks the graph because each has different `from` edges and different context (the relative type).
**Why it happens:** In the original `data.js`, these ARE separate nodes with identical text. The architecture research suggests shared subtrees but this specific case isn't a shared subtree -- it's the same question asked about different relatives.
**How to avoid:** Keep min_affido1-5 as separate nodes. They share question text but have different graph positions (different parents). In Phase 4 (multilingual), they could share a text template with variable substitution: "C'e' una decisione del Tribunale per i Minorenni o dei Servizi Sociali che ti affida a {relative_pronoun}?" For Phase 2, keep them separate.
**Warning signs:** Graph validation fails because edges point to a non-existent merged node. Wrong "who lives with you" context shown after back navigation.

## Code Examples

### Tree Data Structure (Excerpt)
```typescript
// src/lib/tree-data.ts
// Source: existing TYPEFORM_CLONE/data.js (46 question nodes, 29 result nodes)

import type { TreeData } from '@/types/tree';

export const italianTree: TreeData = {
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'question',
      question: "Hai la cittadinanza di un Paese dell'Unione Europea?",
    },
    end_ue: {
      id: 'end_ue',
      type: 'result',
      title: 'Cittadino UE - Non serve permesso di soggiorno',
      resultDescription: 'Come cittadino dell\'Unione Europea, hai il diritto di circolare e soggiornare liberamente nel territorio italiano...',
      requirements: [
        "Documento d'identita o passaporto in corso di validita",
        "Per soggiorni superiori a 3 mesi: iscrizione anagrafica al Comune",
      ],
      notes: 'Se intendi rimanere piu di 3 mesi, dovrai iscriverti all\'anagrafe del Comune dove risiedi.',
    },
    q_situazione: {
      id: 'q_situazione',
      type: 'question',
      question: 'In che situazione ti trovi?',
    },
    // ... 72 more nodes
  },
  edges: [
    { from: 'start', to: 'end_ue', label: 'Si, sono cittadino UE', optionKey: 'si_ue' },
    { from: 'start', to: 'q_situazione', label: 'No, non sono cittadino UE', optionKey: 'no_ue' },
    { from: 'q_situazione', to: 'minore_start', label: 'Ho meno di 18 anni', optionKey: 'minore' },
    { from: 'q_situazione', to: 'famiglia_start', label: 'In Italia c\'e qualcuno della mia famiglia', optionKey: 'famiglia' },
    // ... ~100 more edges
  ],
};
```

### TreePlayer Component
```tsx
// src/components/tree/TreePlayer.tsx
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useTreeStore } from '@/store/tree-store';
import { italianTree } from '@/lib/tree-data';
import { getOptionsForNode, getNode, isTerminalNode } from '@/lib/tree-engine';
import { QuestionScreen } from './QuestionScreen';
import { SlideTransition } from './SlideTransition';
import { Loader2 } from 'lucide-react';

export function TreePlayer() {
  const currentNodeId = useTreeStore((s) => s.currentNodeId);
  const answers = useTreeStore((s) => s.answers);
  const selectOption = useTreeStore((s) => s.selectOption);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const node = getNode(italianTree, currentNodeId);
  const options = getOptionsForNode(italianTree, currentNodeId);
  const selectedOptionKey = answers[currentNodeId] ?? null;

  // Handle option selection with brief delay for visual feedback
  const handleSelect = useCallback((optionKey: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection('forward');

    // Brief delay to show selected state before advancing
    setTimeout(() => {
      selectOption(optionKey);
      setIsTransitioning(false);
    }, 200);
  }, [selectOption, isTransitioning]);

  if (!node || node.type !== 'question') {
    return null; // Terminal nodes handled by parent
  }

  return (
    <SlideTransition nodeId={currentNodeId} direction={direction}>
      <QuestionScreen
        question={node.question!}
        description={node.description}
        options={options}
        selectedOptionKey={selectedOptionKey}
        onSelect={handleSelect}
        disabled={isTransitioning}
      />
    </SlideTransition>
  );
}
```

### Session Resume Detection
```tsx
// src/app/[locale]/tree/TreeContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTreeStore } from '@/store/tree-store';
import { isTerminalNode } from '@/lib/tree-engine';
import { italianTree } from '@/lib/tree-data';
import { TreePlayer } from '@/components/tree/TreePlayer';
import { ContentColumn } from '@/components/layout/ContentColumn';
import { Loader2 } from 'lucide-react';

export default function TreeContent() {
  const [isHydrated, setIsHydrated] = useState(false);
  const currentNodeId = useTreeStore((s) => s.currentNodeId);
  const outcomeId = useTreeStore((s) => s.outcomeId);

  // Wait for Zustand hydration from localStorage
  useEffect(() => {
    // Zustand persist hydrates synchronously for localStorage
    // but we still need to wait for the first client render
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <ContentColumn>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        </div>
      </ContentColumn>
    );
  }

  // If we have an outcome, show temporary outcome screen
  // (Full outcome pages are Phase 3)
  if (outcomeId && isTerminalNode(italianTree, outcomeId)) {
    const node = italianTree.nodes[outcomeId];
    return (
      <ContentColumn>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold">{node.title}</h2>
          <p className="mt-4 text-foreground/80">{node.resultDescription}</p>
          {/* Minimal outcome display for Phase 2 -- Phase 3 builds rich outcome pages */}
        </div>
      </ContentColumn>
    );
  }

  return (
    <ContentColumn>
      <TreePlayer />
    </ContentColumn>
  );
}
```

### i18n Message Extensions
```json
// messages/it.json additions for Phase 2
{
  "tree": {
    "nameLabel": "Come ti chiami?",
    "namePlaceholder": "Il tuo nome (facoltativo)",
    "skipName": "Preferisco non dirlo",
    "explainer": "Rispondi ad alcune domande per scoprire quale permesso di soggiorno puoi richiedere in Italia.",
    "disclaimer": "Questo strumento fornisce informazioni generali e non costituisce consulenza legale.",
    "resumePrompt": "Vuoi continuare da dove eri rimasto?",
    "resumeYes": "Si, continua",
    "resumeNo": "No, ricomincia",
    "outcome": {
      "title": "Il tuo risultato",
      "duration": "Durata",
      "requirements": "Requisiti",
      "notes": "Note",
      "moreInfo": "Maggiori informazioni",
      "restart": "Ricomincia la verifica"
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat question array with `showCondition` + `nextQuestionId` | Graph model with nodes + edges | SOSpermesso architecture decision (2026-02) | Accurately models DAG with shared subtrees. Back navigation uses history stack, not index decrement. |
| Database-seeded questions via Prisma | Static TypeScript data file for Phase 2 | Phase 2 scope decision | Simplifies development, avoids migration complexity. Database model introduced in Phase 3 for outcomes/multilingual. |
| API calls per question navigation | Full graph loaded client-side, traversed in Zustand | Latency optimization | Graph is ~10KB -- fits in a single initial load. Eliminates per-question API latency for tap-to-advance UX. |
| Next/Confirm button to advance | Tap-to-advance (CONTEXT.md decision) | Phase 2 design decision | Answer selection immediately triggers navigation. No separate confirm step. |
| Zustand v4 persist | Zustand v5 persist with `createJSONStorage` | Zustand v5 (2024-2025) | Import path changed to `zustand/middleware`. `createJSONStorage` wrapper required. v5.0.10+ fixes SSR hydration issues. |

**Deprecated/outdated:**
- `quiz-store.ts` (existing): Built for the Corso AI flat quiz model. Will be replaced by `tree-store.ts` but kept for reference. Do not extend it.
- `useQuiz.ts` hook: Built around the flat quiz model with `visibleQuestions` and `questionPath` computed from `showCondition`. Not applicable to graph model. Replace with simpler computed values from tree store.
- `rules-engine.ts`: Corso AI gap detection. Not used in SOSpermesso. Ignore.
- `QuizPlayer.tsx`, `QuestionCard.tsx`, `SingleChoice.tsx`, etc.: Corso AI components. Replace with new `tree/` components. May borrow styling patterns but not logic.

## Open Questions

1. **Session resume UX: auto-resume vs. prompt**
   - What we know: CONTEXT.md lists this as Claude's discretion. Zustand persist will automatically hydrate from localStorage on page load.
   - What's unclear: Should the user see a "Continue where you left off?" prompt, or should they auto-resume silently?
   - Recommendation: **Auto-resume silently.** If the user has a session in localStorage, hydrate it and show the question they were on. Add a small "Ricomincia" (restart) link in the footer or header for users who want to start over. Rationale: This is a simple decision tree, not a complex form. Showing a modal asking "continue or restart?" adds friction for the common case (user wants to continue). The restart option should be accessible but not blocking.

2. **Tree page route: `/[locale]/tree` or keep `/quiz`**
   - What we know: Architecture research recommends renaming from `quiz/` to `tree/` because "the mental model matters for maintenance." The welcome page already links to `/tree` (`<Link href="/tree">`).
   - What's unclear: Whether the existing `/quiz` route and its components should be removed or kept during Phase 2.
   - Recommendation: Create the new tree at `/[locale]/tree`. Leave the existing `/quiz` route untouched (it is not under `[locale]` and uses the old Corso AI system). Clean up old quiz routes in a later phase once the tree is validated.

3. **How to handle the "Aspetto/ho avuto un figlio" and "Ho problemi gravi di salute" paths**
   - What we know: Both options in `q_situazione` lead to the same outcome (`end_cure`). This is correct per the legal logic -- both situations qualify for the same permit.
   - What's unclear: Should these remain as separate answer options leading to the same terminal, or should the outcome page differentiate between them?
   - Recommendation: Keep as separate options leading to the same node. In Phase 3 (outcome pages), the outcome text can use variable substitution if differentiation is needed.

4. **Removing old Corso AI quiz code**
   - What we know: The existing quiz code (`/quiz`, `quiz-store.ts`, `useQuiz.ts`, `components/quiz/*`) is from the Corso AI fork and not used by SOSpermesso.
   - What's unclear: Whether to remove it now or defer cleanup.
   - Recommendation: Defer removal. The old code does not conflict with new tree code (different routes, different store, different components). Removing it is low-priority housekeeping that can be done in a cleanup task.

5. **Category grouping exact implementation**
   - What we know: CONTEXT.md says "First question groups the 8 main paths into 3-4 higher-level categories." The 9 options of `q_situazione` should be grouped.
   - What's unclear: Exact category labels, whether categories are collapsible accordions or just visual groupings with headings.
   - Recommendation: Use simple visual groupings with bold category headings and slightly indented option cards beneath. Not collapsible -- all options visible on one scrollable screen. The categories in the code examples above are a starting suggestion. Exact labels can be refined during implementation.

## Sources

### Primary (HIGH confidence)
- [Existing `data.js`](/Users/albertopasquero/Desktop/TECH/SOSpermesso/TYPEFORM_CLONE/data.js) -- Complete Italian decision tree with 46 question nodes and 29 outcome nodes. Direct source for all tree content.
- [Existing `flowchart_permessi.mermaid`](/Users/albertopasquero/Desktop/TECH/SOSpermesso/TYPEFORM_CLONE/flowchart_permessi.mermaid) -- Visual graph structure confirming all paths and shared terminals.
- [Existing `quiz-store.ts`](/Users/albertopasquero/Desktop/TECH/SOSpermesso/app/src/store/quiz-store.ts) -- Proven navigation history stack pattern, Zustand persist usage with `partialize`.
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/middlewares/persist) -- API reference for `persist`, `createJSONStorage`, `partialize`, `onRehydrateStorage`, `skipHydration`.
- [Zustand SSR and Hydration guide](https://zustand.docs.pmnd.rs/guides/ssr-and-hydration) -- Patterns for handling SSR hydration with persist middleware.
- [Phase 1 Research](/Users/albertopasquero/Desktop/TECH/SOSpermesso/app/.planning/phases/01-i18n-foundation-design-system/01-RESEARCH.md) -- CSS slide transition pattern, design tokens, logical properties.
- [Architecture Research](/Users/albertopasquero/Desktop/TECH/SOSpermesso/app/.planning/research/ARCHITECTURE.md) -- DAG pattern, tree-engine separation, store design.
- [Phase 2 CONTEXT.md](/Users/albertopasquero/Desktop/TECH/SOSpermesso/app/.planning/phases/02-decision-tree-engine/02-CONTEXT.md) -- Locked design decisions.

### Secondary (MEDIUM confidence)
- [Zustand persist SSR hydration fix v5.0.10](https://github.com/pmndrs/zustand/discussions/2788) -- v5.0.10 (January 2026) fixes persist middleware state inconsistencies.
- [Zustand persist with Next.js patterns](https://github.com/pmndrs/zustand/discussions/2230) -- Community patterns for handling localStorage persistence in Next.js.

### Tertiary (LOW confidence)
- [react-decision-tree-flow](https://github.com/rjerue/react-decision-tree-flow) -- Examined for pattern reference. Confirmed custom implementation is simpler for this use case.
- [question-tree-core](https://github.com/hansbrough/question-tree-react) -- Examined for pattern reference. Unmaintained, minimal API. Not recommended.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries already installed and proven in Phase 1. Zustand persist API verified against official docs.
- Architecture: HIGH -- Graph model validated against actual `data.js` content (46 questions, 29 outcomes, shared terminals confirmed). Tree-engine pure function pattern aligns with architecture research recommendations.
- Data model: HIGH -- TypeScript data structure directly translatable from existing `data.js`. Node counts verified: 46 questions + 29 results = 75 total nodes, ~100 edges.
- Pitfalls: HIGH -- Based on direct analysis of the specific graph structure (shared min_affido nodes, 12-way shared end_msna, tap-to-advance timing). Not generic advice.
- Session persistence: HIGH -- Zustand persist with localStorage is the exact pattern used in existing `quiz-store.ts` (proven) with v5.0.10+ SSR fix.
- Slide transitions: MEDIUM -- CSS transition classes exist in globals.css from Phase 1. The `SlideTransition` wrapper component pattern is standard but untested in this specific codebase.
- Category grouping: MEDIUM -- User decision (locked) but exact implementation is Claude's discretion. Recommended approach is visual-only grouping, needs validation during implementation.

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days -- stable domain, all dependencies already installed)
