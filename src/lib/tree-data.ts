/**
 * Italian decision tree for SOSpermesso residence permit wizard.
 *
 * Converted from TYPEFORM_CLONE/data.js into typed TypeScript.
 * Contains 46 question nodes + 29 result nodes = 75 total nodes.
 * All Italian text preserved exactly as in the original source.
 *
 * IMPORTANT: min_affido1 through min_affido5 are intentionally separate nodes.
 * They share question text but occupy different graph positions.
 */

import type { TreeData } from '@/types/tree';

export const italianTree: TreeData = {
  startNodeId: 'start',

  nodes: {
    // =============================================
    // DOMANDA INIZIALE
    // =============================================

    start: {
      id: 'start',
      type: 'question',
      question: 'Hai la cittadinanza di un Paese dell\'Unione Europea?',
    },

    // =============================================
    // SCHEDA: Cittadino UE
    // =============================================

    end_ue: {
      id: 'end_ue',
      type: 'result',
      title: '\u{1F1EA}\u{1F1FA} Cittadino UE - Non serve permesso di soggiorno',
      resultDescription: 'Come cittadino dell\'Unione Europea, hai il diritto di circolare e soggiornare liberamente nel territorio italiano senza bisogno di un permesso di soggiorno. Puoi lavorare, studiare e risiedere in Italia senza particolari vincoli.',
      requirements: [
        'Documento d\'identità o passaporto in corso di validità',
        'Per soggiorni superiori a 3 mesi: iscrizione anagrafica al Comune',
      ],
      notes: 'Se intendi rimanere più di 3 mesi, dovrai iscriverti all\'anagrafe del Comune dove risiedi. Per lavorare non hai bisogno di autorizzazioni speciali.',
    },

    // =============================================
    // DOMANDA PRINCIPALE: SITUAZIONE
    // =============================================

    q_situazione: {
      id: 'q_situazione',
      type: 'question',
      question: 'In che situazione ti trovi?',
    },

    // =============================================
    // PERCORSO: HO PAURA DI TORNARE
    // =============================================

    paura_start: {
      id: 'paura_start',
      type: 'question',
      question: 'Perché hai paura di tornare nel tuo Paese?',
    },

    end_asilo: {
      id: 'end_asilo',
      type: 'result',
      title: '\u{1F6E1}\u{FE0F} Protezione Internazionale - Asilo o Protezione Sussidiaria',
      resultDescription: 'Puoi richiedere la protezione internazionale in Italia se hai il fondato timore di essere perseguitato nel tuo Paese per motivi di razza, religione, nazionalità, appartenenza a un particolare gruppo sociale o opinione politica, oppure se rischi di subire un grave danno.',
      duration: '5 anni (rinnovabile)',
      requirements: [
        'Presenza sul territorio italiano',
        'Domanda di protezione internazionale presso la Questura o alla frontiera',
        'Colloquio con la Commissione Territoriale',
      ],
      notes: 'Durante l\'esame della domanda riceverai un permesso temporaneo e potrai accedere all\'accoglienza. È consigliabile farsi assistere da un avvocato specializzato.',
      link: 'https://sospermesso.it/asilo-protezione-sussidiaria',
    },

    end_calam: {
      id: 'end_calam',
      type: 'result',
      title: '\u{1F32A}\u{FE0F} Permesso di Soggiorno per Calamità',
      resultDescription: 'Questo permesso viene rilasciato a cittadini stranieri che non possono rientrare temporaneamente nel proprio Paese a causa di una grave calamità naturale.',
      duration: 'Da 6 mesi a 1 anno (temporaneo)',
      requirements: [
        'Prova della calamità nel Paese d\'origine',
        'Documenti d\'identità',
        'Impossibilità temporanea di rientro sicuro',
      ],
      notes: 'Questo permesso è temporaneo e viene rilasciato in situazioni eccezionali. Verifica sempre gli aggiornamenti sulle decisioni del Governo italiano.',
      link: 'https://sospermesso.it/calamita',
    },

    // =============================================
    // PERCORSO: BRUTTA SITUAZIONE
    // =============================================

    brutta_start: {
      id: 'brutta_start',
      type: 'question',
      question: 'In che tipo di brutta situazione ti trovi?',
    },

    end_sfrut: {
      id: 'end_sfrut',
      type: 'result',
      title: '\u{2696}\u{FE0F} Permesso per Grave Sfruttamento Lavorativo (Art. 22)',
      resultDescription: 'Questo permesso è destinato a lavoratori stranieri vittime di grave sfruttamento lavorativo e caporalato. Puoi richiederlo se sei stato sottoposto a condizioni lavorative particolarmente sfruttanti.',
      duration: '6 mesi (rinnovabile per 1 anno, poi convertibile)',
      requirements: [
        'Denuncia o testimonianza in procedimento penale contro lo sfruttatore',
        'Allontanamento dal circuito di sfruttamento',
        'Pericolo concreto per la tua incolumità',
      ],
      notes: 'Puoi lavorare immediatamente con questo permesso. È importante rivolgersi ai sindacati o alle associazioni di tutela dei lavoratori per essere supportati.',
      link: 'https://sospermesso.it/sfruttamento-lavorativo',
    },

    end_tratta: {
      id: 'end_tratta',
      type: 'result',
      title: '\u{1F198} Permesso per Vittime di Tratta (Art. 18)',
      resultDescription: 'Sei vittima di tratta o di grave sfruttamento? Questo permesso ti protegge e ti permette di uscire dal circuito di violenza. Non è necessario denunciare per ottenerlo.',
      duration: '6 mesi (rinnovabile, poi convertibile)',
      requirements: [
        'Segnalazione da parte dei servizi sociali o delle forze dell\'ordine',
        'Partecipazione a un programma di assistenza e integrazione sociale',
        'Allontanamento dalla situazione di sfruttamento',
      ],
      notes: '\u{1F4DE} NUMERO VERDE ANTI-TRATTA: 800 290 290 (attivo h24). Puoi ricevere assistenza immediata, protezione e supporto legale. Non sei obbligato a denunciare per ricevere aiuto.',
      link: 'https://sospermesso.it/vittime-tratta',
    },

    end_viol: {
      id: 'end_viol',
      type: 'result',
      title: '\u{1F6E1}\u{FE0F} Permesso per Vittime di Violenza Domestica',
      resultDescription: 'Se sei vittima di violenza domestica o di genere, puoi ottenere un permesso di soggiorno anche se il tuo permesso dipendeva dal familiare violento (es. il coniuge).',
      duration: 'Variabile, generalmente 1 anno (rinnovabile)',
      requirements: [
        'Denuncia o referto medico che attesti la violenza',
        'Ordinanza di protezione del giudice o provvedimenti simili',
        'Percorso di fuoriuscita dalla violenza certificato dai servizi sociali',
      ],
      notes: '\u{1F4DE} NUMERO NAZIONALE ANTIVIOLENZA: 1522 (attivo h24, gratuito). Puoi chiamare per ricevere supporto, consulenza e informazioni sui centri antiviolenza nella tua zona.',
      link: 'https://sospermesso.it/violenza-domestica',
    },

    // =============================================
    // ALTRE SCHEDE FINALI
    // =============================================

    end_cure: {
      id: 'end_cure',
      type: 'result',
      title: '\u{1F3E5} Permesso di Soggiorno per Cure Mediche',
      resultDescription: 'Questo permesso è rilasciato a stranieri che necessitano di cure mediche che non possono essere prestate nel Paese d\'origine, oppure a donne in gravidanza o che hanno partorito da poco.',
      duration: '6 mesi o 1 anno (rinnovabile in base alle necessità mediche)',
      requirements: [
        'Certificazione medica della struttura sanitaria pubblica italiana',
        'Attestazione che le cure non sono disponibili nel Paese d\'origine',
        'Risorse economiche per il sostentamento (se richieste)',
      ],
      notes: 'Anche le donne incinte o che hanno partorito da poco possono richiedere questo permesso per garantire le cure a sé e al neonato.',
      link: 'https://sospermesso.it/cure-mediche',
    },

    end_citt: {
      id: 'end_citt',
      type: 'result',
      title: '\u{1F1EE}\u{1F1F9} Cittadinanza Italiana',
      resultDescription: 'Se sei nato in Italia e hai sempre vissuto qui, potresti avere diritto alla cittadinanza italiana per nascita o per residenza continuativa.',
      requirements: [
        'Nato in Italia e residente legalmente fino ai 18 anni',
        'Domanda di cittadinanza entro i 19 anni (un anno dopo la maggiore età)',
        'Residenza ininterrotta in Italia',
      ],
      notes: 'La cittadinanza italiana ti dà pieni diritti e non avrai più bisogno di permessi di soggiorno. È importante fare domanda entro i termini previsti.',
      link: 'https://sospermesso.it/cittadinanza',
    },

    end_neg_gen: {
      id: 'end_neg_gen',
      type: 'result',
      title: '\u{274C} Nessun permesso disponibile in questa situazione',
      resultDescription: 'Purtroppo, in base alle informazioni che ci hai fornito, al momento non sembri rientrare nelle categorie previste per il rilascio di un permesso di soggiorno in Italia.',
      notes: 'Ti consigliamo di rivolgerti a un consulente legale specializzato in diritto dell\'immigrazione per valutare altre possibilità. Ogni situazione personale può avere soluzioni specifiche che richiedono un\'analisi approfondita.',
      link: 'https://sospermesso.it/consulenza',
    },

    // =============================================
    // PERCORSO: MINORE DI 18 ANNI
    // =============================================

    minore_start: {
      id: 'minore_start',
      type: 'question',
      question: 'Hai un genitore in Italia?',
    },

    min_gen_pds: {
      id: 'min_gen_pds',
      type: 'question',
      question: 'Il tuo genitore ha un permesso di soggiorno valido?',
    },

    end_min_fam: {
      id: 'end_min_fam',
      type: 'result',
      title: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Permesso di Soggiorno per Motivi Familiari (Minore)',
      resultDescription: 'Come minorenne figlio di un genitore con permesso di soggiorno valido, hai diritto al permesso per motivi familiari.',
      duration: 'Uguale alla durata del permesso del genitore',
      requirements: [
        'Genitore con permesso di soggiorno valido o scaduto da meno di 60 giorni',
        'Certificato di nascita tradotto e legalizzato',
        'Documento d\'identità del minore',
      ],
      link: 'https://sospermesso.it/famiglia-minore',
    },

    min_parenti: {
      id: 'min_parenti',
      type: 'question',
      question: 'Con chi vivi in Italia?',
    },

    // Fratello/Sorella
    min_par_ita1: {
      id: 'min_par_ita1',
      type: 'question',
      question: 'Il tuo fratello/sorella è cittadino italiano?',
    },

    min_affido1: {
      id: 'min_affido1',
      type: 'question',
      question: 'C\'è una decisione del Tribunale per i Minorenni o dei Servizi Sociali che ti affida a lui/lei?',
    },

    // Nonno/a
    min_par_ita2: {
      id: 'min_par_ita2',
      type: 'question',
      question: 'Il tuo nonno/a è cittadino italiano?',
    },

    min_affido2: {
      id: 'min_affido2',
      type: 'question',
      question: 'C\'è una decisione del Tribunale per i Minorenni o dei Servizi Sociali che ti affida a lui/lei?',
    },

    // Zio/a
    min_par_ita3: {
      id: 'min_par_ita3',
      type: 'question',
      question: 'Il tuo zio/a è cittadino italiano?',
    },

    min_affido3: {
      id: 'min_affido3',
      type: 'question',
      question: 'C\'è una decisione del Tribunale per i Minorenni o dei Servizi Sociali che ti affida a lui/lei?',
    },

    // Cugino
    min_par_ita4: {
      id: 'min_par_ita4',
      type: 'question',
      question: 'Il tuo cugino è cittadino italiano?',
    },

    min_affido4: {
      id: 'min_affido4',
      type: 'question',
      question: 'C\'è una decisione del Tribunale per i Minorenni o dei Servizi Sociali che ti affida a lui/lei?',
    },

    // Fratello/sorella del nonno
    min_par_ita5: {
      id: 'min_par_ita5',
      type: 'question',
      question: 'È cittadino italiano?',
    },

    min_affido5: {
      id: 'min_affido5',
      type: 'question',
      question: 'C\'è una decisione del Tribunale per i Minorenni o dei Servizi Sociali che ti affida a lui/lei?',
    },

    end_art19: {
      id: 'end_art19',
      type: 'result',
      title: '\u{1F46A} Permesso per Motivi Familiari (Art. 19)',
      resultDescription: 'Puoi ottenere il permesso di soggiorno per motivi familiari se convivi con un familiare cittadino italiano.',
      duration: '2 anni (rinnovabile)',
      requirements: [
        'Familiare italiano (genitore, nonno, fratello/sorella)',
        'Convivenza effettiva',
        'Legame familiare documentato',
      ],
      link: 'https://sospermesso.it/art-19-famiglia',
    },

    end_aff: {
      id: 'end_aff',
      type: 'result',
      title: '\u{1F3E0} Permesso per Affidamento (Minore)',
      resultDescription: 'Come minore affidato da un provvedimento del Tribunale o dei Servizi Sociali a un parente con permesso di soggiorno, puoi ottenere questo permesso.',
      duration: 'Fino ai 18 anni',
      requirements: [
        'Provvedimento di affidamento del Tribunale per i Minorenni',
        'Affidatario con permesso di soggiorno valido',
        'Certificati anagrafici',
      ],
      link: 'https://sospermesso.it/affidamento',
    },

    end_msna: {
      id: 'end_msna',
      type: 'result',
      title: '\u{1F9D2} Minore Straniero Non Accompagnato (MSNA)',
      resultDescription: 'Se sei un minore senza genitori o parenti in grado di assisterti in Italia, puoi essere riconosciuto come MSNA e ricevere protezione e un permesso speciale.',
      duration: 'Fino ai 18 anni (poi convertibile)',
      requirements: [
        'Meno di 18 anni',
        'Assenza di genitori o adulti legalmente responsabili in Italia',
        'Segnalazione alla Procura della Repubblica presso il Tribunale per i Minorenni',
        'Nomina di un tutore',
      ],
      notes: 'Come MSNA hai diritto ad assistenza, accoglienza, istruzione e cure mediche. Alla maggiore età puoi convertire il permesso in altri tipi (studio, lavoro, ecc.).',
      link: 'https://sospermesso.it/msna',
    },

    // =============================================
    // PERCORSO: FAMIGLIA (parente in Italia)
    // =============================================

    famiglia_start: {
      id: 'famiglia_start',
      type: 'question',
      question: 'Chi è il tuo familiare in Italia?',
    },

    // ========== FIGLIO ==========

    figlio_start: {
      id: 'figlio_start',
      type: 'question',
      question: 'Tuo figlio è cittadino italiano?',
    },

    fig_ita_min: {
      id: 'fig_ita_min',
      type: 'question',
      question: 'Tuo figlio ha meno di 18 anni?',
    },

    end_art30: {
      id: 'end_art30',
      type: 'result',
      title: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Permesso Art. 30 - Genitore di Minore Italiano',
      resultDescription: 'Come genitore di un figlio minorenne cittadino italiano, hai diritto al permesso di soggiorno per motivi familiari.',
      duration: '2 anni (rinnovabile)',
      requirements: [
        'Figlio minorenne cittadino italiano',
        'Legame di parentela dimostrato (certificato di nascita)',
        'Responsabilità genitoriale',
      ],
      link: 'https://sospermesso.it/art30-genitore-italiano',
    },

    fig_mant: {
      id: 'fig_mant',
      type: 'question',
      question: 'Tuo figlio ti mantiene economicamente?',
    },

    end_famit: {
      id: 'end_famit',
      type: 'result',
      title: '\u{1F46A} Permesso per Ricongiungimento Familiare',
      resultDescription: 'Puoi richiedere il ricongiungimento familiare se hai un familiare italiano o con permesso UE che ti mantiene e soddisfa i requisiti reddituali.',
      duration: '2 anni (rinnovabile)',
      requirements: [
        'Familiare italiano/UE con reddito adeguato',
        'Alloggio idoneo',
        'Legame familiare documentato',
      ],
      link: 'https://sospermesso.it/ricongiungimento-familiare',
    },

    fig_conv: {
      id: 'fig_conv',
      type: 'question',
      question: 'Vivi stabilmente con tuo figlio?',
    },

    fig_ue: {
      id: 'fig_ue',
      type: 'question',
      question: 'Tuo figlio è cittadino di un Paese UE?',
    },

    fig_ue_min: {
      id: 'fig_ue_min',
      type: 'question',
      question: 'Tuo figlio ha meno di 18 anni?',
    },

    end_zamb: {
      id: 'end_zamb',
      type: 'result',
      title: '\u{1F1EA}\u{1F1FA} Carta di Soggiorno Zambrano',
      resultDescription: 'Sei genitore di un figlio minore cittadino UE? Hai diritto alla Carta di Soggiorno per familiari di cittadini UE (caso Zambrano), che ti permette di restare in Italia per prenderti cura di tuo figlio.',
      duration: '5 anni (rinnovabile)',
      requirements: [
        'Figlio minorenne cittadino UE',
        'Rapporto di dipendenza economica/affettiva del minore da te',
        'Impossibilità per il minore di restare nell\'UE senza di te',
      ],
      link: 'https://sospermesso.it/zambrano-carta-ue',
    },

    fig_ue_mant: {
      id: 'fig_ue_mant',
      type: 'question',
      question: 'Tuo figlio ti mantiene economicamente?',
    },

    end_carta_ue: {
      id: 'end_carta_ue',
      type: 'result',
      title: '\u{1F1EA}\u{1F1FA} Carta di Soggiorno per Familiari di Cittadini UE',
      resultDescription: 'Se sei familiare di un cittadino UE residente in Italia, puoi richiedere la Carta di Soggiorno.',
      duration: '5 anni (rinnovabile permanentemente)',
      requirements: [
        'Familiare cittadino UE residente in Italia',
        'Legame familiare (coniuge, genitore, figlio a carico)',
        'Risorse economiche sufficienti del familiare UE',
      ],
      link: 'https://sospermesso.it/carta-familiari-ue',
    },

    fig_stra_min: {
      id: 'fig_stra_min',
      type: 'question',
      question: 'Tuo figlio ha meno di 18 anni?',
    },

    end_art31: {
      id: 'end_art31',
      type: 'result',
      title: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Permesso Art. 31 - Ricongiungimento con Minore Straniero',
      resultDescription: 'Puoi richiedere il ricongiungimento familiare con tuo figlio minorenne straniero regolarmente soggiornante in Italia.',
      duration: 'Variabile in base alla situazione',
      requirements: [
        'Figlio minorenne con permesso di soggiorno in Italia',
        'Requisiti reddituali e abitativi',
        'Legame di parentela dimostrato',
      ],
      link: 'https://sospermesso.it/art31-ricongiungimento-minore',
    },

    fig_stra_pds: {
      id: 'fig_stra_pds',
      type: 'question',
      question: 'Hai mai avuto un permesso di soggiorno in Italia?',
    },

    fig_stra_mant: {
      id: 'fig_stra_mant',
      type: 'question',
      question: 'Tuo figlio ti mantiene economicamente?',
    },

    end_art30_gen: {
      id: 'end_art30_gen',
      type: 'result',
      title: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Permesso Art. 30 - Genitore a Carico',
      resultDescription: 'Come genitore a carico di un figlio regolarmente soggiornante in Italia, potresti ottenere il permesso per motivi familiari.',
      duration: '2 anni (rinnovabile)',
      requirements: [
        'Figlio con permesso di soggiorno valido',
        'Prova del mantenimento economico (dichiarazioni fiscali, bonifici)',
        'Convivenza o assistenza continuativa',
      ],
      notes: 'È importante dimostrare che sei effettivamente a carico di tuo figlio e che hai bisogno della sua assistenza.',
      link: 'https://sospermesso.it/art30-genitore-a-carico',
    },

    // ========== GENITORE ==========

    genitore_start: {
      id: 'genitore_start',
      type: 'question',
      question: 'Il tuo genitore è cittadino italiano o UE?',
    },

    gen_ita_eta: {
      id: 'gen_ita_eta',
      type: 'question',
      question: 'Hai tra 18 e 21 anni?',
    },

    gen_ita_tipo: {
      id: 'gen_ita_tipo',
      type: 'question',
      question: 'Il genitore è cittadino italiano?',
    },

    end_famit_gen: {
      id: 'end_famit_gen',
      type: 'result',
      title: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Permesso per Ricongiungimento con Genitore Italiano',
      resultDescription: 'Se hai tra 18 e 21 anni e sei a carico del genitore cittadino italiano, puoi ottenere il permesso per motivi familiari.',
      duration: '2 anni (rinnovabile)',
      requirements: [
        'Età tra 18 e 21 anni (o invalidità totale)',
        'Genitore cittadino italiano',
        'Stato di figlio a carico',
      ],
      link: 'https://sospermesso.it/ricongiungimento-genitore-italiano',
    },

    gen_mant: {
      id: 'gen_mant',
      type: 'question',
      question: 'Il genitore ti mantiene economicamente?',
    },

    gen_mant_tipo: {
      id: 'gen_mant_tipo',
      type: 'question',
      question: 'Il genitore è cittadino italiano o UE?',
    },

    gen_ita_conv: {
      id: 'gen_ita_conv',
      type: 'question',
      question: 'Il genitore è cittadino italiano?',
    },

    gen_pds: {
      id: 'gen_pds',
      type: 'question',
      question: 'Hai avuto un permesso di soggiorno per motivi familiari fino ai 18 anni?',
    },

    end_fam_inc: {
      id: 'end_fam_inc',
      type: 'result',
      title: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Conversione Permesso Famiglia dopo i 18 anni',
      resultDescription: 'Se hai avuto un permesso per motivi familiari fino ai 18 anni, potresti convertirlo in un permesso per studio o lavoro al compimento della maggiore età.',
      requirements: [
        'Permesso famiglia precedente fino ai 18 anni',
        'Iscrizione a un corso di studi o contratto di lavoro',
        'Richiesta entro il termine di scadenza',
      ],
      notes: 'È fondamentale fare richiesta di conversione prima della scadenza del permesso per evitare problemi. Rivolgiti a un consulente.',
      link: 'https://sospermesso.it/conversione-famiglia-maggiorenne',
    },

    gen_inv: {
      id: 'gen_inv',
      type: 'question',
      question: 'Sei invalido totale?',
    },

    gen_inv_mant: {
      id: 'gen_inv_mant',
      type: 'question',
      question: 'Il genitore ti mantiene economicamente?',
    },

    end_fam_inv: {
      id: 'end_fam_inv',
      type: 'result',
      title: '\u{267F} Permesso Famiglia Art. 30 per Figlio Invalido',
      resultDescription: 'Se sei invalido totale e a carico di un genitore regolarmente soggiornante, puoi ottenere il permesso per motivi familiari senza limiti di età.',
      duration: '2 anni (rinnovabile)',
      requirements: [
        'Invalidità totale certificata',
        'Genitore con permesso di soggiorno valido',
        'Mantenimento a carico dimostrato',
      ],
      link: 'https://sospermesso.it/famiglia-figlio-invalido',
    },

    end_res_el: {
      id: 'end_res_el',
      type: 'result',
      title: '\u{1F3E1} Residenza Elettiva (da valutare)',
      resultDescription: 'Se non rientri nelle categorie di ricongiungimento familiare ma hai risorse economiche adeguate, potresti valutare la Residenza Elettiva.',
      requirements: [
        'Reddito elevato e stabile proveniente dall\'estero',
        'Alloggio idoneo in Italia',
        'Nessuna intenzione di lavorare in Italia (solo rendite)',
      ],
      notes: 'La Residenza Elettiva è difficile da ottenere e richiede requisiti economici molto stringenti. Consulta un avvocato specializzato.',
      link: 'https://sospermesso.it/residenza-elettiva',
    },

    // ========== NONNO / FRATELLO-SORELLA ==========

    nonno_frat: {
      id: 'nonno_frat',
      type: 'question',
      question: 'Sono cittadini italiani?',
    },

    end_neg_par: {
      id: 'end_neg_par',
      type: 'result',
      title: '\u{274C} Parente troppo lontano - Nessun permesso disponibile',
      resultDescription: 'Purtroppo, i parenti oltre il secondo grado (es. zii, cugini, nipoti) non rientrano nelle categorie per il ricongiungimento familiare, salvo casi eccezionali (es. affidamento di minori).',
      notes: 'Se hai altre ragioni per rimanere in Italia (lavoro, studio, ecc.), esplora queste alternative. Consulta un avvocato per valutare altre soluzioni.',
      link: 'https://sospermesso.it/consulenza',
    },

    // =============================================
    // PERCORSO: CONIUGE / PARTNER
    // =============================================

    coniuge_start: {
      id: 'coniuge_start',
      type: 'question',
      question: 'Il tuo partner è...',
    },

    // CONIUGE ITALIANO
    con_ita_sposi: {
      id: 'con_ita_sposi',
      type: 'question',
      question: 'Siete sposati?',
    },

    con_ita_conv: {
      id: 'con_ita_conv',
      type: 'question',
      question: 'Avete un contratto di convivenza registrato?',
    },

    end_famit_part: {
      id: 'end_famit_part',
      type: 'result',
      title: '\u{1F491} Permesso per Partner Convivente di Cittadino Italiano/UE',
      resultDescription: 'Se hai un contratto di convivenza registrato con un cittadino italiano o UE, puoi richiedere il permesso per motivi familiari.',
      duration: '2 anni (rinnovabile)',
      requirements: [
        'Contratto di convivenza registrato al Comune',
        'Partner cittadino italiano o UE',
        'Convivenza effettiva',
      ],
      link: 'https://sospermesso.it/convivenza-registrata',
    },

    // CONIUGE UE
    con_ue_sposi: {
      id: 'con_ue_sposi',
      type: 'question',
      question: 'Siete sposati?',
    },

    con_ue_conv: {
      id: 'con_ue_conv',
      type: 'question',
      question: 'Avete un contratto di convivenza registrato?',
    },

    // CONIUGE STRANIERO
    con_str_sposi: {
      id: 'con_str_sposi',
      type: 'question',
      question: 'Siete sposati?',
    },

    con_str_pds: {
      id: 'con_str_pds',
      type: 'question',
      question: 'Che tipo di permesso di soggiorno ha il tuo coniuge?',
    },

    end_con_rif: {
      id: 'end_con_rif',
      type: 'result',
      title: '\u{1F6E1}\u{FE0F} Permesso per Coniuge di Rifugiato',
      resultDescription: 'Come coniuge di una persona con protezione internazionale (rifugiato o protezione sussidiaria), hai diritto al ricongiungimento familiare con procedure facilitate.',
      duration: 'Allineata al permesso del coniuge (generalmente 5 anni)',
      requirements: [
        'Matrimonio valido e riconosciuto',
        'Coniuge con status di rifugiato o protezione sussidiaria',
        'Nessun requisito reddituale o abitativo richiesto',
      ],
      link: 'https://sospermesso.it/coniuge-rifugiato',
    },

    end_carta_con: {
      id: 'end_carta_con',
      type: 'result',
      title: '\u{1F1EA}\u{1F1FA} Carta di Soggiorno per Coniuge di Lungosoggiornante UE',
      resultDescription: 'Se il tuo coniuge ha il Permesso UE per lungosoggiornanti, puoi richiedere una Carta di Soggiorno per ricongiungimento.',
      duration: '2 anni (rinnovabile, poi richiedibile Permesso UE)',
      requirements: [
        'Coniuge con Permesso UE lungosoggiornanti',
        'Requisiti reddituali e abitativi',
        'Matrimonio valido',
      ],
      link: 'https://sospermesso.it/carta-coniuge-lungosoggiornante',
    },

    con_str_prec: {
      id: 'con_str_prec',
      type: 'question',
      question: 'Hai avuto un permesso di soggiorno scaduto da meno di un anno?',
    },

    end_conv_fam: {
      id: 'end_conv_fam',
      type: 'result',
      title: '\u{1F504} Conversione in Permesso Famiglia (Possibile)',
      resultDescription: 'Se hai avuto un permesso di soggiorno scaduto da meno di un anno e hai sposato un cittadino straniero regolare, potresti convertire il tuo permesso in uno per motivi familiari.',
      requirements: [
        'Permesso precedente scaduto da meno di 1 anno',
        'Coniuge con permesso di soggiorno valido',
        'Matrimonio registrato',
        'Requisiti reddituali e abitativi del coniuge',
      ],
      notes: 'Consulta rapidamente un avvocato o un patronato per verificare la fattibilità e presentare la domanda in tempo.',
      link: 'https://sospermesso.it/conversione-famiglia',
    },

    end_conv_neg: {
      id: 'end_conv_neg',
      type: 'result',
      title: '\u{274C} Conversione Famiglia oltre l\'anno - Non possibile',
      resultDescription: 'Purtroppo, se il tuo permesso è scaduto da più di un anno, non è più possibile convertirlo in un permesso per motivi familiari. In questa situazione, le opzioni sono limitate.',
      notes: 'Potresti valutare di tornare nel Paese d\'origine e richiedere il ricongiungimento dall\'estero, oppure esplorare altre vie legali. Consulta un avvocato specializzato.',
      link: 'https://sospermesso.it/consulenza',
    },
  },

  edges: [
    // =============================================
    // START
    // =============================================
    { from: 'start', to: 'end_ue', label: 'Sì, sono cittadino UE', optionKey: 'si_ue' },
    { from: 'start', to: 'q_situazione', label: 'No, non sono cittadino UE', optionKey: 'no_ue' },

    // =============================================
    // Q_SITUAZIONE (9 options)
    // =============================================
    { from: 'q_situazione', to: 'minore_start', label: 'Ho meno di 18 anni', optionKey: 'minore' },
    { from: 'q_situazione', to: 'famiglia_start', label: 'In Italia c\'è qualcuno della mia famiglia', optionKey: 'famiglia' },
    { from: 'q_situazione', to: 'coniuge_start', label: 'In Italia ho trovato l\'amore', optionKey: 'partner' },
    { from: 'q_situazione', to: 'paura_start', label: 'Ho paura di tornare nel mio Paese', optionKey: 'paura' },
    { from: 'q_situazione', to: 'end_cure', label: 'Ho problemi gravi di salute', optionKey: 'salute' },
    { from: 'q_situazione', to: 'end_cure', label: 'Aspetto/ho avuto un figlio in Italia', optionKey: 'gravidanza' },
    { from: 'q_situazione', to: 'brutta_start', label: 'Sono in una brutta situazione', optionKey: 'sfruttamento' },
    { from: 'q_situazione', to: 'end_citt', label: 'Sono nato in Italia e sempre vissuto qui', optionKey: 'nato_italia' },
    { from: 'q_situazione', to: 'end_neg_gen', label: 'Nessuna di queste', optionKey: 'nessuna' },

    // =============================================
    // PERCORSO: HO PAURA DI TORNARE
    // =============================================
    { from: 'paura_start', to: 'end_asilo', label: 'C\'è la guerra', optionKey: 'guerra' },
    { from: 'paura_start', to: 'end_asilo', label: 'Qualcuno mi vuole uccidere', optionKey: 'persecuzione' },
    { from: 'paura_start', to: 'end_calam', label: 'Catastrofe naturale', optionKey: 'calamita' },

    // =============================================
    // PERCORSO: BRUTTA SITUAZIONE
    // =============================================
    { from: 'brutta_start', to: 'end_sfrut', label: 'Sfruttamento lavorativo grave', optionKey: 'sfruttamento_lav' },
    { from: 'brutta_start', to: 'end_tratta', label: 'Sono vittima di tratta di esseri umani', optionKey: 'tratta' },
    { from: 'brutta_start', to: 'end_viol', label: 'Subisco violenza domestica', optionKey: 'violenza' },

    // =============================================
    // PERCORSO: MINORE DI 18 ANNI
    // =============================================
    { from: 'minore_start', to: 'min_gen_pds', label: 'Sì, ho un genitore qui', optionKey: 'si_genitore' },
    { from: 'minore_start', to: 'min_parenti', label: 'No, nessun genitore', optionKey: 'no_genitore' },

    { from: 'min_gen_pds', to: 'end_min_fam', label: 'Sì, ha un PdS valido', optionKey: 'pds_valido' },
    { from: 'min_gen_pds', to: 'end_min_fam', label: 'PdS scaduto da meno di 60 giorni', optionKey: 'pds_scaduto_60' },
    { from: 'min_gen_pds', to: 'min_parenti', label: 'PdS scaduto da più di 60 giorni o nessun PdS', optionKey: 'pds_scaduto_no' },

    { from: 'min_parenti', to: 'min_par_ita1', label: 'Fratello/Sorella', optionKey: 'fratello' },
    { from: 'min_parenti', to: 'min_par_ita2', label: 'Nonno/a', optionKey: 'nonno' },
    { from: 'min_parenti', to: 'min_par_ita3', label: 'Zio/a', optionKey: 'zio' },
    { from: 'min_parenti', to: 'min_par_ita4', label: 'Cugino (figlio dello zio)', optionKey: 'cugino' },
    { from: 'min_parenti', to: 'min_par_ita5', label: 'Fratello/sorella del nonno', optionKey: 'prozio' },
    { from: 'min_parenti', to: 'end_msna', label: 'Parenti più lontani', optionKey: 'parenti_lontani' },
    { from: 'min_parenti', to: 'end_msna', label: 'Nessun parente in Italia', optionKey: 'nessun_parente' },

    // Fratello/Sorella path
    { from: 'min_par_ita1', to: 'end_art19', label: 'Sì, è italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita1', to: 'min_affido1', label: 'No, ma ha un permesso di soggiorno', optionKey: 'ha_pds' },
    { from: 'min_par_ita1', to: 'end_msna', label: 'No, non ha permesso', optionKey: 'no_pds' },

    { from: 'min_affido1', to: 'end_aff', label: 'Sì, c\'è un provvedimento', optionKey: 'si_provvedimento' },
    { from: 'min_affido1', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // Nonno/a path
    { from: 'min_par_ita2', to: 'end_art19', label: 'Sì, è italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita2', to: 'min_affido2', label: 'No, ma ha un permesso di soggiorno', optionKey: 'ha_pds' },
    { from: 'min_par_ita2', to: 'end_msna', label: 'No, non ha permesso', optionKey: 'no_pds' },

    { from: 'min_affido2', to: 'end_aff', label: 'Sì, c\'è un provvedimento', optionKey: 'si_provvedimento' },
    { from: 'min_affido2', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // Zio/a path
    { from: 'min_par_ita3', to: 'min_affido3', label: 'Sì, è italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita3', to: 'min_affido3', label: 'No, ma ha un permesso di soggiorno', optionKey: 'ha_pds' },
    { from: 'min_par_ita3', to: 'end_msna', label: 'No, non ha permesso', optionKey: 'no_pds' },

    { from: 'min_affido3', to: 'end_aff', label: 'Sì, c\'è un provvedimento', optionKey: 'si_provvedimento' },
    { from: 'min_affido3', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // Cugino path
    { from: 'min_par_ita4', to: 'min_affido4', label: 'Sì, è italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita4', to: 'min_affido4', label: 'No, ma ha un permesso di soggiorno', optionKey: 'ha_pds' },
    { from: 'min_par_ita4', to: 'end_msna', label: 'No, non ha permesso', optionKey: 'no_pds' },

    { from: 'min_affido4', to: 'end_aff', label: 'Sì, c\'è un provvedimento', optionKey: 'si_provvedimento' },
    { from: 'min_affido4', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // Fratello/sorella del nonno path
    { from: 'min_par_ita5', to: 'min_affido5', label: 'Sì, è italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita5', to: 'min_affido5', label: 'No, ma ha un permesso di soggiorno', optionKey: 'ha_pds' },
    { from: 'min_par_ita5', to: 'end_msna', label: 'No, non ha permesso', optionKey: 'no_pds' },

    { from: 'min_affido5', to: 'end_aff', label: 'Sì, c\'è un provvedimento', optionKey: 'si_provvedimento' },
    { from: 'min_affido5', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // =============================================
    // PERCORSO: FAMIGLIA (parente in Italia)
    // =============================================
    { from: 'famiglia_start', to: 'figlio_start', label: 'Mio figlio', optionKey: 'figlio' },
    { from: 'famiglia_start', to: 'genitore_start', label: 'Mio genitore', optionKey: 'genitore' },
    { from: 'famiglia_start', to: 'nonno_frat', label: 'Mio nonno o fratello/sorella', optionKey: 'nonno_fratello' },
    { from: 'famiglia_start', to: 'end_neg_par', label: 'Altri parenti più lontani', optionKey: 'altri_parenti' },

    // ========== FIGLIO ==========
    { from: 'figlio_start', to: 'fig_ita_min', label: 'Sì, è italiano', optionKey: 'si_italiano' },
    { from: 'figlio_start', to: 'fig_ue', label: 'No', optionKey: 'no' },

    { from: 'fig_ita_min', to: 'end_art30', label: 'Sì', optionKey: 'si' },
    { from: 'fig_ita_min', to: 'fig_mant', label: 'No', optionKey: 'no' },

    { from: 'fig_mant', to: 'end_famit', label: 'Sì', optionKey: 'si' },
    { from: 'fig_mant', to: 'fig_conv', label: 'No', optionKey: 'no' },

    { from: 'fig_conv', to: 'end_art19', label: 'Sì', optionKey: 'si' },
    { from: 'fig_conv', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    { from: 'fig_ue', to: 'fig_ue_min', label: 'Sì', optionKey: 'si_ue' },
    { from: 'fig_ue', to: 'fig_stra_min', label: 'No', optionKey: 'no_ue' },

    { from: 'fig_ue_min', to: 'end_zamb', label: 'Sì', optionKey: 'si' },
    { from: 'fig_ue_min', to: 'fig_ue_mant', label: 'No', optionKey: 'no' },

    { from: 'fig_ue_mant', to: 'end_carta_ue', label: 'Sì', optionKey: 'si' },
    { from: 'fig_ue_mant', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    { from: 'fig_stra_min', to: 'end_art31', label: 'Sì', optionKey: 'si' },
    { from: 'fig_stra_min', to: 'fig_stra_pds', label: 'No', optionKey: 'no' },

    { from: 'fig_stra_pds', to: 'fig_stra_mant', label: 'Sì', optionKey: 'si' },
    { from: 'fig_stra_pds', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    { from: 'fig_stra_mant', to: 'end_art30_gen', label: 'Sì', optionKey: 'si' },
    { from: 'fig_stra_mant', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    // ========== GENITORE ==========
    { from: 'genitore_start', to: 'gen_ita_eta', label: 'Sì', optionKey: 'si' },
    { from: 'genitore_start', to: 'gen_pds', label: 'No', optionKey: 'no' },

    { from: 'gen_ita_eta', to: 'gen_ita_tipo', label: 'Sì', optionKey: 'si' },
    { from: 'gen_ita_eta', to: 'gen_mant', label: 'No', optionKey: 'no' },

    { from: 'gen_ita_tipo', to: 'end_famit_gen', label: 'Sì', optionKey: 'si_italiano' },
    { from: 'gen_ita_tipo', to: 'end_carta_ue', label: 'No, ma è UE', optionKey: 'ue' },

    { from: 'gen_mant', to: 'gen_mant_tipo', label: 'Sì', optionKey: 'si' },
    { from: 'gen_mant', to: 'gen_ita_conv', label: 'No', optionKey: 'no' },

    { from: 'gen_mant_tipo', to: 'end_famit_gen', label: 'Italiano', optionKey: 'italiano' },
    { from: 'gen_mant_tipo', to: 'end_carta_ue', label: 'UE', optionKey: 'ue' },

    { from: 'gen_ita_conv', to: 'end_art19', label: 'Sì', optionKey: 'si' },
    { from: 'gen_ita_conv', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    { from: 'gen_pds', to: 'end_fam_inc', label: 'Sì', optionKey: 'si' },
    { from: 'gen_pds', to: 'gen_inv', label: 'No', optionKey: 'no' },

    { from: 'gen_inv', to: 'gen_inv_mant', label: 'Sì', optionKey: 'si' },
    { from: 'gen_inv', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    { from: 'gen_inv_mant', to: 'end_fam_inv', label: 'Sì', optionKey: 'si' },
    { from: 'gen_inv_mant', to: 'end_res_el', label: 'No', optionKey: 'no' },

    // ========== NONNO / FRATELLO-SORELLA ==========
    { from: 'nonno_frat', to: 'end_art19', label: 'Sì', optionKey: 'si' },
    { from: 'nonno_frat', to: 'end_neg_par', label: 'No', optionKey: 'no' },

    // =============================================
    // PERCORSO: CONIUGE / PARTNER
    // =============================================
    { from: 'coniuge_start', to: 'con_ita_sposi', label: 'Italiano', optionKey: 'italiano' },
    { from: 'coniuge_start', to: 'con_ue_sposi', label: 'Cittadino UE', optionKey: 'ue' },
    { from: 'coniuge_start', to: 'con_str_sposi', label: 'Straniero', optionKey: 'straniero' },

    // CONIUGE ITALIANO
    { from: 'con_ita_sposi', to: 'end_famit', label: 'Sì', optionKey: 'si' },
    { from: 'con_ita_sposi', to: 'con_ita_conv', label: 'No', optionKey: 'no' },

    { from: 'con_ita_conv', to: 'end_famit_part', label: 'Sì', optionKey: 'si' },
    { from: 'con_ita_conv', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    // CONIUGE UE
    { from: 'con_ue_sposi', to: 'end_carta_ue', label: 'Sì', optionKey: 'si' },
    { from: 'con_ue_sposi', to: 'con_ue_conv', label: 'No', optionKey: 'no' },

    { from: 'con_ue_conv', to: 'end_carta_ue', label: 'Sì', optionKey: 'si' },
    { from: 'con_ue_conv', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    // CONIUGE STRANIERO
    { from: 'con_str_sposi', to: 'con_str_pds', label: 'Sì', optionKey: 'si' },
    { from: 'con_str_sposi', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    { from: 'con_str_pds', to: 'end_con_rif', label: 'Asilo o Protezione Sussidiaria', optionKey: 'asilo' },
    { from: 'con_str_pds', to: 'end_carta_con', label: 'Permesso UE per lungosoggiornanti', optionKey: 'lungosoggiornanti' },
    { from: 'con_str_pds', to: 'con_str_prec', label: 'Altro tipo di permesso', optionKey: 'altro' },
    { from: 'con_str_pds', to: 'end_neg_gen', label: 'Non ha permesso', optionKey: 'no_pds' },

    { from: 'con_str_prec', to: 'end_conv_fam', label: 'Sì', optionKey: 'si' },
    { from: 'con_str_prec', to: 'end_conv_neg', label: 'No', optionKey: 'no' },
  ],
};
