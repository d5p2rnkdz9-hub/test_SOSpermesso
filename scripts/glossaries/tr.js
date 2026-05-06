/**
 * TR (Turkish) translation glossary for review-translations.js
 *
 * register: the formal/informal pronoun pair to check for consistency.
 * badTerms: known wrong translations { wrong, correct, source }.
 * preservedTerms: Italian/bureaucratic terms that must NOT be translated.
 * artifactPatterns: additional regex patterns beyond the global defaults.
 */

module.exports = {
  // Turkish uses pronoun-based formality. Site should use formal "siz" throughout.
  register: {
    formal: 'siz',
    informal: 'sen',
  },

  badTerms: [
    {
      wrong: 'Akış vizesi',
      correct: 'Decreto Flussi vizesi',
      source: 'Decreto Flussi',
      note: 'literal translation of "Decreto Flussi" — must keep Italian term',
    },
    {
      wrong: 'akış vizesi',
      correct: 'Decreto Flussi vizesi',
      source: 'Decreto Flussi',
      note: 'literal translation of "Decreto Flussi" — must keep Italian term',
    },
    {
      wrong: 'Aile uyumu',
      correct: 'Aile bütünlüğü',
      source: 'coesione familiare',
      note: '"uyum" means harmony, not cohesion — wrong translation of "coesione familiare"',
    },
    {
      wrong: 'aile uyumu',
      correct: 'aile bütünlüğü',
      source: 'coesione familiare',
      note: '"uyum" means harmony, not cohesion — wrong translation of "coesione familiare"',
    },
    {
      wrong: 'Statik İtalyan vatandaşları',
      correct: 'Başka bir AB ülkesinde yaşamamış İtalyan vatandaşları',
      source: 'cittadini italiani statici',
      note: 'Italian legal jargon "statico/dinamico" borrowed literally — meaningless in Turkish',
    },
    {
      wrong: 'Dinamik İtalyan vatandaşları',
      correct: 'Başka bir AB ülkesinde yaşamış İtalyan vatandaşları',
      source: 'cittadini italiani dinamici',
      note: 'Italian legal jargon "statico/dinamico" borrowed literally — meaningless in Turkish',
    },
    {
      wrong: 'statik vatandaş',
      correct: 'Başka bir AB ülkesinde yaşamamış vatandaş',
      source: 'cittadino statico',
      note: 'Italian legal jargon borrowed literally — meaningless in Turkish',
    },
    {
      wrong: 'dinamik vatandaş',
      correct: 'Başka bir AB ülkesinde yaşamış vatandaş',
      source: 'cittadino dinamico',
      note: 'Italian legal jargon borrowed literally — meaningless in Turkish',
    },
    {
      wrong: 'posta kiti',
      correct: 'Kit postale',
      source: 'Kit postale',
      note: 'Italian term must be preserved — "posta kiti" is a back-translation',
      preservedViolation: true,
    },
    {
      wrong: 'Posta kiti',
      correct: 'Kit postale',
      source: 'Kit postale',
      note: 'Italian term must be preserved — "Posta kiti" is a back-translation',
      preservedViolation: true,
    },
    {
      wrong: 'Akış kararnamesi',
      correct: 'Decreto Flussi',
      source: 'Decreto Flussi',
      note: 'literal translation of decree name — must keep Italian proper name',
    },
    {
      wrong: 'akış kararnamesi',
      correct: 'Decreto Flussi',
      source: 'Decreto Flussi',
      note: 'literal translation of decree name — must keep Italian proper name',
    },
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
    'C3',
    'Sportello Unico',
  ],

  // Turkish-specific incomplete sentence patterns (in addition to global defaults).
  // These catch dangling clauses common in AI-generated Turkish.
  incompleteSentencePatterns: [
    {
      re: /[A-ZÇĞİÖŞÜa-zçğışöşü]{3,}(den|dan|ten|tan)\s*\./g,
      label: 'sentence ends with ablative suffix (-den/-dan/-ten/-tan) — likely missing main verb',
    },
    {
      re: /[A-ZÇĞİÖŞÜa-zçğışöşü]{3,}(arak|erek)\s*\./g,
      label: 'sentence ends with -arak/-erek (converb) — incomplete structure',
    },
    {
      re: /[A-ZÇĞİÖŞÜa-zçğışöşü]{3,}(mek|mak|mek için|mak için)\s*\./g,
      label: 'sentence ends with infinitive (-mek/-mak) — likely missing main clause',
    },
    {
      re: /Talep etmek\s*:/gi,
      label: '"Talep etmek:" — infinitive used as heading, unnatural Turkish',
    },
  ],

  // No extra artifact patterns beyond global defaults for Turkish.
  artifactPatterns: [],
};
