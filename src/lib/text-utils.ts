/**
 * Runtime variable substitution for decision tree text.
 *
 * Runtime variable substitution for decision tree text.
 */

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
