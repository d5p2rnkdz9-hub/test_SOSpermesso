/**
 * FA (Farsi) translation glossary for review-translations.js
 *
 * register: Farsi has formal/informal (شما/تو) but null for now —
 *           register check can be enabled once the preferred form is decided.
 * badTerms: known wrong translations { wrong, correct, source }.
 * preservedTerms: Italian/bureaucratic terms that must NOT be translated.
 * artifactPatterns: additional regex patterns beyond the global defaults.
 */

module.exports = {
  // Farsi has formal/informal (شما/تو) but null for now.
  register: null,

  badTerms: [
    // Add known mistranslations as they're found during review
  ],

  // These Italian/bureaucratic terms should appear verbatim in the translation.
  preservedTerms: [
    'Questura',
    'Prefettura',
    'Questore',
    'Commissione Territoriale',
    'Nulla osta',
    'Decreto Flussi',
    'Kit postale',
    'Sportello Unico',
    'C3',
    'marca da bollo',
    'bollettino postale',
    'permesso di soggiorno',
    'carta di soggiorno',
    'MSNA',
  ],

  // Farsi-specific incomplete sentence patterns.
  incompleteSentencePatterns: [],

  // Farsi-specific artifact patterns.
  artifactPatterns: [],
};
