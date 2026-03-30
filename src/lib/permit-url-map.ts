/**
 * Maps tree result node IDs to their corresponding sospermesso.it permit page URLs.
 *
 * Used by outcome pages to link out to the full guide on sospermesso.it.
 * Nodes with null have no matching permit page (EU citizens, negative results, citizenship).
 */

const SOSPERMESSO_BASE = 'https://www.sospermesso.it';

const PERMIT_PATHS: Record<string, string | null> = {
  end_ue: null, // EU citizen — no permit needed
  end_asilo: '/permesso-asilo-status-rifugiato.html',
  end_calam: '/permesso-calamita-naturale.html',
  end_sfrut: '/permesso-sfruttamento-lavorativo.html',
  end_tratta: '/permesso-protezione-sociale-vittime-di-tratta.html',
  end_viol: '/permesso-protezione-sociale-vittime-di-violenza-domestica.html',
  end_cure_salute: '/permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia.html',
  end_cure_gravidanza: '/permesso-cure-mediche-donna-in-stato-di-gravidanza-o-con-figlio-minore-di-6-mesi.html',
  end_citt: null, // Citizenship matter
  end_neg_gen: null, // Negative result
  end_min_fam: '/permesso-figlio-minore-di-piu-di-14-anni-che-vive-con-i-genitori.html',
  end_art19: '/permesso-famiglia-convivente-con-parente-cittadino-italiano-entro-il-secondo-grado.html',
  end_aff: '/permesso-affidamento-a-familiari-entro-il-quarto-grado.html',
  end_msna: '/permesso-minore-eta-per-msna.html',
  end_art30: '/permesso-famiglia-genitore-di-cittadino-italiano.html',
  end_famit: '/permesso-famiglia-dopo-ingresso-con-visto-per-ricongiungimento-familiare.html',
  end_zamb: null, // Zambrano — no direct sospermesso.it page
  end_carta_ue: '/permesso-carta-di-soggiorno-per-familiari-di-cittadini-ue.html',
  end_art31: '/permesso-assistenza-minore-articolo-31.html',
  end_art30_gen: '/permesso-famiglia-genitore-di-cittadino-italiano.html',
  end_famit_gen: '/permesso-famiglia-dopo-ingresso-con-visto-per-ricongiungimento-familiare.html',
  end_fam_inc: '/permesso-famiglia-senza-nullaosta-per-ricongiungimento-coesione-familiare.html',
  end_fam_inv: '/permesso-famiglia-senza-nullaosta-per-ricongiungimento-coesione-familiare.html',
  end_res_el: '/permesso-residenza-elettiva.html',
  end_neg_par: null, // Negative result
  end_famit_part: '/permesso-famiglia-dopo-ingresso-con-visto-per-ricongiungimento-familiare.html',
  end_con_rif: '/permesso-famigliari-di-persone-con-status-di-rifugiato-o-protezione-sussidiaria.html',
  end_carta_con: '/permesso-permesso-ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno.html',
  end_conv_fam: '/permesso-famiglia-dopo-ingresso-con-visto-per-ricongiungimento-familiare.html',
  end_conv_neg: null, // Negative result

  // Rinnovo tree results (link to #rinnovo section)
  r_end_lav_sub: '/permesso-lavoro-subordinato-dopo-ingresso-con-visto-per-flussi.html#rinnovo',
  r_end_lav_aut: '/permesso-lavoro-autonomo-dopo-ingresso-con-visto-per-flussi.html#rinnovo',
  r_end_stagionale: '/permesso-lavoro-subordinato-stagionale-dopo-ingresso-con-visto-per-flussi-stagionali.html#rinnovo',
  r_end_studio: '/permesso-studio-dopo-ingresso-con-visto.html#rinnovo',
  r_end_att_occ: '/permesso-attesa-occupazione.html#rinnovo',
  r_end_fam_genitore_ita: '/permesso-famiglia-genitore-di-cittadino-italiano.html#rinnovo',
  r_end_fam_ricong: '/permesso-famiglia-dopo-ingresso-con-visto-per-ricongiungimento-familiare.html#rinnovo',
  r_end_fam_coesione: '/permesso-famiglia-senza-nullaosta-per-ricongiungimento-coesione-familiare.html#rinnovo',
  r_end_fam_convivente_ita: '/permesso-famiglia-convivente-con-parente-cittadino-italiano-entro-il-secondo-grado.html#rinnovo',
  r_end_famit_statici: '/permesso-famit-per-familiari-di-cittadini-italiani-statici.html#rinnovo',
  r_end_carta_fam_ita: '/permesso-carta-di-soggiorno-per-familiari-di-italiani-dinamici.html#rinnovo',
  r_end_carta_fam_ue: '/permesso-carta-di-soggiorno-per-familiari-di-cittadini-ue.html#rinnovo',
  r_end_fam_rifugiato: null,
  r_end_affidamento: null,
  r_end_ass_minori: null,
  r_end_asilo: '/permesso-asilo-status-rifugiato.html#rinnovo',
  r_end_prot_suss: '/permesso-protezione-sussidiaria.html#rinnovo',
  r_end_prot_spec: '/permesso-protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale.html#rinnovo',
  r_end_rich_asilo: '/permesso-richiesta-asilo.html#rinnovo',
  r_end_prot_soc_violenza: '/permesso-protezione-sociale-vittime-di-violenza-domestica.html#rinnovo',
  r_end_prot_soc_tratta: '/permesso-protezione-sociale-vittime-di-tratta.html#rinnovo',
  r_end_sfruttamento: '/permesso-sfruttamento-lavorativo.html#rinnovo',
  r_end_calamita: '/permesso-calamita-naturale.html#rinnovo',
  r_end_minore: '/permesso-minore-eta-per-msna.html#rinnovo',
  r_end_cure_visto: '/permesso-cure-mediche-dopo-ingresso-con-visto-per-cure-mediche.html#rinnovo',
  r_end_cure_grave: '/permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia.html#rinnovo',
  r_end_cure_padre: null,
  r_end_cure_gravidanza: null,
  r_end_sportiva: '/permesso-attivita-sportiva.html#rinnovo',
  r_end_apolidia: null,
  r_end_res_elettiva: '/permesso-residenza-elettiva.html#rinnovo',
  r_end_artistico: null,
  r_end_religiosi: '/permesso-motivi-religiosi.html#rinnovo',
  r_end_ricerca: null,
  r_end_tirocinio: '/permesso-tirocinio.html#rinnovo',
  r_end_carta_ue: '/permesso-permesso-ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno.html#rinnovo',
  r_end_prosieguo: null,
  r_end_figlio_14: null,
  r_end_generico: null,
  r_end_scaduto_60: null,

  // Conversione tree results
  c_end_lav_sub_ok: '/permesso-lavoro-subordinato-conversione-da-altro-permesso.html',
  c_end_lav_aut_ok: '/permesso-lavoro-autonomo-conversione-da-altro-permesso.html',
  c_end_altro_wip: null,
  c_end_lav_no: null,
  c_end_lav_speciale: null,
  c_end_lav_cure: null,
  c_end_lav_calam: null,
  c_end_lav_minore: null,
  c_end_att_ok: '/permesso-attesa-occupazione.html',
  c_end_att_no: null,
  c_end_att_asilo: null,
  c_end_att_incerta: null,
  c_end_att_minore: null,
  c_end_stu_ok: '/permesso-studio-conversione-da-altro-permesso.html',
  c_end_stu_no: null,
  c_end_stu_minore: null,
  c_end_stu_speciale: null,
  c_end_fam_ok: '/permesso-famiglia-senza-nullaosta-per-ricongiungimento-coesione-familiare.html',
  c_end_fam_anno: null,
  c_end_carta_ok: '/permesso-permesso-ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno.html',
  c_end_carta_minori: '/permesso-permesso-ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno.html',
  c_end_carta_no: null,
  c_end_scaduto: null,
  c_end_complicata: null,
};

/**
 * Returns the full sospermesso.it URL for a given tree node ID,
 * or null if no matching permit page exists.
 */
export function getPermitUrl(nodeId: string, locale?: string): string | null {
  const path = PERMIT_PATHS[nodeId];
  if (!path) return null;

  // Prefix with locale subdirectory for non-Italian languages
  if (locale && locale !== 'it') {
    const supportedLocales = ['en', 'fr'];
    if (supportedLocales.includes(locale)) {
      return `${SOSPERMESSO_BASE}/${locale}${path}`;
    }
  }

  return `${SOSPERMESSO_BASE}${path}`;
}
