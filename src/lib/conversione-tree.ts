/**
 * Conversione (permit conversion) decision tree for SOSpermesso.
 *
 * INVERTED FLOW: asks "quale hai?" first, then "quale vorresti?"
 *
 * Flow:
 *   1. "Quale permesso hai adesso?" → select current permit
 *   2. "È ancora valido?" → per-current-permit validity gate
 *   3. "In quale permesso vorresti convertire?" → per-current-permit targets
 *   4. Follow-up questions if needed (e.g. studi finiti)
 *   5. Result
 *
 * Node IDs use `c_` prefix to avoid collisions with the main Italian tree.
 */

import type { TreeData, ResultSection } from '@/types/tree';
import { buildResult } from './rinnovo-build-result';
import { rinnovoByKey } from './rinnovo-notion-data.generated';

/**
 * Extract document/method/duration sections from rinnovo buildResult
 * for use in positive conversione outcome pages.
 */
function getTargetPermitSections(notionKey: string): ResultSection[] {
  const permit = rinnovoByKey[notionKey];
  if (!permit) return [];

  // Use buildResult to get a fully-corrected TreeNode, then extract relevant sections
  const tmpNode = buildResult('_tmp', permit);
  const sections = tmpNode.sections ?? [];

  // Keep only doc and duration sections (not the green badge, method, or conversione sections)
  // Method ("Come rinnovare") is excluded because conversione nodes have their own "Come fare"
  return sections
    .filter((s) =>
      s.heading.includes('Documenti') ||
      s.heading.includes('Durata'),
    )
    .map((s) => ({
      ...s,
      // Strip paragraphs that talk about the rinnovo procedure — irrelevant on conversione pages
      content: s.content
        .split('\n\n')
        .filter((para) => !/per il rinnovo|NOTA.*rinnov|rinnovo di questo permesso/i.test(para))
        .join('\n\n')
        .trim(),
    }))
    .filter((s) => s.content.length > 0);
}

