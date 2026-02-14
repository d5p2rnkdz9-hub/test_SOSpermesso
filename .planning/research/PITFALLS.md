# Pitfalls Research

**Domain:** Multilingual legal decision tree for migrants (i18n/RTL, AI-assisted legal content translation)
**Researched:** 2026-02-14
**Confidence:** HIGH (multiple authoritative sources cross-referenced)

## Critical Pitfalls

### Pitfall 1: AI Translation Hallucinating Legal Terms

**What goes wrong:**
LLMs used for translating legal-adjacent content fabricate plausible but incorrect legal terminology. A term like "permesso di soggiorno" gets rendered as a generic "residence permit" when the Italian legal concept is distinct from residence permits in the target user's home country. Worse, the LLM may invent a legal procedure that does not exist, or translate "Questura" as "police station" when it is a specific administrative office with immigration functions. Users follow incorrect legal guidance because the translation reads fluently and confidently.

**Why it happens:**
LLM hallucination rates for legal content range from 17% to 88% depending on the model and task (Stanford HAI research). Legal hallucinations are particularly dangerous because: (a) the output reads fluently, masking the error; (b) Italian immigration law uses terms with no direct equivalent in most languages ("Sportello Unico per l'Immigrazione," "Nulla Osta al Lavoro," "Dichiarazione di Ospitalita," "Fotosegnalamento"); (c) LLMs trained primarily on English legal corpora lack sufficient Italian immigration law training data. Arabic, Bangla, and Urdu are classified as "low-resource" for legal domain translation, compounding the problem.

**How to avoid:**
- Maintain a **glossary of untranslatable Italian legal terms** that must be preserved in Italian across all languages (e.g., "permesso di soggiorno," "Questura," "codice fiscale"), with explanatory translations in parentheses rather than substitution
- Use a two-pass translation workflow: (1) AI draft, (2) human review by a native speaker with Italian immigration experience
- Build **automated term-checking** that flags when a glossary term is mistranslated or omitted
- Include the Italian original in the UI alongside translations for all legal terms (e.g., "Questura (ufficio di polizia per l'immigrazione)")
- Never allow AI to translate article numbers, law references, or institutional names without a locked glossary

**Warning signs:**
- Translation output lacks Italian legal terms that should have been preserved
- Translated text is shorter than original (suggests information was dropped)
- Legal terms are rendered differently across different outcome pages for the same concept
- User testing reveals confusion about which office to visit or which document to bring

**Phase to address:**
Content Architecture phase (before any translation begins). The glossary and term-locking system must exist before the first AI translation run.

---

### Pitfall 2: Hardcoded LTR Assumptions Throughout the Forked Codebase

**What goes wrong:**
The existing Corso AI codebase was built Italian-only with pervasive LTR assumptions. Hardcoded `ml-`, `mr-`, `pl-`, `pr-` Tailwind classes, `text-left`/`text-right`, `float: left`, icon placement with `ArrowLeft`/`ArrowRight` on fixed sides, and `flex` layouts with fixed ordering all break when `dir="rtl"` is applied. The app appears functional in Arabic but navigation is backwards, icons point the wrong way, spacing is asymmetric, and form inputs behave unexpectedly.

Specific issues already present in the codebase:
- `NavigationButtons.tsx` places `ArrowLeft` icon literally on the left and `ArrowRight` on the right with `mr-2`/`ml-2` margins
- `QuestionCard.tsx` uses `text-xl` without accounting for Arabic needing 20-25% larger font for equivalent visual weight
- `ResultsPage` uses `text-left`, `text-center` with `sm:flex-row` layouts that assume LTR reading order
- Progress bar fills left-to-right
- Tailwind config has no RTL plugin or logical property setup

**Why it happens:**
Retrofitting i18n into an existing app is estimated at 35x the cost of building it in from the start (Shopify Engineering). Every component must be audited for physical CSS properties. The danger is not that RTL "doesn't work" but that it "mostly works"--the app renders and looks plausible, but dozens of micro-layout issues make it feel broken to Arabic readers.

