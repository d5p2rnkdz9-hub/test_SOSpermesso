import { esitoDaRicerca, type RicercaConversione } from './da-ricerca';
import esitiJson from './dati/conversione-esiti.json';
import type { ProEdge, ProEsito, ProNode, ProTree } from './types';

/**
 * PRO module "Conversione del permesso".
 *
 * Outcomes come from dati/conversione-esiti.json, merged by
 * scripts/pro-questionario/build-conversione.py from the research files in
 * docs/pro-questionario/ricerca/conversione/. This file only lays out the
 * questions: group → current permit → status → requested permit (→ extra
 * questions where the answer changes the outcome) → outcome for that pair.
 */

type Voce = RicercaConversione & { fonte_ricerca: string };
const ESITI = esitiJson as unknown as Record<string, Voce>;

interface Fonte {
  key: string;
  label: string;
  descrizione?: string;
}

const GRUPPI: { key: string; label: string; descrizione: string; fonti: Fonte[] }[] = [
  {
    key: 'lavoro',
    label: 'Lavoro',
    descrizione: 'Subordinato, autonomo, stagionale, attesa occupazione',
    fonti: [
      { key: 'lavoro_subordinato', label: 'Lavoro subordinato' },
      { key: 'lavoro_autonomo', label: 'Lavoro autonomo' },
      { key: 'lavoro_stagionale', label: 'Lavoro stagionale', descrizione: 'art. 24 TU' },
      { key: 'attesa_occupazione', label: 'Attesa occupazione', descrizione: 'art. 22, c. 11, TU' },
    ],
  },
  {
    key: 'studio',
    label: 'Studio, ricerca, sport, religione',
    descrizione: 'Studio e formazione, ricerca scientifica, art. 27 TU, motivi religiosi',
    fonti: [
      { key: 'studio', label: 'Studio o formazione', descrizione: 'artt. 39 e 39-bis TU' },
      { key: 'ricerca_scientifica', label: 'Ricerca scientifica', descrizione: 'art. 27-ter TU' },
      { key: 'sport_artistico', label: 'Attività sportiva o lavoro artistico', descrizione: 'art. 27 TU' },
      { key: 'religiosi', label: 'Motivi religiosi' },
    ],
  },
  {
    key: 'famiglia',
    label: 'Famiglia',
    descrizione: 'Permesso per motivi familiari',
    fonti: [{ key: 'famiglia', label: 'Motivi familiari', descrizione: 'artt. 29 e 30 TU' }],
  },
  {
    key: 'protezione',
    label: 'Protezione e motivi umanitari',
    descrizione: 'Asilo, sussidiaria, protezione speciale, richiesta asilo, calamità, cure mediche',
    fonti: [
      { key: 'asilo', label: 'Status di rifugiato' },
      { key: 'sussidiaria', label: 'Protezione sussidiaria' },
      { key: 'protezione_speciale', label: 'Protezione speciale', descrizione: 'art. 32, c. 3, d.lgs. 25/2008' },
      { key: 'richiesta_asilo', label: 'Richiesta di protezione internazionale' },
      { key: 'calamita', label: 'Calamità', descrizione: 'art. 20-bis TU' },
      { key: 'cure_mediche', label: 'Cure mediche', descrizione: 'art. 19, c. 2, lett. d-bis, TU' },
    ],
  },
  {
    key: 'minori',
    label: 'Minori',
    descrizione: 'Minore età, assistenza minori (art. 31)',
    fonti: [
      { key: 'minore_eta', label: 'Minore età' },
      { key: 'assistenza_minori', label: 'Assistenza minori', descrizione: 'art. 31, c. 3, TU' },
    ],
  },
  {
    key: 'speciali',
    label: 'Casi speciali e altri titoli',
    descrizione: 'Artt. 18, 18-bis, 18-ter TU, residenza elettiva, apolidia, altri',
    fonti: [
      { key: 'protezione_sociale', label: 'Protezione sociale (vittime di tratta e sfruttamento)', descrizione: 'art. 18 TU' },
      { key: 'violenza_domestica', label: 'Vittime di violenza domestica', descrizione: 'art. 18-bis TU' },
      {
        key: 'sfruttamento',
        label: 'Particolare sfruttamento lavorativo',
        descrizione: 'art. 18-ter TU (già art. 22, c. 12-quater)',
      },
      { key: 'residenza_elettiva', label: 'Residenza elettiva' },
      { key: 'cittadinanza_apolidia', label: 'Acquisto della cittadinanza o apolidia' },
      { key: 'altro', label: 'Altro titolo' },
    ],
  },
];