export const conversioneTree: TreeData = {
  startNodeId: 'c_quale_hai',

  nodes: {
    // =============================================
    // STEP 1 — QUALE PERMESSO HAI ADESSO?
    // =============================================

    c_quale_hai: {
      id: 'c_quale_hai',
      type: 'question',
      question: 'CONVERSIONE: quale permesso di soggiorno hai adesso?',
    },

    c_hai_altro: {
      id: 'c_hai_altro',
      type: 'question',
      question: 'Quale altro permesso hai?',
    },

    // =============================================
    // STEP 2 — VALIDITY CHECK (one per current permit)
    // =============================================

    c_val_lav: { id: 'c_val_lav', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_famiglia: { id: 'c_val_famiglia', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_studio: { id: 'c_val_studio', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_att_occ: { id: 'c_val_att_occ', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_prot_suss: { id: 'c_val_prot_suss', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_asilo: { id: 'c_val_asilo', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_prot_spec: { id: 'c_val_prot_spec', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_minore: { id: 'c_val_minore', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_rich_asilo: { id: 'c_val_rich_asilo', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_stagionale: { id: 'c_val_stagionale', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_ass_minori: { id: 'c_val_ass_minori', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_calamita: { id: 'c_val_calamita', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_cure: { id: 'c_val_cure', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_sport_art: { id: 'c_val_sport_art', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_cittadinanza: { id: 'c_val_cittadinanza', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_res_elett: { id: 'c_val_res_elett', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_religiosi: { id: 'c_val_religiosi', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_ricerca: { id: 'c_val_ricerca', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_sfruttamento: { id: 'c_val_sfruttamento', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_prot_soc: { id: 'c_val_prot_soc', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },
    c_val_generico: { id: 'c_val_generico', type: 'question', question: 'Il tuo permesso di soggiorno è ancora valido?' },

    // Shared scaduto handling (Famiglia exception)
    c_scaduto_quanto: {
      id: 'c_scaduto_quanto',
      type: 'question',
      question: 'Da quanto tempo è scaduto il tuo permesso?',
    },
    c_scaduto_vorresti: {
      id: 'c_scaduto_vorresti',
      type: 'question',
      question: 'In quale permesso vorresti convertire?',
      description: 'Attenzione: con un permesso scaduto, la conversione potrebbe non essere possibile per tutti i tipi di permesso.',
    },

    // =============================================
    // STEP 3 — QUALE PERMESSO VORRESTI? (one per current permit)
    // =============================================

    c_vorresti_lav: { id: 'c_vorresti_lav', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_famiglia: { id: 'c_vorresti_famiglia', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_studio: { id: 'c_vorresti_studio', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_att_occ: { id: 'c_vorresti_att_occ', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_prot_suss: { id: 'c_vorresti_prot_suss', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_asilo: { id: 'c_vorresti_asilo', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_prot_spec: { id: 'c_vorresti_prot_spec', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_minore: { id: 'c_vorresti_minore', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_rich_asilo: { id: 'c_vorresti_rich_asilo', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_stagionale: { id: 'c_vorresti_stagionale', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_ass_minori: { id: 'c_vorresti_ass_minori', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_calamita: { id: 'c_vorresti_calamita', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_cure: { id: 'c_vorresti_cure', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_sport_art: { id: 'c_vorresti_sport_art', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_cittadinanza: { id: 'c_vorresti_cittadinanza', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_res_elett: { id: 'c_vorresti_res_elett', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_religiosi: { id: 'c_vorresti_religiosi', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_ricerca: { id: 'c_vorresti_ricerca', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_sfruttamento: { id: 'c_vorresti_sfruttamento', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_prot_soc: { id: 'c_vorresti_prot_soc', type: 'question', question: 'In quale permesso vorresti convertire?' },
    c_vorresti_generico: { id: 'c_vorresti_generico', type: 'question', question: 'In quale permesso vorresti convertire?' },

    // =============================================
    // FOLLOW-UP QUESTIONS (Studio → Lavoro path)
    // =============================================

    c_lav_studi_finiti: {
      id: 'c_lav_studi_finiti',
      type: 'question',
      question: 'Hai finito il percorso di studi?',
    },

    c_lav_titolo: {
      id: 'c_lav_titolo',
      type: 'question',
      question: 'Qual è il tuo titolo di studio?',
    },

    c_lav_studi_uni: {
      id: 'c_lav_studi_uni',
      type: 'question',
      question: 'Stai frequentando un percorso universitario?',
    },

    c_data_5mag_2023: {
      id: 'c_data_5mag_2023',
      type: 'question',
      question: 'La domanda per il tuo attuale permesso è stata presentata prima o dopo il 5 maggio 2023?',
    },

    // =============================================
    // RESULT NODES
    // =============================================

    // --- LAVORO OUTCOMES ---
    c_end_lav_sub_ok: {
      id: 'c_end_lav_sub_ok',
      type: 'result',
      title: 'Conversione in Lavoro Subordinato: POSSIBILE',
      introText:
        'È possibile convertire il tuo permesso per [PermessoAttuale] in permesso per lavoro subordinato.',
      sections: [
        {
          heading: '\u2705 Conversione possibile — puoi fare da solo',
          content: 'La conversione in lavoro subordinato è possibile.',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Devi prima richiedere il nulla osta presso lo Sportello Unico per l\'Immigrazione, poi presentare domanda tramite il [kit postale](https://www.sospermesso.it/kit-postale).',
        },
        {
          heading: '\u23f3 Durata',
          content: 'Normalmente viene dato per due anni. Se il tuo contratto di lavoro è a tempo indeterminato, può essere dato per tre anni.',
        },
        ...getTargetPermitSections('lav_sub_conv').filter((s) => !s.heading.includes('Durata')),
      ],
    },

    c_end_lav_aut_ok: {
      id: 'c_end_lav_aut_ok',
      type: 'result',
      title: 'Conversione in Lavoro Autonomo: POSSIBILE',
      introText:
        'È possibile convertire il tuo permesso per [PermessoAttuale] in permesso per lavoro autonomo.',
      sections: [
        {
          heading: '\u2705 Conversione possibile — puoi fare da solo',
          content: 'La conversione in lavoro autonomo è possibile.',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Devi prima richiedere il nulla osta presso lo Sportello Unico per l\'Immigrazione, poi presentare domanda tramite il [kit postale](https://www.sospermesso.it/kit-postale).',
        },
        {
          heading: '\u23f3 Durata',
          content: 'Normalmente viene dato per due anni.',
        },
        ...getTargetPermitSections('lav_aut_conv').filter((s) => !s.heading.includes('Durata')),
      ],
    },

    c_end_lav_no: {
      id: 'c_end_lav_no',
      type: 'result',
      title: 'Conversione in Lavoro: NON POSSIBILE',
      introText:
        'Purtroppo, con il tuo attuale permesso di soggiorno la conversione in un permesso per lavoro non è possibile.',
      sections: [
        {
          heading: '\u2139\ufe0f Perché',
          content:
            'Il tipo di permesso che hai attualmente non consente la conversione diretta in un permesso per lavoro secondo la normativa vigente.',
        },
        {
          heading: '\ud83d\udcac Consiglio',
          content:
            'Puoi tornare indietro e provare con un altro tipo di permesso, oppure rivolgerti a un servizio di consulenza legale gratuita.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    c_end_lav_speciale: {
      id: 'c_end_lav_speciale',
      type: 'result',
      title: 'Conversione Protezione Speciale \u2192 Lavoro: situazione complicata',
      introText:
        'La conversione del permesso per protezione speciale in lavoro è una situazione delicata.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content:
            'Se la domanda di protezione è stata presentata prima del 5 maggio 2023, la conversione è possibile.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            "Questa situazione richiede necessariamente l'assistenza di uno specialista in diritto dell'immigrazione.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)",
        },
      ],
    },

    c_end_lav_cure: {
      id: 'c_end_lav_cure',
      type: 'result',
      title: 'Conversione Cure Mediche \u2192 Lavoro',
      introText:
        'La normativa sulla conversione del permesso per cure mediche in lavoro è cambiata.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione attuale',
          content:
            "Il DL 50/2023 ha modificato le regole. La conversione è possibile solo se la domanda è stata presentata prima del 5 maggio 2023.",
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            'Data la complessità della situazione, è indispensabile rivolgersi a un legale specializzato.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    c_end_lav_calam: {
      id: 'c_end_lav_calam',
      type: 'result',
      title: 'Conversione Calamità \u2192 Lavoro',
      introText:
        'La conversione del permesso per calamità naturale in lavoro non è più possibile in via ordinaria.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content:
            "La conversione è possibile solo se la domanda è stata presentata prima del 5 maggio 2023.",
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            "È necessario verificare con un legale se rientri nell'eccezione temporale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)",
        },
      ],
    },

    c_end_lav_minore: {
      id: 'c_end_lav_minore',
      type: 'result',
      title: 'Conversione Minore Età \u2192 Lavoro: situazione delicata',
      introText:
        'La conversione è possibile, ma è subordinata al rispetto di requisiti specifici, ai tempi di presentazione della domanda e — dal 6 ottobre 2023 — alla verifica del contratto di lavoro da parte di consulenti del lavoro o organizzazioni sindacali.',
      sections: [
        {
          heading: '\ud83d\udccb Requisiti per la conversione',
          content:
            'Per convertire il permesso per minore età in un altro permesso servono:\n• **Passaporto valido** (o documento equipollente)\n• **Presenza in Italia da almeno 3 anni** e ammissione ad un progetto di integrazione sociale e civile per almeno 2 anni (con disponibilità di alloggio)\n\nIn alternativa al secondo requisito:\n• **Parere positivo della Direzione Generale dell\'Immigrazione**, basato su almeno 6 mesi di permanenza in Italia prima dei 18 anni e su un percorso di integrazione avviato (scuola, formazione, lavoro). Il parere è necessario ma **non vincolante**: la Questura mantiene autonomia di giudizio.',
        },
        {
          heading: '\ud83d\udcc5 Tempi',
          content:
            'La domanda di conversione va presentata alla Questura competente:\n• **60 giorni prima** del compimento dei 18 anni, dal tutore;\n• oppure **entro 60 giorni dopo** il compimento dei 18 anni, dal diretto interessato.',
        },
        {
          heading: '\ud83d\udd0d Verifica del contratto di lavoro (dal 6 ottobre 2023)',
          content:
            'Per la conversione in permesso per lavoro subordinato o autonomo è prevista una verifica aggiuntiva dei requisiti del contratto:\n• **Regolarità del contratto** sottoscritto;\n• **Rispetto del contratto collettivo** di lavoro applicabile;\n• **Esistenza concreta dell\'attività autonoma**, se applicabile.\n\nLa verifica è effettuata da consulenti del lavoro o dalle organizzazioni sindacali dei datori di lavoro.',
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            'Ti consigliamo di rivolgerti ai servizi sociali e a un esperto legale per assistenza.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    // --- ATTESA OCCUPAZIONE OUTCOMES ---
    c_end_att_ok: {
      id: 'c_end_att_ok',
      type: 'result',
      title: 'Conversione in Attesa Occupazione: POSSIBILE',
      introText:
        'È possibile convertire il tuo permesso per [PermessoAttuale] in permesso per [PermessoTarget].',
      sections: [
        {
          heading: '\u2705 Conversione possibile — puoi fare da solo',
          content: 'La conversione in attesa occupazione è possibile.',
        },
        {
          heading: '\u2139\ufe0f Informazione utile',
          content:
            'Puoi richiedere il permesso per attesa occupazione anche senza precedente esperienza lavorativa.',
        },
        ...getTargetPermitSections('att_occ'),
      ],
    },

    c_end_att_no: {
      id: 'c_end_att_no',
      type: 'result',
      title: 'Conversione in Attesa Occupazione: NON POSSIBILE',
      introText:
        'Purtroppo, con il tuo attuale permesso di soggiorno la conversione in attesa occupazione non è possibile.',
      sections: [
        {
          heading: '\ud83d\udcac Consiglio',
          content:
            'Puoi tornare indietro e provare con un altro tipo di permesso, oppure rivolgerti a un servizio di consulenza legale gratuita.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    c_end_att_asilo: {
      id: 'c_end_att_asilo',
      type: 'result',
      title: 'Asilo/Protezione Sussidiaria \u2192 Attesa Occupazione: non ha senso',
      introText:
        "Il permesso per asilo o protezione sussidiaria offre una protezione più forte rispetto all'attesa occupazione.",
      sections: [
        {
          heading: '\u2139\ufe0f Perché',
          content:
            'In generale le Questure non accettano questa conversione perché il tuo permesso attuale ti dà già più diritti.',
        },
        {
          heading: '\ud83d\udcac Consiglio',
          content:
            'Mantieni il tuo attuale permesso che ti garantisce una protezione maggiore.',
        },
      ],
    },

    c_end_att_incerta: {
      id: 'c_end_att_incerta',
      type: 'result',
      title: 'Conversione in Attesa Occupazione: INCERTA',
      introText:
        'È una situazione delicata: la conversione non è automatica e le Questure interpretano le regole in modo diverso. Tuttavia, se hai lavorato di recente in Italia e adesso sei senza impiego, può valere la pena tentare — il permesso per attesa occupazione è pensato proprio per chi si trova in questa condizione. Per valutare il tuo caso ti consigliamo di rivolgerti a un esperto legale.',
      sections: [],
    },

    c_end_att_minore: {
      id: 'c_end_att_minore',
      type: 'result',
      title: 'Conversione Minore Età \u2192 Attesa Occupazione: situazione particolare',
      introText:
        'La conversione è possibile, ma è subordinata al rispetto di requisiti specifici e ai tempi di presentazione della domanda rispetto al compimento dei 18 anni.',
      sections: [
        {
          heading: '\ud83d\udccb Requisiti per la conversione',
          content:
            'Per convertire il permesso per minore età in un altro permesso servono:\n• **Passaporto valido** (o documento equipollente)\n• **Presenza in Italia da almeno 3 anni** e ammissione ad un progetto di integrazione sociale e civile per almeno 2 anni (con disponibilità di alloggio)\n\nIn alternativa al secondo requisito:\n• **Parere positivo della Direzione Generale dell\'Immigrazione**, basato su almeno 6 mesi di permanenza in Italia prima dei 18 anni e su un percorso di integrazione avviato (scuola, formazione, lavoro). Il parere è necessario ma **non vincolante**: la Questura mantiene autonomia di giudizio.',
        },
        {
          heading: '\ud83d\udcc5 Tempi',
          content:
            'La domanda di conversione va presentata alla Questura competente:\n• **60 giorni prima** del compimento dei 18 anni, dal tutore;\n• oppure **entro 60 giorni dopo** il compimento dei 18 anni, dal diretto interessato.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve assistenza',
          content:
            'Contatta i servizi sociali e un esperto legale per assistenza nella procedura.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    // --- STUDIO OUTCOMES ---
    c_end_stu_ok: {
      id: 'c_end_stu_ok',
      type: 'result',
      title: 'Conversione in Studio: POSSIBILE',
      introText:
        'È possibile convertire il tuo permesso per [PermessoAttuale] in permesso per [PermessoTarget].',
      sections: [
        {
          heading: '\u2705 Conversione possibile — puoi fare da solo',
          content: 'La conversione in studio è possibile.',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Devi presentare domanda tramite il [kit postale](https://www.sospermesso.it/kit-postale) presso gli uffici postali abilitati.',
        },
        ...getTargetPermitSections('studio_conv'),
      ],
    },

    c_end_stu_no: {
      id: 'c_end_stu_no',
      type: 'result',
      title: 'Conversione in Studio: NON POSSIBILE',
      introText:
        'Purtroppo, con il tuo attuale permesso la conversione in un permesso per studio non è possibile.',
      sections: [
        {
          heading: '\ud83d\udcac Consiglio',
          content:
            'Puoi tornare indietro e provare con un altro tipo di permesso, oppure rivolgerti a un servizio di consulenza legale gratuita.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    c_end_stu_minore: {
      id: 'c_end_stu_minore',
      type: 'result',
      title: 'Conversione Minore Età \u2192 Studio: situazione particolare',
      introText:
        'La conversione è possibile, ma è subordinata al rispetto di requisiti specifici e ai tempi di presentazione della domanda rispetto al compimento dei 18 anni.',
      sections: [
        {
          heading: '\ud83d\udccb Requisiti per la conversione',
          content:
            'Per convertire il permesso per minore età in un altro permesso servono:\n• **Passaporto valido** (o documento equipollente)\n• **Presenza in Italia da almeno 3 anni** e ammissione ad un progetto di integrazione sociale e civile per almeno 2 anni (con disponibilità di alloggio)\n\nIn alternativa al secondo requisito:\n• **Parere positivo della Direzione Generale dell\'Immigrazione**, basato su almeno 6 mesi di permanenza in Italia prima dei 18 anni e su un percorso di integrazione avviato (scuola, formazione, lavoro). Il parere è necessario ma **non vincolante**: la Questura mantiene autonomia di giudizio.',
        },
        {
          heading: '\ud83d\udcc5 Tempi',
          content:
            'La domanda di conversione va presentata alla Questura competente:\n• **60 giorni prima** del compimento dei 18 anni, dal tutore;\n• oppure **entro 60 giorni dopo** il compimento dei 18 anni, dal diretto interessato.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve assistenza',
          content:
            'Contatta i servizi sociali e un esperto legale per assistenza nella procedura.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    c_end_stu_speciale: {
      id: 'c_end_stu_speciale',
      type: 'result',
      title: 'Conversione Protezione Speciale \u2192 Studio: situazione complicata',
      introText:
        'La conversione del permesso per protezione speciale in studio è una situazione delicata.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content:
            'Se la domanda di protezione è stata presentata prima del 5 maggio 2023, la conversione è possibile.',
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            "Questa situazione richiede necessariamente l'assistenza di uno specialista.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)",
        },
      ],
    },

    // --- FAMIGLIA OUTCOMES ---
    c_end_fam_ok: {
      id: 'c_end_fam_ok',
      type: 'result',
      title: 'Conversione in Famiglia: POSSIBILE',
      introText:
        'È possibile convertire il tuo permesso per [PermessoAttuale] in permesso per [PermessoTarget].',
      sections: [
        {
          heading: '\u2705 Conversione possibile — puoi fare da solo',
          content: 'La conversione in permesso per motivi familiari è possibile.',
        },
        {
          heading: '\u2139\ufe0f Requisiti',
          content:
            'La conversione è possibile se il tuo familiare ha un permesso di soggiorno e tu sei: coniuge, figlio minore, figlio maggiorenne disabile, o genitore a carico. Vale anche se il familiare è cittadino italiano o UE.',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Presenta la domanda tramite [kit postale](https://www.sospermesso.it/kit-postale) con la documentazione che dimostra il legame familiare.',
        },
        ...getTargetPermitSections('fam_ricong'),
        {
          heading: '\ud83d\udca1 Lo sapevi?',
          content:
            'Esistono molti tipi di permesso per motivi familiari, e tutti possono essere ottenuti come conversione da un altro permesso.',
        },
      ],
    },

    c_end_fam_anno: {
      id: 'c_end_fam_anno',
      type: 'result',
      title: 'Conversione in Famiglia: permesso scaduto da oltre un anno',
      introText:
        'La situazione potrebbe essere problematica: il tuo permesso è scaduto da più di un anno e la possibilità di conversione dipende dalla tua situazione specifica e dalla Questura competente.',
      sections: [],
    },

    // --- CARTA DI SOGGIORNO UE OUTCOMES ---
    c_end_carta_ok: {
      id: 'c_end_carta_ok',
      type: 'result',
      title: 'Permesso UE lungo periodo: POSSIBILE',
      introText:
        'È possibile convertire il tuo permesso per [PermessoAttuale] in [PermessoTarget].',
      sections: [
        {
          heading: '\u2705 Conversione possibile — puoi fare da solo',
          content: 'Puoi richiedere il Permesso UE per soggiornanti di lungo periodo (anche detto Carta di soggiorno).',
        },
        {
          heading: '\u2139\ufe0f Requisiti',
          content:
            '5 anni consecutivi di soggiorno legale in Italia, reddito sufficiente, superamento del test di lingua italiana (livello A2).',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Presenta la domanda tramite [kit postale](https://www.sospermesso.it/kit-postale) con tutta la documentazione richiesta.',
        },
        ...getTargetPermitSections('carta_ue'),
      ],
    },

    c_end_carta_minori: {
      id: 'c_end_carta_minori',
      type: 'result',
      title: 'Conversione Assistenza Minori \u2192 Permesso UE lungo periodo: possibile',
      introText:
        'La conversione è possibile ma richiede requisiti specifici.',
      sections: [
        {
          heading: '\u2139\ufe0f Requisiti',
          content:
            '5 anni di soggiorno legale, reddito sufficiente, alloggio idoneo, test di lingua A2, assenza di precedenti penali.',
        },
      ],
    },

    c_end_carta_no: {
      id: 'c_end_carta_no',
      type: 'result',
      title: 'Permesso UE lungo periodo: NON POSSIBILE',
      introText:
        'Purtroppo, con il tuo attuale permesso la conversione in Permesso UE lungo periodo non è possibile.',
      sections: [
        {
          heading: '\ud83d\udcac Consiglio',
          content:
            'Puoi tornare indietro e provare con un altro tipo di permesso, oppure rivolgerti a un servizio di consulenza legale gratuita.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    // --- SHARED OUTCOMES ---
    c_end_scaduto: {
      id: 'c_end_scaduto',
      type: 'result',
      title: 'Permesso Scaduto',
      introText:
        'Il tuo permesso di soggiorno è scaduto. La procedura di conversione è più complessa e le possibilità di successo dipendono da diversi fattori.',
      sections: [],
    },

    c_end_scaduto_soft: {
      id: 'c_end_scaduto_soft',
      type: 'result',
      title: 'Conversione teoricamente possibile',
      introText:
        'Teoricamente sarebbe possibile convertire il tuo permesso, però il fatto che sia scaduto potrebbe presentare un problema.',
      sections: [
        {
          heading: '\u26a0\ufe0f Attenzione',
          content:
            'La conversione normalmente si può fare solo con un permesso ancora valido. Il tuo permesso risulta scaduto: alcune Questure potrebbero rifiutare la domanda.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Cosa fare',
          content:
            'Ti consigliamo di rivolgerti a un consulente legale qualificato il prima possibile. Un avvocato può aiutarti a capire se la conversione è ancora possibile e come presentare la domanda.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    c_end_complicata: {
      id: 'c_end_complicata',
      type: 'result',
      title: 'Situazione Complicata',
      introText:
        'La tua situazione è complessa e richiede una valutazione approfondita.',
      sections: [
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve consulenza legale',
          content:
            'Ti consigliamo una consulenza legale di persona. Cerca un servizio di consulenza legale gratuita nella tua zona.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },

    c_end_altro_wip: {
      id: 'c_end_altro_wip',
      type: 'result',
      title: 'Altro tipo di permesso',
      introText:
        'Stiamo ancora lavorando alla conversione di altri tipi di permesso.',
      sections: [
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
          content:
            'Nel frattempo, ti consigliamo di rivolgerti a un servizio di consulenza legale per valutare le possibilità di conversione.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
        },
      ],
    },
  },

  edges: [
    // =============================================
    // STEP 1: QUALE PERMESSO HAI ADESSO?
    // =============================================
    { from: 'c_quale_hai', to: 'c_val_lav', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_quale_hai', to: 'c_val_lav', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_quale_hai', to: 'c_val_famiglia', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_quale_hai', to: 'c_val_studio', label: 'Studio', optionKey: 'studio' },
    { from: 'c_quale_hai', to: 'c_val_att_occ', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_quale_hai', to: 'c_val_prot_suss', label: 'Protezione sussidiaria', optionKey: 'prot_suss' },
    { from: 'c_quale_hai', to: 'c_val_asilo', label: 'Asilo (status di rifugiato)', optionKey: 'asilo' },
    { from: 'c_quale_hai', to: 'c_val_prot_spec', label: 'Protezione speciale', optionKey: 'prot_spec' },
    { from: 'c_quale_hai', to: 'c_val_minore', label: 'Minore età', optionKey: 'minore' },
    { from: 'c_quale_hai', to: 'c_val_rich_asilo', label: 'Richiesta asilo (permesso giallo)', optionKey: 'rich_asilo' },
    { from: 'c_quale_hai', to: 'c_val_stagionale', label: 'Lavoro stagionale', optionKey: 'stagionale' },
    { from: 'c_quale_hai', to: 'c_hai_altro', label: 'Altro permesso', optionKey: 'altro' },

    // HAI ALTRO sub-list
    { from: 'c_hai_altro', to: 'c_val_ass_minori', label: 'Assistenza minori (Art. 31)', optionKey: 'ass_minori' },
    { from: 'c_hai_altro', to: 'c_val_calamita', label: 'Calamità naturale', optionKey: 'calamita' },
    { from: 'c_hai_altro', to: 'c_val_cure', label: 'Cure mediche', optionKey: 'cure' },
    { from: 'c_hai_altro', to: 'c_val_sport_art', label: 'Attività sportiva', optionKey: 'sportiva' },
    { from: 'c_hai_altro', to: 'c_val_cittadinanza', label: 'Acquisto cittadinanza / apolide', optionKey: 'cittadinanza' },
    { from: 'c_hai_altro', to: 'c_val_res_elett', label: 'Residenza elettiva', optionKey: 'res_elettiva' },
    { from: 'c_hai_altro', to: 'c_val_sport_art', label: 'Lavoro artistico', optionKey: 'artistico' },
    { from: 'c_hai_altro', to: 'c_val_religiosi', label: 'Motivi religiosi', optionKey: 'religiosi' },
    { from: 'c_hai_altro', to: 'c_val_ricerca', label: 'Ricerca scientifica (art. 27ter)', optionKey: 'ricerca' },
    { from: 'c_hai_altro', to: 'c_val_sfruttamento', label: 'Sfruttamento lavorativo (Art. 22 co. 12quater)', optionKey: 'sfruttamento' },
    { from: 'c_hai_altro', to: 'c_val_prot_soc', label: 'Protezione sociale (Art. 18)', optionKey: 'prot_sociale' },
    { from: 'c_hai_altro', to: 'c_val_generico', label: 'Ho un altro permesso', optionKey: 'altro_perm' },

    // =============================================
    // STEP 2: VALIDITY CHECK (per current permit)
    // All "valido" → vorresti node; all "scaduto" → shared scaduto handler
    // =============================================
    { from: 'c_val_lav', to: 'c_vorresti_lav', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_lav', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_famiglia', to: 'c_vorresti_famiglia', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_famiglia', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_studio', to: 'c_vorresti_studio', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_studio', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_att_occ', to: 'c_vorresti_att_occ', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_att_occ', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_prot_suss', to: 'c_vorresti_prot_suss', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_prot_suss', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_asilo', to: 'c_vorresti_asilo', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_asilo', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_prot_spec', to: 'c_vorresti_prot_spec', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_prot_spec', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_minore', to: 'c_vorresti_minore', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_minore', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_rich_asilo', to: 'c_vorresti_rich_asilo', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_rich_asilo', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_stagionale', to: 'c_vorresti_stagionale', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_stagionale', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_ass_minori', to: 'c_vorresti_ass_minori', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_ass_minori', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_calamita', to: 'c_vorresti_calamita', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_calamita', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_cure', to: 'c_vorresti_cure', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_cure', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_sport_art', to: 'c_vorresti_sport_art', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_sport_art', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_cittadinanza', to: 'c_vorresti_cittadinanza', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_cittadinanza', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_res_elett', to: 'c_vorresti_res_elett', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_res_elett', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_religiosi', to: 'c_vorresti_religiosi', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_religiosi', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_ricerca', to: 'c_vorresti_ricerca', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_ricerca', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_sfruttamento', to: 'c_vorresti_sfruttamento', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_sfruttamento', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_prot_soc', to: 'c_vorresti_prot_soc', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_prot_soc', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },
    { from: 'c_val_generico', to: 'c_vorresti_generico', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_val_generico', to: 'c_scaduto_quanto', label: 'Scaduto', optionKey: 'scaduto' },

    // Shared scaduto handling (Famiglia exception)
    { from: 'c_scaduto_quanto', to: 'c_scaduto_vorresti', label: 'Da meno di un anno', optionKey: 'meno_anno' },
    { from: 'c_scaduto_quanto', to: 'c_end_complicata', label: 'Da più di un anno', optionKey: 'piu_anno' },
    { from: 'c_scaduto_vorresti', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_scaduto_vorresti', to: 'c_end_scaduto_soft', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_scaduto_vorresti', to: 'c_end_scaduto_soft', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_scaduto_vorresti', to: 'c_end_scaduto_soft', label: 'Studio', optionKey: 'studio' },
    { from: 'c_scaduto_vorresti', to: 'c_end_scaduto_soft', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_scaduto_vorresti', to: 'c_end_scaduto_soft', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_scaduto_vorresti', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // =============================================
    // STEP 3: QUALE VORRESTI? (per current permit → results)
    // =============================================

    // --- Current: Lavoro sub/aut ---
    { from: 'c_vorresti_lav', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_lav', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_lav', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_lav', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_lav', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Famiglia ---
    { from: 'c_vorresti_famiglia', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_famiglia', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_famiglia', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_famiglia', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_famiglia', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_famiglia', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Studio ---
    { from: 'c_vorresti_studio', to: 'c_lav_studi_finiti', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_studio', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_studio', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_studio', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_studio', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Attesa occupazione ---
    { from: 'c_vorresti_att_occ', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_att_occ', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_att_occ', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_att_occ', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_att_occ', to: 'c_end_complicata', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_att_occ', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Protezione sussidiaria ---
    { from: 'c_vorresti_prot_suss', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_att_asilo', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Asilo (rifugiato) ---
    { from: 'c_vorresti_asilo', to: 'c_end_lav_no', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_asilo', to: 'c_end_att_asilo', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_asilo', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_asilo', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_asilo', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_asilo', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Protezione speciale ---
    { from: 'c_vorresti_prot_spec', to: 'c_data_5mag_2023', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_att_no', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_stu_speciale', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Minore età ---
    { from: 'c_vorresti_minore', to: 'c_end_lav_minore', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_minore', to: 'c_end_att_minore', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_minore', to: 'c_end_stu_minore', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_minore', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_minore', to: 'c_end_complicata', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_minore', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Richiesta asilo (giallo) ---
    { from: 'c_vorresti_rich_asilo', to: 'c_end_lav_no', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_att_no', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Lavoro stagionale ---
    { from: 'c_vorresti_stagionale', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_stagionale', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_stagionale', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_stagionale', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_stagionale', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_stagionale', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_stagionale', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Assistenza minori ---
    { from: 'c_vorresti_ass_minori', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_carta_minori', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Calamità naturale ---
    { from: 'c_vorresti_calamita', to: 'c_data_5mag_2023', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_calamita', to: 'c_end_att_no', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_calamita', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_calamita', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_calamita', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_calamita', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Cure mediche ---
    { from: 'c_vorresti_cure', to: 'c_data_5mag_2023', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_cure', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_cure', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_cure', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_cure', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_cure', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Attività sportiva / Lavoro artistico (shared) ---
    { from: 'c_vorresti_sport_art', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_sport_art', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_sport_art', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_sport_art', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_sport_art', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_sport_art', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_sport_art', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Acquisto cittadinanza / apolide ---
    { from: 'c_vorresti_cittadinanza', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Residenza elettiva ---
    { from: 'c_vorresti_res_elett', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_res_elett', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_res_elett', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_res_elett', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_res_elett', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_res_elett', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_res_elett', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Motivi religiosi ---
    { from: 'c_vorresti_religiosi', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_religiosi', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_religiosi', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_religiosi', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_religiosi', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_religiosi', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_religiosi', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Ricerca scientifica ---
    { from: 'c_vorresti_ricerca', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_ricerca', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_ricerca', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_ricerca', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_ricerca', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_ricerca', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_ricerca', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Sfruttamento lavorativo ---
    { from: 'c_vorresti_sfruttamento', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Protezione sociale ---
    { from: 'c_vorresti_prot_soc', to: 'c_end_lav_sub_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_lav_aut_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Current: Generico (altro non in elenco) ---
    { from: 'c_vorresti_generico', to: 'c_end_lav_no', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_generico', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_generico', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_generico', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_generico', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo ("Carta di soggiorno")', optionKey: 'carta_ue' },
    { from: 'c_vorresti_generico', to: 'c_end_altro_wip', label: 'Altro tipo di permesso', optionKey: 'altro' },

    // --- Date check 5 maggio 2023 (Protezione speciale, Cure mediche, Calamità → Lavoro) ---
    { from: 'c_data_5mag_2023', to: 'c_end_lav_sub_ok', label: 'Prima del 5 maggio 2023', optionKey: 'ante_5mag' },
    { from: 'c_data_5mag_2023', to: 'c_end_complicata', label: 'Dopo il 5 maggio 2023', optionKey: 'post_5mag' },

    // =============================================
    // FOLLOW-UP: Studio → Lavoro (studi finiti + titolo)
    // =============================================
    { from: 'c_lav_studi_finiti', to: 'c_lav_titolo', label: 'Sì', optionKey: 'si' },
    { from: 'c_lav_studi_finiti', to: 'c_lav_studi_uni', label: 'No', optionKey: 'no' },

    // University check for ongoing studies — goes to subordinato (degree holders)
    { from: 'c_lav_studi_uni', to: 'c_end_lav_sub_ok', label: 'Sì, percorso universitario', optionKey: 'si' },
    { from: 'c_lav_studi_uni', to: 'c_end_lav_no', label: 'No', optionKey: 'no' },

    { from: 'c_lav_titolo', to: 'c_end_lav_sub_ok', label: 'Laurea triennale', optionKey: 'laurea_tri' },
    { from: 'c_lav_titolo', to: 'c_end_lav_sub_ok', label: 'Laurea specialistica', optionKey: 'laurea_spec' },
    { from: 'c_lav_titolo', to: 'c_end_lav_sub_ok', label: 'Diploma di specializzazione', optionKey: 'diploma_spec' },
    { from: 'c_lav_titolo', to: 'c_end_lav_sub_ok', label: 'Dottorato di ricerca', optionKey: 'dottorato' },
    { from: 'c_lav_titolo', to: 'c_end_lav_sub_ok', label: 'Master I livello', optionKey: 'master_1' },
    { from: 'c_lav_titolo', to: 'c_end_lav_sub_ok', label: 'Master II livello', optionKey: 'master_2' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Attestato / diploma perfezionamento', optionKey: 'attestato' },
    { from: 'c_lav_titolo', to: 'c_end_lav_no', label: 'Altro / non ho titolo', optionKey: 'nessuno' },
  ],
};
