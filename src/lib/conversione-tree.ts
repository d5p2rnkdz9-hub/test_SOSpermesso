/**
 * Conversione (permit conversion) decision tree for SOSpermesso.
 *
 * Content sourced from Typeform quiz "oc9jhdkJ" and mapped via
 * .planning/research/TYPEFORM-CONVERSIONE-ANALYSIS.md
 *
 * Contains ~14 question nodes + ~22 result nodes.
 * Node IDs use `c_` prefix to avoid collisions with the main Italian tree.
 *
 * F18-F19 (attesa occ study check) are skipped — Studio routes directly
 * to F20 POSSIBILE (Typeform had no logic on those fields).
 * F38 (Cittadinanza) is orphaned — skipped.
 */

import type { TreeData } from '@/types/tree';

export const conversioneTree: TreeData = {
  startNodeId: 'c_quale_vuoi',

  nodes: {
    // =============================================
    // F2 — MAIN BRANCHING: Quale permesso VORRESTI?
    // =============================================

    c_quale_vuoi: {
      id: 'c_quale_vuoi',
      type: 'question',
      question: 'CONVERSIONE: quale permesso di soggiorno *vorresti*?',
    },

    // =============================================
    // BRANCH A: CONVERSIONE IN LAVORO (F3-F13)
    // =============================================

    c_lav_valido: {
      id: 'c_lav_valido',
      type: 'question',
      question: 'Il tuo permesso di soggiorno attuale \u00e8 ancora valido?',
    },

    c_lav_quale_hai: {
      id: 'c_lav_quale_hai',
      type: 'question',
      question: 'Quale permesso di soggiorno hai adesso?',
    },

    c_lav_altro: {
      id: 'c_lav_altro',
      type: 'question',
      question: 'Quale altro permesso hai?',
    },

    c_lav_studi_finiti: {
      id: 'c_lav_studi_finiti',
      type: 'question',
      question: 'Hai finito il percorso di studi?',
    },

    c_lav_titolo: {
      id: 'c_lav_titolo',
      type: 'question',
      question: 'Qual \u00e8 il tuo titolo di studio?',
    },

    // LAVORO OUTCOMES
    c_end_lav_ok: {
      id: 'c_end_lav_ok',
      type: 'result',
      title: 'Conversione in Lavoro: POSSIBILE',
      introText: 'Buone notizie! La conversione del tuo permesso in un permesso per lavoro \u00e8 possibile.',
      sections: [
        {
          heading: '\ud83d\udce6 Come fare',
          content: 'Devi presentare domanda tramite il kit postale presso gli uffici postali abilitati. La documentazione richiesta dipende dal tipo di conversione (lavoro subordinato o autonomo).',
        },
        {
          heading: '\ud83d\udcc4 Documenti necessari',
          content: 'Per lavoro subordinato: contratto di lavoro o proposta di assunzione, nulla osta dello Sportello Unico. Per lavoro autonomo: documentazione attestante i requisiti per l\'attivit\u00e0 autonoma, iscrizione alla Camera di Commercio o ordine professionale.',
        },
        {
          heading: '\u2696\ufe0f Nota legale',
          content: 'Il rilascio \u00e8 soggetto alla verifica dei requisiti da parte della Questura e dello Sportello Unico per l\'Immigrazione.',
        },
      ],
    },

    c_end_lav_no: {
      id: 'c_end_lav_no',
      type: 'result',
      title: 'Conversione in Lavoro: NON POSSIBILE',
      introText: 'Purtroppo, con il tuo attuale permesso di soggiorno la conversione in un permesso per lavoro non \u00e8 possibile.',
      sections: [
        {
          heading: '\u2139\ufe0f Perch\u00e9',
          content: 'Il tipo di permesso che hai attualmente non consente la conversione diretta in un permesso per lavoro secondo la normativa vigente.',
        },
        {
          heading: '\ud83d\udcac Consiglio',
          content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per esplorare altre opzioni disponibili.',
        },
      ],
    },

    c_end_lav_speciale: {
      id: 'c_end_lav_speciale',
      type: 'result',
      title: 'Conversione Protezione Speciale \u2192 Lavoro: situazione complicata',
      introText: 'La conversione del permesso per protezione speciale in lavoro \u00e8 una situazione delicata.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content: 'Se la domanda di protezione \u00e8 stata presentata prima del 10 marzo 2023, la conversione potrebbe essere possibile. \u00c8 necessario verificare con un esperto legale.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato',
          content: 'Questa situazione richiede necessariamente l\'assistenza di uno specialista in diritto dell\'immigrazione.',
        },
      ],
    },

    c_end_lav_cure: {
      id: 'c_end_lav_cure',
      type: 'result',
      title: 'Conversione Cure Mediche \u2192 Lavoro',
      introText: 'La normativa sulla conversione del permesso per cure mediche in lavoro \u00e8 cambiata.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione attuale',
          content: 'Il DL 50/2023 ha modificato le regole. In generale, la conversione non \u00e8 pi\u00f9 possibile. Tuttavia, potrebbe esserci un\'eccezione se la domanda \u00e8 stata presentata prima di marzo 2024.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato',
          content: 'Data la complessit\u00e0 della situazione, \u00e8 indispensabile rivolgersi a un legale specializzato.',
        },
      ],
    },

    c_end_lav_calam: {
      id: 'c_end_lav_calam',
      type: 'result',
      title: 'Conversione Calamit\u00e0 \u2192 Lavoro',
      introText: 'La conversione del permesso per calamit\u00e0 naturale in lavoro non \u00e8 pi\u00f9 possibile in via ordinaria.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content: 'La conversione non \u00e8 pi\u00f9 possibile. Potrebbe esserci un\'eccezione se la domanda \u00e8 stata presentata prima del 6 maggio 2023.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato',
          content: '\u00c8 necessario verificare con un legale se rientri nell\'eccezione temporale.',
        },
      ],
    },

    c_end_lav_minore: {
      id: 'c_end_lav_minore',
      type: 'result',
      title: 'Conversione Minore Et\u00e0 \u2192 Lavoro: situazione delicata',
      introText: 'La conversione del permesso per minore et\u00e0 in lavoro \u00e8 possibile ma presenta complessit\u00e0.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content: 'La conversione potrebbe richiedere un parere della Direzione Generale dell\'Immigrazione. Dipende dal tempo trascorso in Italia e dal progetto dei servizi sociali.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato',
          content: 'Ti consigliamo di rivolgerti ai servizi sociali e a un esperto legale per assistenza.',
        },
      ],
    },

    // =============================================
    // BRANCH B: CONVERSIONE IN ATTESA OCCUPAZIONE (F14-F23)
    // =============================================

    c_att_valido: {
      id: 'c_att_valido',
      type: 'question',
      question: 'Il tuo permesso di soggiorno attuale \u00e8 ancora valido?',
    },

    c_att_quale_hai: {
      id: 'c_att_quale_hai',
      type: 'question',
      question: 'Quale permesso di soggiorno hai adesso?',
    },

    c_att_altro: {
      id: 'c_att_altro',
      type: 'question',
      question: 'Quale permesso hai?',
    },

    // ATTESA OCC OUTCOMES
    c_end_att_ok: {
      id: 'c_end_att_ok',
      type: 'result',
      title: 'Conversione in Attesa Occupazione: POSSIBILE',
      introText: 'Buone notizie! Puoi richiedere la conversione in un permesso per attesa occupazione.',
      sections: [
        {
          heading: '\u2139\ufe0f Informazione utile',
          content: 'Puoi richiedere il permesso per attesa occupazione anche senza precedente esperienza lavorativa.',
        },
        {
          heading: '\ud83d\udcc4 Documenti necessari',
          content: 'Documento del Centro per l\'Impiego, passaporto valido, prova di alloggio.',
        },
      ],
    },

    c_end_att_no: {
      id: 'c_end_att_no',
      type: 'result',
      title: 'Conversione in Attesa Occupazione: NON POSSIBILE',
      introText: 'Purtroppo, con il tuo attuale permesso di soggiorno la conversione in attesa occupazione non \u00e8 possibile.',
      sections: [
        {
          heading: '\ud83d\udcac Consiglio',
          content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per esplorare altre opzioni.',
        },
      ],
    },

    c_end_att_asilo: {
      id: 'c_end_att_asilo',
      type: 'result',
      title: 'Asilo/Protezione Sussidiaria \u2192 Attesa Occupazione: non ha senso',
      introText: 'Il permesso per asilo o protezione sussidiaria offre una protezione pi\u00f9 forte rispetto all\'attesa occupazione.',
      sections: [
        {
          heading: '\u2139\ufe0f Perch\u00e9',
          content: 'In generale le Questure non accettano questa conversione perch\u00e9 il tuo permesso attuale ti d\u00e0 gi\u00e0 pi\u00f9 diritti.',
        },
        {
          heading: '\ud83d\udcac Consiglio',
          content: 'Mantieni il tuo attuale permesso che ti garantisce una protezione maggiore.',
        },
      ],
    },

    c_end_att_incerta: {
      id: 'c_end_att_incerta',
      type: 'result',
      title: 'Conversione in Attesa Occupazione: INCERTA',
      introText: 'La conversione probabilmente non \u00e8 possibile, ma le Questure interpretano le regole in modo diverso.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content: 'Non c\'\u00e8 una risposta certa. Alcune Questure accettano la conversione, altre no.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve consulenza legale',
          content: '\u00c8 necessario rivolgersi a un esperto per valutare la tua situazione specifica.',
        },
      ],
    },

    c_end_att_minore: {
      id: 'c_end_att_minore',
      type: 'result',
      title: 'Conversione Minore Et\u00e0 \u2192 Attesa Occupazione: situazione particolare',
      introText: 'La conversione \u00e8 possibile ma potrebbe richiedere un parere della Direzione Generale.',
      sections: [
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve assistenza',
          content: 'Contatta i servizi sociali e un esperto legale per assistenza nella procedura.',
        },
      ],
    },

    // =============================================
    // BRANCH C: CONVERSIONE IN STUDIO (F24-F30)
    // =============================================

    c_stu_valido: {
      id: 'c_stu_valido',
      type: 'question',
      question: 'Il tuo permesso di soggiorno attuale \u00e8 ancora valido?',
    },

    c_stu_quale_hai: {
      id: 'c_stu_quale_hai',
      type: 'question',
      question: 'Quale permesso di soggiorno hai adesso?',
    },

    c_stu_altro: {
      id: 'c_stu_altro',
      type: 'question',
      question: 'Quale altro permesso hai?',
    },

    // STUDIO OUTCOMES
    c_end_stu_ok: {
      id: 'c_end_stu_ok',
      type: 'result',
      title: 'Conversione in Studio: POSSIBILE',
      introText: 'Buone notizie! La conversione del tuo permesso in un permesso per studio \u00e8 possibile.',
      sections: [
        {
          heading: '\ud83d\udce6 Come fare',
          content: 'Devi presentare domanda tramite il kit postale presso gli uffici postali abilitati.',
        },
        {
          heading: '\ud83d\udcc4 Documenti necessari',
          content: 'Iscrizione a un corso di studi, prova di mezzi di sostentamento, assicurazione sanitaria.',
        },
      ],
    },

    c_end_stu_no: {
      id: 'c_end_stu_no',
      type: 'result',
      title: 'Conversione in Studio: NON POSSIBILE',
      introText: 'Purtroppo, con il tuo attuale permesso la conversione in un permesso per studio non \u00e8 possibile.',
      sections: [
        {
          heading: '\ud83d\udcac Consiglio',
          content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per esplorare altre opzioni.',
        },
      ],
    },

    c_end_stu_minore: {
      id: 'c_end_stu_minore',
      type: 'result',
      title: 'Conversione Minore Et\u00e0 \u2192 Studio: situazione particolare',
      introText: 'La conversione \u00e8 possibile ma potrebbe richiedere un parere della Direzione Generale.',
      sections: [
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve assistenza',
          content: 'Contatta i servizi sociali e un esperto legale per assistenza nella procedura.',
        },
      ],
    },

    c_end_stu_speciale: {
      id: 'c_end_stu_speciale',
      type: 'result',
      title: 'Conversione Protezione Speciale \u2192 Studio: situazione complicata',
      introText: 'La conversione del permesso per protezione speciale in studio \u00e8 una situazione delicata.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content: 'Se la domanda di protezione \u00e8 stata presentata prima del 10 marzo 2023, la conversione potrebbe essere possibile.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve un avvocato',
          content: 'Questa situazione richiede necessariamente l\'assistenza di uno specialista.',
        },
      ],
    },

    // =============================================
    // BRANCH D: CONVERSIONE IN FAMIGLIA (F31-F33)
    // =============================================

    c_fam_scaduto: {
      id: 'c_fam_scaduto',
      type: 'question',
      question: 'Il tuo permesso di soggiorno \u00e8 ancora valido?',
    },

    // FAMIGLIA OUTCOMES
    c_end_fam_ok: {
      id: 'c_end_fam_ok',
      type: 'result',
      title: 'Conversione in Famiglia: POSSIBILE',
      introText: 'Buone notizie! La conversione in un permesso per motivi familiari \u00e8 possibile.',
      sections: [
        {
          heading: '\u2139\ufe0f Requisiti',
          content: 'La conversione \u00e8 possibile se il tuo familiare ha un permesso di soggiorno e tu sei: coniuge, figlio minore, figlio maggiorenne disabile, o genitore a carico. Vale anche se il familiare \u00e8 cittadino italiano o UE.',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content: 'Presenta la domanda tramite kit postale con la documentazione che dimostra il legame familiare.',
        },
      ],
    },

    c_end_fam_anno: {
      id: 'c_end_fam_anno',
      type: 'result',
      title: 'Conversione in Famiglia: permesso scaduto da oltre un anno',
      introText: 'La situazione potrebbe essere problematica dato che il tuo permesso \u00e8 scaduto da pi\u00f9 di un anno.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content: 'La possibilit\u00e0 di conversione dipende dalla tua situazione specifica e dalla Questura competente.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve consulenza legale',
          content: 'Ti consigliamo di rivolgerti a un esperto legale per valutare le opzioni disponibili.',
        },
      ],
    },

    // =============================================
    // BRANCH E: CONVERSIONE IN CARTA DI SOGGIORNO UE (F34-F40)
    // =============================================

    c_carta_valido: {
      id: 'c_carta_valido',
      type: 'question',
      question: 'Il tuo permesso di soggiorno attuale \u00e8 ancora valido?',
    },

    c_carta_quale_hai: {
      id: 'c_carta_quale_hai',
      type: 'question',
      question: 'Quale permesso di soggiorno hai adesso?',
    },

    c_carta_altro: {
      id: 'c_carta_altro',
      type: 'question',
      question: 'Quale altro permesso hai?',
    },

    // CARTA OUTCOMES
    c_end_carta_ok: {
      id: 'c_end_carta_ok',
      type: 'result',
      title: 'Carta di Soggiorno UE: POSSIBILE',
      introText: 'Buone notizie! Puoi richiedere la Carta di Soggiorno UE per soggiornanti di lungo periodo.',
      sections: [
        {
          heading: '\u2139\ufe0f Requisiti',
          content: '5 anni consecutivi di soggiorno legale in Italia, reddito sufficiente, superamento del test di lingua italiana (livello A2).',
        },
        {
          heading: '\ud83d\udce6 Come fare',
          content: 'Presenta la domanda tramite kit postale con tutta la documentazione richiesta.',
        },
      ],
    },

    c_end_carta_minori: {
      id: 'c_end_carta_minori',
      type: 'result',
      title: 'Conversione Assistenza Minori \u2192 Carta di Soggiorno: possibile',
      introText: 'La conversione \u00e8 possibile ma richiede requisiti specifici.',
      sections: [
        {
          heading: '\u2139\ufe0f Requisiti',
          content: '5 anni di soggiorno legale, reddito sufficiente, alloggio idoneo, test di lingua A2, assenza di precedenti penali.',
        },
      ],
    },

    c_end_carta_no: {
      id: 'c_end_carta_no',
      type: 'result',
      title: 'Carta di Soggiorno UE: NON POSSIBILE',
      introText: 'Purtroppo, con il tuo attuale permesso la conversione in Carta di Soggiorno UE non \u00e8 possibile.',
      sections: [
        {
          heading: '\ud83d\udcac Consiglio',
          content: 'Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita per esplorare altre opzioni.',
        },
      ],
    },

    // =============================================
    // SHARED OUTCOMES (F41-F42)
    // =============================================

    c_end_scaduto: {
      id: 'c_end_scaduto',
      type: 'result',
      title: 'Permesso Scaduto',
      introText: 'Il tuo permesso di soggiorno \u00e8 scaduto. Puoi comunque tentare la conversione, ma ti consigliamo assistenza legale.',
      sections: [
        {
          heading: '\u2696\ufe0f Situazione',
          content: 'Con un permesso scaduto la procedura \u00e8 pi\u00f9 complessa e le possibilit\u00e0 di successo dipendono da diversi fattori.',
        },
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve consulenza legale',
          content: 'Rivolgiti a un servizio di consulenza legale gratuita per valutare la tua situazione.',
        },
      ],
    },

    c_end_complicata: {
      id: 'c_end_complicata',
      type: 'result',
      title: 'Situazione Complicata',
      introText: 'La tua situazione \u00e8 complessa e richiede una valutazione approfondita.',
      sections: [
        {
          heading: '\ud83d\udc68\u200d\u2696\ufe0f Serve consulenza legale',
          content: 'Ti consigliamo una consulenza legale di persona. Cerca un servizio di consulenza legale gratuita nella tua zona.',
        },
      ],
    },
  },

  edges: [
    // =============================================
    // F2: Quale permesso VORRESTI? -> 7 branches
    // =============================================
    { from: 'c_quale_vuoi', to: 'c_lav_valido', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_quale_vuoi', to: 'c_lav_valido', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_quale_vuoi', to: 'c_att_valido', label: 'Attesa occupazione (ricerca lavoro)', optionKey: 'att_occ' },
    { from: 'c_quale_vuoi', to: 'c_stu_valido', label: 'Studio', optionKey: 'studio' },
    { from: 'c_quale_vuoi', to: 'c_fam_scaduto', label: 'Famiglia (motivi famigliari)', optionKey: 'famiglia' },
    { from: 'c_quale_vuoi', to: 'c_carta_valido', label: 'Permesso UE lungo periodo (Carta di soggiorno)', optionKey: 'carta_ue' },
    { from: 'c_quale_vuoi', to: 'c_end_complicata', label: 'ALTRO', optionKey: 'altro' },

    // =============================================
    // BRANCH A: LAVORO
    // =============================================

    // F3: Permesso valido?
    { from: 'c_lav_valido', to: 'c_lav_quale_hai', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_lav_valido', to: 'c_end_scaduto', label: 'Scaduto', optionKey: 'scaduto' },

    // F4: Quale permesso hai? (9 options)
    { from: 'c_lav_quale_hai', to: 'c_end_lav_ok', label: 'Assistenza minori (Art. 31)', optionKey: 'ass_minori' },
    { from: 'c_lav_quale_hai', to: 'c_end_lav_ok', label: 'Attesa occupazione / ricerca lavoro', optionKey: 'att_occ' },
    { from: 'c_lav_quale_hai', to: 'c_end_lav_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_lav_quale_hai', to: 'c_end_lav_ok', label: 'Protezione sussidiaria', optionKey: 'prot_suss' },
    { from: 'c_lav_quale_hai', to: 'c_lav_studi_finiti', label: 'Studio', optionKey: 'studio' },
    { from: 'c_lav_quale_hai', to: 'c_end_lav_minore', label: 'Minore et\u00e0', optionKey: 'minore' },
    { from: 'c_lav_quale_hai', to: 'c_end_lav_speciale', label: 'Protezione speciale', optionKey: 'prot_spec' },
    { from: 'c_lav_quale_hai', to: 'c_end_lav_ok', label: 'Lavoro stagionale', optionKey: 'stagionale' },
    { from: 'c_lav_quale_hai', to: 'c_lav_altro', label: 'Altro permesso', optionKey: 'altro' },

    // F5: Quale altro permesso? (12 options)
    { from: 'c_lav_altro', to: 'c_end_lav_calam', label: 'Calamit\u00e0 naturale', optionKey: 'calamita' },
    { from: 'c_lav_altro', to: 'c_end_lav_cure', label: 'Cure mediche', optionKey: 'cure' },
    { from: 'c_lav_altro', to: 'c_end_lav_no', label: 'Richiesta asilo (permesso giallo)', optionKey: 'rich_asilo' },
    { from: 'c_lav_altro', to: 'c_end_lav_ok', label: 'Attivit\u00e0 sportiva', optionKey: 'sportiva' },
    { from: 'c_lav_altro', to: 'c_end_lav_ok', label: 'Acquisto cittadinanza / apolide', optionKey: 'cittadinanza' },
    { from: 'c_lav_altro', to: 'c_end_lav_ok', label: 'Residenza elettiva', optionKey: 'res_elettiva' },
    { from: 'c_lav_altro', to: 'c_end_lav_ok', label: 'Lavoro artistico', optionKey: 'artistico' },
    { from: 'c_lav_altro', to: 'c_end_lav_ok', label: 'Motivi religiosi', optionKey: 'religiosi' },
    { from: 'c_lav_altro', to: 'c_end_lav_ok', label: 'Ricerca scientifica (art. 27ter)', optionKey: 'ricerca' },
    { from: 'c_lav_altro', to: 'c_end_lav_ok', label: 'Sfruttamento lavorativo (Art. 22 co. 12quater)', optionKey: 'sfruttamento' },
    { from: 'c_lav_altro', to: 'c_end_lav_ok', label: 'Protezione sociale (Art. 18)', optionKey: 'prot_sociale' },
    { from: 'c_lav_altro', to: 'c_end_lav_no', label: 'Ho un altro permesso', optionKey: 'altro_perm' },

    // F6: Hai finito studi? (Lavoro branch)
    { from: 'c_lav_studi_finiti', to: 'c_lav_titolo', label: 'S\u00ec', optionKey: 'si' },
    { from: 'c_lav_studi_finiti', to: 'c_end_lav_no', label: 'No', optionKey: 'no' },

    // F7: Titolo di studio (Lavoro branch)
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Laurea triennale', optionKey: 'laurea_tri' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Laurea specialistica', optionKey: 'laurea_spec' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Diploma di specializzazione', optionKey: 'diploma_spec' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Dottorato di ricerca', optionKey: 'dottorato' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Master I livello', optionKey: 'master_1' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Master II livello', optionKey: 'master_2' },
    { from: 'c_lav_titolo', to: 'c_end_lav_ok', label: 'Attestato / diploma perfezionamento', optionKey: 'attestato' },
    { from: 'c_lav_titolo', to: 'c_end_lav_no', label: 'Altro / non ho titolo', optionKey: 'nessuno' },

    // =============================================
    // BRANCH B: ATTESA OCCUPAZIONE
    // =============================================

    // F14: Permesso valido?
    { from: 'c_att_valido', to: 'c_att_quale_hai', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_att_valido', to: 'c_end_scaduto', label: 'Scaduto', optionKey: 'scaduto' },

    // F15: Quale permesso hai? (11 options)
    { from: 'c_att_quale_hai', to: 'c_end_att_incerta', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_att_quale_hai', to: 'c_end_att_incerta', label: 'Assistenza minori (Art. 31)', optionKey: 'ass_minori' },
    { from: 'c_att_quale_hai', to: 'c_end_att_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_att_quale_hai', to: 'c_end_att_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_att_quale_hai', to: 'c_end_att_ok', label: 'Studio', optionKey: 'studio' },
    { from: 'c_att_quale_hai', to: 'c_end_att_minore', label: 'Minore et\u00e0', optionKey: 'minore' },
    { from: 'c_att_quale_hai', to: 'c_end_att_asilo', label: 'Asilo (status di rifugiato)', optionKey: 'asilo' },
    { from: 'c_att_quale_hai', to: 'c_end_att_asilo', label: 'Protezione sussidiaria', optionKey: 'prot_suss' },
    { from: 'c_att_quale_hai', to: 'c_end_att_no', label: 'Protezione speciale', optionKey: 'prot_spec' },
    { from: 'c_att_quale_hai', to: 'c_end_att_no', label: 'Richiesta asilo (permesso giallo)', optionKey: 'rich_asilo' },
    { from: 'c_att_quale_hai', to: 'c_att_altro', label: 'Il mio permesso non \u00e8 nell\'elenco', optionKey: 'non_elenco' },

    // F16: Quale permesso? (9 options)
    { from: 'c_att_altro', to: 'c_end_att_ok', label: 'Attivit\u00e0 sportiva', optionKey: 'sportiva' },
    { from: 'c_att_altro', to: 'c_end_att_ok', label: 'Lavoro artistico', optionKey: 'artistico' },
    { from: 'c_att_altro', to: 'c_end_att_no', label: 'Calamit\u00e0 naturale', optionKey: 'calamita' },
    { from: 'c_att_altro', to: 'c_end_att_incerta', label: 'Residenza elettiva', optionKey: 'res_elettiva' },
    { from: 'c_att_altro', to: 'c_end_att_incerta', label: 'Acquisto cittadinanza / apolide', optionKey: 'cittadinanza' },
    { from: 'c_att_altro', to: 'c_end_att_ok', label: 'Motivi religiosi', optionKey: 'religiosi' },
    { from: 'c_att_altro', to: 'c_end_att_ok', label: 'Ricerca scientifica (art. 27ter)', optionKey: 'ricerca' },
    { from: 'c_att_altro', to: 'c_end_att_ok', label: 'Sfruttamento lavorativo (22 co. 12quater)', optionKey: 'sfruttamento' },
    { from: 'c_att_altro', to: 'c_end_att_incerta', label: 'Altro permesso', optionKey: 'altro_perm' },

    // =============================================
    // BRANCH C: STUDIO
    // =============================================

    // F24: Permesso valido?
    { from: 'c_stu_valido', to: 'c_stu_quale_hai', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_stu_valido', to: 'c_end_scaduto', label: 'Scaduto', optionKey: 'scaduto' },

    // F25: Quale permesso hai? (11 options)
    { from: 'c_stu_quale_hai', to: 'c_end_stu_ok', label: 'Motivi religiosi', optionKey: 'religiosi' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_ok', label: 'Protezione sussidiaria', optionKey: 'prot_suss' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_ok', label: 'Asilo politico', optionKey: 'asilo' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_ok', label: 'Calamit\u00e0 naturale', optionKey: 'calamita' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_no', label: 'Richiesta asilo', optionKey: 'rich_asilo' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_speciale', label: 'Protezione speciale', optionKey: 'prot_spec' },
    { from: 'c_stu_quale_hai', to: 'c_end_stu_minore', label: 'Minore et\u00e0', optionKey: 'minore' },
    { from: 'c_stu_quale_hai', to: 'c_stu_altro', label: 'Ho un altro permesso', optionKey: 'altro' },

    // F26: Quale altro permesso? (7 options)
    { from: 'c_stu_altro', to: 'c_end_complicata', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_stu_altro', to: 'c_end_complicata', label: 'Assistenza minori', optionKey: 'ass_minori' },
    { from: 'c_stu_altro', to: 'c_end_complicata', label: 'Attivit\u00e0 sportiva', optionKey: 'sportiva' },
    { from: 'c_stu_altro', to: 'c_end_complicata', label: 'Lavoro artistico', optionKey: 'artistico' },
    { from: 'c_stu_altro', to: 'c_end_complicata', label: 'Acquisto cittadinanza / apolidia', optionKey: 'cittadinanza' },
    { from: 'c_stu_altro', to: 'c_end_complicata', label: 'Ricerca scientifica', optionKey: 'ricerca' },
    { from: 'c_stu_altro', to: 'c_end_stu_no', label: 'Ho un altro permesso', optionKey: 'altro_perm' },

    // =============================================
    // BRANCH D: FAMIGLIA
    // =============================================

    // F31: Permesso scaduto? (3 options)
    { from: 'c_fam_scaduto', to: 'c_end_fam_ok', label: '\u00c8 ancora valido', optionKey: 'valido' },
    { from: 'c_fam_scaduto', to: 'c_end_fam_ok', label: '\u00c8 scaduto da meno di un anno', optionKey: 'meno_anno' },
    { from: 'c_fam_scaduto', to: 'c_end_fam_anno', label: '\u00c8 scaduto da pi\u00f9 di un anno', optionKey: 'piu_anno' },

    // =============================================
    // BRANCH E: CARTA DI SOGGIORNO UE
    // =============================================

    // F34: Permesso valido?
    { from: 'c_carta_valido', to: 'c_carta_quale_hai', label: 'Ancora valido', optionKey: 'valido' },
    { from: 'c_carta_valido', to: 'c_end_scaduto', label: 'Scaduto', optionKey: 'scaduto' },

    // F35: Quale permesso hai? (10 options)
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Famiglia', optionKey: 'famiglia' },
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Lavoro subordinato', optionKey: 'lav_sub' },
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Lavoro autonomo', optionKey: 'lav_aut' },
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Residenza elettiva', optionKey: 'res_elettiva' },
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Protezione sussidiaria', optionKey: 'prot_suss' },
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Asilo politico', optionKey: 'asilo' },
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Attivit\u00e0 sportiva', optionKey: 'sportiva' },
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Lavoro artistico', optionKey: 'artistico' },
    { from: 'c_carta_quale_hai', to: 'c_end_carta_ok', label: 'Protezione speciale', optionKey: 'prot_spec' },
    { from: 'c_carta_quale_hai', to: 'c_carta_altro', label: 'Ho un altro permesso', optionKey: 'altro' },

    // F36: Quale altro permesso? (7 options)
    { from: 'c_carta_altro', to: 'c_end_complicata', label: 'Attesa occupazione', optionKey: 'att_occ' },
    { from: 'c_carta_altro', to: 'c_end_complicata', label: 'Calamit\u00e0 naturale', optionKey: 'calamita' },
    { from: 'c_carta_altro', to: 'c_end_complicata', label: 'Minore et\u00e0', optionKey: 'minore' },
    { from: 'c_carta_altro', to: 'c_end_carta_no', label: 'Richiesta asilo', optionKey: 'rich_asilo' },
    { from: 'c_carta_altro', to: 'c_end_carta_no', label: 'Studio', optionKey: 'studio' },
    { from: 'c_carta_altro', to: 'c_end_carta_minori', label: 'Assistenza minori', optionKey: 'ass_minori' },
    { from: 'c_carta_altro', to: 'c_end_carta_no', label: 'Ho un altro permesso', optionKey: 'altro_perm' },
  ],
};