const DESTINAZIONI: { key: string; label: string; descrizione?: string }[] = [
  { key: 'lavoro_subordinato', label: 'Lavoro subordinato' },
  { key: 'lavoro_autonomo', label: 'Lavoro autonomo' },
  { key: 'attesa_occupazione', label: 'Attesa occupazione / ricerca lavoro' },
  { key: 'studio', label: 'Studio' },
  { key: 'famiglia', label: 'Motivi familiari', descrizione: 'familiare di straniero regolarmente soggiornante' },
  {
    key: 'famiglia_ue_ita',
    label: 'Familiare di cittadino UE o italiano',
    descrizione: 'carta di soggiorno, d.lgs. 30/2007',
  },
  { key: 'ue_lungo_periodo', label: 'Permesso UE per soggiornanti di lungo periodo' },
  { key: 'carta_blu', label: 'Carta blu UE' },
  { key: 'residenza_elettiva', label: 'Residenza elettiva' },
  { key: 'cure_mediche', label: 'Cure mediche' },
  { key: 'prosieguo', label: 'Prosieguo amministrativo / integrazione' },
];

const LABEL: Record<string, string> = Object.fromEntries([
  ...GRUPPI.flatMap((g) => g.fonti.map((f) => [f.key, f.label])),
  ...DESTINAZIONI.map((d) => [d.key, d.label]),
]);

/** Permits whose conversion into work depends on the d.l. 20/2023 cut-off (5.5.2023). */
const DATA_CUTRO = new Set(['protezione_speciale', 'calamita', 'cure_mediche']);

const comuniUe =ESITI._ue_requisiti_comuni as unknown as { sintesi: string } | undefined;

function esito(key: string, titolo: string): ProEsito {
  const v = ESITI[key];
  const e = esitoDaRicerca(v, titolo);
  if (key.endsWith('__ue_lungo_periodo') && comuniUe) {
    e.approfondimenti = [{ titolo: 'Requisiti comuni del permesso UE di lungo periodo', testo: comuniUe.sintesi }];
  }
  return e;
}