**How to avoid:**
- Before ANY feature work, do a **full LTR audit** of every component: replace all `ml-`/`mr-` with `ms-`/`me-`, all `pl-`/`pr-` with `ps-`/`pe-`, all `left-`/`right-` with `start-`/`end-`
- Add `tailwindcss-rtl` plugin or use Tailwind v4's built-in `rtl:` variants
- Replace `text-left`/`text-right` with `text-start`/`text-end`
- For directional icons (arrows, back/forward), use `rtl:rotate-180` or conditional rendering
- Set `dir` attribute dynamically on `<html>` based on locale
- Add an Arabic-specific font stack and increase `font-size` by ~20% for Arabic via CSS `[dir="rtl"]` selector
- Use `gap` instead of directional margins in flex containers
- Test every component in both LTR and RTL before considering it complete

**Warning signs:**
- Components look "mostly right" in RTL but icons or spacing feel off
- Back button arrow still points left in RTL mode
- Form labels and inputs misaligned in Arabic
- Progress bar fills from the wrong side

**Phase to address:**
RTL Foundation phase (must be the first engineering phase, before content or feature work begins). Every subsequent phase inherits these patterns.

---

### Pitfall 3: Bidirectional (BiDi) Text Corruption in Mixed-Script Content

**What goes wrong:**
SOSpermesso content inherently mixes scripts: Arabic text contains Italian legal terms, numbers (article references like "Art. 5, comma 2"), URLs, email addresses, and phone numbers. The Unicode BiDi algorithm mishandles neutral characters (punctuation, spaces, parentheses) between RTL and LTR runs, causing text to render in wrong order. "Art. 5, comma 2 del D.Lgs. 286/1998" embedded in an Arabic sentence may display with scrambled number order, reversed punctuation, or the Italian text fragment appearing in the wrong position.

**Why it happens:**
The BiDi algorithm processes neutral characters by inheriting directionality from surrounding strongly-typed characters. When an Arabic sentence contains "Questura di Milano" followed by a phone number, the algorithm may: (a) treat the comma between the Italian text and the phone number as RTL, reversing the number display; (b) mis-order parenthesized Italian terms; (c) break URL rendering so links appear garbled or unclickable. This is not a CSS problem--it is a Unicode rendering problem that requires explicit markup intervention.

**How to avoid:**
- Wrap all embedded LTR content (Italian terms, numbers, URLs) in `<bdi>` or `<span dir="ltr">` elements
- In the translation system, create a markup convention for "LTR islands" that translators and AI must preserve
- Use ICU message syntax `{term}` placeholders for legal terms, law references, and contact information, and render them with explicit `dir="ltr"` wrappers
- Never concatenate RTL and LTR strings manually--always use the i18n library's interpolation
- Test with real Arabic content containing Italian legal references, not placeholder text
- Add `dir="auto"` on user-generated content or any content where direction is unknown

**Warning signs:**
- Numbers appear reversed (1998 displays as something unexpected)
- Parentheses or brackets appear on the wrong side of Italian terms
- URLs in Arabic text are garbled or unclickable
- Phone numbers display with digits in wrong order

**Phase to address:**
Content Architecture phase (design the interpolation/markup system) and RTL Foundation phase (implement the rendering). Must be validated in the RTL Testing phase with real legal content.

---

### Pitfall 4: Variable Substitution Breaking Across Languages

**What goes wrong:**
The decision tree outcome pages contain dynamic content: "Devi andare alla Questura di {city} con il tuo {document_type}." When translated, the variable's position in the sentence changes, but more critically, surrounding words must agree grammatically with the substituted value. Arabic has grammatical gender affecting verbs and adjectives. "Your {document_type}" requires different possessive forms in Arabic depending on the gender of the substituted noun. French articles change. Polish cases change word endings. The app displays grammatically broken sentences.

**Why it happens:**
English and Italian have relatively simple agreement rules. Developers build interpolation as simple string replacement: `t('go_to_questura', { city, document })`. But in Arabic, the verb form, possessive pronoun, and even preposition may change based on what fills the placeholder. The ICU MessageFormat specification handles plurals and select-based gender, but developers rarely implement the full spec for every translatable string.

**How to avoid:**
- Use ICU MessageFormat with `{gender, select, ...}` patterns for all strings containing variable substitutions where the variable could affect grammar
- For high-stakes legal outcome pages, prefer **full sentence variants** over interpolation when possible (e.g., separate translation keys for "Go to the Questura in Rome" vs. "Go to the Questura in Milan" if the city name affects grammar)
- Design the content so substituted values are proper nouns (city names, office names) that minimally affect surrounding grammar
- Have translators flag strings where interpolation creates grammatical impossibility, and create alternative sentence structures
- Test with actual substituted values in every language, not just the placeholder notation

