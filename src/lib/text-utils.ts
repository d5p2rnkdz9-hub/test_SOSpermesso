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

/**
 * Derives the selected relative label from the min_parenti answer.
 * Returns the mapped label, or an empty string if no relative was selected.
 */
export function getSelectedRelative(
  answers: Record<string, string>,
): string {
  const optionKey = answers['min_parenti'];
  if (!optionKey) return '';
  return RELATIVE_LABEL_MAP[optionKey] ?? '';
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
