/**
 * Italian decision tree for SOSpermesso residence permit wizard.
 *
 * Content sourced verbatim from:
 * - TRASCRIZIONE SCHEDE TYPEFORM (domande).docx — question text + edge labels
 * - TRASCRIZIONE SCHEDE TYPEFORM (statement).docx — result page content
 * - flowchart_permessi.mermaid — branching logic
 *
 * Contains 46 question nodes + 1 info node + 30 result nodes = 77 total nodes.
 *
 * Placeholders [Nome] and [Parente selezionato] are substituted at runtime
 * by text-utils.ts substituteVariables().
 *
 * IMPORTANT: min_affido1 through min_affido5 are intentionally separate nodes.
 * They share question text but occupy different graph positions.
 */

import type { TreeData } from '@/types/tree';

export const italianTree: TreeData = {
  startNodeId: 'start',

  nodes: {
    // =============================================
    // D3 — DOMANDA INIZIALE
    // =============================================

    start: {
      id: 'start',
      type: 'question',
      question: '[Nome], hai la cittadinanza di uno Stato dell\'Unione Europea (UE)?',
    },

    // =============================================
    // S1 — SCHEDA: Cittadino UE
    // =============================================

    end_ue: {
      id: 'end_ue',
      type: 'result',
      title: 'Cittadino UE — Non serve permesso di soggiorno',
      introText: 'Ottime notizie [Nome]!\nSei un viaggiatore che proviene da uno Stato UE. In Italia hai molti diritti, tra cui:',
      sections: [
        { heading: 'Diritto di ingresso', content: 'Puoi entrare in Italia senza alcuna formalità.' },
        { heading: 'Soggiorno', content: 'Puoi stare liberamente in Italia o in un altro Stato UE per un massimo di tre mesi. Se vuoi soggiornare in Italia per più di tre mesi, devi avere un motivo (famiglia, lavoro, studio, ecc.) e serve qualche formalità burocratica. Niente di complicato.' },
        { heading: 'Lavoro', content: 'Hai diritto di lavorare in Italia senza bisogno di un permesso per lavoro.' },
        { heading: 'Studio', content: 'Hai diritto di studiare in Italia senza bisogno di un permesso per studio.' },
        { heading: 'Ricongiungimento familiare', content: 'Hai diritto di far venire in Italia i tuoi familiari (anche se cittadini di Stati non-UE).' },
        { heading: 'Mi serve un avvocato?', content: 'No, non ti serve un avvocato 🟢 Come cittadino UE non hai bisogno di un permesso di soggiorno.' },
      ],
      links: [
        { label: 'Trovi più informazioni su SOSpermesso', url: 'https://www.sospermesso.it', type: 'guide' },
      ],
    },

    // =============================================
    // D4 — DOMANDA PRINCIPALE: SITUAZIONE
    // =============================================

    q_situazione: {
      id: 'q_situazione',
      type: 'question',
      question: 'Va bene [Nome]. Se non hai mai avuto un permesso di soggiorno in Italia, dobbiamo capire se sei in una di queste situazioni.',
      description: 'Seleziona una delle opzioni qui sotto.',
    },

    // =============================================
    // D6 — PERCORSO: HO PAURA DI TORNARE
    // =============================================

    paura_start: {
      id: 'paura_start',
      type: 'question',
      question: 'Ci dispiace che il tuo paese per te sia pericoloso. Di che tipo di pericolo si tratta?',
    },

    // S6 — Protezione Internazionale
    end_asilo: {
      id: 'end_asilo',
      type: 'result',
      title: 'Protezione Internazionale — Asilo o Protezione Sussidiaria',
      introText: 'Hey [Nome], speriamo che in Italia tu ti senta al sicuro.\nSe nel tuo paese d\'origine sta succedendo qualcosa di brutto, come una guerra o se c\'è qualcuno che ti vuole fare del male, in Italia esiste la protezione internazionale, che può chiamarsi status di rifugiato o protezione sussidiaria.',
      sections: [
        { heading: 'Come funziona?', content: 'Tutti possono fare domanda, ma poi ci sarà un colloquio con una Commissione che valuterà quanto grave è il tuo problema.' },
        { heading: 'Ho già fatto domanda in passato, oppure ho dei precedenti penali. Posso fare domanda?', content: 'Sì ma in questo caso ti consigliamo di chiedere assistenza legale qualificata prima di andare in Questura' },
        { heading: 'Mi serve un avvocato?', content: '🟠 Puoi fare tutto da solo, ma prima di prendere decisioni, soprattutto se hai già fatto in passato una domanda di protezione internazionale, ti consigliamo di consultare un esperto legale.' },
      ],
      links: [
        { label: 'Più informazioni sulla procedura di protezione internazionale', url: 'https://www.sospermesso.it/protezione-internazionale', type: 'guide' },
        { label: 'Trova centri di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S7 — Calamità
    end_calam: {
      id: 'end_calam',
      type: 'result',
      title: 'Permesso di Soggiorno per Calamità Naturale',
      introText: '[Nome], speriamo che a casa stiano tutti bene.\nSe nel tuo paese al momento c\'è una catastrofe naturale grave (ad esempio un terremoto o un\'alluvione) puoi avere un permesso di soggiorno per calamità naturale.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Dura sei mesi e può essere rinnovato fino a quando dura l\'emergenza. Durante questo tempo hai diritto di lavorare.' },
        { heading: 'Questo permesso può essere convertito in lavoro?', content: 'La Questura probabilmente ti dirà che dopo l\'11 marzo 2023, NON lo puoi convertire il tuo permesso per calamità naturale in permesso per motivi di lavoro. Prima che scada è però possibile provare a inviare un kit postale per convertire il permesso, ma è probabile che poi ti servirà l\'aiuto di un buon avvocato.' },
        { heading: 'Mi serve un avvocato?', content: '🟠 Per ora non hai bisogno di un avvocato ma inizia a pensare a cosa fare quando l\'emergenza sarà finita.' },
      ],
      links: [
        { label: 'Più informazioni sul permesso per calamità naturale', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova centri di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // =============================================
    // D5 — PERCORSO: BRUTTA SITUAZIONE
    // =============================================

    brutta_start: {
      id: 'brutta_start',
      type: 'question',
      question: 'Ci dispiace, [Nome]! Di cosa si tratta esattamente?',
    },

    // S2 — Sfruttamento lavorativo
    end_sfrut: {
      id: 'end_sfrut',
      type: 'result',
      title: 'Permesso per Grave Sfruttamento Lavorativo',
      introText: '[Nome] ci dispiace davvero\nIn Italia ci sono leggi che proteggono i lavoratori da stipendi troppo bassi, da orari troppo lunghi e da maltrattamenti sul posto di lavoro.\nForse però c\'è una piccola buona notizia perché in Italia esiste un permesso di soggiorno per chi è vittima di sfruttamento lavorativo e vuole uscire da questa situazione.\nPerò difficilmente troverai la soluzione da solo. Ti consigliamo di chiedere subito aiuto legale qualificato',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Di solito dura un anno e può essere rinnovato o convertito in permesso per motivi di lavoro' },
      ],
      links: [
        { label: 'Più informazioni', url: 'https://www.sospermesso.it/permesso-sfruttamento-lavorativo', type: 'guide' },
        { label: 'Trova centri di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S3 — Tratta
    end_tratta: {
      id: 'end_tratta',
      type: 'result',
      title: 'Permesso per Vittime di Tratta (Art. 18)',
      introText: 'Ci dispiace, [Nome].\nSembra tu sia in una brutta situazione. Ti consigliamo di chiamare il numero gratuito 800 290 290 per chiedere aiuto anonimo e gratuito.\nLa buona notizia è che in Italia c\'è un permesso di soggiorno per le vittime di tratta di esseri umani che vogliono cambiare vita.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Di solito dura un anno e può essere rinnovato o convertito in permesso per motivi di lavoro' },
      ],
      emergencyNumbers: ['800 290 290'],
      links: [
        { label: 'Più informazioni', url: 'https://www.sospermesso.it/permesso-protezione-sociale-vittime-di-tratta', type: 'guide' },
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S4 — Violenza domestica
    end_viol: {
      id: 'end_viol',
      type: 'result',
      title: 'Permesso per Vittime di Violenza Domestica',
      introText: 'Ci dispiace, [Nome].\nSembra tu sia in una brutta situazione. Ti consigliamo di chiamare il numero gratuito 1522 per chiedere aiuto anonimo e gratuito.\nLa buona notizia è che in Italia c\'è un permesso di soggiorno per le vittime di violenza domestica (violenza fisica, sessuale, psicologica o economica all\'interno della famiglia o tra partner o ex-partner, anche se non si vive insieme).',
      sections: [
        { heading: 'Come si chiede?', content: 'Si chiede personalmente in Questura (non con il KIT postale), sulla base di:\n\nProposta dell\'autorità giudiziaria, in base alle indagini' },
      ],
      emergencyNumbers: ['1522'],
      links: [
        { label: 'Trova centri di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // =============================================
    // ALTRE SCHEDE FINALI
    // =============================================

    // S24 — Cure mediche (percorso salute)
    end_cure_salute: {
      id: 'end_cure_salute',
      type: 'result',
      title: 'Permesso di Soggiorno per Cure Mediche',
      introText: '[Nome], se hai gravi problemi di salute che non puoi curare bene nel tuo paese, puoi chiedere un permesso per cure mediche.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'In generale, un permesso di soggiorno per cure mediche dura tutto il tempo necessario per curarti. Mentre hai questo permesso, puoi studiare e lavorare.' },
        { heading: 'Posso convertire questo permesso in un altro permesso?', content: 'Dopo le modifiche della Legge 50 del 2023, il permesso di soggiorno per cure mediche non può più essere convertito automaticamente in permesso di soggiorno per motivi di lavoro. Dipende da quando l\'hai chiesto: potrebbe esserci ancora la possibilità. Ma ti serve aiuto legale qualificato.' },
        { heading: 'Come lo posso chiedere?', content: 'Devi chiederlo personalmente in Questura.' },
        { heading: 'Mi serve un avvocato?', content: '🟠 No, puoi chiedere tu direttamente questo permesso in Questura ma è importante documentare bene la tua situazione medica. Chiedi un parere legale prima.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S12 — Cure mediche (percorso gravidanza)
    end_cure_gravidanza: {
      id: 'end_cure_gravidanza',
      type: 'result',
      title: 'Permesso di Soggiorno per Cure Mediche — Gravidanza',
      introText: 'Congratulazioni per la tua famiglia!\nQuando stai per diventare genitore o sei appena diventato mamma o papà, puoi avere un permesso di soggiorno per cure mediche.\nAnche il papà del bambino può chiedere questo permesso, ma ci sono condizioni in più.\nIn ogni caso ti consigliamo di chiedere assistenza legale.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Generalmente dura fino a quando tuo figlio ha sei mesi. Puoi avere la residenza, studiare, lavorare e avere il medico di base.' },
        { heading: 'Come lo posso chiedere?', content: 'Puoi chiedere questo permesso personalmente in Questura.' },
        { heading: 'Cosa succede quando scade?', content: 'Attenzione! NON puoi convertire questo permesso in un permesso di lavoro.\nCon il tuo avvocato potrai decidere se fare domanda per un permesso di soggiorno per assistenza minori (art. 31).' },
        { heading: 'Mi serve un avvocato?', content: '🟠 Puoi chiedere il permesso da solo, però ti consigliamo di chiedere un parere legale per capire cosa fare quando il permesso scade.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso per la madre', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Più informazioni su questo permesso per il padre', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova centri di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S31 — Cittadinanza
    end_citt: {
      id: 'end_citt',
      type: 'result',
      title: 'Cittadinanza Italiana',
      introText: 'Se sei nato in Italia e hai sempre vissuto qui quando compi 18 anni puoi chiedere la cittadinanza italiana.',
      sections: [
        { heading: 'Come funziona?', content: 'La Legge riconosce il diritto di diventare cittadino italiano a chi è nato in Italia da genitori stranieri al compimento del 18° anno di età e ha mantenuto ininterrottamente la residenza legale sul territorio italiano. La procedura è molto semplice:\nsi presenta una dichiarazione all\'Ufficio di Stato Civile del proprio Comune di residenza.\nFino ai 18 anni se i tuoi genitori hanno un permesso di soggiorno, puoi avere un permesso per motivi di famiglia.' },
      ],
      links: [
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S28 — Negativo generico
    end_neg_gen: {
      id: 'end_neg_gen',
      type: 'result',
      title: 'Nessun permesso disponibile in questa situazione',
      introText: 'Ehi, [Nome]! Se non hai un permesso di soggiorno e non sei in nessuna delle situazioni che abbiamo detto prima, non riusciamo a trovare un permesso di soggiorno per te.\nSe vuoi, torna indietro e cerca un\'altra soluzione. Oppure continua a leggere.',
      sections: [
        { heading: 'Vivi in Italia da un po\' di tempo in modo irregolare? Lavori? Parli bene italiano? Hai amici qui in Italia?', content: 'Tutto questo potrebbe non essere sufficiente per avere un permesso di soggiorno, in base alle leggi attuali. Secondo la legge per avere la protezione speciale, è necessario fare domanda di protezione internazionale (asilo)\nAl momento le Questure non ricevono più le nuove domande di protezione speciale.\nPuoi provare a chiederla, ma ti serve un consiglio legale specializzato.' },
        { heading: 'Lavori già o hai un\'offerta di lavoro?', content: 'Se sei irregolare, non è sufficiente avere un\'offerta di lavoro per avere un permesso di soggiorno in Italia. Se vuoi lavorare in Italia, potresti aspettare che il Governo pubblichi il "decreto flussi" nel 2026. Il tuo datore di lavoro dovrà fare domanda per te.\nRicorda che per percorrere questa strada hai bisogno del passaporto e dovresti poi tornare nel tuo paese d\'origine per richiedere il visto.\nAnche in questo caso ti serve un consiglio legale specializzato.' },
      ],
      links: [
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // =============================================
    // D7 — PERCORSO: MINORE DI 18 ANNI
    // =============================================

    minore_start: {
      id: 'minore_start',
      type: 'question',
      question: 'Almeno uno dei tuoi genitori è in Italia in questo momento?',
    },

    // D8
    min_gen_pds: {
      id: 'min_gen_pds',
      type: 'question',
      question: 'Tua mamma o tuo papà in questo momento:',
    },

    // S8 — Info interstitial: genitore senza PdS
    info_s8: {
      id: 'info_s8',
      type: 'info',
      question: 'Hey [Nome], se nessuno dei tuoi genitori ha un permesso di soggiorno valido, è un po\' un problema.',
      description: 'Quindi cosa posso fare?\n\nPrima cosa: manda ai tuoi genitori il link a questo test, e scoprite insieme se possono avere un permesso di soggiorno. Così sarà molto facile per te averlo!\n\nSeconda cosa: andiamo avanti per vedere se hai diritto a un altro permesso di soggiorno.',
    },

    // S11 — Famiglia minore (genitore con PdS)
    end_min_fam: {
      id: 'end_min_fam',
      type: 'result',
      title: 'Permesso di Soggiorno per Motivi Familiari (Minore)',
      introText: '[Nome], secondo noi puoi stare tranquillo. Puoi avere un permesso di soggiorno per motivi di famiglia fino ai 18 anni. E forse anche dopo.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Il permesso per motivi di famiglia dura almeno fino a quando compi 18 anni.' },
        { heading: 'Quando compio 18 anni cosa succede?', content: 'Puoi convertirlo in un permesso di soggiorno per studio, lavoro o ricerca lavoro. Se invece sei ancora dipendente economicamente dai tuoi genitori, questo permesso di solito viene rinnovato fino ai 21 anni.\nAttenzione: devi mandare la richiesta di conversione prima dei 18 anni.' },
        { heading: 'Come lo posso chiedere?', content: 'Puoi chiedere questo permesso con un kit postale mandato dal tuo genitore.' },
        { heading: 'Mi serve un avvocato?', content: '🟢 No, puoi fare tutto da solo con la tua famiglia.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova centri di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D9
    min_parenti: {
      id: 'min_parenti',
      type: 'question',
      question: 'In Italia vivi nella stessa casa con uno di questi famigliari?',
    },

    // D10 — Fratello/Sorella
    min_par_ita1: {
      id: 'min_par_ita1',
      type: 'question',
      question: 'Qual è la situazione di tuo [Parente selezionato]?',
    },

    // D11 — Affidamento fratello
    min_affido1: {
      id: 'min_affido1',
      type: 'question',
      question: 'C\'è una decisione del tribunale per i minorenni o almeno dei servizi sociali di affidarti a tuo [Parente selezionato]?',
    },

    // D10 — Nonno/a
    min_par_ita2: {
      id: 'min_par_ita2',
      type: 'question',
      question: 'Qual è la situazione di tuo [Parente selezionato]?',
    },

    // D11 — Affidamento nonno
    min_affido2: {
      id: 'min_affido2',
      type: 'question',
      question: 'C\'è una decisione del tribunale per i minorenni o almeno dei servizi sociali di affidarti a tuo [Parente selezionato]?',
    },

    // D10 — Zio/a
    min_par_ita3: {
      id: 'min_par_ita3',
      type: 'question',
      question: 'Qual è la situazione di tuo [Parente selezionato]?',
    },

    // D11 — Affidamento zio
    min_affido3: {
      id: 'min_affido3',
      type: 'question',
      question: 'C\'è una decisione del tribunale per i minorenni o almeno dei servizi sociali di affidarti a tuo [Parente selezionato]?',
    },

    // D10 — Cugino
    min_par_ita4: {
      id: 'min_par_ita4',
      type: 'question',
      question: 'Qual è la situazione di tuo [Parente selezionato]?',
    },

    // D11 — Affidamento cugino
    min_affido4: {
      id: 'min_affido4',
      type: 'question',
      question: 'C\'è una decisione del tribunale per i minorenni o almeno dei servizi sociali di affidarti a tuo [Parente selezionato]?',
    },

    // D10 — Fratello/sorella del nonno
    min_par_ita5: {
      id: 'min_par_ita5',
      type: 'question',
      question: 'Qual è la situazione di tuo [Parente selezionato]?',
    },

    // D11 — Affidamento prozio
    min_affido5: {
      id: 'min_affido5',
      type: 'question',
      question: 'C\'è una decisione del tribunale per i minorenni o almeno dei servizi sociali di affidarti a tuo [Parente selezionato]?',
    },

    // S16 — Art. 19 (familiare italiano convivente)
    end_art19: {
      id: 'end_art19',
      type: 'result',
      title: 'Permesso per Motivi Familiari (Articolo 19)',
      introText: '[Nome], puoi avere un permesso di soggiorno per motivi familiari.\nATTENZIONE: tuo [Parente selezionato] deve avere la cittadinanza italiana e dovete vivere insieme. Prima di dare il permesso di soggiorno, la Polizia può fare dei controlli per verificare se vivete insieme.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Generalmente dura due anni. Puoi avere la residenza, studiare, lavorare e avere il medico di base.' },
        { heading: 'Come lo chiedo?', content: 'Devi chiedere questo permesso personalmente in Questura.' },
        { heading: 'Mi serve un avvocato?', content: '🟢 No, puoi fare tutto da solo.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S10 — Affidamento
    end_aff: {
      id: 'end_aff',
      type: 'result',
      title: 'Permesso per Motivi Familiari — Minore Affidato',
      introText: 'Buone notizie [Nome]. In base a quello che ci hai detto, sei considerato un minore straniero non accompagnato e affidato. Hai diritto a un permesso di soggiorno per motivi di famiglia fino ai 18 anni. E forse anche dopo.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Il permesso per motivi di famiglia dura almeno fino a quando compi 18 anni.' },
        { heading: 'Quando compio 18 anni cosa succede?', content: 'Dopo puoi convertirlo in un permesso di soggiorno per studio, lavoro o ricerca lavoro.\nAttenzione: devi mandare la richiesta di conversione prima dei 18 anni.' },
        { heading: 'Come lo posso chiedere?', content: 'Puoi chiedere questo permesso con un kit postale o direttamente in Questura.' },
        { heading: 'Mi serve un avvocato?', content: '🟢 No, puoi fare tutto da solo con la tua famiglia, ma è meglio chiedere l\'aiuto dei servizi sociali.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it/Permesso-per-motivi-familiari-per-minori-stranieri-affidati-a-familiari-entro-il-quarto-grado-1ba7355e7f7f80b5bf30db3fae87ace4', type: 'guide' },
        { label: 'Trova centri di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S9 — MSNA
    end_msna: {
      id: 'end_msna',
      type: 'result',
      title: 'Minore Straniero Non Accompagnato (MSNA)',
      introText: '[Nome] in base a quello che ci hai detto, in Italia sei considerato un minore straniero non accompagnato.\nPer questo, puoi avere un permesso di soggiorno per minore età fino ai 18 anni, che potrai poi convertire in permesso per:\n• studio\n• lavoro\n• ricerca lavoro\n• affidamento (prosieguo amministrativo)',
      sections: [
        { heading: 'Come lo posso chiedere?', content: 'Devi chiedere questo permesso direttamente in Questura. E\' meglio se ti fai aiutare dai Servizi sociali del tuo comune' },
        { heading: 'Mi serve un avvocato?', content: '🟠 No, puoi fare tutto da solo ma per non fare errori è meglio farti aiutare. Rivolgiti al servizio sociale più vicino a te.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova centri di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // =============================================
    // D12 — PERCORSO: FAMIGLIA (parente in Italia)
    // =============================================

    famiglia_start: {
      id: 'famiglia_start',
      type: 'question',
      question: 'Molto bene [Nome]. Chi c\'è in Italia della tua famiglia?',
    },

    // ========== D15 — FIGLIO ==========

    figlio_start: {
      id: 'figlio_start',
      type: 'question',
      question: 'Almeno uno dei tuoi figli ha la cittadinanza italiana?',
      description: 'Ricorda: se l\'altro genitore è cittadino italiano, vostro figlio è molto probabilmente cittadino italiano.',
    },

    // D16
    fig_ita_min: {
      id: 'fig_ita_min',
      type: 'question',
      question: 'Tuo figlio italiano ha meno di 18 anni?',
    },

    // S15 — Art. 30 (genitore di minore italiano)
    end_art30: {
      id: 'end_art30',
      type: 'result',
      title: 'Permesso per Motivi Familiari — Genitore di Minore Italiano',
      introText: '[Nome] se hai un figlio minore che è cittadino italiano e che risiede in Italia, puoi chiedere un permesso di soggiorno per motivi familiari.',
      sections: [
        { heading: 'Come lo posso chiedere?', content: 'Puoi chiedere questo permesso direttamente in Questura. E\' importante portare un certificato di residenza del figlio minore in Italia' },
        { heading: 'Quanto dura?', content: 'Generalmente viene dato per 1 o 2 anni e può essere poi rinnovato fino a quando tuo figlio ha 18 anni.\nPuò anche essere convertito in un permesso per lavoro' },
        { heading: 'Mi serve un avvocato?', content: '🟠 In teoria puoi fare domanda anche da solo, ma ti consigliamo di chiedere un parere legale prima.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it/Genitore-di-minore-cittadino-italiano-1ba7355e7f7f80b4bd96d937d1548bd9', type: 'guide' },
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D17
    fig_mant: {
      id: 'fig_mant',
      type: 'question',
      question: 'Tuo figlio maggiorenne cittadino italiano ti mantiene?',
      description: 'Per capirci: questo figlio paga la maggior parte delle tue spese per casa, cibo, vestiti, ecc.?',
    },

    // S22 — Famit generico
    end_famit: {
      id: 'end_famit',
      type: 'result',
      title: 'Permesso per Motivi Familiari (Famit)',
      introText: '[Nome], potresti chiedere un permesso di soggiorno come familiare di cittadino italiano "statico". Questo permesso viene anche chiamato "Famit".',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Il permesso "Famit" dura 5 anni, consente di studiare e lavorare. Alla scadenza, può essere rinnovato o convertito in permesso per lavoro.' },
        { heading: 'Come lo posso chiedere?', content: 'Personalmente in Questura, accompagnato dal cittadino italiano.' },
        { heading: 'Mi serve un avvocato?', content: '🟠 No, puoi chiedere questo permesso direttamente da solo in Questura. Però ti consigliamo di chiedere un parere legale prima, per trovare la soluzione più adatta a te.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D18
    fig_conv: {
      id: 'fig_conv',
      type: 'question',
      question: 'Tuo figlio italiano maggiorenne vive con te?',
    },

    // D19
    fig_ue: {
      id: 'fig_ue',
      type: 'question',
      question: 'Tuo figlio è cittadino di uno Stato dell\'Unione Europea (UE)?',
    },

    // D20
    fig_ue_min: {
      id: 'fig_ue_min',
      type: 'question',
      question: 'Tuo figlio (cittadino UE) è minore di 18 anni?',
    },

    // S18 — Zambrano
    end_zamb: {
      id: 'end_zamb',
      type: 'result',
      title: 'Carta di Soggiorno — Caso Zambrano',
      introText: '[Nome], in base alle informazioni che ci hai dato, dovresti avere diritto a un permesso di soggiorno, ad esempio il permesso di soggiorno per motivi familiari o la Carta di soggiorno come familiare di cittadino UE.\nPerò al momento le Questure non danno facilmente un permesso in questa situazione. È una situazione complessa e ti serve un parere legale.',
      sections: [],
      links: [
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D21
    fig_ue_mant: {
      id: 'fig_ue_mant',
      type: 'question',
      question: 'Tuo figlio (maggiorenne, cittadino UE) ti mantiene?',
      description: 'Per capirci: questo figlio paga la maggior parte delle tue spese per casa, cibo, vestiti, ecc.?',
    },

    // S23 — Carta familiare UE
    end_carta_ue: {
      id: 'end_carta_ue',
      type: 'result',
      title: 'Carta di Soggiorno per Familiari di Cittadini UE',
      introText: '[Nome], in base alle informazioni che ci hai dato, potresti chiedere la Carta di soggiorno come familiare di cittadini UE.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'La Carta di soggiorno per familiare di cittadini UE dura cinque anni. Puoi studiare, lavorare, prendere la residenza e avere il medico di base.' },
        { heading: 'Quando scade cosa faccio?', content: 'Puoi rinnovare la Carta, che diventerà permanente. Puoi anche convertire la Carta in un permesso per lavoro.' },
        { heading: 'Come lo posso chiedere?', content: 'Personalmente in Questura, accompagnato dal familiare cittadino UE.' },
        { heading: 'Mi serve un avvocato?', content: '🟢 No, puoi chiedere questo permesso direttamente in Questura, da solo.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D22
    fig_stra_min: {
      id: 'fig_stra_min',
      type: 'question',
      question: 'Tuo figlio ha meno di 18 anni?',
    },

    // S14 — Art. 31
    end_art31: {
      id: 'end_art31',
      type: 'result',
      title: 'Permesso per Assistenza Minore (Articolo 31)',
      introText: 'Se hai un figlio minore in Italia, puoi provare a chiedere un permesso di soggiorno per assistenza minori ("Articolo 31").',
      sections: [
        { heading: 'Come lo posso chiedere?', content: 'Questo permesso non può essere chiesto direttamente in Questura! Devi fare una procedura al Tribunale per i Minorenni del territorio in cui abiti. Ti consigliamo fortemente di fare questa procedura con un avvocato.' },
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Il permesso per Art. 31 generalmente viene dato per uno/due/tre anni, ma il Tribunale può decidere anche una durata diversa. Puoi avere la residenza, studiare, lavorare e avere il medico di base.\nAttenzione! Mentre aspetti la decisione del Tribunale NON hai diritto ad avere un permesso di soggiorno temporaneo.' },
        { heading: 'E quando scade il permesso cosa faccio?', content: 'Se tuo figlio sarà ancora minorenne, potrai fare una nuova causa al Tribunale per i Minorenni. Oppure, se lavori, puoi chiedere la conversione in un permesso per lavoro.' },
        { heading: 'Mi serve un avvocato?', content: '🟠 In teoria puoi fare domanda al tribunale anche da solo, ma ti consigliamo di farlo con un avvocato. Come minimo, chiedi un parere legale prima. Ricorda che se hai un reddito inferiore a circa 13.500 euro all\'anno, potresti avere diritto all\'assistenza legale gratuita.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it/Permesso-per-assistenza-minore-art-31-1c77355e7f7f80cfac5cec0c426e8213', type: 'guide' },
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D23
    fig_stra_pds: {
      id: 'fig_stra_pds',
      type: 'question',
      question: 'Hai mai avuto un permesso di soggiorno da quando sei in Italia?',
    },

    // D24
    fig_stra_mant: {
      id: 'fig_stra_mant',
      type: 'question',
      question: 'Tuo figlio ti mantiene?',
      description: 'Per capirci: questo figlio paga la maggior parte delle tue spese per casa, cibo, vestiti, ecc.?',
    },

    // S19 — Art. 30 genitore a carico
    end_art30_gen: {
      id: 'end_art30_gen',
      type: 'result',
      title: 'Permesso per Motivi Familiari — Genitore a Carico',
      introText: 'Dalle informazioni che ci hai dato potresti chiedere un permesso per motivi familiari perché sei un genitore che dipende dai suoi figli.\nDovrai dimostrare che c\'è un rapporto di dipendenza economica.\nE\' una situazione complessa ed è meglio chiedere una consulenza legale.',
      sections: [
        { heading: 'Mi serve un avvocato?', content: '🟠 E\' una situazione un po\' particolare e ti consigliamo di chiedere aiuto legale.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it/Coesione-familiare-1ba7355e7f7f80ce99bbd18879a0f807', type: 'guide' },
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // ========== D13 — GENITORE ==========

    genitore_start: {
      id: 'genitore_start',
      type: 'question',
      question: 'Mamma o papà hanno la cittadinanza italiana o la cittadinanza di un altro Stato membro della UE?',
      description: 'È sufficiente uno di loro.',
    },

    // D25
    gen_ita_eta: {
      id: 'gen_ita_eta',
      type: 'question',
      question: 'Hai tra 18 e 21 anni?',
      description: 'Se hai meno di 18 anni, sei nel posto sbagliato, torna indietro e seleziona "ho meno di 18 anni".',
    },

    // D27
    gen_ita_tipo: {
      id: 'gen_ita_tipo',
      type: 'question',
      question: 'Il tuo genitore è cittadino italiano?',
    },

    // S29 — Famit genitore
    end_famit_gen: {
      id: 'end_famit_gen',
      type: 'result',
      title: 'Permesso per Motivi Familiari — Con Genitore',
      introText: 'In base alle informazioni che ci hai dato, puoi avere un permesso "Famit", della durata di 5 anni.\nA volte in queste situazioni la Questura dà un permesso per famiglia, della durata di 2 anni.\nAlla scadenza, tutti e due possono essere convertiti in permesso per lavoro.',
      sections: [
        { heading: 'Come lo posso chiedere?', content: 'Puoi chiedere questi permessi personalmente in Questura.' },
        { heading: 'Mi serve un avvocato?', content: '🟠 No, ma un parere legale può essere utile a preparare tutti i documenti necessari.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D26
    gen_mant: {
      id: 'gen_mant',
      type: 'question',
      question: 'Il tuo genitore ti mantiene?',
      description: 'Per capirci: questo genitore paga la maggior parte delle tue spese per casa, cibo, vestiti, scuola, ecc.?',
    },

    // D36
    gen_mant_tipo: {
      id: 'gen_mant_tipo',
      type: 'question',
      question: 'Il tuo genitore è:',
    },

    // D27 (same question, different context: parent doesn't maintain)
    gen_ita_conv: {
      id: 'gen_ita_conv',
      type: 'question',
      question: 'Il tuo genitore è cittadino italiano?',
    },

    // D28
    gen_pds: {
      id: 'gen_pds',
      type: 'question',
      question: 'Hai avuto fino ai 18 anni un permesso di soggiorno per motivi familiari?',
      description: 'Se hai ancora adesso meno di 18 anni, sei nel posto sbagliato: torna indietro e seleziona "ho meno di 18 anni".',
    },

    // S27 — Famiglia incerto
    end_fam_inc: {
      id: 'end_fam_inc',
      type: 'result',
      title: 'Permesso Famiglia dopo i 18 anni — Da Valutare',
      introText: 'In base alle informazioni che ci hai dato, non siamo sicuri che tu possa avere un permesso di soggiorno per motivi familiari. Ti consigliamo di chiedere una consulenza legale.',
      sections: [
        { heading: 'Ti spieghiamo meglio', content: 'Se fino ai 18 anni avevi un permesso di soggiorno per motivi familiari collegato a quello del tuo genitore, potresti ancora avere la possibilità di chiedere un permesso dello stesso tipo.\n\nLa possibilità di rinnovo dipende da diversi fattori, in particolare:\n• Se sei ancora molto giovane\n• Se stai ancora studiando\n• Se il tuo genitore ti mantiene economicamente\n• Se vivi ancora con la famiglia' },
        { heading: 'Mi serve un avvocato?', content: '🟠 Vista la situazione, prima di prendere decisioni ti consigliamo di chiedere un parere legale.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D29
    gen_inv: {
      id: 'gen_inv',
      type: 'question',
      question: 'Sei in una situazione di invalidità totale?',
      description: '"Totale" significa una certificazione 100% di invalidità. Hai problemi fisici o mentali gravi che non ti consentono di svolgere nessun lavoro.',
    },

    // D30
    gen_inv_mant: {
      id: 'gen_inv_mant',
      type: 'question',
      question: 'Sei a carico dei tuoi genitori?',
      description: 'Per capirci: pagano loro la maggior parte delle tue spese per casa, cibo, vestiti, scuola, ecc.?',
    },

    // S26 — Famiglia figlio invalido
    end_fam_inv: {
      id: 'end_fam_inv',
      type: 'result',
      title: 'Permesso Famiglia per Figlio con Invalidità Totale',
      introText: 'In base alle informazioni che ci hai dato, puoi avere un permesso di soggiorno per motivi familiari come figlio con invalidità totale. Attenzione: devi avere una certificazione di invalidità al 100%',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'In genere ha durata di 2 anni. Alla scadenza, può essere rinnovato.' },
        { heading: 'Come lo posso chiedere?', content: 'Con kit postale inserendo nella busta tutti i documenti relativi alla tua invalidità.' },
        { heading: 'Mi serve un avvocato?', content: '🟠 No, ma un parere legale può essere utile a preparare tutti i documenti necessari.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S25 — Residenza elettiva
    end_res_el: {
      id: 'end_res_el',
      type: 'result',
      title: 'Nessun Permesso Famiglia — Valuta Residenza Elettiva',
      introText: '[Nome], in base alle informazioni che ci hai dato, NON puoi avere il permesso di soggiorno per motivi familiari, perché non sei "invalido totale".',
      sections: [
        { heading: 'Cosa posso fare?', content: 'Se hai un assegno di invalidità, potresti avere diritto a un permesso di soggiorno per residenza elettiva, ma è una situazione complessa e ti serve una consulenza legale.' },
      ],
      links: [
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // ========== D14 — NONNO / FRATELLO-SORELLA ==========

    nonno_frat: {
      id: 'nonno_frat',
      type: 'question',
      question: 'Il tuo familiare in Italia è cittadino/a italiano/a?',
    },

    // S13 — Negativo parenti lontani
    end_neg_par: {
      id: 'end_neg_par',
      type: 'result',
      title: 'Parente Troppo Lontano — Nessun Permesso Disponibile',
      introText: 'Hey [Nome], anche noi vogliamo bene alla nostra famiglia. Però questi sono parenti troppo lontani.',
      sections: [
        { heading: 'Perché?', content: 'Anche se questi tuoi parenti hanno un permesso di soggiorno, questo non basta per far avere un permesso di soggiorno a te. Per sapere se hai diritto a un altro permesso di soggiorno, puoi ricominciare il test.' },
      ],
      links: [
        { label: 'Chiedi un consiglio legale gratuito — Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // =============================================
    // D31 — PERCORSO: CONIUGE / PARTNER
    // =============================================

    coniuge_start: {
      id: 'coniuge_start',
      type: 'question',
      question: 'Tuo marito/moglie/partner è:',
    },

    // D32 — CONIUGE ITALIANO
    con_ita_sposi: {
      id: 'con_ita_sposi',
      type: 'question',
      question: 'Siete sposati?',
    },

    // D33
    con_ita_conv: {
      id: 'con_ita_conv',
      type: 'question',
      question: 'Avete un contratto di convivenza registrato all\'anagrafe del Comune di residenza?',
    },

    // S17 — Partner convivente
    end_famit_part: {
      id: 'end_famit_part',
      type: 'result',
      title: 'Permesso per Partner Convivente di Cittadino Italiano/UE',
      introText: 'Secondo la legge, dovrebbe essere possibile avere un permesso di soggiorno di cinque anni ("Carta di soggiorno" o "FAMIT", a seconda della situazione).\nBasta avere una relazione affettiva e vivere insieme.\nPerò, se non sei sposato con una persona di sesso diverso dal tuo (matrimonio) o con una persona dello stesso sesso (unione civile), le Questure non danno facilmente questo permesso. Dipende dalla Questura! A volte è necessario fare una causa in tribunale con un avvocato.',
      sections: [
        { heading: 'Mi serve un avvocato?', content: '🟠 È una situazione che può essere complessa e ti consigliamo di chiedere un parere legale.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D32 — CONIUGE UE
    con_ue_sposi: {
      id: 'con_ue_sposi',
      type: 'question',
      question: 'Siete sposati?',
    },

    // D33
    con_ue_conv: {
      id: 'con_ue_conv',
      type: 'question',
      question: 'Avete un contratto di convivenza registrato all\'anagrafe del Comune di residenza?',
    },

    // D32 — CONIUGE STRANIERO
    con_str_sposi: {
      id: 'con_str_sposi',
      type: 'question',
      question: 'Siete sposati?',
    },

    // D34
    con_str_pds: {
      id: 'con_str_pds',
      type: 'question',
      question: 'Che permesso di soggiorno ha tua moglie/tuo marito?',
      description: 'Sì, bisogna essere sposati. Puoi consultare la nostra guida per stranieri irregolari che vogliono sposarsi in Italia.',
    },

    // S21 — Coniuge rifugiato
    end_con_rif: {
      id: 'end_con_rif',
      type: 'result',
      title: 'Permesso per Coniuge di Rifugiato',
      introText: '[Nome], se sei marito/moglie di una persona straniera che ha un permesso di soggiorno per asilo o per protezione sussidiaria, hai diritto a un permesso di soggiorno per motivi familiari, anche se non hai mai avuto un altro permesso di soggiorno',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Hai diritto a questo permesso fino a che il tuo marito/moglie ha il suo permesso. Puoi studiare, lavorare e avere il medico di base. Quando scade, puoi rinnovarlo o convertirlo in un permesso per lavoro.' },
        { heading: 'Come lo posso chiedere?', content: 'Puoi chiedere questo permesso con un kit postale.' },
        { heading: 'Mi serve un avvocato?', content: '🟢 No, puoi mandare tu il kit postale da solo.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it/Permesso-di-soggiorno-per-familiari-di-rifugiati-o-titolari-di-protezione-sussidiaria-20a7355e7f7f80f480b7d0ab51d8d305', type: 'guide' },
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S20 — Carta coniuge lungosoggiornante
    end_carta_con: {
      id: 'end_carta_con',
      type: 'result',
      title: 'Carta di Soggiorno per Coniuge di Lungosoggiornante',
      introText: 'Buone notizie [Nome], puoi chiedere anche tu la Carta di soggiorno per soggiornanti di lungo periodo.',
      sections: [
        { heading: 'Quanto dura questo permesso e che diritti mi dà?', content: 'Questa Carta di soggiorno dura dieci anni. Puoi studiare, lavorare e avere il medico di base. Quando la Carta scade, puoi rinnovarla.' },
        { heading: 'Come lo posso chiedere?', content: 'Personalmente in Questura, accompagnato da tuo marito/moglie.' },
        { heading: 'Mi serve un avvocato?', content: '🟢 No, puoi chiedere da solo questo permesso in Questura.' },
      ],
      links: [
        { label: 'Più informazioni su questo permesso', url: 'https://www.sospermesso.it', type: 'guide' },
        { label: 'Vuoi un consiglio legale gratuito? Trova un centro vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // D35
    con_str_prec: {
      id: 'con_str_prec',
      type: 'question',
      question: 'Hai avuto in passato un permesso di soggiorno, o un visto di ingresso, scaduto da meno di un anno?',
    },

    // SCHEDA 56 — Conversione famiglia possibile (no statement in docx)
    end_conv_fam: {
      id: 'end_conv_fam',
      type: 'result',
      title: 'Conversione in Permesso Famiglia — Possibile',
      introText: '[Nome], se hai avuto un permesso di soggiorno o un visto di ingresso scaduto da meno di un anno, puoi chiedere un permesso di soggiorno per motivi familiari.',
      sections: [
        { heading: 'Mi serve un avvocato?', content: '🟢 No, puoi fare tutto da solo.' },
      ],
      links: [
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },

    // S30 — Conversione famiglia negativa
    end_conv_neg: {
      id: 'end_conv_neg',
      type: 'result',
      title: 'Conversione Famiglia — Non Possibile',
      introText: 'In base alle informazioni che ci hai dato, NON puoi avere un permesso di soggiorno per motivi familiari perché non hai avuto un permesso di soggiorno in passato, oppure avevi un permesso ma è scaduto da più di un anno.\nPer sapere se hai diritto a un altro permesso di soggiorno, puoi ricominciare il test.\nOppure chiedi una consulenza legale approfondita',
      sections: [],
      links: [
        { label: 'Trova un centro di aiuto legale gratuito vicino a te!', url: 'https://www.sospermesso.it/aiuto-legale', type: 'legal_aid' },
      ],
    },
  },

  edges: [
    // =============================================
    // D3 — START
    // =============================================
    { from: 'start', to: 'end_ue', label: 'Sì', optionKey: 'si_ue' },
    { from: 'start', to: 'q_situazione', label: 'No', optionKey: 'no_ue' },

    // =============================================
    // D4 — Q_SITUAZIONE (9 options)
    // =============================================
    { from: 'q_situazione', to: 'minore_start', label: 'Ho meno di 18 anni', optionKey: 'minore' },
    { from: 'q_situazione', to: 'famiglia_start', label: 'In Italia c\'è qualcuno della mia famiglia', optionKey: 'famiglia' },
    { from: 'q_situazione', to: 'coniuge_start', label: 'In Italia ho trovato l\'amore', optionKey: 'partner' },
    { from: 'q_situazione', to: 'paura_start', label: 'Ho paura di tornare nel mio Paese', optionKey: 'paura' },
    { from: 'q_situazione', to: 'end_cure_salute', label: 'Ho problemi gravi di salute', optionKey: 'salute' },
    { from: 'q_situazione', to: 'end_cure_gravidanza', label: 'Aspetto un figlio o ho appena avuto un figlio in Italia', optionKey: 'gravidanza' },
    { from: 'q_situazione', to: 'brutta_start', label: 'Sono in una brutta situazione (tratta, violenze, sfruttamento)', optionKey: 'sfruttamento' },
    { from: 'q_situazione', to: 'end_citt', label: 'Sono nato in Italia e ho sempre vissuto qui', optionKey: 'nato_italia' },
    { from: 'q_situazione', to: 'end_neg_gen', label: 'Nessuna di queste situazioni', optionKey: 'nessuna' },

    // =============================================
    // D6 — PERCORSO: HO PAURA DI TORNARE
    // =============================================
    { from: 'paura_start', to: 'end_asilo', label: 'Guerra', optionKey: 'guerra' },
    { from: 'paura_start', to: 'end_asilo', label: 'Qualcuno che mi vuole uccidere o fare del male', optionKey: 'persecuzione' },
    { from: 'paura_start', to: 'end_calam', label: 'Catastrofe naturale (come un terremoto o un\'alluvione)', optionKey: 'calamita' },

    // =============================================
    // D5 — PERCORSO: BRUTTA SITUAZIONE
    // =============================================
    { from: 'brutta_start', to: 'end_sfrut', label: 'Lavoro in un posto dove mi trattano male e non mi pagano, o mi pagano pochissimo. Sono una vittima di sfruttamento lavorativo.', optionKey: 'sfruttamento_lav' },
    { from: 'brutta_start', to: 'end_tratta', label: 'Qualcuno mi costringe a fare delle cose che non voglio. Sono una vittima di tratta di esseri umani.', optionKey: 'tratta' },
    { from: 'brutta_start', to: 'end_viol', label: 'Qualcuno della mia famiglia qui in Italia mi maltratta continuamente. Sono una vittima di violenza domestica.', optionKey: 'violenza' },

    // =============================================
    // D7/D8/D9 — PERCORSO: MINORE DI 18 ANNI
    // =============================================
    { from: 'minore_start', to: 'min_gen_pds', label: 'Sì', optionKey: 'si_genitore' },
    { from: 'minore_start', to: 'min_parenti', label: 'No', optionKey: 'no_genitore' },

    { from: 'min_gen_pds', to: 'end_min_fam', label: 'Ha un permesso di soggiorno valido', optionKey: 'pds_valido' },
    { from: 'min_gen_pds', to: 'end_min_fam', label: 'Ha un permesso di soggiorno scaduto da meno di 60 giorni', optionKey: 'pds_scaduto_60' },
    { from: 'min_gen_pds', to: 'info_s8', label: 'Ha un permesso di soggiorno scaduto da più di 60 giorni', optionKey: 'pds_scaduto_no' },
    { from: 'min_gen_pds', to: 'info_s8', label: 'Non ha mai avuto un permesso di soggiorno', optionKey: 'pds_mai' },

    // S8 info → continue to min_parenti
    { from: 'info_s8', to: 'min_parenti', label: 'Andiamo avanti!', optionKey: 'continua' },

    // D9 — min_parenti
    { from: 'min_parenti', to: 'min_par_ita1', label: 'Fratello o sorella', optionKey: 'fratello' },
    { from: 'min_parenti', to: 'min_par_ita2', label: 'Nonno o nonna', optionKey: 'nonno' },
    { from: 'min_parenti', to: 'min_par_ita3', label: 'Zio/zia (Fratello o sorella di mamma o di papà)', optionKey: 'zio' },
    { from: 'min_parenti', to: 'min_par_ita4', label: 'Figli di zio o zia', optionKey: 'cugino' },
    { from: 'min_parenti', to: 'min_par_ita5', label: 'Fratello/sorella di tua nonna/nonno', optionKey: 'prozio' },
    { from: 'min_parenti', to: 'end_msna', label: 'Abito con altri parenti più lontani', optionKey: 'parenti_lontani' },
    { from: 'min_parenti', to: 'end_msna', label: 'Non ho parenti in Italia', optionKey: 'nessun_parente' },

    // D10/D11 — Fratello/Sorella path
    { from: 'min_par_ita1', to: 'end_art19', label: 'È cittadino italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita1', to: 'min_affido1', label: 'Non è italiano ma ha un permesso di soggiorno in Italia', optionKey: 'ha_pds' },
    { from: 'min_par_ita1', to: 'end_msna', label: 'Non è italiano e non ha un permesso di soggiorno in Italia', optionKey: 'no_pds' },

    { from: 'min_affido1', to: 'end_aff', label: 'Sì', optionKey: 'si_provvedimento' },
    { from: 'min_affido1', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // D10/D11 — Nonno/a path
    { from: 'min_par_ita2', to: 'end_art19', label: 'È cittadino italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita2', to: 'min_affido2', label: 'Non è italiano ma ha un permesso di soggiorno in Italia', optionKey: 'ha_pds' },
    { from: 'min_par_ita2', to: 'end_msna', label: 'Non è italiano e non ha un permesso di soggiorno in Italia', optionKey: 'no_pds' },

    { from: 'min_affido2', to: 'end_aff', label: 'Sì', optionKey: 'si_provvedimento' },
    { from: 'min_affido2', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // D10/D11 — Zio/a path
    { from: 'min_par_ita3', to: 'min_affido3', label: 'È cittadino italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita3', to: 'min_affido3', label: 'Non è italiano ma ha un permesso di soggiorno in Italia', optionKey: 'ha_pds' },
    { from: 'min_par_ita3', to: 'end_msna', label: 'Non è italiano e non ha un permesso di soggiorno in Italia', optionKey: 'no_pds' },

    { from: 'min_affido3', to: 'end_aff', label: 'Sì', optionKey: 'si_provvedimento' },
    { from: 'min_affido3', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // D10/D11 — Cugino path
    { from: 'min_par_ita4', to: 'min_affido4', label: 'È cittadino italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita4', to: 'min_affido4', label: 'Non è italiano ma ha un permesso di soggiorno in Italia', optionKey: 'ha_pds' },
    { from: 'min_par_ita4', to: 'end_msna', label: 'Non è italiano e non ha un permesso di soggiorno in Italia', optionKey: 'no_pds' },

    { from: 'min_affido4', to: 'end_aff', label: 'Sì', optionKey: 'si_provvedimento' },
    { from: 'min_affido4', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // D10/D11 — Fratello/sorella del nonno path
    { from: 'min_par_ita5', to: 'min_affido5', label: 'È cittadino italiano', optionKey: 'si_italiano' },
    { from: 'min_par_ita5', to: 'min_affido5', label: 'Non è italiano ma ha un permesso di soggiorno in Italia', optionKey: 'ha_pds' },
    { from: 'min_par_ita5', to: 'end_msna', label: 'Non è italiano e non ha un permesso di soggiorno in Italia', optionKey: 'no_pds' },

    { from: 'min_affido5', to: 'end_aff', label: 'Sì', optionKey: 'si_provvedimento' },
    { from: 'min_affido5', to: 'end_msna', label: 'No', optionKey: 'no_provvedimento' },

    // =============================================
    // D12 — PERCORSO: FAMIGLIA (parente in Italia)
    // =============================================
    { from: 'famiglia_start', to: 'coniuge_start', label: 'Moglie/marito', optionKey: 'coniuge' },
    { from: 'famiglia_start', to: 'figlio_start', label: 'Figlia/figlio', optionKey: 'figlio' },
    { from: 'famiglia_start', to: 'genitore_start', label: 'Genitore', optionKey: 'genitore' },
    { from: 'famiglia_start', to: 'nonno_frat', label: 'Nonna/nonno o Sorella/Fratello', optionKey: 'nonno_fratello' },
    { from: 'famiglia_start', to: 'nonno_frat', label: 'Figlio del figlio (nipote)', optionKey: 'figlio_del_figlio' },
    { from: 'famiglia_start', to: 'end_neg_par', label: 'Parenti più lontani (ad esempio cugini, zii)', optionKey: 'altri_parenti' },

    // ========== D15-D24 — FIGLIO ==========
    { from: 'figlio_start', to: 'fig_ita_min', label: 'Sì', optionKey: 'si_italiano' },
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

    // ========== D13/D25-D30 — GENITORE ==========
    { from: 'genitore_start', to: 'gen_ita_eta', label: 'Sì', optionKey: 'si' },
    { from: 'genitore_start', to: 'gen_pds', label: 'No', optionKey: 'no' },

    { from: 'gen_ita_eta', to: 'gen_ita_tipo', label: 'Sì', optionKey: 'si' },
    { from: 'gen_ita_eta', to: 'gen_mant', label: 'No', optionKey: 'no' },

    { from: 'gen_ita_tipo', to: 'end_famit_gen', label: 'Sì', optionKey: 'si_italiano' },
    { from: 'gen_ita_tipo', to: 'end_carta_ue', label: 'No', optionKey: 'ue' },

    { from: 'gen_mant', to: 'gen_mant_tipo', label: 'Sì', optionKey: 'si' },
    { from: 'gen_mant', to: 'gen_ita_conv', label: 'No', optionKey: 'no' },

    { from: 'gen_mant_tipo', to: 'end_famit_gen', label: 'Cittadino italiano', optionKey: 'italiano' },
    { from: 'gen_mant_tipo', to: 'end_carta_ue', label: 'Cittadino di un altro paese UE', optionKey: 'ue' },

    { from: 'gen_ita_conv', to: 'end_art19', label: 'Sì', optionKey: 'si' },
    { from: 'gen_ita_conv', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    { from: 'gen_pds', to: 'end_fam_inc', label: 'Sì', optionKey: 'si' },
    { from: 'gen_pds', to: 'gen_inv', label: 'No', optionKey: 'no' },

    { from: 'gen_inv', to: 'gen_inv_mant', label: 'Sì', optionKey: 'si' },
    { from: 'gen_inv', to: 'end_neg_gen', label: 'No', optionKey: 'no' },

    { from: 'gen_inv_mant', to: 'end_fam_inv', label: 'Sì', optionKey: 'si' },
    { from: 'gen_inv_mant', to: 'end_res_el', label: 'No', optionKey: 'no' },

    // ========== D14 — NONNO / FRATELLO-SORELLA ==========
    { from: 'nonno_frat', to: 'end_art19', label: 'Sì', optionKey: 'si' },
    { from: 'nonno_frat', to: 'end_neg_par', label: 'No', optionKey: 'no' },

    // =============================================
    // D31-D35 — PERCORSO: CONIUGE / PARTNER
    // =============================================
    { from: 'coniuge_start', to: 'con_ita_sposi', label: 'Cittadino italiano', optionKey: 'italiano' },
    { from: 'coniuge_start', to: 'con_ue_sposi', label: 'Cittadino di un altro paese UE', optionKey: 'ue' },
    { from: 'coniuge_start', to: 'con_str_sposi', label: 'Cittadino di un paese non-UE', optionKey: 'straniero' },

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

    { from: 'con_str_pds', to: 'end_con_rif', label: 'Protezione sussidiaria o status/asilo', optionKey: 'asilo' },
    { from: 'con_str_pds', to: 'end_carta_con', label: 'UE lungosoggiornanti', optionKey: 'lungosoggiornanti' },
    { from: 'con_str_pds', to: 'con_str_prec', label: 'Ha un altro tipo di permesso di soggiorno', optionKey: 'altro' },
    { from: 'con_str_pds', to: 'end_neg_gen', label: 'Non ha il permesso di soggiorno', optionKey: 'no_pds' },

    { from: 'con_str_prec', to: 'end_conv_fam', label: 'Sì', optionKey: 'si' },
    { from: 'con_str_prec', to: 'end_conv_neg', label: 'No', optionKey: 'no' },
  ],
};
