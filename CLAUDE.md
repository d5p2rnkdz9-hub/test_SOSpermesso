# CLAUDE.md

## Git Rules
- **NEVER push unless the user explicitly says "push".** Commits are fine, but `git push` burns Netlify build credits. Wait for explicit permission.

## Translation infrastructure (shared with Sito_Nuovo)

The translation review pipeline shares its rules, prompts, and outputs with the sibling project `Sito_Nuovo/`. The canonical home is a sibling directory:

```
~/Desktop/TECH/SOSpermesso/translations-shared/
├── glossaries/{lang}.js     ← term rules (register, badTerms, preservedTerms)
├── prompts/                 ← reusable AI subagent prompt templates
│   └── ai-review-prompt.md
└── review-reports/
    ├── app/                 ← this project's review outputs
    └── sito-nuovo/          ← sibling project's review outputs (used as priors)
```

The following paths in this project are **symlinks** into `translations-shared/`:
- `app/scripts/glossaries/`  → `translations-shared/glossaries/`
- `app/review-reports/`      → `translations-shared/review-reports/app/`

**Do not edit through the symlinks** — edit at the canonical `translations-shared/` location so the intent is clear. Any edits you make via the symlinks will land in the shared directory anyway, but path references should use the `translations-shared/` form for unambiguity.

### What's per-project (NOT shared)
- `app/translations/{lang}.json` — flat IT→target strings (decision tree). Bundled by Next.js; must stay inside `app/`.
- `app/scripts/review-translations.js` — reads `translations/*.json` (flat shape). Sito_Nuovo has its own copy that reads Notion cache (`_cache/permits-*.json`) — different content shape, kept separate on purpose.
- `app/scripts/extract-it-strings.ts`, `split-batches.ts`, `apply-step2*-fixes.js`, etc. — app-specific tooling.

### Translation Quality Review (3-phase loop)

After translating or modifying any non-IT locale file, run a quality review:

```bash
npm run translations:review -- --lang {code}
```

Outputs (all under `translations-shared/review-reports/app/`):
- `{lang}-automated.md` — regex/glossary findings (bad terms, register, artifacts).
- `{lang}-for-ai-review.json` — structured payload (~30 entries per batch).
- `{lang}-batch-{1..N}.txt` — flat-text batches for AI subagents (Sito_Nuovo-compatible format).

**Phase 1 — Automated:** the regex pass above. Catches known bad terms, register violations, dangling sentences, artifacts, near-duplicate phrases.

**Phase 2 — AI subagents:** spawn parallel Claude Code subagents using `translations-shared/prompts/ai-review-prompt.md` as the template. Each subagent reads one or more `{lang}-batch-N.txt` files plus the glossary and any prior findings at `translations-shared/review-reports/sito-nuovo/{lang}-ai-review.md`. Outputs `{lang}-ai-review.md` in the app reports dir, matching Sito_Nuovo's CRITICAL/HIGH/MEDIUM/LOW + SYSTEMIC structure.

**Phase 3 — Human spot-check:** native speaker, out of scope of this codebase.

**Feedback loop:** confirmed bad-term findings get folded back into `translations-shared/glossaries/{lang}.js` so the next automated run catches them. This benefits both `app` and `Sito_Nuovo` automatically.

### Glossary format (`translations-shared/glossaries/{lang}.js`)
```js
module.exports = {
  register: { formal: 'usted', informal: 'tú' },  // null for EN/BN
  badTerms: [{ wrong: '...', correct: '...', source: '...', note: '...' }],
  preservedTerms: ['Questura', 'Permesso di Soggiorno', ...],  // informational only
  incompleteSentencePatterns: [],
  artifactPatterns: [],
};
```

Do NOT check for absence of preserved terms — only flag *translated forms* of them via `badTerms`.

### Adding a new locale
1. Add the locale code to `src/i18n/routing.ts`.
2. Add a font import + class binding in `src/app/[locale]/layout.tsx` if the script needs it (CJK, RTL, Indic).
3. Translate IT→{lang}: the IT source is already split into 4 batches at `translations/_batches/it-batch-{1..4}.json`. Spawn 4 parallel translation subagents → merge to `translations/{lang}.json`.
4. Wire into `src/i18n/loadTranslations.ts`: add `import {lang} from '../../translations/{lang}.json'` and the entry in `MAPS`.
5. Run the 3-phase review (above).
