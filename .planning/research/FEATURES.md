# Feature Research

**Domain:** Multilingual legal eligibility decision tree for migrants
**Researched:** 2026-02-14
**Confidence:** MEDIUM (domain research synthesized from multiple comparable tools; no single identical competitor exists)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

#### Legal-Specific Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Legal disclaimer / "not legal advice" notice** | Italian law requires distinguishing informational content from consulenza legale. Without it, the tool creates liability for SOSpermesso and erodes trust with legal aid workers who know the difference. Standard in every Italian legal information site ("non costituisce consulenza"). | LOW | Must appear at start of questionnaire AND on every outcome page. Use warm, non-scary language in keeping with SOSpermesso tone. Translate disclaimer into all supported languages. |
| **Confidence indicators on outcomes** | Users need to know how certain the tool is about their result. Already part of existing SOSpermesso content ("siamo sicuri" / "non siamo sicuri"). A2J Author and Docassemble tools show that guided interviews must communicate certainty levels. Without it, users either over-rely on or dismiss results. | LOW | Already designed in existing scheda content. Display prominently -- consider color/icon coding (green = confident, yellow = uncertain). |
| **"Next steps" action list per outcome** | Every comparable tool (LawHelp Interactive, UNHCR Help, refugee.info) provides actionable next steps, not just information. Users who reach an outcome need to know WHAT TO DO, not just what they may be eligible for. | LOW | Already designed in schede: come lo chiedo, mi serve un avvocato, quanto dura. Structure as clear checklist, not prose paragraphs. |
| **Links to legal aid / referral information** | All legal eligibility tools connect users to human help. UNHCR Digital Gateway, refugee.info, and Eureka all provide referral to local services. Without this, the tool is a dead end. | LOW | Already designed in schede with links to sospermesso.it guides and legal aid centers. Ensure links are prominent and work on mobile. |
| **Variable substitution / personalization** | Using the person's name ("[Nome]") and earlier answers ("[Parente selezionato]") throughout. All comparable tools (Typeform, Docassemble, A2J Author, Survey Solutions) support text piping. Without it, the experience feels generic and impersonal. | MEDIUM | Already designed in content. Requires rendering engine to substitute variables from session state into question text and outcome pages. Must work correctly across all languages. |
| **Back button with correct history** | Users MUST be able to go back and change answers without losing progress. A2J Author and Docassemble both support this. Decision trees with branching make naive "previous index" back buttons wrong -- must use navigation history stack. | LOW | Already implemented in quiz-store.ts via navigationHistory stack. Verify it works correctly with all branching paths. |
| **Session persistence / resume** | Users on mobile may close browser mid-questionnaire. Both LawHelp Interactive and A2J Author let users save and return. For migrants on shared or unstable devices, this is critical. | LOW | Already implemented via resumeToken in quiz-store.ts. Consider: how does user get back? Bookmark? Access code? Cookie only works on same browser. |
| **Mobile-first responsive design** | Migrant users overwhelmingly access via smartphone. UNHCR Digital Gateway is mobile-first. Eureka runs on WhatsApp. Responsive design is non-negotiable. | LOW | Already a constraint. Ensure touch targets are large (48px minimum per WCAG), text is readable without zooming, and all UI elements work on 320px screens. |

