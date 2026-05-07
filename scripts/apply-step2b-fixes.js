#!/usr/bin/env node
/**
 * Step 2b: apply user-approved decisions from the AI review.
 *
 *   1. EN: normalize to UK English spelling.
 *   2. ES: permiso de residencia → permiso de estadía (LatAm preference per glossary).
 *
 * The ES register flip (tú → usted) is too nuanced for string replacement and
 * is handled by parallel translation subagents instead — see spawn step.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

// ─── EN: US → UK spelling normalization ────────────────────────────────────
// Source: AI review S-3. Recommended UK to align with parent site sospermesso.it.
const EN_UK_REPLACEMENTS = [
  // -or → -our
  ['labor exploitation', 'labour exploitation'],
  ['Labor exploitation', 'Labour exploitation'],
  ['labor consultants', 'labour consultants'],
  ['Labor consultants', 'Labour consultants'],
  // generic labor → labour (catches stragglers like "labor inspector")
  [' labor ', ' labour '],
  // -ize → -ise
  ['organization', 'organisation'],
  ['Organization', 'Organisation'],
  ['organizations', 'organisations'],
  ['Organizations', 'Organisations'],
  ['authorize', 'authorise'],
  ['authorized', 'authorised'],
  ['Authorized', 'Authorised'],
  ['authorizes', 'authorises'],
  ['authorizing', 'authorising'],
  ['authorization', 'authorisation'],
  ['Authorization', 'Authorisation'],
  ['recognize', 'recognise'],
  ['recognized', 'recognised'],
  ['recognizes', 'recognises'],
  ['recognition', 'recognition'], // same in both — keep for consistency hint
  ['specialize', 'specialise'],
  ['specialized', 'specialised'],
  ['specializes', 'specialises'],
  ['specializing', 'specialising'],
  ['specialization', 'specialisation'],
  ['Specialization', 'Specialisation'],
  ['utilize', 'utilise'],
  ['utilized', 'utilised'],
  // -ll-: enrollment → enrolment, fulfill → fulfil
  ['enrollment', 'enrolment'],
  ['Enrollment', 'Enrolment'],
  ['enrollments', 'enrolments'],
  // program → programme (when meaning a course/scheme; not computer program)
  // App context is courses/permits → safe to flip globally.
  ['university program', 'university programme'],
  ['educational program', 'educational programme'],
  ['training program', 'training programme'],
  ['integration program', 'integration programme'],
  // primary care doctor → general practitioner
  ['primary care doctor', 'general practitioner'],
];

// ─── ES: permiso de residencia → permiso de estadía (S-1) ──────────────────
// Per glossary (Cynthia Chavez) + AI review S-1. ~200 entries.
const ES_RESIDENCIA_REPLACEMENTS = [
  ['permiso de residencia', 'permiso de estadía'],
  ['Permiso de residencia', 'Permiso de estadía'],
  ['Permiso de Residencia', 'Permiso de Estadía'],
  ['permisos de residencia', 'permisos de estadía'],
  ['Permisos de residencia', 'Permisos de estadía'],
];

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

function processLang(lang, replacements, label) {
  const file = path.join(ROOT, 'translations', `${lang}.json`);
  const orig = fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(orig);
  console.log(`\n=== ${lang.toUpperCase()} (${label}) ===`);
  applyReplacements(obj, replacements, `replacements`);
  const out = JSON.stringify(obj, null, 2) + '\n';
  if (DRY) {
    console.log(`  [dry-run] would write ${file}`);
    return;
  }
  if (out === orig) {
    console.log(`  no changes`);
    return;
  }
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, out, 'utf-8');
  fs.renameSync(tmp, file);
  console.log(`  → wrote ${file}`);
}

processLang('en', EN_UK_REPLACEMENTS, 'US → UK English');
processLang('es', ES_RESIDENCIA_REPLACEMENTS, 'permiso de residencia → permiso de estadía');

if (DRY) console.log('\n[dry-run mode] no files written');