/** Studio → lavoro: only for vocational courses and traineeships the course must be over. */
const ESITO_FORMAZIONE_NON_CONCLUSA: ProEsito = {
  verdetto: 'non_possibile',
  titolo: 'Studio (formazione professionale o tirocinio) → Lavoro: non ancora',
  sintesi:
    'Per i titolari di permesso rilasciato per frequentare un corso di formazione professionale o un tirocinio formativo, la conversione in lavoro è ammessa solo **dopo la conclusione** del corso o del tirocinio (art. 14, c. 6, ultimo periodo, d.P.R. 394/1999). Per gli altri percorsi di studio (università, AFAM, ITS, scuola) la conversione è invece possibile anche prima di aver concluso gli studi (art. 6, c. 1, TU).\n\nNel frattempo il titolare può svolgere attività lavorativa subordinata per non più di 20 ore settimanali, cumulabili fino a 1.040 ore annue (art. 14, c. 4, d.P.R. 394/1999).',
  requisiti: [
    'Attestato di conclusione del corso o del tirocinio, da produrre con la domanda',
    'Permesso ancora valido al momento della domanda: la conclusione del corso non sana un titolo scaduto',
  ],
  norme: [
    {
      estremi: 'art. 14, c. 6, d.P.R. 394/1999',
      contenuto: 'Conversione del permesso per formazione professionale o tirocinio solo dopo la conclusione del corso.',
      url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1999-08-31;394~art14',
    },
    {
      estremi: 'art. 14, c. 4, d.P.R. 394/1999',
      contenuto: 'Attività lavorativa consentita allo studente: 20 ore settimanali, 1.040 ore annue.',
      url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1999-08-31;394~art14',
    },
    {
      estremi: 'art. 6, c. 1, d.lgs. 286/1998',
      contenuto: 'Conversione del permesso per studio in lavoro prima della scadenza, fuori quota.',
      url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-07-25;286~art6',
    },
  ],
  casiLimite: [
    {
      titolo: 'Permesso in scadenza prima della fine del corso',
      testo:
        'Il titolare deve chiedere il rinnovo per formazione fino alla conclusione; la conversione si chiede dopo, con il permesso rinnovato ancora valido.',
    },
    {
      titolo: 'Dicitura del permesso incerta',
      testo:
        'Conta il motivo del rilascio indicato sul permesso («studio», «formazione», «tirocinio»), non il tipo di corso frequentato di fatto: in caso di dubbio verificare il visto d’ingresso e il fascicolo in Questura.',
    },
  ],
};