#### Multilingual Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Full content translation (all 5 languages)** | The core purpose. Typeform's multilingual is "misleading & completely broken" per their own community. This is the #1 reason for building a custom tool. | HIGH | All ~40 questions + ~25 schede + all UI strings. Translation is content work, not engineering, but the architecture must support it cleanly. |
| **RTL layout for Arabic** | Arabic is a launch language. CSS logical properties (margin-inline-start, padding-inline-end) must be used instead of left/right. Cannot be retrofitted -- must be built from day one. | MEDIUM | Set dir="rtl" on root element when Arabic is selected. Use CSS logical properties throughout. Arabic text takes different space and line heights. Test with actual Arabic content, not lorem ipsum. |
| **Language selector accessible from any page** | Users must be able to switch language at any time without losing progress. UNHCR Help and refugee.info Italy both support this. | MEDIUM | Language switch must NOT restart the questionnaire. All answers are language-independent (option IDs, not translated text). Language only affects display layer. |
| **Bidirectional text handling** | Arabic contains LTR elements (numbers, brand names, URLs). The Unicode Bidirectional Algorithm handles most cases, but embedded LTR strings in RTL context need explicit dir="auto" or unicode-bidi treatment. | MEDIUM | Use dir="auto" on user-generated content blocks. Test mixed-direction scenarios: phone numbers in Arabic text, Italian legal terms in Arabic explanations. |

#### Accessibility Table Stakes (for low-literacy migrant users)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Plain language / short sentences** | SOSpermesso's target users may have limited literacy in any language. W3C and plain language guidelines recommend 8th grade reading level. Legal information tools for migrants must use simple vocabulary. | LOW | Already characteristic of existing SOSpermesso content (warm, emoji-using, reassuring). Apply same principle to all translated content. Translators must prioritize clarity over precision. |
| **Large touch targets and clear visual hierarchy** | WCAG 2.2 requires 24x24px minimum, but 48x48px is recommended for mobile. A2J Author specifically calls out "increased target sizes for inputs and buttons." Users may be interacting with unfamiliar UI patterns. | LOW | Apply to all buttons, radio buttons, checkboxes. One question per screen (already the pattern). Clear visual distinction between question text, options, and navigation. |
| **One question per screen** | All guided interview tools (A2J Author, Docassemble, Typeform) present one question at a time. Reduces cognitive load. Critical for low-literacy users and complex branching where question relevance depends on prior answers. | LOW | Already the pattern in the existing codebase. Do not change this. |
| **Progress indication** | Users need to know where they are in the process. However, branching makes exact progress bars misleading (user may be 3 questions from end or 8). | LOW | Already implemented via ProgressBar component. Consider: show step count relative to user's specific path rather than total questions. Or use a simpler "you're getting closer" indicator rather than a percentage. |

### Differentiators (Competitive Advantage)

