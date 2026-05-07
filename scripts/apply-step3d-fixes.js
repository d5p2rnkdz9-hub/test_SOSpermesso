#!/usr/bin/env node
/**
 * Step 3d fixes: BN AI review findings (post-translation review).
 * Applies unambiguous CRITICAL/HIGH/MEDIUM that don't need user judgment.
 *
 * The dominant issue is inter-pass inconsistency (4 parallel translation
 * subagents in Step 1 made different terminology choices). Most fixes
 * normalize to the glossary's preserved-Italian policy.
 *
 * Deferred (need per-entry rewrite or user judgment):
 *   - C-1 (entry 64): "asilo" parenthetical scoping issue — needs nuanced rewrite
 *   - H-6: statico/dinamici jargon — many entries, stylistic
 *   - H-12: servizi sociali multiple renderings — stylistic
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

// ─── BN fixes ──────────────────────────────────────────────────────────────
const BN_REPLACEMENTS = [
  // S-3: Bollettino postale preserve (drop Bengali calques)
  ['ডাক রসিদ', 'Bollettino postale'],
  ['পোস্টাল রসিদ', 'Bollettino postale'],
  // S-4: Tribunale per i Minorenni preserve (drop half-translations)
  // Order matters: longer/more-specific first
  ['নাবালকদের জন্য Tribunale', 'Tribunale per i Minorenni'],
  ['Tribunale নাবালকদের', 'Tribunale per i Minorenni'],
  ['নাবালক Tribunale', 'Tribunale per i Minorenni'],
  // S-2: UE Italian (matches IT source + pass 1 majority)
  // Only when surrounded by Bengali context — but "EU" is short and ambiguous,
  // so be careful. Use word-boundary contexts:
  // " EU " → " UE ", "EU-র" → "UE-র", "EU নাগরিক" → "UE নাগরিক", etc.
  // Safer: replace specific patterns the reviewer listed
  ['EU দীর্ঘমেয়াদী', 'UE দীর্ঘমেয়াদী'],
  ['EU নাগরিক', 'UE নাগরিক'],
  ['EU রাষ্ট্র', 'UE রাষ্ট্র'],
  ['EU দেশ', 'UE দেশ'],
  ['EU-র', 'UE-র'],
  ['EU-এর', 'UE-এর'],
  ['EU অঞ্চল', 'UE অঞ্চল'],
  ['EU পরিবার', 'UE পরিবার'],
  ['EU ছাড়া', 'UE ছাড়া'],
  // S-5: Remove pass-3 editorial " (conversione)" parentheticals
  ['রূপান্তরের (conversione)', 'রূপান্তরের'],
  ['রূপান্তর (conversione)', 'রূপান্তর'],
  // H-8 (entry 671): partita IVA preserve
  ['VAT নম্বর বরাদ্দের', 'partita IVA বরাদ্দের'],
  // H-7 (entry 239): bare Latin "status" mid-phrase
  ['বা status/আশ্রয়', 'বা শরণার্থী মর্যাদা/আশ্রয়'],
];

// S-1 / H-1: `permesso` (অনুমতি) preserve as `Permesso di Soggiorno`.
// 206 occurrences of অনুমতি across the file. Conservative approach:
// only replace when it's clearly the residence-permit sense (most are).
// Replace ALL occurrences — every legal-aid context mention of "permesso"
// in this app refers to a residence permit.
const BN_PERMESSO_REPLACEMENTS = [
  // Specific high-frequency patterns first (these absorb most cases cleanly)
  ['আপনার অনুমতি', 'আপনার Permesso di Soggiorno'],
  ['অন্য ধরনের অনুমতি', 'অন্য ধরনের Permesso di Soggiorno'],
  ['একটি অনুমতি', 'একটি Permesso di Soggiorno'],
  ['কোন অনুমতি', 'কোন Permesso di Soggiorno'],
  ['এই অনুমতি', 'এই Permesso di Soggiorno'],
  ['সেই অনুমতি', 'সেই Permesso di Soggiorno'],
  ['নতুন অনুমতি', 'নতুন Permesso di Soggiorno'],
  ['একই অনুমতি', 'একই Permesso di Soggiorno'],
  ['কোনো অনুমতি', 'কোনো Permesso di Soggiorno'],
  ['উপযুক্ত অনুমতি', 'উপযুক্ত Permesso di Soggiorno'],
  ['বিশেষ অনুমতি', 'বিশেষ Permesso di Soggiorno'],
  ['কর্মসংস্থান অপেক্ষার অনুমতি', 'কর্মসংস্থান অপেক্ষার Permesso di Soggiorno'],
  ['অনুমতিটি', 'Permesso di Soggiorno-টি'],
  ['অনুমতিতে', 'Permesso di Soggiorno-তে'],
  ['অনুমতিকে', 'Permesso di Soggiorno-কে'],
  ['অনুমতির', 'Permesso di Soggiorno-র'],
  ['অনুমতিগুলি', 'Permesso di Soggiorno-গুলি'],
  // Final catch-all for bare cases (after the prefixed forms above absorb
  // their patterns). NOT first because that would prevent the prefix
  // matches from running.
  ['অনুমতি', 'Permesso di Soggiorno'],
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

function processBn() {
  const file = path.join(ROOT, 'translations', 'bn.json');
  const orig = fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(orig);
  console.log('\n=== BN ===');
  applyReplacements(obj, BN_REPLACEMENTS, 'general fixes');
  applyReplacements(obj, BN_PERMESSO_REPLACEMENTS, 'permesso → Permesso di Soggiorno');
  const out = JSON.stringify(obj, null, 2) + '\n';
  if (DRY) { console.log(`  [dry-run] would write ${file}`); return; }
  if (out !== orig) {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, out, 'utf-8');
    fs.renameSync(tmp, file);
    console.log(`  → wrote ${file}`);
  }
}

processBn();
if (DRY) console.log('\n[dry-run mode] no files written');