function build(): ProTree {
  const nodes: Record<string, ProNode> = {};
  const edges: ProEdge[] = [];
  const add = (n: ProNode) => {
    nodes[n.id] = n;
  };
  const edge = (from: string, to: string, label: string, optionKey: string, descrizione?: string) =>
    edges.push({ from, to, label, optionKey, descrizione });

  add({
    id: 'pc_inizio',
    type: 'question',
    domanda: 'Per quale motivo è stato rilasciato il permesso attuale?',
    breve: 'Area',
    nota:
      'La conversione dipende dal **motivo del rilascio** indicato sul permesso, non dall’attività svolta in concreto. Le ipotesi di conversione sono tipiche: senza una norma che la preveda la Questura non può convertire, e il Consiglio di Stato richiede una base normativa espressa (Cons. Stato n. 476/2018).',
    riferimenti: ['art. 5, c. 3-bis, e art. 6 TU', 'art. 14 d.P.R. 394/1999'],
  });

  for (const g of GRUPPI) {
    const qFonte = `pc_fonte_${g.key}`;
    edge('pc_inizio', qFonte, g.label, g.key, g.descrizione);
    add({ id: qFonte, type: 'question', domanda: 'Titolo di soggiorno attuale', breve: 'Titolo attuale' });

    for (const f of g.fonti) {
      const qStato = `pc_stato_${f.key}`;
      const qVerso = `pc_verso_${f.key}`;
      edge(qFonte, qStato, f.label, f.key, f.descrizione);
      add({
        id: qStato,
        type: 'question',
        domanda: 'Il permesso è in corso di validità?',
        breve: 'Validità',
        nota:
          'La conversione presuppone un titolo valido al momento della domanda. Il termine per chiedere il rinnovo (art. 5, c. 4, TU: 90 giorni prima della scadenza nel testo in vigore dal 22.5.2026) non è perentorio (Cons. Stato n. 7156/2022), ma dopo 60 giorni dalla scadenza senza domanda di rinnovo ricorre l’ipotesi di espulsione dell’art. 13, c. 2, lett. b), TU.',
        riferimenti: ['art. 5, c. 4, TU', 'art. 13, c. 2, lett. b), TU'],
      });
      edge(qStato, qVerso, 'Sì, valido (o rinnovo chiesto in tempo)', 'valido');
      edge(qStato, 'pc_scaduto_breve', 'Scaduto da meno di un anno', 'scaduto_breve');
      edge(qStato, 'pc_scaduto_oltre', 'Scaduto da più di un anno', 'scaduto_oltre');

      add({
        id: qVerso,
        type: 'question',
        domanda: 'In quale titolo si vuole convertire?',
        breve: 'Titolo richiesto',
      });
      for (const d of DESTINAZIONI) {
        const key = `${f.key}__${d.key}`;
        if (!ESITI[key]) continue;
        const titolo = `${f.label} → ${d.label}`;
        const rId = `pr_${key}`;
        add({ id: rId, type: 'result', esito: esito(key, titolo) });

        if (key === 'studio__lavoro_subordinato') {
          add({
            id: 'pc_studio_percorso',
            type: 'question',
            domanda: 'Per quale percorso è stato rilasciato il permesso per studio?',
            breve: 'Percorso',
            nota:
              'Per i corsi di formazione professionale e i tirocini la conversione è ammessa solo dopo la conclusione (art. 14, c. 6, d.P.R. 394/1999); per gli altri percorsi anche prima di aver finito gli studi.',
            riferimenti: ['art. 6, c. 1, TU', 'art. 14, c. 6, d.P.R. 394/1999'],
          });
          edge(qVerso, 'pc_studio_percorso', d.label, d.key, d.descrizione);
          edge('pc_studio_percorso', rId, 'Università, AFAM, ITS, scuola', 'universita');
          edge('pc_studio_percorso', 'pc_studio_formazione_conclusa', 'Formazione professionale o tirocinio', 'formazione');
          add({
            id: 'pc_studio_formazione_conclusa',
            type: 'question',
            domanda: 'Il corso o il tirocinio è concluso?',
            breve: 'Corso concluso',
          });
          edge('pc_studio_formazione_conclusa', rId, 'Sì, concluso', 'si');
          edge('pc_studio_formazione_conclusa', 'pr_studio_formazione_non_conclusa', 'No', 'no');
          add({ id: 'pr_studio_formazione_non_conclusa', type: 'result', esito: ESITO_FORMAZIONE_NON_CONCLUSA });
          continue;
        }
        if (DATA_CUTRO.has(f.key) && (d.key === 'lavoro_subordinato' || d.key === 'lavoro_autonomo')) {
          const qData = `pc_data_${key}`;
          const base = nodes[rId] as Extract<ProNode, { type: 'result' }>;
          delete nodes[rId];
          add({
            id: qData,
            type: 'question',
            domanda: 'Quando è stata presentata la domanda da cui è nato il permesso?',
            breve: 'Domanda originaria',
            nota:
              'Il d.l. 20/2023 (conv. l. 50/2023) ha escluso dal 6.5.2023 la conversione in lavoro di questi permessi. L’art. 7, c. 2, fa salvi i permessi nati da una domanda presentata **entro il 5.5.2023**: per il Consiglio di Stato conta la data della domanda originaria (anche la sola richiesta di appuntamento via PEC), non quella dell’istanza di conversione né del rinnovo (Cons. Stato, sez. III, nn. 3313/2024, 9634/2025, 905/2026, 2397/2026), contro la circolare n. 50432 dell’1.6.2023.',
            riferimenti: ['art. 7, cc. 2-3, d.l. 20/2023', 'art. 6, c. 1-bis, TU (testo previgente)'],
          });
          edge(qVerso, qData, d.label, d.key, d.descrizione);
          add({
            id: `${rId}__entro`,
            type: 'result',
            esito: { ...base.esito, verdetto: 'possibile', titolo: `${titolo} (domanda entro il 5.5.2023)` },
          });
          add({
            id: `${rId}__dopo`,
            type: 'result',
            esito: { ...base.esito, verdetto: 'non_possibile', titolo: `${titolo} (domanda dal 6.5.2023)` },
          });
          edge(qData, `${rId}__entro`, 'Entro il 5 maggio 2023', 'entro');
          if (f.key === 'protezione_speciale') {
            edge(
              qData,
              `${rId}__entro`,
              'Dopo, ma è un permesso per vita privata e familiare valido al 5.5.2023',
              'vita_privata',
              'art. 19, c. 1.1, terzo periodo, TU (testo d.l. 130/2020); art. 7, c. 3, d.l. 20/2023',
            );
          }
          edge(qData, `${rId}__dopo`, 'Dal 6 maggio 2023 in poi', 'dopo');
          continue;
        }
        edge(qVerso, rId, d.label, d.key, d.descrizione);
      }
    }
  }

  // Shared branch for expired permits: the outcome no longer depends on the old title.
  add({
    id: 'pc_scaduto_breve',
    type: 'question',
    domanda: 'In quale titolo si vuole convertire?',
    breve: 'Titolo richiesto',
    nota:
      'Con il permesso scaduto la via ordinaria è il rinnovo tardivo, valutato caso per caso; la sola scadenza non giustifica il diniego se la domanda arriva con ritardo breve e i requisiti sussistono.',
  });
  add({
    id: 'pc_scaduto_oltre',
    type: 'question',
    domanda: 'In quale titolo si vuole convertire?',
    breve: 'Titolo richiesto',
    nota:
      'Oltre l’anno il ritardo è difficilmente giustificabile per i titoli legati al lavoro e allo studio; restano aperte alcune vie familiari che non presuppongono un titolo valido.',
  });
  const scaduti: [string, string, string, string][] = [
    ['pc_scaduto_breve', 'scaduto_breve__altro', 'Lavoro, studio o attesa occupazione', 'altro'],
    ['pc_scaduto_breve', 'scaduto_breve__famiglia', 'Motivi familiari', 'famiglia'],
    ['pc_scaduto_breve', 'scaduto_breve__ue_lungo_periodo', 'Permesso UE per soggiornanti di lungo periodo', 'ue'],
    ['pc_scaduto_oltre', 'scaduto_oltre__altro', 'Lavoro, studio o attesa occupazione', 'altro'],
    ['pc_scaduto_oltre', 'scaduto_oltre__famiglia', 'Motivi familiari', 'famiglia'],
  ];
  for (const [q, key, label, optionKey] of scaduti) {
    if (!ESITI[key]) continue;
    const fascia = key.startsWith('scaduto_breve') ? 'scaduto da meno di un anno' : 'scaduto da più di un anno';
    add({ id: `pr_${key}`, type: 'result', esito: esito(key, `Permesso ${fascia} → ${label}`) });
    edge(q, `pr_${key}`, label, optionKey);
  }

  // A current permit without any researched outcome must not be a dead end.
  for (const n of Object.values(nodes)) {
    if (n.type === 'question' && n.id.startsWith('pc_verso_') && !edges.some((e) => e.from === n.id)) {
      const id = `pr_wip_${n.id.slice('pc_verso_'.length)}`;
      add({
        id,
        type: 'result',
        esito: {
          verdetto: 'incerto',
          titolo: `${LABEL[n.id.slice('pc_verso_'.length)] ?? 'Titolo'}: scheda in preparazione`,
          sintesi: 'L’analisi delle conversioni da questo titolo è in corso di redazione.',
        },
      });
      edge(n.id, id, 'Vedi stato della scheda', 'wip');
    }
  }

  return {
    id: 'conversione',
    titolo: 'Conversione del permesso di soggiorno',
    descrizione:
      'Per ogni coppia di titoli: ammissibilità, base normativa, procedura, giurisprudenza, prassi e casi limite.',
    aggiornatoAl: '2026-11-19',
    regime: 'Disciplina vigente al 19/11/2026, con note sul regime transitorio (Patto UE, d.l. 20/2023)',
    bozza: true,
    startNodeId: 'pc_inizio',
    nodes,
    edges,
  };
}

export const conversionePro: ProTree = build();