**Warning signs:**
- Translators report that certain sentences "cannot be translated" with the current variable positions
- Arabic translations look correct with placeholder markers but break when real values are substituted
- Same outcome page reads smoothly in some languages but is awkward in others

**Phase to address:**
Content Architecture phase (design interpolation strategy and message format) and Translation phase (translators must work with the interpolation system, not around it).

---

### Pitfall 5: Emoji and Tone Loss in Cross-Cultural Translation

**What goes wrong:**
The existing app uses a warm, friendly tone with emojis throughout the UI and feedback content. When translated to Arabic, the emojis either: (a) carry different cultural connotations--thumbs-up is offensive in some Middle Eastern contexts, praying hands have no Islamic connotation, hand gestures are culturally sensitive; (b) appear on the wrong side of text in RTL rendering; (c) disrupt the BiDi algorithm when placed between Arabic and Latin text. Beyond emojis, the warm Italian tone ("Grazie per aver completato il questionario!") may translate to inappropriately casual language for legal information in cultures where formality signals trustworthiness, or may lose warmth entirely in languages where legal register requires distance.

**Why it happens:**
Emojis are treated as universal but are deeply cultural. The thumbs-up emoji is considered an obscene gesture in parts of the Middle East and Greece. The folded hands emoji signifies Christian prayer, not Islamic prayer (which uses open palms). Flower and plant imagery resonates more strongly in Arabic culture than in South Asian cultures. Meanwhile, AI translation models default to either overly formal legal register (losing the friendly tone) or overly casual register (undermining trust in legal information).

**How to avoid:**
- Create a **per-language emoji policy**: define which emojis are safe for each target culture, which must be substituted, and which should be removed
- Avoid hand gesture emojis entirely in the base content--use neutral emojis (checkmarks, information symbols, arrows) that are culturally safe
- Separate emoji handling from text translation: emojis should be in the template, not in the translated string, and should be locale-conditional
- For tone: provide AI translators with a **tone guide per language** specifying the formality level (e.g., Arabic legal content may need slightly more formal tone than Italian to maintain trust)
- Test translated tone with native speakers from the actual target demographic (migrants in Italy), not just native speakers generally
- Do not rely on AI to determine cultural appropriateness of emojis

**Warning signs:**
- Translated text uses hand gesture emojis that native reviewers flag
- Arabic users report the app feels "too casual" or "not trustworthy" for legal information
- Emojis render at line boundaries or between BiDi runs, causing visual glitches
- The translated tone reads like a children's app or, conversely, like an impenetrable legal document

**Phase to address:**
Content Architecture phase (emoji policy, tone guide) and Translation QA phase (native speaker review of tone and cultural fit).

---

### Pitfall 6: AI Translation Quality Collapse for Low-Resource Languages

**What goes wrong:**
SOSpermesso targets 10+ languages including Arabic, Bangla, Urdu, and potentially Tigrinya, Wolof, or other languages spoken by migrant communities in Italy. AI translation quality degrades dramatically for these languages. Arabic suffers from diglossia (MSA vs. spoken dialects)--a Moroccan Arabic speaker may not understand a translation in MSA. Bangla dialects like Sylheti are poorly served by LLMs. Urdu benchmarks show translated data "fails to retain cultural nuances, idiomatic expressions, and contextual meanings." The app displays fluent-looking text that native speakers find stilted, incomprehensible, or laughably wrong.

**Why it happens:**
Despite Arabic having 400+ million speakers, it functions as a "low-resource language" for NLP tasks because: (a) training data skews heavily toward MSA while users speak dialect; (b) legal domain training data is almost nonexistent for Arabic, let alone Bangla or Urdu; (c) LLMs are primarily optimized for English, and translation into these languages is a secondary capability with weaker guardrails; (d) Bangla, Urdu, and smaller African languages have even less training data, meaning hallucination and fluency issues compound.

