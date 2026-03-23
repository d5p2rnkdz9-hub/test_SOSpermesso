/**
 * Combined "Rinnovare o Convertire" decision tree.
 *
 * Merges:
 *   - Shared intro + fork (rc_ prefix)
 *   - NEW rinnovo branch (r_ prefix) — result content from Notion DB
 *   - EXISTING conversione branch (c_ prefix) — unchanged
 *
 * Flow:
 *   rc_intro → rc_fork
 *     ├─ "Rinnovare" → r_quale_hai → [sub-questions if needed] → r_end_*
 *     └─ "Convertire" → c_quale_hai → (existing conversione tree)
 */

import type { TreeData, TreeNode, TreeEdge, ResultSection } from '@/types/tree';
import { conversioneTree } from './conversione-tree';
import { rinnovoByKey, type RinnovoPermit } from './rinnovo-notion-data.generated';

// ---------------------------------------------------------------------------
// Helper: build a rinnovo result node from Notion data
// ---------------------------------------------------------------------------

function buildResult(
  nodeId: string,
  permit: RinnovoPermit | undefined,
  overrides?: { title?: string; introText?: string; extraSections?: ResultSection[] },
): TreeNode {
  if (!permit) {
    return {
      id: nodeId,
      type: 'result',
      title: 'Informazioni non disponibili',
      introText: 'Non abbiamo informazioni su questo permesso. Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita.',
      sections: [],
    };
  }

  const method = permit.modRinnovo[0] ?? '';
  const notPossible = method === 'n/a' || method === 'rinnovabile previa conversione' || method === '';
  const sections: ResultSection[] = [];

  // --- Method section ---
  if (method === 'KIT') {
    sections.push({
      heading: '\ud83d\udce6 Come rinnovare',
      content:
        'La domanda di rinnovo si presenta tramite il kit postale disponibile presso gli uffici postali abilitati. Compila il modulo, allega i documenti e spedisci.',
    });
  } else if (method === 'personalmente') {
    sections.push({
      heading: '\ud83d\udce6 Come rinnovare',
      content:
        'La domanda di rinnovo si presenta di persona in Questura. Prendi un appuntamento e porta tutti i documenti necessari.',
    });
  } else if (method === 'n/a') {
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
      content:
        permit.possoConvertire
          ? `Questo permesso non si rinnova direttamente. Tuttavia, è possibile convertirlo: ${permit.possoConvertire}. Ti consigliamo di rivolgerti a un servizio di consulenza legale.`
          : 'Questo permesso non si rinnova direttamente. Ti consigliamo di rivolgerti a un servizio di consulenza legale per valutare le alternative.',
    });
  } else if (method === 'rinnovabile previa conversione') {
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
      content:
        'Questo permesso non si rinnova: prima della scadenza devi convertirlo in un altro tipo di permesso. Ti consigliamo di rivolgerti a un servizio di consulenza legale.',
    });
  } else if (method === '') {
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
      content:
        'Non abbiamo informazioni sufficienti sul rinnovo di questo permesso. Ti consigliamo di rivolgerti a un servizio di consulenza legale.',
    });
  }

  // For "not possible" outcomes, only show the lawyer advice above — skip details
  if (!notPossible) {
    // --- Lawyer section (green = self) for possible renewals ---
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
      content: '\ud83d\udfe2 Puoi fare da solo! Segui le istruzioni qui sotto.',
    });

    // --- Duration section ---
    if (permit.duration) {
      sections.push({
        heading: '\u23f3 Durata',
        content: `Il permesso dura ${permit.duration}.`,
      });
    }

    // --- Documents section ---
    const realDocs = permit.docRinnovo.filter(
      (d) => d !== 'n/a' && d !== 'rinnovabile previa conversione',
    );
    if (realDocs.length > 0) {
      sections.push({
        heading: '\ud83d\udcc4 Documenti necessari per il rinnovo',
        content: realDocs.map((d) => `\u2022 ${d}`).join('\n'),
      });
    }

    // --- Warnings section ---
    if (permit.infoExtra) {
      sections.push({
        heading: '\u26a0\ufe0f Note importanti',
        content: permit.infoExtra,
      });
    }
  }

  // --- Extra sections from overrides ---
  if (overrides?.extraSections) {
    sections.push(...overrides.extraSections);
  }

  // Determine title
  let title: string;
  if (method === 'n/a' || method === 'rinnovabile previa conversione') {
    title = overrides?.title ?? `Rinnovo ${permit.notionName}: NON POSSIBILE`;
  } else if (method === '') {
    title = overrides?.title ?? `Rinnovo ${permit.notionName}: da verificare`;
  } else {
    title =
      overrides?.title ??
      `Rinnovo ${permit.notionName}: POSSIBILE (${method === 'KIT' ? 'kit postale' : 'di persona'})`;
  }

  // Determine intro
  let introText: string;
  if (method === 'KIT') {
    introText = overrides?.introText ?? 'Il rinnovo del tuo permesso è possibile tramite il kit postale.';
  } else if (method === 'personalmente') {
    introText =
      overrides?.introText ?? 'Il rinnovo del tuo permesso è possibile presentandoti di persona in Questura.';
  } else if (method === 'n/a' || method === 'rinnovabile previa conversione') {
    introText = overrides?.introText ?? 'Purtroppo, questo permesso non si può rinnovare direttamente.';
  } else {
    introText =
      overrides?.introText ??
      'Non abbiamo informazioni complete sul rinnovo di questo permesso. Ti consigliamo una consulenza legale.';
  }

  return { id: nodeId, type: 'result', title, introText, sections };
}