Features that set SOSpermesso apart from Typeform and generic tools. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Outcome page as standalone resource** | Each scheda (outcome page) should be shareable as a standalone URL, printable, and saveable. Typeform results disappear. A real legal information page that can be bookmarked, shared with a lawyer, or printed for an appointment is a major differentiator. | MEDIUM | Generate a stable URL per outcome (e.g., /scheda/protezione-speciale). Include all relevant information, legal references, and next steps. Add print stylesheet. Consider PDF export. |
| **WhatsApp/share integration for outcome pages** | Migrant users communicate primarily via WhatsApp. Research shows WhatsApp surveys have higher engagement with migrant populations. Being able to share "I may be eligible for [permit type]" with a friend, lawyer, or legal aid worker via WhatsApp is a high-value, low-cost feature. | LOW | WhatsApp share link is just a URL: `https://wa.me/?text=...`. Add share buttons (WhatsApp, copy link, email) to outcome pages. Include the scheda URL and a brief summary. |
| **Legal aid worker mode** | Dual audience: migrants self-serve AND legal aid workers screen clients. Workers need: faster flow (skip reassuring language), ability to process multiple clients, and possibly a summary view. Typeform can't distinguish between audiences. | MEDIUM | Could be as simple as a URL parameter (?mode=operatore) that: condenses explanatory text, shows all outcome details on one page, includes legal citations. Defer complex features to post-MVP. |
| **Warm, emoji-using, non-bureaucratic design** | Deliberately NOT looking like a government form. The existing SOSpermesso content uses emojis, metaphors ("navigating turbulent bureaucratic waters"), and reassuring language. This emotional design is a differentiator against cold, clinical tools. Most legal tools (A2J Author, Docassemble) have functional but cold interfaces. | LOW | Already characteristic of existing content. Carry through to UI design: rounded corners, warm colors, friendly illustrations. The tool should feel like a helpful friend, not a government office. |
| **Outcome page with structured sections** | Each outcome page organized as FAQ-style blocks: What is this permit? Am I eligible? How do I apply? Do I need a lawyer? How long does it last? What rights does it give me? This structured format is more useful than prose paragraphs. | LOW | Already designed in existing schede content. Implement as collapsible sections or clearly labeled cards. Each section should be independently linkable (anchor links). |
| **Path-aware progress ("you're almost done")** | Unlike generic surveys with a fixed number of questions, SOSpermesso's branching means some paths are 3 questions, others are 8. Path-aware progress shows how far along THIS user's path is, not a misleading percentage of total questions. | MEDIUM | Requires knowing the maximum depth of the current branch. Could pre-calculate or estimate. Even a simple "2 more questions" message is better than a misleading progress bar. |
| **"I'm not sure" option with guidance** | For questions where users genuinely don't know (e.g., "Does your relative have Italian citizenship?"), provide an "I'm not sure" option that explains how to find out, rather than forcing a guess or dead-ending. | LOW | Add "Non so / I don't know" option to relevant questions. Route to guidance text explaining how to find the answer, or route to a "consult a lawyer for this specific question" outcome. |
| **Print-friendly outcome summary** | Users may need to bring their result to a legal aid appointment or immigration office. A print-friendly version of the outcome page, stripped of navigation chrome, with all key information visible. | LOW | CSS @media print stylesheet. Hide navigation, show all sections expanded, include SOSpermesso contact info. Consider: auto-generate a simple reference number for the session. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems in this specific domain.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **User accounts / login for migrants** | "So they can save and return to their results." | Creates barriers for vulnerable users: email may not be stable, passwords are forgotten, fear of creating accounts linked to immigration status. Privacy-sensitive population. UNHCR specifically notes data security concerns. | Use anonymous sessions with resume tokens (already implemented). Outcome pages are shareable URLs that work without login. |
| **AI chatbot for follow-up questions** | "Users will have questions after seeing their outcome." | Legal information chatbots carry enormous liability risk. If the chatbot gives wrong legal guidance, SOSpermesso is responsible. AI hallucinations about legal rights are dangerous. Academic literature specifically warns about algorithmic decision-making in migration contexts. | Link to human legal aid resources. Provide structured FAQ sections on outcome pages. Offer contact information for SOSpermesso team. |
| **Automatic legal advice generation** | "Personalize the outcome based on all their answers." | Crosses the line from legal information to legal advice. Creates attorney-client relationship implications. The tool provides INFORMATION about permit types, not ADVICE about what to do. This distinction is legally critical in Italy. | Variable substitution and path-based routing already personalize the experience without generating novel legal advice. Each outcome page is human-authored by legal experts. |
| **Real-time law change updates** | "The tool should automatically update when immigration law changes." | Immigration law changes require human legal review, not automatic updates. Wrong information is worse than no information. Content must be reviewed by legal experts before publication. | Content versioning with a "last reviewed" date on each outcome page. Admin notification system when content needs review. Manual update process with legal expert approval. |
| **Full WCAG AAA compliance** | "Maximum accessibility for all users." | AAA is aspirational, not a realistic target. It requires things like sign language interpretation of all audio content, extended audio descriptions, and reading level below lower secondary education for ALL text. The effort is enormous and some requirements conflict with legal precision. | Target WCAG 2.1 AA compliance, which covers the vast majority of accessibility needs. Add specific accommodations for the known user population (large text, high contrast, simple language). |
| **Offline mode / PWA** | "Users may not have reliable internet." | Adds significant complexity (service workers, cache management, sync). The questionnaire is lightweight and works on slow connections. The outcome pages with external links require internet anyway. | Optimize for low-bandwidth: minimize JS bundle, lazy-load images, ensure the core flow works on 2G connections. Print-friendly outcome pages can be saved as PDFs for offline reference. |
| **Audio narration of questions** | "For users who can't read." | High-quality audio narration in 5+ languages (including multiple Arabic dialects) is expensive to produce and maintain. TTS quality for Arabic is poor. Every content update requires re-recording. | Use visual design (icons, color coding, large text) to maximize comprehension. Keep text short and simple. Consider audio as a future enhancement if user testing reveals the need. |
| **Admin UI for editing content** | "Non-technical staff should be able to update questions and outcomes." | Building a full CMS is a significant engineering effort. Content changes to legal decision trees require careful testing (does changing one question break downstream paths?). The team is small and technically capable. | Content in structured data files (JSON/YAML) managed in version control. Changes go through PR review, ensuring both legal accuracy and technical correctness. Admin dashboard for ANALYTICS only, not content editing, in v1. |