**How to avoid:**
- **Tier the languages by AI translation reliability**: Tier 1 (AI + light review: French, Spanish, English, Chinese), Tier 2 (AI + heavy review: Arabic, Bangla, Urdu), Tier 3 (human-primary: any language below 100M training tokens in major LLMs)
- For Tier 2/3 languages, use AI for first draft only and budget for professional human review of all legal content
- For Arabic specifically: decide on MSA vs. dialect early (MSA is the safe choice for a written legal tool, but test with actual users--many migrants may be more comfortable with a simplified register)
- Build a **translation memory** system: once a phrase is correctly translated and reviewed, lock it so the AI does not re-translate it differently in another context
- Run back-translation tests (translate to target, translate back to Italian, compare) as an automated quality gate
- For each new language launch, conduct user testing with 3-5 native speakers from the migrant community before going live

**Warning signs:**
- Back-translation produces significantly different meaning from the original
- Native speakers describe translations as "technically correct but nobody talks like this"
- Same Italian sentence gets translated differently on different outcome pages
- Languages added later in the project get less QA and show more issues
- User analytics show high bounce rates for specific language versions

**Phase to address:**
Translation Infrastructure phase (language tiering, translation memory) and per-language Launch Validation phase (user testing before each language goes live).

---

### Pitfall 7: Untranslatable Italian Legal Procedures Rendered as Generic Equivalents

**What goes wrong:**
Italian immigration law has procedures and institutions with no equivalent in other legal systems. "Fotosegnalamento" (the specific fingerprinting and photographing process at immigration offices) gets translated to "identification" or "fingerprinting," losing the specific procedural meaning. "Nulla Osta al Lavoro" becomes "work permit" when it is actually a pre-authorization clearance distinct from the actual work permit. "Dichiarazione di Ospitalita" becomes "hospitality declaration" which means nothing to the user. The decision tree's outcome pages tell users to do things using terms they cannot act on because the translated term does not correspond to what they will encounter at the actual Italian government office.

**Why it happens:**
Every legal system has sui generis concepts. AI translation systems normalize foreign legal terms to the most common English/target-language equivalent, erasing specificity. The user then searches for the translated term at the Questura and encounters the Italian term, creating confusion at the exact moment they need clarity. This is especially dangerous because SOSpermesso users may have limited Italian proficiency--they need the Italian term to navigate real-world bureaucracy, not just a translated explanation.

**How to avoid:**
- Maintain all Italian bureaucratic terms in Italian in all translations, with an inline explanation in the target language: "Fotosegnalamento (rilevamento delle impronte digitali e foto segnaletiche / fingerprinting and photo process)"
- Create a **visual glossary** accessible from any outcome page, with the Italian term, target-language explanation, and ideally a photo or icon of the document/office
- In the translation workflow, mark Italian legal terms with a `<keep>` tag or equivalent that instructs the AI not to translate them
- Ensure the decision tree logic uses Italian term IDs internally, not translated strings, so logic never depends on translation accuracy
- For each outcome page, include a "What you will see" section showing the Italian terms users will encounter on actual forms and documents

**Warning signs:**
- Outcome pages contain zero Italian words (means legal terms were fully translated away)
- Users report not knowing what to ask for at the Questura
- Translation reviewer cannot find the original Italian legal term in the translated text
- The same Italian institution is referred to by different translated names in different places

