#!/usr/bin/env node
/**
 * Translation quality review for the Next.js app — adapted from Sito_Nuovo.
 *
 * Reads `translations/{lang}.json` (flat IT-text → translated-text) plus the
 * IT source at `translations/source/it.json`. Runs the same automated checks
 * (register mix, bad terms, preserved-term violations, artifacts, incomplete
 * sentences, duplication) and emits two reports:
 *
 *   review-reports/{lang}-automated.md       — human report
 *   review-reports/{lang}-for-ai-review.json — batched payload for AI subagents
 *
 * Usage:
 *   node scripts/review-translations.js --lang en
 *   npm run review:translations -- --lang fr
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const langIdx = args.indexOf('--lang');
if (langIdx === -1 || !args[langIdx + 1]) {
  console.error('Usage: node scripts/review-translations.js --lang <code>');
  process.exit(1);
}
const LANG = args[langIdx + 1].toLowerCase();

const ROOT          = path.join(__dirname, '..');
const SOURCE_IT     = path.join(ROOT, 'translations', 'source', 'it.json');
const TARGET_FILE   = path.join(ROOT, 'translations', `${LANG}.json`);
const PROVENANCE    = path.join(ROOT, 'translations', 'source', 'provenance.json');
const REPORTS_DIR   = path.join(ROOT, 'review-reports');
const BATCH_SIZE    = 30; // entries per AI review batch

// ─── Load language glossary ───────────────────────────────────────────────────

const glossaryPath = path.join(__dirname, 'glossaries', `${LANG}.js`);
const glossary = fs.existsSync(glossaryPath) ? require(glossaryPath) : {};

const REGISTER         = glossary.register || null;
const BAD_TERMS        = glossary.badTerms || [];
const EXTRA_ARTIFACTS  = glossary.artifactPatterns || [];
const EXTRA_INCOMPLETE = glossary.incompleteSentencePatterns || [];

// ─── Default checks (language-agnostic) ──────────────────────────────────────

const DEFAULT_ARTIFACT_PATTERNS = [
  { re: /\([A-Z]\)/g,          label: 'parenthetical capital letter — likely leftover annotation artifact' },
  { re: /\b(\w{4,})\s+\1\b/gi, label: 'consecutive duplicate word' },
];

const ALL_ARTIFACT_PATTERNS  = [...DEFAULT_ARTIFACT_PATTERNS, ...EXTRA_ARTIFACTS];
const ALL_INCOMPLETE_PATTERNS = [...EXTRA_INCOMPLETE];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Checks (each takes the translated text) ─────────────────────────────────

function checkRegister(text) {
  const issues = [];
  if (!REGISTER) return issues;
  const { formal, informal } = REGISTER;

  let formalCount, informalCount;
  try {
    const fRe = new RegExp(`\\b${escapeRegex(formal)}\\b`, 'gi');
    const iRe = new RegExp(`\\b${escapeRegex(informal)}\\b`, 'gi');
    formalCount   = [...text.matchAll(fRe)].length;
    informalCount = [...text.matchAll(iRe)].length;
  } catch (_) {
    formalCount   = (text.match(new RegExp(escapeRegex(formal),   'g')) || []).length;
    informalCount = (text.match(new RegExp(escapeRegex(informal), 'g')) || []).length;
  }

  if (informalCount > 0 && formalCount > 0) {
    issues.push({
      type: 'REGISTER MIX',
      detail: `Both formal "${formal}" (${formalCount}x) and informal "${informal}" (${informalCount}x)`,
      suggestion: `Use only "${formal}" throughout`,
    });
  } else if (informalCount > 0) {
    issues.push({
      type: 'REGISTER',
      detail: `Informal "${informal}" found ${informalCount}x — site uses formal "${formal}"`,
      suggestion: `Replace informal with "${formal}"`,
    });
  }
  return issues;
}

function checkBadTerms(text) {
  const issues = [];
  for (const { wrong, correct, source, note, preservedViolation } of BAD_TERMS) {
    if (text.includes(wrong)) {
      issues.push({
        type: preservedViolation ? 'PRESERVED TERM TRANSLATED' : 'BAD TERM',
        detail: `"${wrong}"${note ? ` — ${note}` : ''}${source ? ` (source: "${source}")` : ''}`,
        suggestion: `→ "${correct}"`,
      });
    }
  }
  return issues;
}

function checkArtifacts(text) {
  const issues = [];
  for (const { re, label } of ALL_ARTIFACT_PATTERNS) {
    const cloned = new RegExp(re.source, re.flags);
    for (const m of text.matchAll(cloned)) {
      issues.push({
        type: 'ARTIFACT',
        detail: `"${m[0]}" — ${label}`,
        suggestion: 'Remove or rewrite',
      });
    }
  }
  return issues;
}

function checkIncomplete(text) {
  const issues = [];
  for (const { re, label } of ALL_INCOMPLETE_PATTERNS) {
    const cloned = new RegExp(re.source, re.flags);
    for (const m of text.matchAll(cloned)) {
      issues.push({
        type: 'INCOMPLETE',
        detail: `"${m[0]}" — ${label}`,
        suggestion: 'Rewrite as a complete sentence',
      });
    }
  }
  return issues;
}

function checkDuplication(text) {
  const issues = [];
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 8; i++) {
    const phrase = words.slice(i, i + 5).join(' ');
    if (phrase.length < 15) continue;
    const nextChunk = words.slice(i + 1, i + 12).join(' ');
    if (nextChunk.includes(phrase)) {
      issues.push({
        type: 'DUPLICATION',
        detail: `Phrase appears twice in close proximity: "${phrase}"`,
        suggestion: 'Remove duplicate occurrence',
      });
      i += 5;
    }
  }
  return issues;
}

function runChecks(text) {
  return [
    ...checkRegister(text),
    ...checkBadTerms(text),
    ...checkArtifacts(text),
    ...checkIncomplete(text),
    ...checkDuplication(text),
  ];
}

// ─── Coverage: missing/untranslated keys vs IT source ────────────────────────

function checkCoverage(source, target) {
  const sourceKeys = Object.keys(source);
  const targetKeys = Object.keys(target);

  const missing     = sourceKeys.filter(k => !(k in target));
  const extra       = targetKeys.filter(k => !(k in source));
  const untranslated = sourceKeys.filter(k => target[k] === k); // value === key
  return { missing, extra, untranslated };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SOURCE_IT)) {
    console.error(`IT source missing at ${SOURCE_IT}. Run npx tsx scripts/extract-it-strings.ts first.`);
    process.exit(1);
  }
  if (!fs.existsSync(TARGET_FILE)) {
    console.error(`Target translation missing at ${TARGET_FILE}.`);
    process.exit(1);
  }

  const source = JSON.parse(fs.readFileSync(SOURCE_IT, 'utf-8'));
  const target = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf-8'));
  const provenance = fs.existsSync(PROVENANCE) ? JSON.parse(fs.readFileSync(PROVENANCE, 'utf-8')) : {};

  const coverage = checkCoverage(source, target);

  // Run per-entry checks
  const entryIssues = []; // { it, target, issues }
  for (const [it, translated] of Object.entries(target)) {
    if (translated === it) continue; // skip untranslated (handled by coverage)
    const issues = runChecks(translated);
    if (issues.length > 0) {
      entryIssues.push({ it, target: translated, issues });
    }
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  // ─── Markdown report ─────────────────────────────────────────────────────────
  const mdPath = path.join(REPORTS_DIR, `${LANG}-automated.md`);
  const md = [];
  md.push(`# ${LANG.toUpperCase()} translation review`);
  md.push(`Generated: ${new Date().toISOString()}\n`);

  md.push('## Coverage');
  md.push(`- Source keys: **${Object.keys(source).length}**`);
  md.push(`- Target keys: **${Object.keys(target).length}**`);
  md.push(`- Missing (in source, not target): **${coverage.missing.length}**`);
  md.push(`- Extra (in target, not source): **${coverage.extra.length}**`);
  md.push(`- Untranslated (value === key): **${coverage.untranslated.length}**`);
  if (coverage.missing.length > 0) {
    md.push(`\n### Missing keys (first 20)`);
    for (const k of coverage.missing.slice(0, 20)) md.push(`- \`${k.slice(0, 100)}\``);
  }
  if (coverage.untranslated.length > 0) {
    md.push(`\n### Untranslated entries (first 20)`);
    for (const k of coverage.untranslated.slice(0, 20)) md.push(`- \`${k.slice(0, 100)}\``);
  }

  md.push(`\n## Automated issues: ${entryIssues.length} entries flagged\n`);
  if (entryIssues.length === 0) {
    md.push('_No issues from automated checks._\n');
  } else {
    for (const { it, target, issues } of entryIssues) {
      md.push(`### IT: \`${it.slice(0, 100)}${it.length > 100 ? '…' : ''}\``);
      md.push(`> ${target.slice(0, 200)}${target.length > 200 ? '…' : ''}\n`);
      for (const iss of issues) {
        md.push(`- **${iss.type}** — ${iss.detail}  \n  → ${iss.suggestion}`);
      }
      md.push('');
    }
  }
  fs.writeFileSync(mdPath, md.join('\n'), 'utf-8');

  // ─── AI-review JSON (batched) ────────────────────────────────────────────────
  const jsonPath = path.join(REPORTS_DIR, `${LANG}-for-ai-review.json`);
  const entries = Object.entries(target).map(([it, translated]) => ({
    it,
    translated,
    untranslated: it === translated,
    sampleIds: (provenance[it] || []).slice(0, 3),
  }));
  const batches = [];
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    batches.push({
      batchId: Math.floor(i / BATCH_SIZE) + 1,
      entries: entries.slice(i, i + BATCH_SIZE),
    });
  }
  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ lang: LANG, generatedAt: new Date().toISOString(), batches }, null, 2),
    'utf-8',
  );

  console.log(`\n${LANG.toUpperCase()} review:`);
  console.log(`  Coverage: ${Object.keys(target).length}/${Object.keys(source).length} keys; ${coverage.missing.length} missing, ${coverage.untranslated.length} untranslated.`);
  console.log(`  Automated issues: ${entryIssues.length} entries flagged.`);
  console.log(`  → ${path.relative(ROOT, mdPath)}`);
  console.log(`  → ${path.relative(ROOT, jsonPath)} (${batches.length} batches)`);
}

main();
