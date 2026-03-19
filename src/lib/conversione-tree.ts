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

import type { TreeData } from '@/types/tree';

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
    c_scaduto_fam: {
      id: 'c_scaduto_fam',
      type: 'question',
      question:
        'Con un permesso scaduto da poco, solo la conversione per motivi familiari potrebbe essere possibile. Vuoi procedere con la conversione per famiglia?',
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

    // =============================================
    // RESULT NODES (all unchanged)
    // =============================================

    // --- LAVORO OUTCOMES ---
    c_end_lav_ok: {
      id: 'c_end_lav_ok',
      type: 'result',
      title: 'Conversione in Lavoro: POSSIBILE',
      introText:
        'Buone notizie! La conversione del tuo permesso in un permesso per lavoro è possibile.',
      sections: [
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Devi prima richiedere il nulla osta presso lo Sportello Unico per l\'Immigrazione, poi presentare domanda tramite il kit postale presso gli uffici postali abilitati. La documentazione richiesta dipende dal tipo di conversione (lavoro subordinato o autonomo).',
        },
        {
          heading: '\ud83d\udcc4 Documenti necessari',
          content:
            "Per lavoro subordinato: contratto di lavoro o proposta di assunzione, nulla osta dello Sportello Unico. Per lavoro autonomo: documentazione attestante i requisiti per l'attività autonoma, iscrizione alla Camera di Commercio o ordine professionale.",
        },
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
            'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per esplorare altre opzioni disponibili.',
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
            'Se la domanda di protezione è stata presentata prima del 10 marzo 2023, la conversione potrebbe essere possibile. È necessario verificare con un esperto legale.',
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            "Questa situazione richiede necessariamente l'assistenza di uno specialista in diritto dell'immigrazione.",
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
            "Il DL 50/2023 ha modificato le regole. In generale, la conversione non è più possibile. Tuttavia, potrebbe esserci un'eccezione se la domanda è stata presentata prima di marzo 2024.",
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            'Data la complessità della situazione, è indispensabile rivolgersi a un legale specializzato.',
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
            "La conversione non è più possibile. Potrebbe esserci un'eccezione se la domanda è stata presentata prima del 6 maggio 2023.",
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            "È necessario verificare con un legale se rientri nell'eccezione temporale.",
        },
      ],
    },

    c_end_lav_minore: {
      id: 'c_end_lav_minore',
      type: 'result',
      title: 'Conversione Minore Età \u2192 Lavoro: situazione delicata',
      introText:
        'La conversione del permesso per minore età in lavoro è possibile ma presenta complessità.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content:
            "La conversione potrebbe richiedere un parere della Direzione Generale dell'Immigrazione. Dipende dal tempo trascorso in Italia e dal progetto dei servizi sociali.",
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            'Ti consigliamo di rivolgerti ai servizi sociali e a un esperto legale per assistenza.',
        },
      ],
    },

    // --- ATTESA OCCUPAZIONE OUTCOMES ---
    c_end_att_ok: {
      id: 'c_end_att_ok',
      type: 'result',
      title: 'Conversione in Attesa Occupazione: POSSIBILE',
      introText:
        'Buone notizie! Puoi richiedere la conversione in un permesso per attesa occupazione.',
      sections: [
        {
          heading: '\u2139\ufe0f Informazione utile',
          content:
            'Puoi richiedere il permesso per attesa occupazione anche senza precedente esperienza lavorativa.',
        },
        {
          heading: '\ud83d\udcc4 Documenti necessari',
          content:
            "Documento del Centro per l'Impiego, passaporto valido, prova di alloggio.",
        },
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
            'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per esplorare altre opzioni.',
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
        'La conversione probabilmente non è possibile, ma le Questure interpretano le regole in modo diverso.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content:
            "Non c'è una risposta certa. Alcune Questure accettano la conversione, altre no.",
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve consulenza legale',
          content:
            'È necessario rivolgersi a un esperto per valutare la tua situazione specifica.',
        },
      ],
    },

    c_end_att_minore: {
      id: 'c_end_att_minore',
      type: 'result',
      title: 'Conversione Minore Età \u2192 Attesa Occupazione: situazione particolare',
      introText:
        'La conversione è possibile ma potrebbe richiedere un parere della Direzione Generale.',
      sections: [
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve assistenza',
          content:
            'Contatta i servizi sociali e un esperto legale per assistenza nella procedura.',
        },
      ],
    },

    // --- STUDIO OUTCOMES ---
    c_end_stu_ok: {
      id: 'c_end_stu_ok',
      type: 'result',
      title: 'Conversione in Studio: POSSIBILE',
      introText:
        'Buone notizie! La conversione del tuo permesso in un permesso per studio è possibile.',
      sections: [
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Devi presentare domanda tramite il kit postale presso gli uffici postali abilitati.',
        },
        {
          heading: '\ud83d\udcc4 Documenti necessari',
          content:
            'Iscrizione a un corso di studi, prova di mezzi di sostentamento, assicurazione sanitaria.',
        },
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
            'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per esplorare altre opzioni.',
        },
      ],
    },

    c_end_stu_minore: {
      id: 'c_end_stu_minore',
      type: 'result',
      title: 'Conversione Minore Età \u2192 Studio: situazione particolare',
      introText:
        'La conversione è possibile ma potrebbe richiedere un parere della Direzione Generale.',
      sections: [
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve assistenza',
          content:
            'Contatta i servizi sociali e un esperto legale per assistenza nella procedura.',
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
            'Se la domanda di protezione è stata presentata prima del 10 marzo 2023, la conversione potrebbe essere possibile.',
        },
        {
          heading: "\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato",
          content:
            "Questa situazione richiede necessariamente l'assistenza di uno specialista.",
        },
      ],
    },

    // --- FAMIGLIA OUTCOMES ---
    c_end_fam_ok: {
      id: 'c_end_fam_ok',
      type: 'result',
      title: 'Conversione in Famiglia: POSSIBILE',
      introText:
        'Buone notizie! La conversione in un permesso per motivi familiari è possibile.',
      sections: [
        {
          heading: '\u2139\ufe0f Requisiti',
          content:
            'La conversione è possibile se il tuo familiare ha un permesso di soggiorno e tu sei: coniuge, figlio minore, figlio maggiorenne disabile, o genitore a carico. Vale anche se il familiare è cittadino italiano o UE.',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Presenta la domanda tramite kit postale con la documentazione che dimostra il legame familiare.',
        },
      ],
    },

    c_end_fam_anno: {
      id: 'c_end_fam_anno',
      type: 'result',
      title: 'Conversione in Famiglia: permesso scaduto da oltre un anno',
      introText:
        'La situazione potrebbe essere problematica dato che il tuo permesso è scaduto da più di un anno.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content:
            'La possibilità di conversione dipende dalla tua situazione specifica e dalla Questura competente.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve consulenza legale',
          content:
            'Ti consigliamo di rivolgerti a un esperto legale per valutare le opzioni disponibili.',
        },
      ],
    },

    // --- CARTA DI SOGGIORNO UE OUTCOMES ---
    c_end_carta_ok: {
      id: 'c_end_carta_ok',
      type: 'result',
      title: 'Carta di Soggiorno UE: POSSIBILE',
      introText:
        'Buone notizie! Puoi richiedere la Carta di Soggiorno UE per soggiornanti di lungo periodo.',
      sections: [
        {
          heading: '\u2139\ufe0f Requisiti',
          content:
            '5 anni consecutivi di soggiorno legale in Italia, reddito sufficiente, superamento del test di lingua italiana (livello A2).',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content:
            'Presenta la domanda tramite kit postale con tutta la documentazione richiesta.',
        },
      ],
    },

    c_end_carta_minori: {
      id: 'c_end_carta_minori',
      type: 'result',
      title: 'Conversione Assistenza Minori \u2192 Carta di Soggiorno: possibile',
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
      title: 'Carta di Soggiorno UE: NON POSSIBILE',
      introText:
        'Purtroppo, con il tuo attuale permesso la conversione in Carta di Soggiorno UE non è possibile.',
      sections: [
        {
          heading: '\ud83d\udcac Consiglio',
          content:
            'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per esplorare altre opzioni.',
        },
      ],
    },

    // --- SHARED OUTCOMES ---
    c_end_scaduto: {
      id: 'c_end_scaduto',
      type: 'result',
      title: 'Permesso Scaduto',
      introText:
        'Il tuo permesso di soggiorno è scaduto. Puoi comunque tentare la conversione, ma ti consigliamo assistenza legale.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content:
            'Con un permesso scaduto la procedura è più complessa e le possibilità di successo dipendono da diversi fattori.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve consulenza legale',
          content:
            'Rivolgiti a un servizio di consulenza legale gratuita per valutare la tua situazione.',
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
            'Ti consigliamo una consulenza legale di persona. Cerca un servizio di consulenza legale gratuita nella tua zona.',
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
    { from: 'c_scaduto_quanto', to: 'c_scaduto_fam', label: 'Da meno di un anno', optionKey: 'meno_anno' },
    { from: 'c_scaduto_quanto', to: 'c_end_scaduto', label: 'Da più di un anno', optionKey: 'piu_anno' },
    { from: 'c_scaduto_fam', to: 'c_end_fam_ok', label: 'Sì, voglio convertire per famiglia', optionKey: 'si_fam' },
    { from: 'c_scaduto_fam', to: 'c_end_scaduto', label: 'No, ho un\'altra esigenza', optionKey: 'no_fam' },

    // =============================================
    // STEP 3: QUALE VORRESTI? (per current permit → results)
    // =============================================

    // --- Current: Lavoro sub/aut ---
    { from: 'c_vorresti_lav', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_lav', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_lav', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_lav', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Famiglia ---
    { from: 'c_vorresti_famiglia', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_famiglia', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_famiglia', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_famiglia', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Studio ---
    { from: 'c_vorresti_studio', to: 'c_lav_studi_finiti', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_studio', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_studio', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_studio', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Attesa occupazione ---
    { from: 'c_vorresti_att_occ', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_att_occ', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_att_occ', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_att_occ', to: 'c_end_complicata', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Protezione sussidiaria ---
    { from: 'c_vorresti_prot_suss', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_att_asilo', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_prot_suss', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Asilo (rifugiato) ---
    { from: 'c_vorresti_asilo', to: 'c_end_lav_no', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_asilo', to: 'c_end_att_asilo', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_asilo', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_asilo', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_asilo', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Protezione speciale ---
    { from: 'c_vorresti_prot_spec', to: 'c_end_lav_speciale', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_att_no', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_stu_speciale', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_prot_spec', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Minore età ---
    { from: 'c_vorresti_minore', to: 'c_end_lav_minore', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_minore', to: 'c_end_att_minore', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_minore', to: 'c_end_stu_minore', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_minore', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_minore', to: 'c_end_complicata', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Richiesta asilo (giallo) ---
    { from: 'c_vorresti_rich_asilo', to: 'c_end_lav_no', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_att_no', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_rich_asilo', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Lavoro stagionale ---
    { from: 'c_vorresti_stagionale', to: 'c_end_lav_ok', label: 'Lavoro (subordinato o autonomo)', optionKey: 'lavoro' },
    { from: 'c_vorresti_stagionale', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_stagionale', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_stagionale', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_stagionale', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Assistenza minori ---
    { from: 'c_vorresti_ass_minori', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_ass_minori', to: 'c_end_carta_minori', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Calamità naturale ---
    { from: 'c_vorresti_calamita', to: 'c_end_lav_calam', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_calamita', to: 'c_end_att_no', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_calamita', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_calamita', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_calamita', to: 'c_end_complicata', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Cure mediche ---
    { from: 'c_vorresti_cure', to: 'c_end_lav_cure', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_cure', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_cure', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_cure', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_cure', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Attività sportiva / Lavoro artistico (shared) ---
    { from: 'c_vorresti_sport_art', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_sport_art', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_sport_art', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_sport_art', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_sport_art', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Acquisto cittadinanza / apolide ---
    { from: 'c_vorresti_cittadinanza', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_cittadinanza', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Residenza elettiva ---
    { from: 'c_vorresti_res_elett', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_res_elett', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_res_elett', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_res_elett', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_res_elett', to: 'c_end_carta_ok', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Motivi religiosi ---
    { from: 'c_vorresti_religiosi', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_religiosi', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_religiosi', to: 'c_end_stu_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_religiosi', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_religiosi', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Ricerca scientifica ---
    { from: 'c_vorresti_ricerca', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_ricerca', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_ricerca', to: 'c_end_complicata', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_ricerca', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_ricerca', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Sfruttamento lavorativo ---
    { from: 'c_vorresti_sfruttamento', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_att_ok', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_sfruttamento', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Protezione sociale ---
    { from: 'c_vorresti_prot_soc', to: 'c_end_lav_ok', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_prot_soc', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // --- Current: Generico (altro non in elenco) ---
    { from: 'c_vorresti_generico', to: 'c_end_lav_no', label: 'Lavoro', optionKey: 'lavoro' },
    { from: 'c_vorresti_generico', to: 'c_end_att_incerta', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_vorresti_generico', to: 'c_end_stu_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_vorresti_generico', to: 'c_end_fam_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_vorresti_generico', to: 'c_end_carta_no', label: 'Permesso UE lungo periodo', optionKey: 'carta_ue' },

    // =============================================
    // FOLLOW-UP: Studio → Lavoro (studi finiti + titolo)
    // =============================================
    { from: 'c_lav_studi_finiti', to: 'c_lav_titolo', label: 'Sì', optionKey: 'si' },
    { from: 'c_lav_studi_finiti', to: 'c_lav_studi_uni', label: 'No', optionKey: 'no' },

    // University check for ongoing studies
    { from: 'c_lav_studi_uni', to: 'c_end_lav_ok', label: 'Sì, percorso universitario', optionKey: 'si' },
    { from: 'c_lav_studi_uni', to: 'c_end_lav_no', label: 'No', optionKey: 'no' },

    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Laurea triennale', optionKey: 'laurea_tri' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Laurea specialistica', optionKey: 'laurea_spec' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Diploma di specializzazione', optionKey: 'diploma_spec' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Dottorato di ricerca', optionKey: 'dottorato' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Master I livello', optionKey: 'master_1' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Master II livello', optionKey: 'master_2' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Attestato / diploma perfezionamento', optionKey: 'attestato' },
    { from: 'c_lav_titolo', to: 'c_end_lav_no', label: 'Altro / non ho titolo', optionKey: 'nessuno' },
  ],
};
