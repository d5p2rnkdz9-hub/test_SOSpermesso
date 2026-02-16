# Phase 2: Decision Tree Engine - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive questionnaire engine with ~40 branching questions leading to ~25 legal outcomes. Users enter via the welcome screen, navigate yes/no and single-select questions through 8 main paths (minor, family, partner, fear, health, pregnancy, exploitation, born in Italy), go back and change answers, and resume mid-session. All content in Italian only. Outcome page content and multilingual support are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Entry & onboarding
- Name input merged into the existing welcome screen — minimal text field with a "skip name" option
- Brief explainer (1-2 sentences about what the tool does) + legal disclaimer ("this is not legal advice") on the welcome screen before starting
- If name is skipped, outcome pages use generic text ("You may be eligible for...") — no later prompt to add name
- First question groups the 8 main paths into 3-4 higher-level categories (e.g., "Family situation", "Protection needs") that expand into specific options — avoid overwhelming with all 8 at once

### Back navigation & answer changes
- Back button lives in the sticky header — always visible, consistent placement
- When user goes back and changes an answer that affects the branching path, silently discard all downstream answers on the old branch — no warning dialog
- Back navigation is one question at a time only — no answer summary panel or jump-to-question feature
- When going back, previous answer is pre-selected/highlighted so user can see what they chose

### Question screen design
- One question per screen — full viewport, clean focus
- Answer options displayed as tappable cards that can include a short description/explanation under each option
- Tap to advance — selecting an answer immediately moves to the next question, no confirm button
- Horizontal slide transition between questions — slides in from right (forward) or left (back) for directional sense

### Claude's Discretion
- Session persistence mechanism (localStorage, sessionStorage, or other)
- Data model for the decision tree (graph structure, storage format)
- Graph traversal algorithm
- Loading and error states
- Exact card styling and spacing
- How the category grouping maps to the 8 paths
- Session resumption UX (auto-resume vs. prompt — user didn't select this for discussion)

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard approaches. The questionnaire should feel fast and focused given the tap-to-advance + slide transition choices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-decision-tree-engine*
*Context gathered: 2026-02-16*
