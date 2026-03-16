/**
 * Bidirectional mapping between URL slugs and conversione tree result node IDs.
 *
 * Same pattern as outcome-slugs.ts but for the conversione (permit conversion) tree.
 * Used for /outcome/conversione/[slug] routes.
 */

/** Forward map: slug -> nodeId */
export const CONVERSIONE_OUTCOME_SLUGS: Record<string, string> = {
  'lavoro-possibile': 'c_end_lav_ok',
  'lavoro-impossibile': 'c_end_lav_no',
  'lavoro-speciale': 'c_end_lav_speciale',
  'lavoro-cure-mediche': 'c_end_lav_cure',
  'lavoro-calamita': 'c_end_lav_calam',
  'lavoro-minore': 'c_end_lav_minore',
  'attesa-occupazione-possibile': 'c_end_att_ok',
  'attesa-occupazione-impossibile': 'c_end_att_no',
  'attesa-occupazione-asilo': 'c_end_att_asilo',
  'attesa-occupazione-incerta': 'c_end_att_incerta',
  'attesa-occupazione-minore': 'c_end_att_minore',
  'studio-possibile': 'c_end_stu_ok',
  'studio-impossibile': 'c_end_stu_no',
  'studio-minore': 'c_end_stu_minore',
  'studio-speciale': 'c_end_stu_speciale',
  'famiglia-possibile': 'c_end_fam_ok',
  'famiglia-oltre-anno': 'c_end_fam_anno',
  'carta-possibile': 'c_end_carta_ok',
  'carta-assistenza-minori': 'c_end_carta_minori',
  'carta-impossibile': 'c_end_carta_no',
  'permesso-scaduto': 'c_end_scaduto',
  'situazione-complicata': 'c_end_complicata',
};

/** Reverse map: nodeId -> slug */
export const CONVERSIONE_NODE_TO_SLUG: Record<string, string> =
  Object.fromEntries(
    Object.entries(CONVERSIONE_OUTCOME_SLUGS).map(([slug, nodeId]) => [
      nodeId,
      slug,
    ]),
  );

/** Get node ID from slug, or undefined if slug is unknown */
export function getConversioneNodeIdFromSlug(
  slug: string,
): string | undefined {
  return CONVERSIONE_OUTCOME_SLUGS[slug];
}

/** Get slug from node ID, or undefined if nodeId has no mapping */
export function getConversioneSlugFromNodeId(
  nodeId: string,
): string | undefined {
  return CONVERSIONE_NODE_TO_SLUG[nodeId];
}
