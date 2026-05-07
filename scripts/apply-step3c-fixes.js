#!/usr/bin/env node
/**
 * Step 3c fixes: UR + ZH AI review findings.
 * Applies unambiguous CRITICAL/HIGH that don't need user judgment.
 *
 * Deferred (need user decisions):
 *   - UR S-1 / ZH S-3: `permesso di soggiorno` translated rather than preserved.
 *     Same project-level decision as FA — needs explicit choice.
 *   - UR H-9: Entry 484 legal ambiguity (5 years from request vs recognition) — legal team verify.
 *   - UR H-1: bare Questura at sentence-start — stylistic, many entries.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

// ─── ZH fixes ──────────────────────────────────────────────────────────────
const ZH_REPLACEMENTS = [
  // C-1 / S-2: protezione sussidiaria — UNHCR/EU PRC standard
  ['附属保护', '辅助保护'],
  // S-4 / H-3: Tribunale per i Minorenni preserve
  ['少年法院', 'Tribunale per i Minorenni'],
  // H-4: ricorso = petition, not appeal (entry 478)
  ['提交新的上诉', '提交新的诉讼'],
  // H-5: assistenza minori standardization
  ['未成年人协助', '未成年人照护'],
  // H-6: "non ha senso" calque
  ['没有意义', '没有必要'],
  // H-8: Direzione Generale dell'Immigrazione preserve (entry 674)
  ['部级理事会根据第32条', "Direzione Generale dell'Immigrazione 根据第32条"],
  // M-14: bare bollettino → bollettino postale
  ['bollettino 为', 'bollettino postale 为'],
];

// ZH halfwidth → fullwidth punctuation in CJK-dominant entries (S-1, ~180 entries)
function fullwidthZhPunctuation(obj) {
  let totalEdits = 0;
  let entriesTouched = 0;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const cjkCount = (v.match(/[一-鿿]/g) || []).length;
    if (cjkCount < 5) continue;  // skip non-Chinese-dominant entries
    let out = v;
    let before = out;
    // Replace ASCII punct adjacent to CJK with fullwidth equivalents.
    // Use lookbehind/lookahead so URLs and Latin-only segments are untouched.
    out = out.replace(/,(?=[一-鿿])/g, '，');
    out = out.replace(/(?<=[一-鿿])\?/g, '？');
    // Colon after CJK but not part of URL (`://`)
    out = out.replace(/(?<=[一-鿿]):(?!\/\/)/g, '：');
    out = out.replace(/;(?=[一-鿿])/g, '；');
    out = out.replace(/(?<=[一-鿿])!/g, '！');
    // Open paren CJK-CJK
    out = out.replace(/(?<=[一-鿿])\((?=[一-鿿])/g, '（');
    // Close paren after CJK
    out = out.replace(/(?<=[一-鿿])\)/g, '）');
    if (out !== before) {
      const diffs = [...before].filter((c, i) => c !== out[i]).length;
      totalEdits += diffs;
      entriesTouched++;
      obj[k] = out;
    }
  }
  console.log(`  punctuation fullwidth (S-1): touched ${entriesTouched} entries`);
}

// ─── UR fixes ──────────────────────────────────────────────────────────────
const UR_REPLACEMENTS = [
  // H-4: calque "in the wrong place"
  ['آپ غلط جگہ پر ہیں', 'یہ سیکشن آپ کے لیے نہیں ہے'],
  // H-5: per capirci calque
  ['وضاحت کے لیے:', 'یعنی:'],
  // H-7: unione civile preserve
  ['سول یونین', 'unione civile'],
  // H-8: partner — شراکت دار = business partner; use ساتھی for life partner
  ['شوہر / بیوی / شراکت دار', 'شوہر / بیوی / ساتھی'],
  // S-6: degraded template in batches 19-20 (entries 542, 547, 550, 555, 562)
  [
    'اور تجدید کیا جا سکتا ہے۔ آپ خود بھی کر سکتے ہیں، لیکن قانونی رائے لینا ہمیشہ مشورہ ہے۔',
    'اور اس کی تجدید کی جا سکتی ہے۔ آپ خود کر سکتے ہیں، لیکن قانونی رائے لینا ہمیشہ تجویز کیا جاتا ہے۔',
  ],
  // H-6: assegno di invalidità as English-loan الاؤنس → Urdu وظیفہ + IT preserve
  [
    'اگر آپ کو معذوری کا الاؤنس ملتا ہے',
    'اگر آپ کو معذوری کا وظیفہ (assegno di invalidità) ملتا ہے',
  ],
];

// UR C-1: RTL arrow direction inversion in conversion labels
// Pattern: entries starting with a permit-name-then-arrow-then-other-permit
// pattern. Replace ` → ` with ` سے ` (from) so reading flows naturally in RTL.
function fixUrArrowDirection(obj) {
  let count = 0;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    // Only target conversion-label entries: contain `میں تبدیلی` (= "into change") and arrow
    if (v.includes(' → ') && v.includes('میں تبدیلی')) {
      obj[k] = v.replace(/ → /g, ' سے ');
      count++;
    }
  }
  console.log(`  RTL arrow direction (C-1): rewrote ${count} conversion labels`);
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

function processZh() {
  const file = path.join(ROOT, 'translations', 'zh.json');
  const orig = fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(orig);
  console.log('\n=== ZH ===');
  applyReplacements(obj, ZH_REPLACEMENTS, 'replacements');
  fullwidthZhPunctuation(obj);
  const out = JSON.stringify(obj, null, 2) + '\n';
  if (DRY) { console.log(`  [dry-run] would write ${file}`); return; }
  if (out !== orig) {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, out, 'utf-8');
    fs.renameSync(tmp, file);
    console.log(`  → wrote ${file}`);
  }
}

function processUr() {
  const file = path.join(ROOT, 'translations', 'ur.json');
  const orig = fs.readFileSync(file, 'utf-8');
  const obj = JSON.parse(orig);
  console.log('\n=== UR ===');
  applyReplacements(obj, UR_REPLACEMENTS, 'replacements');
  fixUrArrowDirection(obj);
  const out = JSON.stringify(obj, null, 2) + '\n';
  if (DRY) { console.log(`  [dry-run] would write ${file}`); return; }
  if (out !== orig) {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, out, 'utf-8');
    fs.renameSync(tmp, file);
    console.log(`  → wrote ${file}`);
  }
}

processZh();
processUr();
if (DRY) console.log('\n[dry-run mode] no files written');