## Feature Dependencies

```
[Full Content Translation]
    |-- requires --> [i18n Architecture (string externalization, locale routing)]
    |-- requires --> [RTL Layout Support]
    |-- requires --> [Bidirectional Text Handling]

[Language Selector]
    |-- requires --> [i18n Architecture]
    |-- requires --> [Session answers stored as language-independent IDs]

[Variable Substitution]
    |-- requires --> [i18n Architecture (variables must work in all languages)]
    |-- requires --> [Session state management (answers accessible for substitution)]

[Outcome Page as Standalone Resource]
    |-- requires --> [Full Content Translation]
    |-- requires --> [Variable Substitution]
    |-- enhances --> [WhatsApp/Share Integration]
    |-- enhances --> [Print-friendly Outcome Summary]

[WhatsApp/Share Integration]
    |-- requires --> [Outcome Page as Standalone Resource (needs stable URL)]

[Legal Aid Worker Mode]
    |-- requires --> [Full Content Translation (worker may use different language than client)]
    |-- enhances --> [Outcome Page as Standalone Resource]

[Legal Disclaimer]
    |-- requires --> [Full Content Translation]

[Path-aware Progress]
    |-- requires --> [Decision tree structure (branch depth knowledge)]
    |-- conflicts with --> [Naive progress bar (misleading percentage)]

[Confidence Indicators]
    |-- requires --> [Outcome page structure]
    |-- independent of --> [i18n (confidence level is per-scheda, not per-language)]

[Session Persistence]
    |-- independent of --> [i18n (already implemented)]
    |-- enhances --> [Language Selector (switch language mid-session)]
```

### Dependency Notes

- **i18n Architecture is the critical path:** Almost every legal and multilingual feature depends on having a solid internationalization foundation. String externalization, locale routing, and language-independent answer storage must be built first.
- **RTL must be concurrent with i18n:** Building i18n without RTL support means retrofitting later, which is expensive. CSS logical properties and dir attribute must be in the initial i18n implementation.
- **Outcome pages are the sharing prerequisite:** WhatsApp share, print, and PDF features all require outcome pages to exist as standalone, URL-addressable resources. Build outcome pages before adding sharing features.
- **Variable substitution crosses the language boundary:** Variables like [Nome] are simple, but [Parente selezionato] requires the substituted value to be in the correct language and grammatical form. This is a non-trivial translation challenge.
- **Path-aware progress conflicts with naive progress bar:** The existing ProgressBar component likely shows percentage of total questions. For a branching decision tree, this is misleading. Replace or augment with path-aware indicator.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to replace Typeform.

