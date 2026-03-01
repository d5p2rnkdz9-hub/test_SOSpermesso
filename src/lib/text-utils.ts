/**
 * Runtime variable substitution for decision tree text.
 *
 * Replaces [Nome] and [Parente selezionato] placeholders with actual values.
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

/**
 * Replaces [Nome] and [Parente selezionato] placeholders in text.
 *
 * - [Nome] → userName, or empty string if null
 * - [Parente selezionato] → derived from answers via getSelectedRelative
 */
export function substituteVariables(
  text: string,
  userName: string | null,
  answers: Record<string, string>,
): string {
  const name = userName ?? '';
  const relative = getSelectedRelative(answers);

  return text
    .replace(/\[Nome\]/g, name)
    .replace(/\[Parente selezionato\]/g, relative);
}
