# Phase 2: Adaptive Logic & Results - Context

**Gathered:** 2026-02-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Expand the quiz beyond the current Q2 branch into a fully adaptive questionnaire. Every question can branch based on the answer. Add a rules engine to evaluate responses and deliver personalized, professional feedback with optional course-specific prompts. The quiz assesses AI knowledge for Italian lawyers before course enrollment.

</domain>

<decisions>
## Implementation Decisions

### Branching behavior
- Every question can potentially branch to a different next question based on the answer
- Users see different total question counts depending on their path (variable length)
- Branching is seamless — users don't know they're on a different path, it just flows naturally
- Branching logic defined in code (question data file), not database — changes require a deploy but simpler to maintain

### Question flow structure
- **Experience** — Start general, go deeper based on answers (max 3-4 questions on deepest path)
- **Satisfaction** — How satisfied they are with AI so far
- **Concerns** — What's limiting their AI adoption (risks, trust, ethics, etc.)
- **Course expectations** — What they hope to get from the course
- User has some question ideas but wants Claude to propose questions and fill gaps — mix approach

### Content areas to assess
- AI tool usage (breadth AND depth — which tools and how they use them)
- AI risks & ethics (concerns limiting adoption)
- Claude proposes questions based on these domains; user reviews and adjusts during planning

### Feedback depth
- Short summary: 2-3 paragraphs, not a full report
- Professional assessment tone — neutral, factual ("Your current level suggests focusing on these areas")
- No proficiency levels, scores, or categorization — text feedback only, avoids feeling judgmental
- Claude's discretion on whether to reference specific answers or stay at profile level

### Course prompts (replacing traditional recommendations)
- NOT pre-course homework or study resources
- Instead: personalized prompts for during the course — "Remember to ask facilitators about X" or "Pay attention when they cover Y"
- 1-2 key prompts maximum per participant
- Only shown when relevant — some participants may get none if no gaps detected
- Dual audience: participant sees their prompts AND facilitator gets a summary of what each participant needs

### Claude's Discretion
- Rules engine implementation approach
- How to evaluate responses for gap detection
- Whether feedback references specific answers or stays at profile level
- Exact question wording and Italian copy
- Technical branching implementation pattern

</decisions>

<specifics>
## Specific Ideas

- Flow follows a natural progression: experience → satisfaction → concerns → expectations
- Experience section starts broad and drills down only if answers warrant it (adaptive depth)
- Course prompts are phrased as actionable notes: "During the course, ask about..." not homework
- Facilitator summary enables instructors to prepare for individual participant needs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-adaptive-logic-results*
*Context gathered: 2026-02-09*