- [ ] **i18n architecture with RTL** -- String externalization, locale routing, CSS logical properties, dir attribute. Foundation for everything else.
- [ ] **Full content translation (5 languages)** -- All questions, options, and outcome pages in IT, AR, FR, EN, ES.
- [ ] **Language selector** -- Accessible from every page, does not restart questionnaire.
- [ ] **Decision tree engine** -- Branching logic, show conditions, option-level routing. (Mostly built; needs adaptation from quiz to decision tree.)
- [ ] **Variable substitution** -- [Nome], [Parente selezionato], dynamic text throughout.
- [ ] **Outcome pages (schede)** -- Structured sections, confidence indicators, next steps, legal aid links.
- [ ] **Legal disclaimer** -- On start screen and outcome pages. Translated.
- [ ] **Session persistence** -- Resume via token. Works across browser sessions.
- [ ] **Mobile-responsive** -- Works on 320px screens, large touch targets.
- [ ] **Warm, friendly design** -- Not a government form. Matches SOSpermesso brand.

### Add After Validation (v1.x)

Features to add once the core tool is live and getting real user traffic.

- [ ] **Shareable outcome page URLs** -- Stable URLs for each scheda, shareable via link.
- [ ] **WhatsApp share button** -- One-tap sharing of outcome to WhatsApp contact.
- [ ] **Print-friendly outcomes** -- CSS print stylesheet for outcome pages.
- [ ] **"I'm not sure" options** -- For questions where uncertainty is common.
- [ ] **Path-aware progress** -- Replace misleading percentage with path-specific progress.
- [ ] **Admin analytics dashboard** -- Usage stats, outcome distribution, drop-off points, language distribution.
- [ ] **"Last reviewed" dates on outcomes** -- Content currency indicator for legal information.

### Future Consideration (v2+)

Features to defer until the tool is established.

- [ ] **Legal aid worker mode** -- Faster flow, multi-client, summary view. Needs user research with actual legal aid workers first.
- [ ] **PDF export of outcome** -- Downloadable summary for appointments. Needs design work.
- [ ] **Additional languages beyond launch 5** -- Architecture supports it; content translation is the bottleneck.
- [ ] **Content versioning / audit trail** -- Track which version of legal content a user saw. Important for legal accountability but complex to implement.
- [ ] **Audio support for select languages** -- If user testing reveals reading is a barrier, add audio narration starting with Italian and Arabic.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| i18n architecture + RTL | HIGH | HIGH | P1 |
| Full content translation (5 langs) | HIGH | HIGH (content work) | P1 |
| Language selector | HIGH | MEDIUM | P1 |
| Decision tree adaptation | HIGH | MEDIUM | P1 |
| Variable substitution | HIGH | MEDIUM | P1 |
| Outcome pages (schede) | HIGH | MEDIUM | P1 |
| Legal disclaimer | HIGH | LOW | P1 |
| Session persistence | HIGH | LOW (already built) | P1 |
| Mobile-responsive | HIGH | LOW (already built) | P1 |
| Warm design | MEDIUM | LOW | P1 |
| Shareable outcome URLs | HIGH | LOW | P2 |
| WhatsApp share | HIGH | LOW | P2 |
| Print-friendly outcomes | MEDIUM | LOW | P2 |
| "I'm not sure" options | MEDIUM | LOW | P2 |
| Path-aware progress | MEDIUM | MEDIUM | P2 |
| Admin analytics | MEDIUM | MEDIUM | P2 |
| Content review dates | MEDIUM | LOW | P2 |
| Legal aid worker mode | MEDIUM | MEDIUM | P3 |
| PDF export | MEDIUM | MEDIUM | P3 |
| Additional languages | MEDIUM | HIGH (content) | P3 |
| Content versioning | LOW | HIGH | P3 |
| Audio narration | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (replaces Typeform)
- P2: Should have, add when validated with real users
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Typeform (current) | A2J Author | Docassemble | LawHelp Interactive | Refugee.info | SOSpermesso (planned) |
|---------|-------------------|------------|-------------|--------------------|--------------|-----------------------|
| Multilingual | Broken/workaround | No native support | Yes (YAML-based) | 5 languages | Multiple | Yes, 5+ languages |
| RTL support | No | No | Partial | Unknown | Unknown | Yes (day one) |
| Branching logic | Yes (limited) | Yes | Yes (Python-based) | Yes (HotDocs) | No (static content) | Yes |
| Variable substitution | Yes (piping) | Yes | Yes | Yes | No | Yes |
| Session save/resume | No (for free tier) | Optional accounts | Yes (login) | Yes (accounts) | N/A | Yes (anonymous token) |
| Outcome pages | No (redirect) | Document generation | Document generation | Document assembly | Static articles | Yes (rich schede) |
| Confidence indicators | No | No | No | No | No | Yes |
| Shareable results | No | Print/download | PDF/DOCX | Print/download | Shareable URLs | Yes (URLs + WhatsApp) |
| Mobile-first | Yes | Yes (recent) | Yes | Partial | Yes | Yes |
| Warm design | Limited theming | Avatar-based | Functional | Functional | Clean/modern | Warm, emoji, friendly |
| Legal disclaimer | Not built-in | Author-configurable | Author-configurable | Built-in | Built-in | Built-in, translated |
| Analytics | Basic (paid) | No | Yes (admin) | No | No | Yes (planned) |
| Print-friendly | No | Yes | Yes (PDF) | Yes (PDF) | No | Planned |
| Open source | No | Yes | Yes | No (uses HotDocs) | No | No |

