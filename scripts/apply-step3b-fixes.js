#!/usr/bin/env node
/**
 * Step 3b fixes: RU + TR AI review findings.
 * Applies unambiguous CRITICAL/HIGH/MEDIUM that don't need user judgment.
 *
 * Deferred (need per-entry rewrite or user decision):
 *   - RU C-1: Carta di Soggiorno conflation (~21 entries, same as AR/EN issue)
 *   - TR S-2 cluster: Oturma Kartı → preserve Carta di soggiorno (~7 entries)
 *   - TR H-6 Si:/Evet: list-header pattern (11 entries — format-dependent)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

// ─── RU fixes ──────────────────────────────────────────────────────────────
const RU_REPLACEMENTS = [
  // S-1/H-1: preserve Italian financial document terms
  ['Гербовая марка', 'marca da bollo'],
  ['Почтовая квитанция', 'bollettino postale'],
  // S-2/H-2: false friend — Dichiarazione di ospitalità
  ['Декларация о гостеприимстве', 'Dichiarazione di ospitalità'],
  ['декларация о гостеприимстве', 'dichiarazione di ospitalità'],
  // H-3: Carta di soggiorno preserve
  ['Карта проживания', 'Carta di soggiorno'],
  ['карта проживания', 'carta di soggiorno'],
  // H-4: Comune preserve
  ['муниципалитетом', 'Comune'],
  // H-7: SSN preserve
  ['Государственная медицинская служба', 'SSN'],
  ['государственной медицинской службе', 'SSN'],
  ['государственная медицинская служба', 'SSN'],
];

// ─── TR fixes ──────────────────────────────────────────────────────────────
const TR_REPLACEMENTS = [
  // S-4: preserve Decreto Flussi
  ['"flussi" vizesi', 'Decreto Flussi vizesi'],
  // H-2: per capirci calque
  ['Anlamak için:', 'Yani:'],
  // H-9: bollettino postale preserve (drops "posta makbuzu" prefix)
  ["'luk posta makbuzu (bollettino postale)", ' değerinde bollettino postale'],
  ["'lik posta makbuzu (bollettino postale)", ' değerinde bollettino postale'],
  // S-1 / H-9 sibling: damga pulu (marca da bollo) → marca da bollo
  ["'luk damga pulu (marca da bollo)", ' değerinde marca da bollo'],
  ["'lik damga pulu (marca da bollo)", ' değerinde marca da bollo'],
  // L-4: case drift FAMIT → Famit
  ['FAMIT', 'Famit'],
  // L-7: madde 27ter → Madde 27ter (article-number casing on legal references)
  ['(madde 27ter)', '(Madde 27ter)'],
  ['(madde 31)', '(Madde 31)'],
];

// TR entry-level override — single-entry CRITICAL fix
const TR_OVERRIDES = {
  // C-1: Soggiorno (section header for residence) → İkamet
  'Soggiorno': 'İkamet',
};

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

function applyOverrides(obj, overrides, label) {
  let count = 0;
  for (const [key, newValue] of Object.entries(overrides)) {
    if (obj[key] !== undefined && obj[key] !== newValue) {
      obj[key] = newValue;
      count++;
    } else if (obj[key] === undefined) {
      console.warn(`  ${label} WARN: key not found: "${key.slice(0, 60)}…"`);
    }
  }
  console.log(`  ${label}: ${count} entries overridden`);
}

function processLang(lang, replacements, overrides = {}) {
  const file = path.join(ROOT, 'translations', `${lang}.json`);
  const orig = fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(orig);
  console.log(`\n=== ${lang.toUpperCase()} ===`);
  applyReplacements(obj, replacements, 'replacements');
  if (Object.keys(overrides).length) applyOverrides(obj, overrides, 'overrides');
  const out = JSON.stringify(obj, null, 2) + '\n';
  if (DRY) { console.log(`  [dry-run] would write ${file}`); return; }
  if (out !== orig) {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, out, 'utf-8');
    fs.renameSync(tmp, file);
    console.log(`  → wrote ${file}`);
  } else {
    console.log('  no changes');
  }
}

processLang('ru', RU_REPLACEMENTS);
processLang('tr', TR_REPLACEMENTS, TR_OVERRIDES);
if (DRY) console.log('\n[dry-run mode] no files written');