**Phase to address:**
Content Architecture phase (term tagging system, glossary structure) and Content Creation phase (outcome page templates with Italian term preservation).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing translations in component files instead of external JSON | Faster initial development | Every translation update requires code deployment; translators cannot work independently | Never--externalize from day one |
| Using string concatenation instead of ICU MessageFormat | Simpler translation files | Breaks in languages with different word order, gender, or pluralization rules; creates untranslatable strings | Never for user-facing legal content |
| One-size-fits-all font stack for all scripts | Fewer CSS rules | Arabic appears 20-25% smaller than Latin at same font size; Bangla/Devanagari may not render correctly; Chinese characters need different line-height | Never--script-specific typography is a launch requirement |
| AI-only translation without human review | Dramatically faster, cheaper | 17-88% hallucination rate on legal content; potential for harmful misinformation; loss of trust if users discover errors | Only for Tier 1 languages on non-legal UI chrome (button labels, navigation) |
| Testing RTL with Google Translate output | Quick way to see Arabic text in the UI | Google Translate output may mask BiDi issues because it does not contain real mixed-script content (Italian terms in Arabic sentences) | Only for initial visual layout check, never for content validation |
| Single translation file per language | Simple project structure | Files become enormous (25 outcome pages x 10+ languages); merge conflicts; slow loading of unused translations | Only if outcome pages are lazy-loaded by route and translations are split accordingly |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| next-intl middleware | Setting locale from browser `Accept-Language` without fallback; Arabic users with English browser settings get Italian | Chain detection: URL prefix > cookie > `Accept-Language` header > explicit language selector always visible |
| AI translation API (Claude/GPT) | Sending content for translation without glossary context; each API call translates terms differently | Include the locked glossary in every translation prompt; use system instructions specifying which terms to preserve in Italian |
| RTL detection (`rtl-detect` library) | Only checking locale at layout level; inner components render without direction context | Set `dir` on `<html>` element AND pass direction through React context so components can conditionally render icons/layouts |
| Tailwind CSS RTL | Using `tailwindcss-rtl` plugin designed for v3 with Tailwind v4 (or vice versa); plugin silently fails | Verify plugin version compatibility; for Tailwind v4, use native `rtl:` and `ltr:` variants with logical properties instead of plugin |
| Translation management platform | Importing raw AI translations without marking them as "needs review" | All AI-generated translations should enter the system with "draft" status; only human-reviewed translations get "approved" status |
| Font loading for multiple scripts | Loading all script fonts on every page; 2MB+ of fonts for 10 languages | Load fonts per-locale using `next/font` with locale-conditional imports; Arabic, Bangla, Chinese each need separate font files |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all language bundles at once | Initial page load >3s on mobile; large JS bundle | Split translation files by route AND by language; load only the active locale's translations | With 10+ languages and 25 outcome pages: ~250 translation files loaded if not split |
| Rendering all outcome pages server-side for every locale | Build times multiply by number of languages; 25 pages x 10 languages = 250 static pages | Use ISR (Incremental Static Regeneration) or dynamic rendering for outcome pages; static generation for common entry pages only | When adding the 4th or 5th language, build times become unmanageable |
| Client-side locale switching re-downloading all content | Language switch triggers full page reload and re-fetch | Cache translations in service worker or localStorage; prefetch adjacent-locale translations for likely switches | Noticeable on slow mobile connections common among migrant users |
| Arabic web fonts with full Unicode coverage | Font files 500KB-2MB each; Arabic users on low-bandwidth connections wait for text to render | Use subset fonts covering only the Arabic characters actually used in the content; prefer variable fonts with `unicode-range` | When Arabic is a launch language and users are on prepaid mobile data |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Displaying AI-translated legal guidance without disclaimer | Users take legally consequential action based on potentially hallucinated translation; liability exposure | Every outcome page must display: "This information is translated with AI assistance. For official procedures, confirm with [office name]. This is not legal advice." in the user's language |
| Allowing locale parameter injection in URL routing | Attacker crafts URL with malicious locale value; potential path traversal or XSS via locale-specific content loading | Validate locale against a whitelist of supported locale codes; reject any locale not in the list |
| BiDi character injection in user inputs | Users (or attackers) insert RTL override characters to make URLs appear to point to legitimate sites ("BiDi Swap" attack) | Strip or neutralize BiDi control characters (U+200F, U+200E, U+202A-E) from all user inputs and displayed URLs |
| Translation files containing unescaped HTML | Translator or AI inserts `<script>` or event handlers into translation strings | Sanitize all translation strings at load time; use the i18n library's built-in rich text rendering (next-intl's `rich()` function) instead of `dangerouslySetInnerHTML` |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Language selector using only country flags | Flags represent countries, not languages; Arabic is spoken across 20+ countries; which flag represents Bangla--Bangladesh or West Bengal? Flags can be politically sensitive | Use language name written in that language's script: "العربية" not "Arabic" or a Saudi flag; optionally pair with a globe icon |
| Legal content using complex vocabulary in translation | Migrant users may have limited literacy even in their native language; formal legal register is inaccessible | Write source Italian at B1/CEFR level; instruct AI to translate at equivalent simplified register; test with actual users |
| No visual cues besides text for decision tree navigation | Users with low literacy cannot navigate the decision tree; relies entirely on reading comprehension | Pair each decision node with an icon or illustration representing the concept (document icon, building icon, calendar icon); use color coding for outcome types |
| Assuming all Arabic speakers read MSA fluently | North African Arabic dialects differ significantly from MSA; a Moroccan user may struggle with formal MSA translations | Use simplified MSA (no complex grammatical constructions); test with users from diverse Arabic-speaking regions represented in Italy's migrant population |
| Language selector hidden in footer or settings menu | Users who cannot read Italian never find the language selector; they abandon the app | Language selector must be the FIRST visible element--above the fold, before any Italian text, using script names visible to speakers of each language |
| Progress indicators using only numbers | "Question 3 of 7" is meaningless if numerals differ by script or user has low numeracy | Use visual progress bar (already present) but ensure it fills in the correct direction for RTL; supplement with fraction display using locale-appropriate numerals |

