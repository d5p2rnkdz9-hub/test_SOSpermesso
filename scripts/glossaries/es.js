/**
 * ES (Spanish) translation glossary for review-translations.js
 * Updated with translator feedback (Cynthia Chavez Guillen, 2026-03-25)
 * Target audience: Latin American Spanish speakers
 */

module.exports = {
  // Spanish site uses tú (informal) consistently — but avoid overly blunt imperatives
  register: {
    formal: 'usted',
    informal: 'tú',
  },

  badTerms: [
    // Core terminology — LatAm preference over Peninsular Spanish
    { wrong: 'permiso de estancia', correct: 'permiso de estadía', source: 'translator-review', note: 'estancia is Peninsular Spanish; estadía is more common in Latin America' },
    { wrong: 'permisos de estancia', correct: 'permisos de estadía', source: 'translator-review', note: 'plural form' },
    { wrong: 'de estancia', correct: 'de estadía', source: 'translator-review', note: 'catch-all for "de estancia" in various contexts' },
    { wrong: 'Reagrupación familiar', correct: 'Reunificación familiar', source: 'translator-review', note: 'reunificación is more widely used in LatAm' },
    { wrong: 'reagrupación familiar', correct: 'reunificación familiar', source: 'translator-review', note: 'lowercase form' },

    // Bureaucratic terms — avoid literal Italian translations
    { wrong: 'Jefatura de Policía', correct: 'Oficina de extranjería/migraciones', source: 'translator-review', note: 'Questura should be described as immigration office, not police HQ' },
    { wrong: 'jefatura de policía', correct: 'oficina de extranjería/migraciones', source: 'translator-review', note: 'lowercase form' },
    { wrong: 'Oficina postal habilitada', correct: 'Oficina de Correos habilitada (Poste Italiane)', source: 'translator-review', note: 'add Poste Italiane reference' },
    { wrong: 'oficina postal habilitada', correct: 'oficina de Correos habilitada (Poste Italiane)', source: 'translator-review', note: 'lowercase form' },
    { wrong: 'decreto anual de cuotas de inmigración', correct: 'Decreto de flujos de entrada anuales (Decreto Flussi)', source: 'translator-review', note: 'keep Italian term in parentheses — LatAm users know it as Decreto Flussi' },
    { wrong: 'Decreto flujos anual', correct: 'Decreto de flujos de entrada anuales (Decreto Flussi)', source: 'translator-review', note: 'too literal' },

    // Document/financial terms
    { wrong: 'documentos requeridos', correct: 'documentos necesarios', source: 'translator-review', note: 'more natural in LatAm Spanish' },
    { wrong: 'Documentos requeridos', correct: 'Documentos necesarios', source: 'translator-review', note: 'capitalized form' },
    { wrong: 'Extracto de cuenta bancaria', correct: 'Estado de cuenta', source: 'translator-review', note: 'extracto is too technical; estado de cuenta is standard LatAm' },
    { wrong: 'extracto de cuenta bancaria', correct: 'estado de cuenta', source: 'translator-review', note: 'lowercase form' },
    { wrong: 'Declaración de hospitalidad', correct: 'Declaración/constancia de hospedaje', source: 'translator-review', note: 'hospitalidad is a literal translation from Italian' },
    { wrong: 'declaración de hospitalidad', correct: 'declaración/constancia de hospedaje', source: 'translator-review', note: 'lowercase form' },
    { wrong: 'Caducado', correct: 'Vencido', source: 'translator-review', note: 'caducado is Peninsular; vencido is more universal in LatAm' },
    { wrong: 'caducado', correct: 'vencido', source: 'translator-review', note: 'lowercase form' },

    // Visa terminology
    { wrong: 'con visado', correct: 'con visa', source: 'translator-review', note: 'visado is Peninsular; visa is LatAm standard' },
    { wrong: 'el visado', correct: 'la visa', source: 'translator-review', note: 'gender change too — visa is feminine in LatAm' },
    { wrong: 'un visado', correct: 'una visa', source: 'translator-review', note: 'gender change' },

    // Navigation/UI text
    { wrong: 'Haz nuestro test', correct: 'Realiza nuestro test', source: 'translator-review', note: 'Haz is too blunt/informal' },
    { wrong: 'conversión desde', correct: 'conversión a partir de', source: 'translator-review', note: 'more natural phrasing' },
    { wrong: 'Conversión desde', correct: 'Conversión a partir de', source: 'translator-review', note: 'capitalized form' },

    // Legal/assistance terms
    { wrong: 'Asistencia legal', correct: 'Asesoría legal', source: 'translator-review', note: 'asesoría is more common in LatAm for legal aid' },
    { wrong: 'asistencia legal', correct: 'asesoría legal', source: 'translator-review', note: 'lowercase form' },

    // Insurance
    { wrong: 'Póliza de seguro', correct: 'Seguro de salud', source: 'translator-review', note: 'póliza de seguro is redundant; seguro de salud is clearer for health coverage context' },
    { wrong: 'póliza de seguro', correct: 'seguro de salud', source: 'translator-review', note: 'lowercase form' },
  ],

  // These Italian/bureaucratic terms should appear verbatim in Spanish translations.
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
    'Poste Italiane',
  ],

  incompleteSentencePatterns: [],
  artifactPatterns: [],
};
