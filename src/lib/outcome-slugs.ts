/**
 * Bidirectional mapping between URL slugs and tree result node IDs.
 *
 * Every result node in tree-data.ts has a corresponding slug for stable,
 * human-readable outcome page URLs (e.g. /it/outcome/protezione-internazionale).
 *
 * Slugs are manually assigned to survive tree restructuring without breaking URLs.
 */

/** Forward map: slug -> nodeId */
export const OUTCOME_SLUGS: Record<string, string> = {
  'cittadino-ue': 'end_ue',
  'protezione-internazionale': 'end_asilo',
  'calamita-naturale': 'end_calam',
  'sfruttamento-lavorativo': 'end_sfrut',
  'vittime-tratta': 'end_tratta',
  'violenza-domestica': 'end_viol',
  'cure-mediche': 'end_cure_salute',
  'cure-mediche-gravidanza': 'end_cure_gravidanza',
  'cittadinanza': 'end_citt',
  'nessun-permesso': 'end_neg_gen',
  'famiglia-minore': 'end_min_fam',
  'art-19-familiare-italiano': 'end_art19',
  'minore-affidato': 'end_aff',
  'minore-non-accompagnato': 'end_msna',
  'art-30-genitore-minore-italiano': 'end_art30',
  'famit-coniuge-italiano': 'end_famit',
  'zambrano': 'end_zamb',
  'carta-familiare-ue': 'end_carta_ue',
  'art-31-assistenza-minore': 'end_art31',
  'genitore-a-carico': 'end_art30_gen',
  'famiglia-genitore': 'end_famit_gen',
  'famiglia-incerto': 'end_fam_inc',
  'famiglia-invalido': 'end_fam_inv',
  'residenza-elettiva': 'end_res_el',
  'parente-lontano': 'end_neg_par',
  'partner-convivente': 'end_famit_part',
  'coniuge-rifugiato': 'end_con_rif',
  'coniuge-lungosoggiornante': 'end_carta_con',
  'conversione-famiglia': 'end_conv_fam',
  'conversione-famiglia-negativa': 'end_conv_neg',
};

/** Reverse map: nodeId -> slug */
export const NODE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(OUTCOME_SLUGS).map(([slug, nodeId]) => [nodeId, slug]),
);

/** Get node ID from slug, or undefined if slug is unknown */
export function getNodeIdFromSlug(slug: string): string | undefined {
  return OUTCOME_SLUGS[slug];
}

/** Get slug from node ID, or undefined if nodeId has no mapping */
export function getSlugFromNodeId(nodeId: string): string | undefined {
  return NODE_TO_SLUG[nodeId];
}
