/**
 * Bidirectional mapping between URL slugs and rinnovo-conversione tree result node IDs.
 *
 * 63 slugs total: 41 rinnovo (r_end_*) + 22 conversione (c_end_*).
 * Used for /outcome/rinnovo-conversione/[slug] routes.
 */

/** Forward map: slug -> nodeId */
export const RC_OUTCOME_SLUGS: Record<string, string> = {
  // ── Rinnovo results (40) ──────────────────────────────────────────

  // Lavoro
  'rinnovo-lavoro-subordinato': 'r_end_lav_sub',
  'rinnovo-lavoro-autonomo': 'r_end_lav_aut',
  'rinnovo-lavoro-stagionale': 'r_end_stagionale',

  // Studio
  'rinnovo-studio': 'r_end_studio',

  // Famiglia
  'rinnovo-famiglia-genitore-italiano': 'r_end_fam_genitore_ita',
  'rinnovo-ricongiungimento-familiare': 'r_end_fam_ricong',
  'rinnovo-coesione-familiare': 'r_end_fam_coesione',
  'rinnovo-convivente-italiano': 'r_end_fam_convivente_ita',
  'rinnovo-familiare-italiano': 'r_end_famit_statici',
  'rinnovo-carta-famiglia-italiano': 'r_end_carta_fam_ita',
  'rinnovo-carta-famiglia-ue': 'r_end_carta_fam_ue',
  'rinnovo-famiglia-rifugiato': 'r_end_fam_rifugiato',
  'rinnovo-affidamento': 'r_end_affidamento',
  'rinnovo-assistenza-minori': 'r_end_ass_minori',

  // Protezione
  'rinnovo-asilo': 'r_end_asilo',
  'rinnovo-protezione-sussidiaria': 'r_end_prot_suss',
  'rinnovo-protezione-speciale': 'r_end_prot_spec',
  'rinnovo-richiesta-asilo': 'r_end_rich_asilo',
  'rinnovo-sfruttamento': 'r_end_sfruttamento',
  'rinnovo-protezione-violenza': 'r_end_prot_soc_violenza',
  'rinnovo-protezione-tratta': 'r_end_prot_soc_tratta',
  'rinnovo-calamita': 'r_end_calamita',
  'rinnovo-minore': 'r_end_minore',

  // Cure mediche
  'rinnovo-cure-visto': 'r_end_cure_visto',
  'rinnovo-cure-grave': 'r_end_cure_grave',
  'rinnovo-cure-padre': 'r_end_cure_padre',
  'rinnovo-cure-gravidanza': 'r_end_cure_gravidanza',

  // Altro
  'rinnovo-attesa-occupazione': 'r_end_att_occ',
  'rinnovo-attivita-sportiva': 'r_end_sportiva',
  'rinnovo-apolidia': 'r_end_apolidia',
  'rinnovo-residenza-elettiva': 'r_end_res_elettiva',
  'rinnovo-lavoro-artistico': 'r_end_artistico',
  'rinnovo-motivi-religiosi': 'r_end_religiosi',
  'rinnovo-ricerca': 'r_end_ricerca',
  'rinnovo-tirocinio': 'r_end_tirocinio',
  'rinnovo-carta-ue': 'r_end_carta_ue',
  'rinnovo-prosieguo': 'r_end_prosieguo',
  'rinnovo-figlio-minore': 'r_end_figlio_14',
  'rinnovo-generico': 'r_end_generico',
  'rinnovo-permesso-scaduto': 'r_end_scaduto_60',

  // ── Conversione results (22) ──────────────────────────────────────

  'conversione-lavoro-possibile': 'c_end_lav_ok',
  'conversione-lavoro-impossibile': 'c_end_lav_no',
  'conversione-lavoro-speciale': 'c_end_lav_speciale',
  'conversione-lavoro-cure-mediche': 'c_end_lav_cure',
  'conversione-lavoro-calamita': 'c_end_lav_calam',
  'conversione-lavoro-minore': 'c_end_lav_minore',
  'conversione-attesa-occupazione-possibile': 'c_end_att_ok',
  'conversione-attesa-occupazione-impossibile': 'c_end_att_no',
  'conversione-attesa-occupazione-asilo': 'c_end_att_asilo',
  'conversione-attesa-occupazione-incerta': 'c_end_att_incerta',
  'conversione-attesa-occupazione-minore': 'c_end_att_minore',
  'conversione-studio-possibile': 'c_end_stu_ok',
  'conversione-studio-impossibile': 'c_end_stu_no',
  'conversione-studio-minore': 'c_end_stu_minore',
  'conversione-studio-speciale': 'c_end_stu_speciale',
  'conversione-famiglia-possibile': 'c_end_fam_ok',
  'conversione-famiglia-oltre-anno': 'c_end_fam_anno',
  'conversione-carta-possibile': 'c_end_carta_ok',
  'conversione-carta-assistenza-minori': 'c_end_carta_minori',
  'conversione-carta-impossibile': 'c_end_carta_no',
  'conversione-permesso-scaduto': 'c_end_scaduto',
  'conversione-permesso-scaduto-soft': 'c_end_scaduto_soft',
  'conversione-situazione-complicata': 'c_end_complicata',
};

/** Reverse map: nodeId -> slug */
export const RC_NODE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(RC_OUTCOME_SLUGS).map(([slug, nodeId]) => [nodeId, slug]),
);

/** Get node ID from slug, or undefined if slug is unknown */
export function getRCNodeIdFromSlug(slug: string): string | undefined {
  return RC_OUTCOME_SLUGS[slug];
}

/** Get slug from node ID, or undefined if nodeId has no mapping */
export function getRCSlugFromNodeId(nodeId: string): string | undefined {
  return RC_NODE_TO_SLUG[nodeId];
}
