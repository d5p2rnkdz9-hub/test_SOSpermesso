/**
 * Runtime variable substitution and dictionary auto-linking for decision tree text.
 */

const DIZIONARIO_BASE = 'https://www.sospermesso.it/dizionario';

/** Dictionary terms → anchor IDs, sorted longest-first to avoid partial matches */
const DICTIONARY_TERMS: [string, string][] = [
  ['minore straniero non accompagnato', 'minore-straniero-non-accompagnato'],
  ['ricongiungimento familiare', 'ricongiungimento-familiare'],
  ['protezione internazionale', 'protezione-internazionale'],
  ['prosieguo amministrativo', 'prosieguo-amministrativo'],
  ['dichiarazione di ospitalità', 'dichiarazione-di-ospitalita'],
  ['tribunale per i minorenni', 'tribunale-per-i-minorenni'],
  // 'permesso di soggiorno' excluded — too generic, appears everywhere
  ['commissione territoriale', 'commissione-territoriale'],
  ['idoneità alloggiativa', 'idoneita-alloggiativa'],
  ['coesione familiare', 'coesione-familiare'],
  ['casellario giudiziale', 'casellario-giudiziale'],
  ['cessione di fabbricato', 'cessione-di-fabbricato'],
  ['status di rifugiato', 'status-di-rifugiato'],
  ['tessera sanitaria', 'tessera-sanitaria'],
  ['attestato nominativo', 'attestato-nominativo'],
  ['carta di soggiorno', 'carta-di-soggiorno'],
  ['carichi pendenti', 'carichi-pendenti'],
  ['codice fiscale', 'codice-fiscale'],
  ['sportello unico', 'sportello-unico'],
  ['servizi sociali', 'servizi-sociali'],
  ['copia conforme', 'copia-conforme'],
  ['unione civile', 'unione-civile'],
  ['marca da bollo', 'marca-da-bollo'],
  ['kit postale', 'kit-postale'],
  ['accoglienza', 'accoglienza'],
  ['affidamento', 'affidamento'],
  // 'conversione' excluded — too generic, appears everywhere in conversione tree
  ['prefettura', 'prefettura'],
  ['nulla osta', 'nulla-osta'],
  ['rifugiato', 'rifugiato'],
  ['domicilio', 'domicilio'],
  ['residenza', 'residenza'],
  ['tribunale', 'tribunale'],
  ['ricevuta', 'ricevuta'],
  ['questura', 'questura'],
  ['diniego', 'diniego'],
  ['rinnovo', 'rinnovo'],
  ['a carico', 'a-carico'],
  ['coniuge', 'coniuge'],
  ['udienza', 'udienza'],
  ['minore', 'minore'],
  ['tutore', 'tutore'],
  ['asilo', 'asilo'],
  ['visto', 'visto'],
  ['asl', 'asl'],
  ['c3', 'c3'],
];

/**
 * Links the first occurrence of each dictionary term in text.
 * Skips terms already inside markdown links [...](...).
 */
function linkDictionaryTerms(text: string): string {
  const linked = new Set<string>();

  for (const [term, anchor] of DICTIONARY_TERMS) {
    if (linked.has(anchor)) continue;

    // Case-insensitive match, word boundary, not already inside a markdown link
    const regex = new RegExp(`(?<![\\[\\(])\\b(${term})\\b(?![\\]\\)])`, 'i');
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      // Check we're not inside a markdown link by looking for unbalanced [ before match
      const before = text.slice(0, match.index);
      const openBrackets = (before.match(/\[/g) || []).length;
      const closeBrackets = (before.match(/\]/g) || []).length;
      if (openBrackets > closeBrackets) continue; // inside a link

      const url = `${DIZIONARIO_BASE}#${anchor}`;
      text = text.slice(0, match.index)
        + `[${match[1]}](${url})`
        + text.slice(match.index + match[0].length);
      linked.add(anchor);
    }
  }

  return text;
}

/** Maps min_parenti optionKey → display label for [Parente selezionato] */
const RELATIVE_LABEL_MAP: Record<string, string> = {
  fratello: 'fratello/sorella',
  nonno: 'nonno/nonna',
  zio: 'zio/zia',
  cugino: 'cugino/a',
  prozio: 'fratello/sorella del nonno',
};

/** Maps famiglia_start optionKey → display label (fallback for non-minor paths) */
const FAMILY_START_LABEL_MAP: Record<string, string> = {
  coniuge: 'marito/moglie',
  figlio: 'figlio/a',
  genitore: 'genitore',
  nonno_fratello: 'nonno/a o fratello/sorella',
  figlio_del_figlio: 'nipote',
};