## "Looks Done But Isn't" Checklist

- [ ] **RTL layout:** Component renders correctly in `dir="rtl"` -- verify icon directions, margins, padding, text alignment, progress bar direction, and flex ordering are all mirrored
- [ ] **BiDi mixed content:** Outcome pages with Italian legal terms embedded in Arabic text -- verify term order, number order, punctuation position, and URL clickability
- [ ] **Translation completeness:** Every UI string is externalized -- verify no Italian text remains hardcoded in components (check button labels, error messages, loading states, meta tags, alt text, aria-labels, placeholder text, and toast notifications)
- [ ] **Legal term preservation:** All ~30 Italian legal terms appear in Italian in every language version -- verify with automated glossary checker against all translation files
- [ ] **Font rendering:** Arabic, Bangla, Devanagari, and Chinese characters render correctly with appropriate sizing -- verify on actual mobile devices, not just browser DevTools
- [ ] **Emoji cultural safety:** No hand gesture emojis, no culturally ambiguous symbols -- verify against the per-language emoji policy document
- [ ] **Variable substitution:** Outcome pages with dynamic values display grammatically correct sentences in all languages -- verify with actual substituted values, not placeholder markers
- [ ] **Locale routing:** Direct URL access with locale prefix works; locale cookie is set; language switch preserves current page position in decision tree
- [ ] **Disclaimer text:** Legal disclaimer appears on every outcome page in every language -- verify it was not lost during translation or omitted from a template
- [ ] **Back-translation validation:** For each language launch, all 25 outcome pages have passed back-translation check (translate to target, back to Italian, compare meaning)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Hardcoded LTR CSS throughout | MEDIUM | Systematic find-and-replace of physical properties with logical equivalents; 2-3 days for full codebase audit with Tailwind |
| AI-hallucinated legal terms in translations | HIGH | Identify all affected strings via glossary term checker; re-translate with corrected glossary constraints; re-review with human translator; potential harm if users already acted on incorrect information |
| BiDi text corruption on outcome pages | MEDIUM | Add `<bdi>`/`dir="ltr"` wrappers to interpolated Italian terms in translation templates; requires touching every translation file but is mechanical |
| Emoji cultural offense | LOW | Remove or replace offending emojis in translation files; update emoji policy; deploy within hours |
| Low-resource language translations incomprehensible | HIGH | Cannot be fixed with technology alone; requires hiring native-speaking reviewers for each affected language; timeline 2-4 weeks per language |
| Variable substitution grammar breaks | HIGH | Requires restructuring translation keys to use ICU select/plural patterns or splitting into full sentence variants; affects all languages; may require re-translation |
| Missing language selector visibility | LOW | CSS/layout change to move selector above fold; 1-2 hours |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| AI Translation Hallucinating Legal Terms | Content Architecture | Automated glossary term checker passes on all translation files; no Italian legal term is absent from any language version |
| Hardcoded LTR Assumptions | RTL Foundation | Every component passes visual RTL review; automated Tailwind audit finds zero physical directional properties |
| BiDi Text Corruption | RTL Foundation + Content Architecture | Arabic outcome pages with real Italian legal terms display correctly; automated test renders each outcome page in Arabic and checks term ordering |
| Variable Substitution Breaking | Content Architecture + Translation | ICU MessageFormat validation passes for all strings with variables; native speakers confirm grammar in 3 sample languages |
| Emoji and Tone Loss | Content Architecture + Translation QA | Per-language emoji policy exists and is enforced; native speaker tone review completed for each language |
| AI Quality Collapse for Low-Resource Languages | Translation Infrastructure + Launch Validation | Back-translation score >80% meaning preservation for all languages; native speaker approval for each language before public launch |
| Untranslatable Italian Legal Procedures | Content Architecture + Content Creation | Every outcome page contains original Italian terms for all legal procedures; visual glossary is accessible from every outcome page |