### Key competitive observations

1. **No existing tool combines multilingual + RTL + warm design + legal decision tree.** SOSpermesso occupies a unique niche.
2. **Typeform's multilingual is genuinely broken** -- community posts confirm users have "zero control" over displayed language. This validates the decision to build custom.
3. **A2J Author is the closest comparable** in the legal self-help space but lacks multilingual support and has a cold, courthouse-themed interface.
4. **Docassemble is the most technically capable** open-source alternative but requires Python expertise and has a steep learning curve. Its strength is document assembly, not information delivery.
5. **Shareable outcome pages are the biggest gap in the market.** No comparable tool makes legal eligibility results easily shareable via WhatsApp or as standalone URLs. This is SOSpermesso's strongest differentiator given migrant communication patterns.

## Sources

### Verified (MEDIUM confidence)
- [A2J Author Accessibility](https://www.a2jauthor.org/content/accessibility) -- WCAG compliance, screen reader support, accessibility features
- [A2J Author Overview](https://www.a2jauthor.org/content/chapter-1-a2j-author-overview) -- Guided interview capabilities, branching, just-in-time learning
- [Docassemble Overview](https://docassemble.org/docs.html) -- Multilingual support, interview logic, session persistence
- [LawHelp Interactive](https://www.probono.net/programs/lhi/) -- Document assembly, 5000+ interviews, 5 languages
- [Typeform Multilingual Community Post](https://community.typeform.com/share-your-typeform-6/typeform-s-multilingual-support-is-misleading-completely-broken-15409) -- Confirms multilingual limitations
- [UNHCR Digital Gateway](https://www.unhcr.org/digitalstrategy/the-digital-gateway/) -- Self-service platform, multilingual, WhatsApp integration
- [Eureka Platform](https://ai4good.org/eureka/) -- Multilingual AI assistant for refugees, privacy-first design
- [Refugee.info Italy](https://italy.refugee.info/en-us) -- IRC multilingual information service for migrants in Italy

### WebSearch-derived (LOW confidence -- patterns observed, not verified with primary sources)
- RTL layout best practices (CSS logical properties, dir attribute, bidirectional text)
- Legal disclaimer patterns in Italian law ("non costituisce consulenza")
- WhatsApp survey engagement with migrant populations
- Low-literacy UX design principles (icons, large targets, short sentences)
- Legal analytics dashboard feature patterns

---
*Feature research for: Multilingual legal eligibility decision tree for migrants*
*Researched: 2026-02-14*