/**
 * Derives the selected relative label from answers.
 * Checks min_parenti first, then falls back to famiglia_start.
 * Returns the mapped label, or an empty string if no relative was selected.
 */
export function getSelectedRelative(
  answers: Record<string, string>,
): string {
  const minParenti = answers['min_parenti'];
  if (minParenti) return RELATIVE_LABEL_MAP[minParenti] ?? '';

  const famigliaStart = answers['famiglia_start'];
  if (famigliaStart) return FAMILY_START_LABEL_MAP[famigliaStart] ?? '';

  return '';
}

/** Maps c_quale_hai optionKey → Italian display label for [PermessoAttuale] */
const CURRENT_PERMIT_LABELS: Record<string, string> = {
  lav_sub: 'lavoro subordinato',
  lav_aut: 'lavoro autonomo',
  famiglia: 'motivi familiari',
  studio: 'studio',
  att_occ: 'attesa occupazione',
  prot_suss: 'protezione sussidiaria',
  asilo: 'asilo',
  prot_spec: 'protezione speciale',
  minore: 'minore età',
  rich_asilo: 'richiesta asilo',
  stagionale: 'lavoro stagionale',
  ass_minori: 'assistenza minori',
  calamita: 'calamità naturale',
  cure: 'cure mediche',
  sport_art: 'attività sportiva',
  cittadinanza: 'cittadinanza',
  res_elett: 'residenza elettiva',
  religiosi: 'motivi religiosi',
  ricerca: 'ricerca scientifica',
  sfruttamento: 'sfruttamento lavorativo',
  prot_sociale: 'protezione sociale',
  generico: 'altro permesso',
};

/** Maps c_vorresti_* answer optionKey → Italian display label for [PermessoTarget] */
const TARGET_PERMIT_LABELS: Record<string, string> = {
  lavoro: 'lavoro',
  lav_sub: 'lavoro subordinato',
  lav_aut: 'lavoro autonomo',
  att_occ: 'attesa occupazione',
  studio: 'studio',
  famiglia: 'motivi familiari',
  carta_ue: 'Carta UE per soggiornanti di lungo periodo',
  altro: 'altro permesso',
};

/** Derives current permit label from conversione answers. */
function getCurrentPermit(answers: Record<string, string>): string {
  const key = answers['c_quale_hai'];
  return key ? (CURRENT_PERMIT_LABELS[key] ?? '') : '';
}

/** Derives target permit label from conversione answers. */
function getTargetPermit(answers: Record<string, string>): string {
  // Find the c_vorresti_* or c_scaduto_vorresti answer
  for (const [nodeId, optionKey] of Object.entries(answers)) {
    if (nodeId.startsWith('c_vorresti_') || nodeId === 'c_scaduto_vorresti') {
      return TARGET_PERMIT_LABELS[optionKey] ?? '';
    }
  }
  return '';
}

/** Derives permit validity status label from rinnovo-conversione answers. */
function getValidityStatus(answers: Record<string, string>): string {
  const validity = answers['r_valid_check'];
  if (validity === 'valido') return 'è ancora valido';
  if (validity === 'scaduto') {
    const expiry = answers['r_scad_check'];
    if (expiry === 'meno_60') return 'è scaduto da meno di 60 giorni';
  }
  return '';
}

/**
 * Replaces placeholders in tree text with actual values.
 *
 * - [Parente selezionato] → derived from answers via getSelectedRelative
 * - [StatoPermesso] → derived from rinnovo validity answers
 */
export function substituteVariables(
  text: string,
  userName: string | null,
  answers: Record<string, string>,
): string {
  const relative = getSelectedRelative(answers);
  const validityStatus = getValidityStatus(answers);
  const currentPermit = getCurrentPermit(answers);
  const targetPermit = getTargetPermit(answers);

  let result = text
    .replace(/\[Parente selezionato\]/g, relative)
    .replace(/\[StatoPermesso\]\s*/g, validityStatus ? `${validityStatus} ` : '')
    .replace(/\[PermessoAttuale\]/g, currentPermit)
    .replace(/\[PermessoTarget\]/g, targetPermit);

  // Collapse any double spaces left after empty substitutions
  return result.replace(/ {2,}/g, ' ').trim();
}

/**
 * Applies dictionary auto-linking to text.
 * Call this only on content that goes through a markdown renderer (e.g. FaqAccordion).
 * Do NOT use on plain text (e.g. question titles).
 */
export function withDictionaryLinks(text: string): string {
  return linkDictionaryTerms(text);
}