## Sources

### RTL and i18n
- [RTL Styling 101 - Comprehensive guide](https://rtlstyling.com/posts/rtl-styling/) - MEDIUM confidence (community resource, well-maintained)
- [Shopify Engineering - i18n Best Practices for Front-End Developers](https://shopify.engineering/internationalization-i18n-best-practices-front-end-developers) - HIGH confidence (production lessons from Shopify)
- [W3C - Inline Markup and Bidirectional Text in HTML](https://www.w3.org/International/articles/inline-bidi-markup/) - HIGH confidence (W3C standard)
- [shadcn/ui RTL Support Issue #2759](https://github.com/shadcn-ui/ui/issues/2759) - HIGH confidence (directly relevant to the component library in use)
- [next-intl documentation](https://next-intl.dev/docs/usage/translations) - HIGH confidence (official library docs)
- [Tailwind CSS RTL Support Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/1492) - MEDIUM confidence (official Tailwind discussion)

### AI Translation and Legal Content
- [Stanford Justice Innovation - AI, Machine Translation, and Access to Justice](https://justiceinnovation.law.stanford.edu/ai-machine-translation-and-access-to-justice/) - HIGH confidence (Stanford research)
- [Stanford HAI - Hallucinating Law: Legal Mistakes with LLMs](https://hai.stanford.edu/news/hallucinating-law-legal-mistakes-large-language-models-are-pervasive) - HIGH confidence (Stanford research)
- [Localazy - 8 LLM Arabic Models Tested](https://localazy.com/blog/ai-8-llm-arabic-models-tested-to-translate) - MEDIUM confidence (industry benchmark)
- [PoliLingua - Hidden Risks of AI for Legal Translation](https://www.polilingua.com/blog/post/ai-legal-translation-risks.htm) - MEDIUM confidence (industry analysis)
- [Straker.ai - AI Translation for Compliance Documents](https://www.straker.ai/blogs/ai-translation-for-compliance-documents-is-the-risk-worth-the-reward) - MEDIUM confidence (industry perspective)
- [Machine Translation in the Field of Law (ResearchGate)](https://www.researchgate.net/publication/337046266_Machine_Translation_in_the_Field_of_Law_A_Study_of_the_Translation_of_Italian_Legal_Texts_into_German) - HIGH confidence (peer-reviewed research)

### Italian Immigration Terminology
- [Mazzeschi - Italian Immigration Technical Terms](https://www.mazzeschi.it/italian-immigration-technical-terms/) - HIGH confidence (Italian immigration law firm)
- [ProZ - Permesso di Soggiorno translation discussion](https://www.proz.com/kudoz/italian-to-english/law-general/1577248-carta-permesso-di-soggiorno.html) - MEDIUM confidence (professional translator community)

### Cultural Sensitivity
- [Emoji Cultural Differences - Multiple sources cross-referenced](https://en.localconcept.com/blog/2019/07/17/emojis/) - MEDIUM confidence (multiple sources agree)
- [Avantpage - How to Translate Emojis Across Cultures](https://avantpage.com/blog/translate-emojis-cultures-avoid-mistakes/) - MEDIUM confidence (industry guidance)

### Low-Resource Language Translation
- [Alif: Advancing Urdu LLMs (ArXiv)](https://arxiv.org/html/2510.09051v1) - HIGH confidence (academic research)
- [ACL - LLMs for Low-Resource Dialect Translation](https://aclanthology.org/2025.banglalp-1.24/) - HIGH confidence (peer-reviewed)
- [Frontiers - Cross-dialectal Arabic Translation](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1661789/full) - HIGH confidence (peer-reviewed)

### Low-Literacy UX Design
- [ACM - Actionable UI Design Guidelines for Low-Literate Users](https://dl.acm.org/doi/10.1145/3449210) - HIGH confidence (peer-reviewed ACM)
- [UW CSE - User Interface Design for Low-literate and Novice Users](https://courses.cs.washington.edu/courses/cse490c/18au/readings/medhi-thies-2015.pdf) - HIGH confidence (academic research)

---
*Pitfalls research for: Multilingual legal decision tree for migrants (SOSpermesso)*
*Researched: 2026-02-14*
