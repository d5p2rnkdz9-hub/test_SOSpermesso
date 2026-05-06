/**
 * AR (Arabic) translation glossary for review-translations.js
 *
 * Updated based on professional translator review (2026-04).
 *
 * Key principle: Italian terms must NOT appear bare in Arabic text.
 * They should be replaced with Arabic equivalents, with the Italian
 * term optionally in parentheses for reference.
 *
 * register: Arabic doesn't have formal/informal pronoun split.
 * badTerms: known wrong translations { wrong, correct, source }.
 * preservedTerms: Italian terms that may appear in parentheses only.
 * artifactPatterns: regex patterns for automated checks.
 */

module.exports = {
  register: null,

  badTerms: [
    // === HYBRID STRUCTURES (bare Italian in Arabic text) ===
    // These are the #1 issue found by the professional translator.
    {
      wrong: 'Soggiorno di Permesso',
      correct: 'تصريح الإقامة',
      source: 'hybrid structure',
      note: 'reversed Italian term left untranslated — must be Arabic',
    },
    {
      wrong: 'contrato',
      correct: 'contratto',
      source: 'spelling error',
      note: 'Italian spelling error: missing double t',
    },

    // === WRONG ARABIC TRANSLATIONS ===
    {
      wrong: 'مرسوم التدفقات',
      correct: 'نظام تدفقات العمالة (Decreto Flussi)',
      source: 'Decreto Flussi',
      note: 'literal translation — use Arabic description + Italian in parentheses',
    },
    {
      wrong: 'طقم البريد',
      correct: 'طلب البريد (Kit Postale)',
      source: 'Kit Postale',
      note: 'back-translation — use Arabic description + Italian in parentheses',
    },
    {
      wrong: 'تصريح عدم ممانعة',
      correct: 'تصريح العمل المسبق (Nulla Osta)',
      source: 'Nulla Osta',
      note: 'Arabic translation + Italian in parentheses',
    },
    {
      wrong: 'النافذة الواحدة',
      correct: 'مكتب الهجرة الموحد (Sportello Unico)',
      source: 'Sportello Unico',
      note: 'literal translation — use Arabic description + Italian in parentheses',
    },
    {
      wrong: 'مكتب الشرطة',
      correct: 'مصلحة الشرطة (Questura)',
      source: 'Questura',
      note: 'imprecise — use مصلحة الشرطة + (Questura)',
    },
    {
      wrong: 'الطابع المالي',
      correct: 'طابع ضريبي (Marca da bollo)',
      source: 'marca da bollo',
      note: 'Arabic description + Italian in parentheses',
    },
    {
      wrong: 'مكتب المحافظة',
      correct: 'المحافظة (Prefettura)',
      source: 'Prefettura',
      note: 'Arabic description + Italian in parentheses',
    },

    // === STYLE/REGISTER ISSUES ===
    {
      wrong: 'راسلنا',
      correct: 'تواصل معنا',
      source: 'contact CTA',
      note: 'too direct — use more formal register',
    },
  ],

  // Italian terms that may appear in parentheses only (not bare in text).
  // The automated check flags these ONLY when they appear outside parentheses.
  preservedTerms: [
    'Questura',
    'Prefettura',
    'Questore',
    'Commissione Territoriale',
    'Nulla Osta',
    'Decreto Flussi',
    'Kit Postale',
    'Kit postale',
    'C3',
    'Sportello Unico',
    'Codice Fiscale',
    'SSN',
    'INPS',
    'INAIL',
    'Poste Italiane',
    'Permesso di Soggiorno',
    'Carta di Soggiorno',
    'Carta di soggiorno',
    'Schengen',
  ],

  // Arabic-specific incomplete sentence patterns.
  incompleteSentencePatterns: [
    {
      re: /[،,]\s*\.$/gm,
      label: 'sentence ends with comma then period — likely truncated',
    },
  ],

  // Arabic-specific artifact patterns.
  artifactPatterns: [
    {
      re: /[\u0660-\u0669]/g,
      label: 'Arabic-Indic numeral found — site uses Western numerals (0-9)',
    },
    {
      // Detect bare Italian terms outside parentheses in Arabic text
      re: /(?<!\()(?:Permesso di Soggiorno|Soggiorno di Permesso)(?!\))/gi,
      label: 'bare Italian "Permesso di Soggiorno" — must be replaced with تصريح الإقامة',
    },
    {
      // Detect missing separators (taa marbouta directly followed by Arabic letter)
      re: /ة[\u0627-\u064A]{2,}/g,
      label: 'possible concatenated words (missing space after taa marbouta)',
    },
  ],
};
