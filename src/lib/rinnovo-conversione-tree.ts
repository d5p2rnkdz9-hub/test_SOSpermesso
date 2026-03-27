/**
 * Combined "Rinnovare o Convertire" decision tree.
 *
 * Merges:
 *   - Shared intro + fork (rc_ prefix)
 *   - NEW rinnovo branch (r_ prefix) — result content from Notion DB
 *   - EXISTING conversione branch (c_ prefix) — unchanged
 *
 * Flow:
 *   rc_fork
 *     ├─ "Rinnovare" → r_quale_hai → [sub-questions if needed] → r_end_*
 *     └─ "Convertire" → c_quale_hai → (existing conversione tree)
 */

import type { TreeData, TreeNode, TreeEdge, ResultSection } from '@/types/tree';
import { conversioneTree } from './conversione-tree';
import { rinnovoByKey, type RinnovoPermit } from './rinnovo-notion-data.generated';

// ---------------------------------------------------------------------------
// Rinnovo permit → sospermesso.it URL map (with #rinnovo anchor)
// ---------------------------------------------------------------------------

const SOSPERMESSO_BASE = 'https://www.sospermesso.it';

const RINNOVO_PERMIT_PATHS: Record<string, string | null> = {
  // Lavoro
  lav_sub_flussi: '/permesso-lavoro-subordinato-dopo-ingresso-con-visto-per-flussi.html',
  lav_sub_conv: '/permesso-lavoro-subordinato-conversione-da-altro-permesso.html',
  lav_aut_flussi: '/permesso-lavoro-autonomo-dopo-ingresso-con-visto-per-flussi.html',
  lav_aut_conv: '/permesso-lavoro-autonomo-conversione-da-altro-permesso.html',
  stagionale: '/permesso-lavoro-subordinato-stagionale-dopo-ingresso-con-visto-per-flussi-stagionali.html',
  att_occ: '/permesso-attesa-occupazione.html',
  tirocinio: '/permesso-tirocinio.html',
  // Studio
  studio_visto: '/permesso-studio-dopo-ingresso-con-visto.html',
  studio_conv: '/permesso-studio-conversione-da-altro-permesso.html',
  // Famiglia
  fam_genitore_ita: '/permesso-famiglia-genitore-di-cittadino-italiano.html',
  fam_ricong: '/permesso-famiglia-dopo-ingresso-con-visto-per-ricongiungimento-familiare.html',
  fam_coesione: '/permesso-famiglia-senza-nullaosta-per-ricongiungimento-coesione-familiare.html',
  fam_convivente_ita: '/permesso-famiglia-convivente-con-parente-cittadino-italiano-entro-il-secondo-grado.html',
  famit_statici: '/permesso-famit-per-familiari-di-cittadini-italiani-statici.html',
  carta_fam_ita: '/permesso-carta-di-soggiorno-per-familiari-di-italiani-dinamici.html',
  carta_fam_ue: '/permesso-carta-di-soggiorno-per-familiari-di-cittadini-ue.html',
  fam_rifugiato: null, // No dedicated page
  affidamento: null, // No dedicated page
  ass_minori: null, // Handled with custom link
  figlio_14: null, // No dedicated page
  // Protezione
  asilo: '/permesso-asilo-status-rifugiato.html',
  prot_suss: '/permesso-protezione-sussidiaria.html',
  prot_spec: '/permesso-protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale.html',
  rich_asilo: '/permesso-richiesta-asilo.html',
  prot_soc_violenza: '/permesso-protezione-sociale-vittime-di-violenza-domestica.html',
  prot_soc_tratta: '/permesso-protezione-sociale-vittime-di-tratta.html',
  sfruttamento: '/permesso-sfruttamento-lavorativo.html',
  calamita: '/permesso-calamita-naturale.html',
  minore: '/permesso-minore-eta-per-msna.html',
  prosieguo: null, // No dedicated page
  // Salute
  cure_visto: '/permesso-cure-mediche-dopo-ingresso-con-visto-per-cure-mediche.html',
  cure_grave: '/permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia.html',
  cure_padre: null, // No dedicated page
  cure_gravidanza: null, // No dedicated page
  // Altro
  sportiva: '/permesso-attivita-sportiva.html',
  artistico: null, // No dedicated page
  religiosi: '/permesso-motivi-religiosi.html',
  ricerca: null, // No dedicated page
  apolidia: '/permesso-apolidia.html',
  res_elettiva: '/permesso-residenza-elettiva.html',
  carta_ue: '/permesso-ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno.html',
};