/**
 * For merged permits (e.g. lavoro sub flussi + conv have same docs),
 * use the first available variant's data.
 */
function mergedResult(nodeId: string, keys: string[], overrides?: Parameters<typeof buildResult>[2]): TreeNode {
  const permit = keys.map((k) => rinnovoByKey[k]).find(Boolean);
  return buildResult(nodeId, permit, overrides);
}

// ---------------------------------------------------------------------------
// SHARED NODES (rc_ prefix)
// ---------------------------------------------------------------------------

const sharedNodes: Record<string, TreeNode> = {
  rc_intro: {
    id: 'rc_intro',
    type: 'info',
    question:
      'Questo strumento ti aiuta a capire come rinnovare o convertire il tuo permesso di soggiorno. Rispondi a poche domande per scoprire cosa fare, quali documenti servono, e dove presentare la domanda.',
    description: 'Rinnovare o convertire il permesso di soggiorno',
  },

  rc_fork: {
    id: 'rc_fork',
    type: 'question',
    question: 'Cosa vuoi fare con il tuo permesso di soggiorno?',
  },
};

// ---------------------------------------------------------------------------
// RINNOVO QUESTION NODES (r_ prefix)
// ---------------------------------------------------------------------------

const rinnovoQuestionNodes: Record<string, TreeNode> = {
  // STEP 1: Which permit do you have?
  r_quale_hai: {
    id: 'r_quale_hai',
    type: 'question',
    question: 'Quale permesso di soggiorno hai adesso?',
  },

  r_hai_altro: {
    id: 'r_hai_altro',
    type: 'question',
    question: 'Quale altro permesso hai?',
  },

  // SUB-QUESTIONS for permits with multiple sub-types

  r_quale_fam: {
    id: 'r_quale_fam',
    type: 'question',
    question: 'Che tipo di permesso per motivi familiari hai?',
  },


  r_quale_cure: {
    id: 'r_quale_cure',
    type: 'question',
    question: 'Che tipo di permesso per cure mediche hai?',
  },

  r_quale_prot_soc: {
    id: 'r_quale_prot_soc',
    type: 'question',
    question: 'Che tipo di protezione sociale hai?',
  },
};

// ---------------------------------------------------------------------------
// RINNOVO RESULT NODES (r_end_ prefix) — built from Notion data
// ---------------------------------------------------------------------------

