# Phase 1: Foundation & Assessment Core - Context

**Gathered:** 2025-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a linear questionnaire where lawyers answer screening questions about their AI experience, expectations, and concerns. Responses persist in database. Ends with AI-generated personalized feedback via Haiku API (moved forward from Phase 2 as AI capability demonstration). Level-based sorting (1/2/3) remains in Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Question Presentation
- One question per screen (focused, clean)
- Progress bar visible (no question count)
- Explicit "Next" button to advance (no auto-advance)
- Answer UI style: Claude's discretion (radio buttons vs clickable cards)

### Navigation & Flow
- Users CAN go back to previous questions
- All questions required (no skipping)
- Phase 1 ends with Haiku API-generated personalized feedback
  - Not for level sorting — that's Phase 2
  - Purpose: demonstrate AI capabilities to lawyers ("wow" moment)

### Visual Design
- DigiCrazy Lab branded (match PDF brochure colors — blue/green scheme)
- Desktop/laptop first, mobile secondary
- Logo appears on start and end screens only (not during questions)

### Question Content — All in Italian
Questions should feel conversational, NOT like a test.

**Structure:**

| # | Question | Type | Notes |
|---|----------|------|-------|
| 1 | Quali strumenti AI hai usato? | Multiselect | ChatGPT, Claude, Gemini, Copilot, Banca dati giuridica con AI, Nessuno, Altro |
| 2 | Hai usato AI per il lavoro legale? | Y/N | Branch trigger |
| 2a | → Per cosa? | Multiselect | Ricerca, studio, scrittura, altro (if YES) |
| 2b | → Tendenza d'uso? | Single | In aumento, stabile, in diminuzione (if YES) |
| 2c | → Come ti trovi? | Word options | Frustrato/Neutrale/Soddisfatto/Entusiasta (if YES) |
| 2d | → Perché no? | Multiselect | Privacy, tempo, paura errori, non vedo valore, altro (if NO) |
| 3 | Profilo tecnologico | 3 profiles | Self-assessment: basic / comfortable / confident |
| 4 | Aspettative | Open text | Key question — what do you hope to learn? |
| 5 | Preoccupazioni | Multiselect + optional text | Privacy/riservatezza, etica professionale, affidabilità |
| 6 | Per cosa vorresti usare l'AI? | Rank top 3 | Ricerca, scrittura, revisione documenti, comunicazione clienti, altro |

**IT Self-Assessment Profiles (Question 3):**
- **Profilo A**: "Uso strumenti base — email, Word, navigazione web. I nuovi software richiedono tempo per imparare."
- **Profilo B**: "Sono a mio agio con la tecnologia — uso strumenti cloud, imparo nuove app velocemente, risolvo problemi di base."
- **Profilo C**: "Sono confidente con la tecnologia — adotto rapidamente nuovi strumenti, personalizzo il mio workflow, sono curioso di capire come funzionano le cose."

**Optional text fields on:**
- Expectations (question 4) — key elaboration
- Concerns (question 5) — optional "tell us more"

### Claude's Discretion
- Answer component styling (radio vs cards)
- Exact spacing, typography, animations
- Loading states and error handling
- Haiku prompt engineering for feedback generation
- Database schema details

</decisions>

<specifics>
## Specific Ideas

- "Questions should not feel like a test" — conversational tone throughout
- Haiku API generates personalized feedback at the end — show lawyers what AI can do
- Match DigiCrazy Lab brochure styling (blue/green color scheme, "TrAIn your BrAIn" tagline)
- Branching logic: Q2 YES path explores usage depth, Q2 NO path explores barriers

</specifics>

<deferred>
## Deferred Ideas

- Level-based sorting (Level 1/2/3) — Phase 2 with rules engine
- Rules engine for automated classification — Phase 2
- Admin dashboard — Phase 3

</deferred>

---

*Phase: 01-foundation-assessment-core*
*Context gathered: 2025-02-04*