function getRinnovoGuideUrl(treeKey: string): string | null {
  const path = RINNOVO_PERMIT_PATHS[treeKey];
  if (!path) return null;
  return `${SOSPERMESSO_BASE}${path}#rinnovo`;
}

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

  // --- Separate hallmark docs from generic ones ---
  const GENERIC_DOC_PATTERNS = [
    /^marca da bollo/i,
    /^fototessere/i,
    /^\d+ fototessere/i,
    /^bollettino postale/i,
    /^copia del passaporto/i,
    /^permesso in scadenza/i,
  ];
  const realDocs = permit.docRinnovo.filter(
    (d) => d !== 'n/a' && d !== 'rinnovabile previa conversione',
  );
  const hallmarkDocs = realDocs.filter(
    (d) => !GENERIC_DOC_PATTERNS.some((p) => p.test(d)),
  );
  const genericDocs = realDocs.filter(
    (d) => GENERIC_DOC_PATTERNS.some((p) => p.test(d)),
  );

  // --- Green/red badge + descriptive intro (Item #15) ---
  if (!notPossible) {
    sections.push({
      heading: '\u2705 Rinnovo possibile — puoi fare da solo',
      content: `[Nome], il tuo permesso per ${permit.notionName.toLowerCase()} [StatoPermesso] e può essere rinnovato.`,
    });
  }

  // --- Hallmark documents (permit-specific, shown first) ---
  if (!notPossible && hallmarkDocs.length > 0) {
    sections.push({
      heading: '\ud83d\udccc Documenti fondamentali',
      content: `Per rinnovare questo permesso, prepara:\n${hallmarkDocs.map((d) => `\u2022 ${d}`).join('\n')}`,
    });
  }

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
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
      content:
        permit.possoConvertire
          ? `Questo permesso non si rinnova direttamente. Tuttavia, è possibile convertirlo: ${permit.possoConvertire}. Ti consigliamo di rivolgerti a un servizio di consulenza legale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)`
          : 'Questo permesso non si rinnova direttamente. Ti consigliamo di rivolgerti a un servizio di consulenza legale per valutare le alternative.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
    });
  } else if (method === 'rinnovabile previa conversione') {
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
      content:
        'Questo permesso non si rinnova: prima della scadenza devi convertirlo in un altro tipo di permesso. Ti consigliamo di rivolgerti a un servizio di consulenza legale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
    });
  } else if (method === '') {
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
      content:
        'Non abbiamo informazioni sufficienti sul rinnovo di questo permesso. Ti consigliamo di rivolgerti a un servizio di consulenza legale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
    });
  }

  // For "not possible" outcomes, only show the lawyer advice above — skip details
  if (!notPossible) {
    // --- Duration section ---
    if (permit.duration) {
      sections.push({
        heading: '\u23f3 Durata',
        content: `Il permesso dura ${permit.duration}.`,
      });
    }

    // --- Generic documents section ---
    if (genericDocs.length > 0) {
      sections.push({
        heading: '\ud83d\udcc4 Documenti standard (servono sempre)',
        content: genericDocs.map((d) => `\u2022 ${d}`).join('\n'),
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

  // --- Link to sospermesso.it permit page with #rinnovo anchor (Item #24) ---
  const guideUrl = getRinnovoGuideUrl(permit.treeKey);
  if (guideUrl) {
    sections.push({
      heading: '\ud83d\udcda Guida completa',
      content: `[Leggi la guida completa sul rinnovo di questo permesso su SOSpermesso](${guideUrl})`,
    });
  }

  // Determine title — now just the permit name (Item #15: removed old header format)
  const title = overrides?.title ?? permit.notionName;

  // Determine intro
  let introText: string;
  if (method === 'KIT') {
    introText = overrides?.introText ?? `Il tuo permesso per ${permit.notionName.toLowerCase()} può essere rinnovato tramite il kit postale.`;
  } else if (method === 'personalmente') {
    introText =
      overrides?.introText ?? `Il tuo permesso per ${permit.notionName.toLowerCase()} può essere rinnovato presentandoti di persona in Questura.`;
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
  // STEP 0: Validity check before permit selection
  r_valid_check: {
    id: 'r_valid_check',
    type: 'question',
    question: 'Il tuo permesso è ancora valido?',
  },

  r_scad_check: {
    id: 'r_scad_check',
    type: 'question',
    question: 'È scaduto da meno di 60 giorni?',
    description: 'Il termine massimo per rinnovare è 60 giorni dopo la scadenza.',
  },

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
  // Item #12: duration "normalmente 2 anni; se contratto indeterminato, 3 anni"
  r_end_lav_sub: mergedResult('r_end_lav_sub', ['lav_sub_flussi', 'lav_sub_conv'], {
    title: 'Lavoro subordinato',
    extraSections: [{
      heading: '\u23f3 Durata',
      content: 'Normalmente viene dato per due anni. Se il tuo contratto di lavoro è a tempo indeterminato, può essere dato per tre anni.',
    }],
  }),
  r_end_lav_aut: mergedResult('r_end_lav_aut', ['lav_aut_flussi', 'lav_aut_conv'], {
    title: 'Lavoro autonomo',
    extraSections: [{
      heading: '\u23f3 Durata',
      content: 'Normalmente viene dato per due anni. Se il tuo contratto di lavoro è a tempo indeterminato, può essere dato per tre anni.',
    }],
  }),
  r_end_stagionale: buildResult('r_end_stagionale', rinnovoByKey['stagionale']
    ? { ...rinnovoByKey['stagionale'], duration: 'fino alla scadenza del nuovo contratto di lavoro stagionale' }
    : undefined, {
    title: 'Lavoro stagionale',
    // Item #20: Q&A about conversion to lavoro subordinato
    extraSections: [{
      heading: '\ud83d\udca1 Lo sapevi?',
      content: 'Se hai un contratto di lavoro subordinato non stagionale, puoi anche chiedere la conversione in permesso di soggiorno per lavoro subordinato.',
    }],
  }),

  // --- Studio ---
  // Item #17: can be renewed while studies ongoing, max 3 years after
  r_end_studio: buildResult('r_end_studio', rinnovoByKey['studio_visto'], {
    title: 'Studio',
    extraSections: [{
      heading: '\u23f3 Durata',
      content: 'Il permesso per studio può essere rinnovato finché proseguono gli studi, e per un massimo di 3 anni dopo la fine del percorso di studi.',
    }],
  }),

  // --- Famiglia (many sub-types) ---
  // Item #9: Remove "conversione con kit" warning from fam_genitore_ita
  r_end_fam_genitore_ita: buildResult('r_end_fam_genitore_ita',
    rinnovoByKey['fam_genitore_ita']
      ? {
        ...rinnovoByKey['fam_genitore_ita'],
        infoExtra: rinnovoByKey['fam_genitore_ita'].infoExtra
          .replace(/\n\nAttenzione: se stai chiedendo questo permesso come conversione da altro permesso, la domanda si fa con kit/g, ''),
      }
      : undefined, {
    title: 'Famiglia - genitore di cittadino italiano',
  }),
  r_end_fam_ricong: buildResult('r_end_fam_ricong', rinnovoByKey['fam_ricong'], {
    title: 'Famiglia - ricongiungimento familiare',
  }),
  r_end_fam_coesione: buildResult('r_end_fam_coesione', rinnovoByKey['fam_coesione'], {
    title: 'Famiglia - coesione familiare',
  }),
  r_end_fam_convivente_ita: buildResult('r_end_fam_convivente_ita', rinnovoByKey['fam_convivente_ita'], {
    title: 'Famiglia - convivente con parente italiano',
  }),
  r_end_famit_statici: buildResult('r_end_famit_statici', rinnovoByKey['famit_statici'], {
    title: 'FAMIT per familiari di cittadini italiani',
  }),
  // Item #11: after first renewal it becomes permanent
  r_end_carta_fam_ita: buildResult('r_end_carta_fam_ita', rinnovoByKey['carta_fam_ita'], {
    title: 'Carta di soggiorno per familiari di italiani',
    extraSections: [{
      heading: '\ud83d\udca1 Lo sapevi?',
      content: 'Dopo il primo rinnovo (dopo 5 anni), la carta di soggiorno diventa permanente. Dopo quel momento, sarà sufficiente aggiornare i dati personali ogni 10 anni.',
    }],
  }),
  // Item #10: after first renewal it becomes permanent
  r_end_carta_fam_ue: buildResult('r_end_carta_fam_ue', rinnovoByKey['carta_fam_ue'], {
    title: 'Carta di soggiorno per familiari di cittadini UE',
    extraSections: [{
      heading: '\ud83d\udca1 Lo sapevi?',
      content: 'Dopo il primo rinnovo (dopo 5 anni), la carta di soggiorno diventa permanente. Dopo quel momento, sarà sufficiente aggiornare i dati personali ogni 10 anni.',
    }],
  }),
  r_end_fam_rifugiato: buildResult('r_end_fam_rifugiato', rinnovoByKey['fam_rifugiato'], {
    title: 'Familiari di rifugiato o protezione sussidiaria',
  }),
  // Item #23: affidamento — specify can convert to studio, lavoro, attesa occupazione
  r_end_affidamento: buildResult('r_end_affidamento', rinnovoByKey['affidamento'], {
    title: 'Affidamento a familiari entro il quarto grado',
    extraSections: [{
      heading: '\ud83d\udd04 Conversione',
      content: 'Questo permesso può essere convertito in permesso per studio, per lavoro, o per attesa occupazione.',
    }],
  }),
  r_end_ass_minori: {
    id: 'r_end_ass_minori',
    type: 'result',
    title: 'Assistenza minori (Art. 31)',
    introText: 'Questo permesso non può essere rinnovato. Per ottenere un nuovo permesso Art. 31 è necessario fare una nuova causa al Tribunale per i Minorenni.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale necessaria',
        content: 'Sì, hai bisogno di un avvocato per presentare un nuovo ricorso al Tribunale per i Minorenni.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
      },
      {
        heading: '\ud83d\udccc Cosa fare',
        content: 'Prima della scadenza del permesso, rivolgiti a un avvocato o a un servizio di consulenza legale per avviare una nuova causa al Tribunale per i Minorenni e ottenere un nuovo permesso Art. 31.\n\n[Maggiori informazioni sul permesso Art. 31](https://www.sospermesso.it/permesso-assistenza-minore-articolo-31.html)',
      },
    ],
  },

  // --- Protezione ---
  // Item #16: Q&A about citizenship after 5 years
  r_end_asilo: buildResult('r_end_asilo', rinnovoByKey['asilo'], {
    title: 'Asilo (status di rifugiato)',
    extraSections: [{
      heading: '\ud83d\udca1 Lo sapevi?',
      content: 'Puoi chiedere la cittadinanza italiana dopo 5 anni dalla tua domanda di asilo. Chiedi aiuto legale per sapere come fare.',
    }],
  }),
  r_end_prot_suss: buildResult('r_end_prot_suss', rinnovoByKey['prot_suss'], {
    title: 'Protezione sussidiaria',
    // Item #16: same Q&A for prot sussidiaria
    extraSections: [{
      heading: '\ud83d\udca1 Lo sapevi?',
      content: 'Puoi chiedere la cittadinanza italiana dopo 5 anni dalla tua domanda di asilo. Chiedi aiuto legale per sapere come fare.',
    }],
  }),
  // Item #22: don't say impossible, say dubious/can be attempted
  r_end_prot_spec: {
    id: 'r_end_prot_spec',
    type: 'result',
    title: 'Protezione speciale',
    introText: 'Il rinnovo della protezione speciale è una questione complessa. In alcuni casi è possibile, ma è fortemente consigliato rivolgersi a un consulente legale.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
        content: 'Il rinnovo della protezione speciale non è sempre garantito e dipende dalle circostanze specifiche del tuo caso. In alcune situazioni è possibile ottenerlo. Ti consigliamo di rivolgerti a un servizio di consulenza legale il prima possibile per valutare le tue opzioni.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
      },
      {
        heading: '\ud83d\udd04 Conversione',
        content: 'Se il rinnovo non è possibile, potresti valutare la conversione in un altro tipo di permesso (ad es. lavoro o studio). Un consulente legale può aiutarti a capire le alternative.',
      },
    ],
  },
  r_end_rich_asilo: buildResult('r_end_rich_asilo', rinnovoByKey['rich_asilo'], {
    title: 'Richiesta asilo',
    // Item #18: specify duration "fino a un anno"
    extraSections: [{
      heading: '\u23f3 Durata',
      content: 'Il permesso per richiesta asilo dura fino a un anno ed è rinnovabile fino alla decisione della Commissione.',
    }],
  }),
  // Item #26: sfruttamento — specify can convert to lavoro autonomo o subordinato
  r_end_sfruttamento: buildResult('r_end_sfruttamento', rinnovoByKey['sfruttamento'], {
    title: 'Sfruttamento lavorativo',
    extraSections: [{
      heading: '\ud83d\udd04 Conversione',
      content: 'Questo permesso può essere convertito in permesso per lavoro autonomo o subordinato.',
    }],
  }),
  r_end_prot_soc_violenza: buildResult('r_end_prot_soc_violenza', rinnovoByKey['prot_soc_violenza'], {
    title: 'Protezione sociale - vittime di violenza domestica',
  }),
  r_end_prot_soc_tratta: buildResult('r_end_prot_soc_tratta', rinnovoByKey['prot_soc_tratta'], {
    title: 'Protezione sociale - vittime di tratta',
  }),
  r_end_calamita: buildResult('r_end_calamita', rinnovoByKey['calamita'], {
    title: 'Calamità naturale',
  }),
  // Item #13: renewable until 18, then needs to be converted — link to conversione
  r_end_minore: {
    id: 'r_end_minore',
    type: 'result',
    title: 'Minore età (per MSNA)',
    introText: 'Il permesso per minore età è rinnovabile fino al compimento dei 18 anni.',
    sections: [
      {
        heading: '\u2705 Rinnovo possibile',
        content: 'Il tuo permesso per minore età può essere rinnovato finché non compi 18 anni.',
      },
      {
        heading: '\u26a0\ufe0f Al compimento dei 18 anni',
        content: 'Quando compi 18 anni, il permesso per minore età scade e non può più essere rinnovato. Dovrai convertirlo in un altro tipo di permesso (ad es. studio, lavoro, attesa occupazione, prosieguo amministrativo).',
      },
      {
        heading: '\ud83d\udd04 Conversione',
        content: 'Torna indietro e scegli "Convertire il permesso" per scoprire le tue opzioni di conversione. Ti consigliamo di iniziare la procedura prima del compimento dei 18 anni.',
      },
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
        content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale per valutare le opzioni di conversione prima della scadenza.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
      },
    ],
  },

  // --- Cure mediche ---
  r_end_cure_visto: buildResult('r_end_cure_visto', rinnovoByKey['cure_visto'], {
    title: 'Cure mediche (ingresso con visto)',
  }),
  r_end_cure_grave: buildResult('r_end_cure_grave', rinnovoByKey['cure_grave']
    ? { ...rinnovoByKey['cure_grave'], modRinnovo: ['personalmente'] }
    : undefined, {
    title: 'Cure mediche - persona gravemente malata',
  }),
  r_end_cure_padre: {
    id: 'r_end_cure_padre',
    type: 'result',
    title: 'Cure mediche (padre)',
    introText: 'Questo permesso dura solo 6 mesi dalla nascita del bambino e non è rinnovabile né convertibile.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
        content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
      },
      {
        heading: '\ud83d\udca1 Alternativa possibile',
        content: 'Potresti valutare la possibilità di richiedere un permesso per assistenza minori (Art. 31).\n\n[Maggiori informazioni sul permesso Art. 31](https://www.sospermesso.it/permesso-assistenza-minore-articolo-31.html)',
      },
    ],
  },
  r_end_cure_gravidanza: {
    id: 'r_end_cure_gravidanza',
    type: 'result',
    title: 'Cure mediche (gravidanza/maternità)',
    introText: 'Questo permesso dura solo 6 mesi dalla nascita del bambino e non è rinnovabile né convertibile.',
    sections: [
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
        content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
      },
      {
        heading: '\ud83d\udca1 Alternativa possibile',
        content: 'Potresti valutare la possibilità di richiedere un permesso per assistenza minori (Art. 31).\n\n[Maggiori informazioni sul permesso Art. 31](https://www.sospermesso.it/permesso-assistenza-minore-articolo-31.html)',
      },
    ],
  },

  // --- Altro ---
  r_end_att_occ: buildResult('r_end_att_occ', rinnovoByKey['att_occ'], {
    title: 'Attesa occupazione',
  }),
  r_end_sportiva: buildResult('r_end_sportiva', rinnovoByKey['sportiva'], {
    title: 'Attività sportiva',
    // Item #26: specify can convert to lavoro
    extraSections: [{
      heading: '\ud83d\udd04 Conversione',
      content: 'Questo permesso può essere convertito in permesso per motivi di lavoro.',
    }],
  }),
  r_end_apolidia: buildResult('r_end_apolidia', rinnovoByKey['apolidia'], {
    title: 'Apolidia',
  }),
  r_end_res_elettiva: buildResult('r_end_res_elettiva', rinnovoByKey['res_elettiva'], {
    title: 'Residenza elettiva',
  }),
  r_end_artistico: buildResult('r_end_artistico', rinnovoByKey['artistico'], {
    title: 'Lavoro artistico',
  }),
  r_end_religiosi: buildResult('r_end_religiosi', rinnovoByKey['religiosi'], {
    title: 'Motivi religiosi',
  }),
  r_end_ricerca: buildResult('r_end_ricerca', rinnovoByKey['ricerca'], {
    title: 'Ricerca scientifica',
  }),
  r_end_tirocinio: buildResult('r_end_tirocinio', rinnovoByKey['tirocinio'], {
    title: 'Tirocinio',
  }),
  // Item #14: Carta UE — it's not renewal, it's "aggiornamento"; remove primo rilascio notes
  r_end_carta_ue: buildResult('r_end_carta_ue',
    rinnovoByKey['carta_ue']
      ? {
        ...rinnovoByKey['carta_ue'],
        // Strip the "NOTA documenti primo rilascio" block from infoExtra
        infoExtra: rinnovoByKey['carta_ue'].infoExtra
          .replace(/\n\nNOTA documenti primo rilascio[\s\S]*$/, ''),
      }
      : undefined, {
    title: 'Carta UE per soggiornanti di lungo periodo',
    introText: 'La Carta UE per soggiornanti di lungo periodo ha durata illimitata e non necessita di rinnovo. Dopo 10 anni è necessario aggiornare i dati personali (foto e residenza).',
    extraSections: [{
      heading: '\u26a0\ufe0f Attenzione',
      content: 'Si tratta di un aggiornamento, non di un rinnovo. Molte Questure potrebbero chiedere altri documenti come se fosse un rinnovo. Se li hai, mettili nel kit. Se non li hai, chiedi comunque l\'aggiornamento e se la Questura rigetta la tua domanda, rivolgiti a un aiuto legale.',
    }],
  }),
  r_end_prosieguo: buildResult('r_end_prosieguo', rinnovoByKey['prosieguo'], {
    title: 'Prosieguo amministrativo',
  }),
  r_end_figlio_14: buildResult('r_end_figlio_14', rinnovoByKey['figlio_14'], {
    title: 'Figlio minore di più di 14 anni',
  }),

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
          'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per verificare le possibilità di rinnovo.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
      },
    ],
  },

  // --- Expired > 60 days ---
  r_end_scaduto_60: {
    id: 'r_end_scaduto_60',
    type: 'result',
    title: 'Permesso scaduto da più di 60 giorni',
    introText:
      '[Nome], il tuo permesso è scaduto da più di 60 giorni e potrebbe non essere più rinnovato. Fai comunque la domanda, ma chiedi subito un aiuto legale.',
    sections: [
      {
        heading: '⚠️ Attenzione',
        content:
          'Il termine massimo per rinnovare il permesso di soggiorno è 60 giorni dopo la scadenza. Superato questo termine, la questura potrebbe rifiutare la domanda di rinnovo.',
      },
      {
        heading: '\ud83d\udc68\u200d\u2696\ufe0f Cosa fare',
        content:
          'Presenta comunque la domanda di rinnovo il prima possibile e rivolgiti subito a un servizio di consulenza legale gratuita per farti assistere.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// RINNOVO EDGES
// ---------------------------------------------------------------------------

const rinnovoEdges: TreeEdge[] = [
  // =============================================
  // STEP 0: VALIDITY CHECK
  // =============================================
  { from: 'r_valid_check', to: 'r_quale_hai', label: 'Sì, è ancora valido', optionKey: 'valido' },
  { from: 'r_valid_check', to: 'r_scad_check', label: 'No, è scaduto', optionKey: 'scaduto' },
  { from: 'r_scad_check', to: 'r_quale_hai', label: 'Sì, meno di 60 giorni', optionKey: 'meno_60' },
  { from: 'r_scad_check', to: 'r_end_scaduto_60', label: 'No, più di 60 giorni', optionKey: 'piu_60' },

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
  // Item #19: removed "Assistenza minori" — already in famiglia sub-question
  // =============================================
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
  // Item #8: removed "Ricongiungimento familiare" option
  { from: 'r_quale_fam', to: 'r_end_fam_genitore_ita', label: 'Genitore di cittadino italiano', optionKey: 'genitore_ita' },
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
  // Fork → branches
  { from: 'rc_fork', to: 'r_valid_check', label: 'Rinnovare il permesso', optionKey: 'rinnovare' },
  { from: 'rc_fork', to: 'c_quale_hai', label: 'Convertire il permesso', optionKey: 'convertire' },
];

// ---------------------------------------------------------------------------
// COMBINED TREE
// ---------------------------------------------------------------------------

export const rinnovoConversioneTree: TreeData = {
  startNodeId: 'rc_fork',

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
    // Shared edges (fork → branches)
    ...sharedEdges,
    // Rinnovo edges
    ...rinnovoEdges,
    // Existing conversione edges
    ...conversioneTree.edges,
  ],
};
