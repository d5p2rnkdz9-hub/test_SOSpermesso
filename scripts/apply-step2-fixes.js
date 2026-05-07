#!/usr/bin/env node
/**
 * One-off script: apply unambiguous fixes from the EN/FR/ES AI reviews
 * (Step 2 of translation review pipeline).
 *
 * Skips contentious decisions — those need user sign-off:
 *   - EN: UK vs US English spelling normalization
 *   - EN: [StatoPermesso] placeholder grammar (engineering, not translation)
 *   - ES: permiso de residencia vs estadía (200+ entries; register decision)
 *   - ES: tú vs usted (current glossary says tú; user prompt suggested usted)
 *
 * Run from app/ root:  node scripts/apply-step2-fixes.js [--dry-run]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

// ─── EN: calque + false-friend replacements (SYSTEMIC) ─────────────────────
const EN_REPLACEMENTS = [
  // S-1: attesa occupazione calque
  ['awaiting employment', 'job-seeking'],
  ['Awaiting employment', 'Job-seeking'],
  ['Awaiting Employment', 'Job-seeking'],
  // S-2: dichiarazione di ospitalità — standardize
  ['Hosting declaration', 'Declaration of hospitality'],
  ['hosting declaration', 'declaration of hospitality'],
  ['Hospitality declaration', 'Declaration of hospitality'],
  ['hospitality declaration', 'declaration of hospitality'],
  // H-1: organizzazioni sindacali dei datori di lavoro
  ['trade unions of employers', 'employer associations'],
  // H-4: requires specific requirements (tautology)
  ['requires specific requirements', 'subject to specific requirements'],
  // H-6: prima cosa / seconda cosa calque
  ['First thing: ', 'First, '],
  ['Second thing: ', 'Second, '],
  // L-6 / standardization: nominal certificate calque
  ['Nominal certificate', 'Personal certificate'],
  ['nominal certificate', 'personal certificate'],
];

// EN entry-level overrides (CRITICAL findings — exact key edits)
const EN_OVERRIDES = {
  // C-1: Entry 116 — Zambrano is a family card, not EU long-term permit
  'Carta di Soggiorno — Caso Zambrano': 'Family residence card — Zambrano case',
  // C-2: Entry 188/189/190 — spouse of long-term resident is a family-derivative card
  'Carta di Soggiorno per Coniuge di Lungosoggiornante':
    'EU long-term residence card for spouse of a long-term resident',
};

// EN substring replacements (apply within values)
const EN_SUBSTRING_REPLACEMENTS = [
  // H-2: Entry 478 — ricorso al Tribunale per i Minorenni is a fresh petition, not appeal
  ['file a new appeal with the Juvenile Court (Tribunale per i Minorenni)',
   'file a new petition with the Tribunale per i Minorenni'],
];

// ─── FR: calque + false-friend replacements (SYSTEMIC) ─────────────────────
const FR_REPLACEMENTS = [
  // S-1: minore età calque
  ['Mineur âge', 'Minorité'],
  ['mineur âge', 'minorité'],
  ['Mineur Âge', 'Minorité'],
  // S-2: dichiarazione di ospitalità — false friend
  ['déclaration d’hospitalité', 'déclaration d’hébergement'],
  ['Déclaration d’hospitalité', 'Déclaration d’hébergement'],
  ["déclaration d'hospitalité", "déclaration d'hébergement"],
  ["Déclaration d'hospitalité", "Déclaration d'hébergement"],
  // S-4: Servizio Sanitario calque
  ['Service Sanitaire', 'Service national de santé'],
  ['service sanitaire', 'service national de santé'],
  // H-1: maman/papa register clash with formal vous
  ['venez de devenir maman ou papa', 'venez de devenir mère ou père'],
];

// FR entry-level overrides (HIGH findings — exact key edits)
const FR_OVERRIDES = {
  // H-4: anagrafe ≠ état civil
  "Avete un contratto di convivenza registrato all'anagrafe del Comune di residenza?":
    "Avez-vous un contrat de cohabitation enregistré au registre de la population (anagrafe) de la Commune de résidence ?",
};

// ─── ES: Peninsular → LatAm replacements (SYSTEMIC, agreed by glossary) ────
const ES_REPLACEMENTS = [
  // S-2: nóminas (Spain) → recibos de sueldo (LatAm)
  ['nóminas', 'recibos de sueldo'],
  ['Nóminas', 'Recibos de sueldo'],
  // S-3: rellenar (Spain) → llenar (LatAm)
  ['Rellena ', 'Llena '],
  ['rellena ', 'llena '],
  ['rellenar', 'llenar'],
  ['Rellenar', 'Llenar'],
  ['se rellena', 'se llena'],
  // M-2: cualificada (Spain) → calificada (LatAm)
  ['cualificada', 'calificada'],
  ['Cualificada', 'Calificada'],
  ['cualificado', 'calificado'],
  ['Cualificado', 'Calificado'],
  // H-10: per capirci → es decir / o sea (LatAm natural)
  ['Para entendernos:', 'Es decir:'],
  ['para entendernos:', 'es decir:'],
];

// ES entry-level overrides
const ES_OVERRIDES = {
  // C-2: MSNA expansion on first mention (3 entries — find by content match)
  // We do this via substring replace, not full-string override, since the IT keys are long.
};

// Apply substring replacements inside MSNA-mentioning entries
const ES_SUBSTRING_REPLACEMENTS = [
  // C-2: expand MSNA on uses where it appears as bare acronym
  ['eres considerado un MSNA', 'eres considerado un menor extranjero no acompañado (MSNA)'],
  ['como MSNA en acogida', 'como menor extranjero no acompañado (MSNA) en acogida'],
  // H-5: gender agreement — una visa ... vencido → vencida
  ['una visa de entrada, vencido', 'una visa de entrada, vencida'],
  ['una visa de entrada vencido', 'una visa de entrada vencida'],
  // L-7: orthographic accent on cuándo (interrogative)
  ['¿Cuando vence', '¿Cuándo vence'],
];

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
  return entriesTouched;
}

function applyOverrides(obj, overrides, label) {
  let count = 0;
  for (const [key, newValue] of Object.entries(overrides)) {
    if (obj[key] !== undefined) {
      if (obj[key] !== newValue) {
        obj[key] = newValue;
        count++;
      }
    } else {
      console.warn(`  ${label} WARN: key not found: "${key.slice(0, 60)}…"`);
    }
  }
  console.log(`  ${label}: ${count} entries overridden`);
}

function processLang(lang, replacements, overrides, substringReplacements = []) {
  const file = path.join(ROOT, 'translations', `${lang}.json`);
  const orig = fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(orig);
  console.log(`\n=== ${lang.toUpperCase()} ===`);
  applyReplacements(obj, replacements, `replacements`);
  if (substringReplacements.length) {
    applyReplacements(obj, substringReplacements, `substring-fixes`);
  }
  applyOverrides(obj, overrides, `overrides`);
  const out = JSON.stringify(obj, null, 2) + '\n';
  if (DRY) {
    console.log(`  [dry-run] would write ${file}`);
    return;
  }
  if (out === orig) {
    console.log(`  no changes (already up to date)`);
    return;
  }
  // Atomic write
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, out, 'utf-8');
  fs.renameSync(tmp, file);
  console.log(`  → wrote ${file}`);
}

processLang('en', EN_REPLACEMENTS, EN_OVERRIDES, EN_SUBSTRING_REPLACEMENTS);
processLang('fr', FR_REPLACEMENTS, FR_OVERRIDES);
processLang('es', ES_REPLACEMENTS, ES_OVERRIDES, ES_SUBSTRING_REPLACEMENTS);

if (DRY) console.log('\n[dry-run mode] no files written');
