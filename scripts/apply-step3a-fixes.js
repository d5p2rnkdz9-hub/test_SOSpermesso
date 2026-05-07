#!/usr/bin/env node
/**
 * Step 3a fixes: AR + FA AI review findings.
 * Applies unambiguous CRITICAL/HIGH/MEDIUM that don't need user judgment.
 *
 * Deferred (need user decisions):
 *   - FA S-1: `permesso di soggiorno` → `اجازه اقامت` everywhere (~250 entries).
 *     Glossary says preserve Italian. User must choose: preserve Latin or update glossary.
 *   - AR C-1/S-1: `Carta di Soggiorno` family-card mistranslated as EU long-term permit
 *     (8+ entries). Needs per-entry rewrite — not a simple find-replace.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

// ─── AR fixes ──────────────────────────────────────────────────────────────
const AR_REPLACEMENTS = [
  // S-2 / H-1: subsidiary protection — UNHCR/EU standard term
  ['حماية ثانوية', 'الحماية الإضافية'],
  // S-4 / H-4: Tribunale per i Minorenni (preserve Italian, glossary rule)
  ['محكمة الأحداث', 'Tribunale per i Minorenni'],
];

// AR S-3: targeted gloss restoration — only when the Arabic gloss is missing.
// (Avoids double-glossing already-correct entries.)
const AR_GLOSS_FIXES = [
  { needle: 'marca da bollo', already: 'طابع ضريبي', replace: 'طابع ضريبي (Marca da bollo)' },
  { needle: 'bollettino postale', already: 'إيصال بريدي', replace: 'إيصال بريدي (Bollettino postale)' },
  { needle: 'الـ Kit postale', already: 'طلب البريد', replace: 'طلب البريد (Kit postale)' },
  { needle: 'الـ Questura', already: 'مصلحة الشرطة', replace: 'مصلحة الشرطة (Questura)' },
];

// ─── FA fixes ──────────────────────────────────────────────────────────────
const FA_REPLACEMENTS = [
  // H-2: drop redundant Persian plural marker on already-plural Italian
  ['Questureها', 'Questure'],
  ['Questure ها', 'Questure'],
  ['Questura ها', 'Questura'],
  // H-5: per capirci calque
  ['برای روشن شدن:', 'به عبارت دیگر:'],
  // H-9: duplicate spouse word
  ['همسر/همسر/شریک زندگی', 'همسر/شریک زندگی'],
];

// FA C-1: RTL arrow direction inversion in conversion labels.
// Replace ` ← ` (space-arrow-space) with Persian "به" (to) — only inside conversion-label
// entries (those start with "تبدیل" — "Conversion").
function fixFaArrowDirection(obj) {
  let count = 0;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v.startsWith('تبدیل ') && v.includes(' ← ')) {
      obj[k] = v.replace(/ ← /g, ' به ');
      count++;
    }
  }
  return count;
}

// ─── Apply ────────────────────────────────────────────────────────────────
function applyReplacements(obj, replacements, label) {
  let totalEdits = 0;
  let entriesTouched = 0;
  for (const k of Object.keys(obj)) {
    let v = obj[k];
    let changed = false;
    for (const [from, to] of replacements) {
      if (v.includes(from)) {
        v = v.split(from).join(to);
        totalEdits++;
        changed = true;
      }
    }
    if (changed) {
      obj[k] = v;
      entriesTouched++;
    }
  }
  console.log(`  ${label}: ${totalEdits} substitutions across ${entriesTouched} entries`);
}

function applyGlossFixes(obj, glossFixes, label) {
  let totalEdits = 0;
  let entriesTouched = 0;
  for (const k of Object.keys(obj)) {
    let v = obj[k];
    let changed = false;
    for (const { needle, already, replace } of glossFixes) {
      // Only fix entries where the lowercase Italian appears and the Arabic gloss is absent
      if (v.includes(needle) && !v.includes(already)) {
        v = v.split(needle).join(replace);
        totalEdits++;
        changed = true;
      }
    }
    if (changed) {
      obj[k] = v;
      entriesTouched++;
    }
  }
  console.log(`  ${label}: ${totalEdits} substitutions across ${entriesTouched} entries`);
}

function processAr() {
  const file = path.join(ROOT, 'translations', 'ar.json');
  const orig = fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(orig);
  console.log('\n=== AR ===');
  applyReplacements(obj, AR_REPLACEMENTS, 'replacements');
  applyGlossFixes(obj, AR_GLOSS_FIXES, 'gloss-restorations (S-3)');
  const out = JSON.stringify(obj, null, 2) + '\n';
  if (DRY) { console.log(`  [dry-run] would write ${file}`); return; }
  if (out !== orig) {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, out, 'utf-8');
    fs.renameSync(tmp, file);
    console.log(`  → wrote ${file}`);
  }
}

function processFa() {
  const file = path.join(ROOT, 'translations', 'fa.json');
  const orig = fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(orig);
  console.log('\n=== FA ===');
  applyReplacements(obj, FA_REPLACEMENTS, 'replacements');
  const arrowCount = fixFaArrowDirection(obj);
  console.log(`  RTL arrow direction (C-1): rewrote ${arrowCount} conversion labels`);
  const out = JSON.stringify(obj, null, 2) + '\n';
  if (DRY) { console.log(`  [dry-run] would write ${file}`); return; }
  if (out !== orig) {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, out, 'utf-8');
    fs.renameSync(tmp, file);
    console.log(`  → wrote ${file}`);
  }
}

processAr();
processFa();
if (DRY) console.log('\n[dry-run mode] no files written');
