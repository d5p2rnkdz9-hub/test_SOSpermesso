# Corso AI - Pre-Training Screening

## What This Is

A web-based pre-training screening tool for AI courses targeting Italian lawyers. Uses branching questionnaires to assess participants' AI knowledge and experience, providing personalized feedback on their proficiency level and generating admin reports for course instructors. Part of DigiCrazy Lab's "AI e professione forense" training program.

## Core Value

Understand what each participant knows about AI before the course starts — enabling instructors to tailor content and participants to understand their starting point.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Branching questionnaire with adaptive logic (answers determine next question)
- [ ] Multiple question types: multiple choice, multiple select, true/false
- [ ] 5-10 questions per screening session
- [ ] Custom rules engine for level determination (not just score thresholds)
- [ ] Three proficiency levels: Level 1 (basics), Level 2 (projects), Level 3 (advanced/code)
- [ ] Immediate personalized feedback for learner (level + explanation of why)
- [ ] Admin dashboard to view all participant responses
- [ ] Cloud-hosted deployment
- [ ] Part of course enrollment flow (not standalone public link)

### Out of Scope

- Video content management — not needed for screening tool
- Payment processing — handled separately
- LMS integration — standalone for v1
- Mobile app — web-first
- Multi-language support — Italian only for now

## Context

**Course: "AI e professione forense"**
- Training lawyers on using AI without compromising professional quality and responsibility
- Module 1 (2h): Risks, limits, conscious AI use — Feb 25, 2025
- Module 2 (2h): Practical applications — March 11, 2025
- Max 12 participants, €320/person, in-person in Milan
- Instructors: Enrica Curatola (digital skills) + Avv. Alberto Pasquero (legal/deontological)

**Level Mapping:**
- Level 1: Never used AI tools, needs fundamentals (what is AI, risks, basic prompting)
- Level 2: Has used AI casually, ready for practical workflows and projects
- Level 3: Advanced user, beyond current course scope (potential future offering)

**Screening Logic Examples:**
- "Have you heard of Claude, ChatGPT, Gemini?" → Yes → "Which have you used?"
- If "None" → basic awareness questions → likely Level 1
- If used tools → deeper questions about workflows, risks awareness

**Future Vision:**
This tool will serve multiple courses. For this first course (single class), it's pure assessment. For future courses, it will also sort participants into appropriate levels.

## Constraints

- **Timeline**: Must be functional before Feb 25, 2025 course date
- **Hosting**: Cloud platform (Vercel, Netlify, or similar)
- **Admin**: Single admin manages all content (Alberto)
- **Language**: Italian interface and content

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Branching questionnaire over linear quiz | Adaptive paths reveal more about knowledge than fixed questions | — Pending |
| Three-level system (1-2-3) | Maps to course structure: basics → projects → code | — Pending |
| Standalone tool (no LMS) | Simpler v1, can integrate later | — Pending |

---
*Last updated: 2025-02-04 after initialization*