const rinnovoResultNodes: Record<string, TreeNode> = {
  // --- Lavoro (merged sub-types) ---
  r_end_lav_sub: mergedResult('r_end_lav_sub', ['lav_sub_flussi', 'lav_sub_conv'], {
    title: 'Rinnovo Lavoro subordinato: POSSIBILE (kit postale)',
  }),
  r_end_lav_aut: mergedResult('r_end_lav_aut', ['lav_aut_flussi', 'lav_aut_conv'], {
    title: 'Rinnovo Lavoro autonomo: POSSIBILE (kit postale)',
  }),
  r_end_stagionale: buildResult('r_end_stagionale', rinnovoByKey['stagionale']
    ? { ...rinnovoByKey['stagionale'], duration: 'fino alla scadenza del nuovo contratto di lavoro stagionale' }
    : undefined, {
    title: 'Rinnovo Lavoro stagionale: POSSIBILE (kit postale)',
  }),

  // --- Studio (separate sub-types) ---
  r_end_studio: buildResult('r_end_studio', rinnovoByKey['studio_visto'], {
    title: 'Rinnovo Studio: POSSIBILE (kit postale)',
  }),

  // --- Famiglia (many sub-types) ---
  r_end_fam_genitore_ita: buildResult('r_end_fam_genitore_ita', rinnovoByKey['fam_genitore_ita']),
  r_end_fam_ricong: buildResult('r_end_fam_ricong', rinnovoByKey['fam_ricong']),
  r_end_fam_coesione: buildResult('r_end_fam_coesione', rinnovoByKey['fam_coesione']),
  r_end_fam_convivente_ita: buildResult('r_end_fam_convivente_ita', rinnovoByKey['fam_convivente_ita']),
  r_end_famit_statici: buildResult('r_end_famit_statici', rinnovoByKey['famit_statici']),
  r_end_carta_fam_ita: buildResult('r_end_carta_fam_ita', rinnovoByKey['carta_fam_ita']),
  r_end_carta_fam_ue: buildResult('r_end_carta_fam_ue', rinnovoByKey['carta_fam_ue']),
  r_end_fam_rifugiato: buildResult('r_end_fam_rifugiato', rinnovoByKey['fam_rifugiato']),
  r_end_affidamento: buildResult('r_end_affidamento', rinnovoByKey['affidamento']),
  r_end_ass_minori: {
    id: 'r_end_ass_minori',
    type: 'result',
    title: 'Rinnovo Assistenza minori (Art. 31): NON POSSIBILE',
    introText: 'Questo permesso non può essere rinnovato. Per ottenere un nuovo permesso Art. 31 è necessario fare una nuova causa al Tribunale per i Minorenni.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
        content: 'Sì, hai bisogno di un avvocato per presentare un nuovo ricorso al Tribunale per i Minorenni.',
      },
      {
        heading: '\ud83d\udccc Cosa fare',
        content: 'Prima della scadenza del permesso, rivolgiti a un avvocato o a un servizio di consulenza legale per avviare una nuova causa al Tribunale per i Minorenni e ottenere un nuovo permesso Art. 31.\n\nMaggiori informazioni: https://www.sospermesso.it/permesso-assistenza-minore-articolo-31.html',
      },
    ],
  },

  // --- Protezione ---
  r_end_asilo: buildResult('r_end_asilo', rinnovoByKey['asilo']),
  r_end_prot_suss: buildResult('r_end_prot_suss', rinnovoByKey['prot_suss']),
  r_end_prot_spec: {
    id: 'r_end_prot_spec',
    type: 'result',
    title: 'Rinnovo Protezione speciale',
    introText: 'Il rinnovo della protezione speciale è una questione complessa e controversa. Ti consigliamo di rivolgerti subito a un consulente legale.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
        content: 'Sì, ti consigliamo di rivolgerti a un servizio di consulenza legale il prima possibile.',
      },
    ],
  },
  r_end_rich_asilo: buildResult('r_end_rich_asilo', rinnovoByKey['rich_asilo']),
  r_end_sfruttamento: buildResult('r_end_sfruttamento', rinnovoByKey['sfruttamento']),
  r_end_prot_soc_violenza: buildResult('r_end_prot_soc_violenza', rinnovoByKey['prot_soc_violenza']),
  r_end_prot_soc_tratta: buildResult('r_end_prot_soc_tratta', rinnovoByKey['prot_soc_tratta']),
  r_end_calamita: buildResult('r_end_calamita', rinnovoByKey['calamita']),
  r_end_minore: {
    id: 'r_end_minore',
    type: 'result',
    title: 'Rinnovo Minore età (per MSNA)',
    introText: 'Il permesso per minore età è rinnovabile fino al compimento dei 18 anni. Dopo i 18 anni devi convertirlo in un altro tipo di permesso.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
        content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale per valutare le opzioni di conversione prima della scadenza.',
      },
      {
        heading: '\ud83d\udd04 Conversione',
        content: 'Quando compi 18 anni, dovrai convertire il permesso in un altro tipo (ad es. studio, lavoro, attesa occupazione). Torna indietro e scegli "Convertire il permesso" per scoprire le tue opzioni.',
      },
    ],
  },

  // --- Cure mediche (separate sub-types) ---
  r_end_cure_visto: buildResult('r_end_cure_visto', rinnovoByKey['cure_visto']),
  r_end_cure_grave: buildResult('r_end_cure_grave', rinnovoByKey['cure_grave']
    ? { ...rinnovoByKey['cure_grave'], modRinnovo: ['personalmente'] }
    : undefined, {
    title: 'Rinnovo Cure mediche per persona gravemente malata: POSSIBILE (di persona in Questura)',
  }),
  r_end_cure_padre: {
    id: 'r_end_cure_padre',
    type: 'result',
    title: 'Rinnovo Cure mediche (padre): NON POSSIBILE',
    introText: 'Questo permesso dura solo 6 mesi dalla nascita del bambino e non è rinnovabile né convertibile.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
        content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale.',
      },
      {
        heading: '\ud83d\udca1 Alternativa possibile',
        content: 'Potresti valutare la possibilità di richiedere un permesso per assistenza minori (Art. 31).\n\nMaggiori informazioni: https://www.sospermesso.it/permesso-assistenza-minore-articolo-31.html',
      },
    ],
  },
  r_end_cure_gravidanza: {
    id: 'r_end_cure_gravidanza',
    type: 'result',
    title: 'Rinnovo Cure mediche (gravidanza/maternità): NON POSSIBILE',
    introText: 'Questo permesso dura solo 6 mesi dalla nascita del bambino e non è rinnovabile né convertibile.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Mi serve un avvocato?',
        content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale.',
      },
      {
        heading: '\ud83d\udca1 Alternativa possibile',
        content: 'Potresti valutare la possibilità di richiedere un permesso per assistenza minori (Art. 31).\n\nMaggiori informazioni: https://www.sospermesso.it/permesso-assistenza-minore-articolo-31.html',
      },
    ],
  },

  // --- Altro ---
  r_end_att_occ: buildResult('r_end_att_occ', rinnovoByKey['att_occ']),
  r_end_sportiva: buildResult('r_end_sportiva', rinnovoByKey['sportiva']),
  r_end_apolidia: buildResult('r_end_apolidia', rinnovoByKey['apolidia']),
  r_end_res_elettiva: buildResult('r_end_res_elettiva', rinnovoByKey['res_elettiva']),
  r_end_artistico: buildResult('r_end_artistico', rinnovoByKey['artistico']),
  r_end_religiosi: buildResult('r_end_religiosi', rinnovoByKey['religiosi']),
  r_end_ricerca: buildResult('r_end_ricerca', rinnovoByKey['ricerca']),
  r_end_tirocinio: buildResult('r_end_tirocinio', rinnovoByKey['tirocinio']),
  r_end_carta_ue: buildResult('r_end_carta_ue', rinnovoByKey['carta_ue']),
  r_end_prosieguo: buildResult('r_end_prosieguo', rinnovoByKey['prosieguo']),
  r_end_figlio_14: buildResult('r_end_figlio_14', rinnovoByKey['figlio_14']),

  // --- Generic fallback ---
  r_end_generico: {
    id: 'r_end_generico',
    type: 'result',
    title: 'Situazione da verificare',
    introText:
      'Non abbiamo informazioni specifiche sul rinnovo del tuo permesso.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Consiglio',
        content:
          'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per verificare le possibilità di rinnovo.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// RINNOVO EDGES
// ---------------------------------------------------------------------------

const rinnovoEdges: TreeEdge[] = [
  // =============================================
  // STEP 1: QUALE PERMESSO HAI? (main list)
  // =============================================
  { from: 'r_quale_hai', to: 'r_end_lav_sub', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
  { from: 'r_quale_hai', to: 'r_end_lav_aut', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
  { from: 'r_quale_hai', to: 'r_quale_fam', label: 'Famiglia', optionKey: 'famiglia' },
  { from: 'r_quale_hai', to: 'r_end_studio', label: 'Studio', optionKey: 'studio' },
  { from: 'r_quale_hai', to: 'r_end_att_occ', label: 'Attesa occupazione', optionKey: 'att_occ' },
  { from: 'r_quale_hai', to: 'r_end_prot_suss', label: 'Protezione sussidiaria', optionKey: 'prot_suss' },
  { from: 'r_quale_hai', to: 'r_end_asilo', label: 'Asilo (status di rifugiato)', optionKey: 'asilo' },
  { from: 'r_quale_hai', to: 'r_end_prot_spec', label: 'Protezione speciale', optionKey: 'prot_spec' },
  { from: 'r_quale_hai', to: 'r_end_minore', label: 'Minore età', optionKey: 'minore' },
  { from: 'r_quale_hai', to: 'r_end_rich_asilo', label: 'Richiesta asilo (permesso giallo)', optionKey: 'rich_asilo' },
  { from: 'r_quale_hai', to: 'r_end_stagionale', label: 'Lavoro stagionale', optionKey: 'stagionale' },
  { from: 'r_quale_hai', to: 'r_hai_altro', label: 'Altro permesso', optionKey: 'altro' },

  // =============================================
  // HAI ALTRO (sub-list)
  // =============================================
  { from: 'r_hai_altro', to: 'r_end_ass_minori', label: 'Assistenza minori (Art. 31)', optionKey: 'ass_minori' },
  { from: 'r_hai_altro', to: 'r_end_calamita', label: 'Calamità naturale', optionKey: 'calamita' },
  { from: 'r_hai_altro', to: 'r_quale_cure', label: 'Cure mediche', optionKey: 'cure' },
  { from: 'r_hai_altro', to: 'r_end_sportiva', label: 'Attività sportiva', optionKey: 'sportiva' },
  { from: 'r_hai_altro', to: 'r_end_apolidia', label: 'Apolidia', optionKey: 'apolidia' },
  { from: 'r_hai_altro', to: 'r_end_res_elettiva', label: 'Residenza elettiva', optionKey: 'res_elettiva' },
  { from: 'r_hai_altro', to: 'r_end_artistico', label: 'Lavoro artistico', optionKey: 'artistico' },
  { from: 'r_hai_altro', to: 'r_end_religiosi', label: 'Motivi religiosi', optionKey: 'religiosi' },
  { from: 'r_hai_altro', to: 'r_end_ricerca', label: 'Ricerca scientifica', optionKey: 'ricerca' },
  { from: 'r_hai_altro', to: 'r_end_sfruttamento', label: 'Sfruttamento lavorativo', optionKey: 'sfruttamento' },
  { from: 'r_hai_altro', to: 'r_quale_prot_soc', label: 'Protezione sociale (Art. 18)', optionKey: 'prot_sociale' },
  { from: 'r_hai_altro', to: 'r_end_tirocinio', label: 'Tirocinio', optionKey: 'tirocinio' },
  { from: 'r_hai_altro', to: 'r_end_carta_ue', label: 'Carta UE lungo periodo', optionKey: 'carta_ue' },
  { from: 'r_hai_altro', to: 'r_end_prosieguo', label: 'Prosieguo amministrativo', optionKey: 'prosieguo' },
  { from: 'r_hai_altro', to: 'r_end_figlio_14', label: 'Figlio minore >14 anni', optionKey: 'figlio_14' },
  { from: 'r_hai_altro', to: 'r_end_generico', label: 'Ho un altro permesso', optionKey: 'altro_perm' },

  // =============================================
  // SUB-QUESTIONS
  // =============================================

  // --- Famiglia sub-types ---
  { from: 'r_quale_fam', to: 'r_end_fam_genitore_ita', label: 'Genitore di cittadino italiano', optionKey: 'genitore_ita' },
  { from: 'r_quale_fam', to: 'r_end_fam_ricong', label: 'Ricongiungimento familiare', optionKey: 'ricong' },
  { from: 'r_quale_fam', to: 'r_end_fam_coesione', label: 'Coesione familiare', optionKey: 'coesione' },
  { from: 'r_quale_fam', to: 'r_end_fam_convivente_ita', label: 'Convivente con parente italiano', optionKey: 'convivente_ita' },
  { from: 'r_quale_fam', to: 'r_end_famit_statici', label: 'Familiare di cittadino italiano (FAMIT)', optionKey: 'famit' },
  { from: 'r_quale_fam', to: 'r_end_carta_fam_ita', label: 'Carta di soggiorno fam. italiani', optionKey: 'carta_fam_ita' },
  { from: 'r_quale_fam', to: 'r_end_carta_fam_ue', label: 'Carta di soggiorno fam. cittadini UE', optionKey: 'carta_fam_ue' },
  { from: 'r_quale_fam', to: 'r_end_fam_rifugiato', label: 'Familiare di rifugiato/prot. sussidiaria', optionKey: 'fam_rifugiato' },
  { from: 'r_quale_fam', to: 'r_end_affidamento', label: 'Affidamento (entro 4° grado)', optionKey: 'affidamento' },
  { from: 'r_quale_fam', to: 'r_end_ass_minori', label: 'Assistenza minori (Art. 31)', optionKey: 'ass_minori' },


  // --- Cure mediche sub-types ---
  { from: 'r_quale_cure', to: 'r_end_cure_visto', label: 'Ingresso con visto per cure', optionKey: 'cure_visto' },
  { from: 'r_quale_cure', to: 'r_end_cure_grave', label: 'Persona gravemente malata in Italia', optionKey: 'cure_grave' },
  { from: 'r_quale_cure', to: 'r_end_cure_padre', label: 'Padre di bambino <6 mesi', optionKey: 'cure_padre' },
  { from: 'r_quale_cure', to: 'r_end_cure_gravidanza', label: 'Donna incinta / figlio <6 mesi', optionKey: 'cure_gravidanza' },

  // --- Protezione sociale sub-types ---
  { from: 'r_quale_prot_soc', to: 'r_end_prot_soc_violenza', label: 'Vittime di violenza domestica', optionKey: 'violenza' },
  { from: 'r_quale_prot_soc', to: 'r_end_prot_soc_tratta', label: 'Vittime di tratta', optionKey: 'tratta' },
];

// ---------------------------------------------------------------------------
// SHARED EDGES (rc_ prefix)
// ---------------------------------------------------------------------------

const sharedEdges: TreeEdge[] = [
  // Intro → Fork
  { from: 'rc_intro', to: 'rc_fork', label: 'Inizia', optionKey: 'start' },

  // Fork → branches
  { from: 'rc_fork', to: 'r_quale_hai', label: 'Rinnovare il permesso', optionKey: 'rinnovare' },
  { from: 'rc_fork', to: 'c_quale_hai', label: 'Convertire il permesso', optionKey: 'convertire' },
];

// ---------------------------------------------------------------------------
// COMBINED TREE
// ---------------------------------------------------------------------------

export const rinnovoConversioneTree: TreeData = {
  startNodeId: 'rc_intro',

  nodes: {
    // Shared intro + fork
    ...sharedNodes,
    // Rinnovo question nodes
    ...rinnovoQuestionNodes,
    // Rinnovo result nodes (content from Notion DB)
    ...rinnovoResultNodes,
    // Existing conversione tree (all c_ nodes)
    ...conversioneTree.nodes,
  },

  edges: [
    // Shared edges (intro → fork → branches)
    ...sharedEdges,
    // Rinnovo edges
    ...rinnovoEdges,
    // Existing conversione edges
    ...conversioneTree.edges,
  ],
};
