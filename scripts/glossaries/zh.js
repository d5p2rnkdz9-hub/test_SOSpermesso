/**
 * ZH (Chinese Simplified) translation glossary for review-translations.js
 *
 * register: Chinese doesn't have a formal/informal register distinction
 *           like European languages. No register check needed.
 * badTerms: known wrong translations { wrong, correct, source }.
 * preservedTerms: Italian/bureaucratic terms that must NOT be translated.
 * artifactPatterns: additional regex patterns beyond the global defaults.
 */

module.exports = {
  // Chinese doesn't have formal/informal register distinction.
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

  // Chinese-specific incomplete sentence patterns.
  incompleteSentencePatterns: [],

  // Chinese-specific artifact patterns.
  artifactPatterns: [],
};
