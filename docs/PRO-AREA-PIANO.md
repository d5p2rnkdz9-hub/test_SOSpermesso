# Area PRO — piano (scadenziario, circolari complete, chatbot PRO sospeso)

> Concordato il 2026-11-07. Si appoggia a `PRO-PREMIUM-PIANO.md` (account e pagamenti).
> Target: CAF, consulenti del lavoro, sindacati; avvocati in futuro.
> Aggiornato l'8/11/2026: giurisprudenza per tutti gli utenti PRO (punto 4), KB del chatbot e
> allineamento automatico col sito (punto 5).

## Stato di partenza (2026-11-07)

- Account Better Auth (magic link) e paywall sulle massime già su `main` (app `9016705`, sito `86b8e59`).
- Non fatto: migrazione schema `auth` in produzione, env Netlify dell'app, fix della modalità PRO
  che nell'app non si attiva più (dal `9c0a5b6`).
- Circolari: 1272 (immigrazione.biz) pubbliche sul sito, restano gratuite (SEO).
  Nel SQLite `Sito_Nuovo/data-pipeline/data/circolari.db` ci sono 2160 documenti,
  1931 con testo: le 659 di permessidisoggiorno.info non sono mai state pubblicate.
- Tutto il premium vive nell'app (il sito è statico e non conosce la sessione).
  Unico gate: `src/lib/pro-access.ts`.

## Ordine di lavoro

### 0. Prerequisiti
- Migrare lo schema `auth` su Neon produzione; env Netlify dell'app
  (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEON_DATABASE_URL`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`).
- Ripristinare l'attivazione della modalità PRO nell'app (`initFromDevice()`).

### 1. Circolari complete (base comune a ricerca e chatbot)
- Script di import SQLite → Neon, tabella `pro.circolare` (id, fonte, titolo, ente, numero, data,
  oggetto, tipo_documento, testo, source_url, pdf_url, permessi[], colonna `tsvector` italiano).
- Pagine app `/[locale]/pro/circolari`: ricerca full-text, filtro per permesso ed ente, pagina
  singola con testo e link alla fonte.
- Avviso email (Resend) quando entra una circolare su un permesso seguito.

### 2. Scadenziario per operatori
- Tabella `auth.pratica` (user_id, riferimento cliente, permesso slug, data scadenza, questura, note).
- Pagina `/[locale]/account/pratiche`: elenco, inserimento, modifica.
- Netlify scheduled function giornaliera: promemoria a 90/60/30 giorni con link alla checklist
  di rinnovo sul sito.

**Privacy (19/11/2026).** Lo scadenziario si attiva solo dopo l'accettazione dell'Accordo sul
trattamento dei dati art. 28 GDPR (Alberto Pasquero responsabile, l'utente titolare): testo in
`src/lib/accordo-testo.ts`, finestra con scorrimento fino in fondo in `AccordoGate.tsx`,
accettazioni in `pro.accordo_accettazione` (`scripts/sql/008_pro_accordo.sql`), copia per email.
Ogni modifica al testo = nuova `ACCORDO_VERSIONE` in `src/lib/accordo.ts` e preavviso di 30
giorni agli utenti (art. 13 dell'accordo). I promemoria non contengono più riferimento né tipo
di permesso.

**TODO per riaprirlo** (`PRATICHE_ATTIVE` in `src/lib/pratiche.ts`):
- [ ] Applicare `008_pro_accordo.sql` su dev e prod (`scripts/db-migrate.mjs`).
- [ ] Decidere se ridurre il menu dei permessi a categorie neutre (lavoro, famiglia, studio,
      altro): oggi il tipo di permesso rivela dati sanitari, religiosi, su vittime di tratta.
      Se si cambia, aggiornare l'Allegato 1 dell'accordo (nuova versione).
- [ ] Note libere: toglierle o lasciarle con il divieto di dati sanitari e penali (art. 3.3).
- [ ] Titolarità degli account: allineare l'informativa di SOS Flussi (titolare lo Studio) con
      SOS Permesso, visto che l'account è unico.
- [ ] Verificare quanto dichiarato nell'Allegato 2: 2FA su Neon, Netlify, Resend e GitHub;
      ripristino Neon di 7 giorni; nessun dato delle pratiche nei log di Netlify.

### 3. Chatbot PRO (retrieval agentico) — SOSPESO il 16/11/2026

**Stato.** Spento: `src/lib/assistente-pro.ts` (`ASSISTENTE_PRO_ATTIVO`, si riaccende solo con
`CHATBOT_PRO_ENABLED=1`). La route risponde 503, `/pro/assistente` e la dashboard rimandano al
chatbot gratuito del sito. Il codice (`chat-pro.ts`, `ChatPro.tsx`, tabelle `pro.chat_*`) resta.

**Perché.** Prova di Alberto: «Conversione da studio a lavoro subordinato fuori quota: cosa serve?»
(2° suggerimento della schermata vuota). Quattro difetti, analizzati in
`.planning/chatbot-qualita/` (sintesi in `0-piano.md`):
1. **Forma** (`1-forma.md`): scrive «la scheda indica…» e mette il link alla scheda dopo ogni
   elenco. Causa: regola 2 del prompt (`chat-pro.ts:59`) + `Scheda pubblica: URL` in testa ai
   risultati (`generate-permits-kb.js:42`). Le schede devono restare conoscenza di fondo, con i
   link solo in «Per approfondire».
2. **Norme** (`2-norme.md`): «conviene verificare il testo vigente dell'art. 6 TUI»: il bot non
   ha uno strumento per le norme, e la regola 3 lo invita a rimandare la verifica. I testi
   aggiornati ci sono nella KB immigrazbot-norme (TUI al 4/6/2026 + d.l. 100, DPR 394 al
   29/10/2026, verificati su Normattiva).
3. **Conflitti legge/circolari** (`3-conflitti.md`): la Circ. 5969/2023 (`biz-1227`) dice già
   «fuori quota» (d.l. 20/2023 + art. 24 c. 5 d.l. 75/2023), ma il bot ne ha letto solo l'inizio.
   Il ranking premia le circolari flussi 2005-2022, non c'è nessun dato su cosa è superato e il
   prompt non dà una gerarchia delle fonti. Trappola: l'art. 14 cc. 5-6 DPR 394 dice ancora
   «nei limiti delle quote» (regolamento non adeguato), e la nostra scheda PRO flussi riporta la
   regola anteriore al 2023.
4. **Testo troncato** (`4-troncato.md`): `TOOL_TEXT_CAP = 10_000` taglia senza modo di
   proseguire. 280 documenti su 1.929 superano i 10.000 caratteri; il passaggio decisivo di
   `biz-1227` è intorno al carattere 34.000 di 52.000.

**TODO per riaccenderlo** (dettagli, file e righe nei documenti citati):

*Privacy (prima di riaccenderlo)*
- [ ] Gli utenti scrivono nella chat anche dati dei clienti: i messaggi restano in `pro.chat_*`
      e vanno ad Anthropic (USA). Verificare il DPA di Anthropic e la certificazione Data Privacy
      Framework, poi aggiungere la chat all'accordo art. 28 (art. 1.1, 3.3, Allegati 1-3) con
      Anthropic tra i sub-responsabili: nuova `ACCORDO_VERSIONE` e preavviso di 30 giorni
      (art. 6.2). In alternativa vietare i dati personali nella chat.

*Fase 1: risolve il caso segnalato (~2 giorni)*
- [ ] Prompt: blocco «FONTI E CITAZIONI» (`1-forma.md` §3), «GERARCHIA DELLE FONTI»
      (`3-conflitti.md` §3.1), «mai scaricare la verifica sull'utente» (`2-norme.md` §7), regola
      sui documenti lunghi (`4-troncato.md` §5). Togliere la regola 3 attuale.
- [ ] `leggi_circolare`: parametri `cerca` (paragrafi pertinenti, FTS italiano) e `da_paragrafo`;
      taglio su confine di paragrafo; messaggio di fine blocco che dice come proseguire;
      `cercaInCircolare()` in `circolari.ts`.
- [ ] `scheda_permesso`: etichette neutre («Approfondimento giuridico» invece di «Scheda PRO»,
      link in coda «per Per approfondire»).
- [ ] Ranking `cerca_circolari`: `ts_rank_cd(..., 32)` + recenza; escludere `fuori_ambito`.
- [ ] Correggere la conversione da studio nella scheda PRO flussi
      (`pro-content-shared/pro-content.json`) — **da validare da Alberto**.
- [ ] Valida Alberto: regola «la legge prevale sul regolamento non adeguato; una circolare
      anteriore all'ultima modifica dell'articolo è potenzialmente superata».
- [ ] Test: esportare `runTool`; `scripts/check-chat-forma.mjs` (bozza in
      `.planning/chatbot-qualita/check-forma.bozza.mjs`); `scripts/eval-chat-pro.ts` su Neon dev
      con i casi di `1-forma.md` §4c, `3-conflitti.md` §3.4 e `4-troncato.md` §6
      (`env -u ANTHROPIC_API_KEY`).
- [ ] Lettura (sola) di `pro.chat_messaggio` in produzione, da terminale di Alberto: traccia
      reale del turno, numero di letture troncate, il «prima» della regex.

*Fase 2: norme nel bot (~2 giorni)*
- [ ] `scripts/sql/007_pro_norme.sql` (`pro.norma_atto`, `pro.norma_articolo`) +
      `scripts/import-norme.mjs` dalla KB immigrazbot-norme (primo lotto 19 atti, ~10 MB).
      Pulizia: soppressioni `....` → «[parole soppresse dal legislatore]»; falso tag `lett.a`
      nel DPR 394 art. 14.
- [ ] Strumenti `leggi_norma` / `cerca_norme` con «testo vigente al…», rinvii, «richiamato da»,
      avvertenza GU; elenco ATTI NORMATIVI nel prompt.
- [ ] Sentinella Normattiva mensile (`scripts/sync-norme-normattiva.mjs`, in locale).
- [ ] A monte, pipeline IMMIGRAZBOT (`export_norme.py`): correggere i due difetti di parsing,
      `vigente_dal` + atto modificante, atti mancanti (d.l. 20/2023, 145/2024, 146/2025,
      d.lgs. 83/2026, l. 91/1992, d.P.R. 179/2011, DPCM flussi 2025, d.m. 4/6/2010).
- [ ] Verificare gli estremi della conversione del d.l. 75/2023 (l. 112/2023) su Normattiva.

*Fase 3: circolari superate (~5-6 giorni + 5-10 ore di revisione di Alberto)*
- [ ] Tabelle `pro.norma_articolo_versione`, `pro.circolare_norma`, `pro.circolare_stato`, dal
      file versionato `Sito_Nuovo/data-pipeline/data/circolari-stato.json`.
- [ ] Pipeline: multivigenza Normattiva → regex sulle norme citate → LLM in batch sugli ~810 documenti
      in ambito → regola sulla data (`da_verificare`) → `efficacia_esaurita` per quote/click
      day/emersioni.
- [ ] Revisione umana delle 150 circolari più usate; avviso di stato in testa ai risultati; solo
      «superata» verificata abbassa il ranking.
- [ ] Facoltativo: togliere il trattino morbido U+00AD in `export_circolari_site.py`.

**Progetto originale** (resta valido):
- Route `/api/pro/chat` dietro `getProAccess()`, streaming, storico per utente.
- Strumenti (tool use) sulla tabella del punto 1: `cerca_circolari`, `leggi_circolare`,
  `scheda_permesso`. Tetto di 6-8 chiamate per domanda, limite giornaliero per utente.
- Registro professionale, ogni affermazione con la fonte linkata; senza fonte dice che non sa.
- Può partire da una pratica dello scadenziario.
- Strumenti `cerca_sentenze` / `leggi_sentenza` quando esisterà la tabella del punto 4.

### 4. Giurisprudenza (aggiunto l'8/11/2026)
Non solo per gli avvocati: anche CAF e sindacati la usano (diniego o revoca del rinnovo, requisiti
di reddito, reati ostativi, coesione familiare). Si affianca alle circolari, non le sostituisce.
- **Tabella `pro.sentenza`**, stessa forma di `pro.circolare` così ricerca e chatbot si riusano:
  id, autorità (TAR, CdS, Cassazione, Tribunale, CGUE, CEDU), sezione, numero, data, estremi,
  massima, testo integrale, `source_url`, `permessi[]`, `temi[]`, `tsvector` italiano,
  `anonimizzata`, `validata_da` / `validata_at`.
- **Fonti candidate** (da scegliere):
  - TAR e Consiglio di Stato (giustizia-amministrativa.it): pubbliche, già anonimizzate, le più
    utili per rinnovi e dinieghi della Questura.
  - Cassazione (SentenzeWeb): protezione speciale, espulsioni, conversioni.
  - KB ImmigrazBot dello studio (schede e mappe, testo integrale su Drive) e decisioni della KB
    SOS Patto: da verificare diritti e anonimizzazione prima di pubblicarle in un prodotto a pagamento.
- **Massime**: solo da decisioni con testo integrale nel DB, scritte o validate da un avvocato;
  finché non sono validate restano con il badge BOZZA. Le sentenze già in
  `pro-content-shared/pro-content.json` (bozza) si migrano qui.
- Pagine `/[locale]/pro/giurisprudenza`: ricerca full-text, filtri per permesso, autorità, anno;
  link dalla scheda permesso PRO ("Giurisprudenza collegata").
- Import con lo stesso schema di `import-circolari.mjs` (upsert per id, mai cancellare).

### 5. Base di conoscenza del chatbot PRO e allineamento col sito (aggiunto l'8/11/2026)
Principio: **il sito è la fonte, il chatbot non ha contenuti suoi**. Ogni modifica o
arricchimento del sito deve arrivare al chatbot senza passaggi a memoria.

**Situazione oggi** (ogni pezzo si aggiorna a mano, nessuno lo controlla):

| Pezzo | Fonte | Come arriva al chatbot | Aggiornamento |
|---|---|---|---|
| Schede permesso (Q&A, checklist, costi) | Notion → `Sito_Nuovo/_cache/permits-it.json` | `scripts/generate-permits-kb.js` → `permits-kb.generated.ts` (committato) | manuale; `next build` non lo lancia |
| Contenuti PRO (sintesi, norme, sentenze bozza) | `pro-content-shared/pro-content.json` | `scripts/generate-pro-content.js` | manuale |
| Circolari | SQLite `data-pipeline/data/circolari.db` | `export_circolari_pro.py` → `import-circolari.mjs` → Neon | manuale, produzione lanciata da Alberto |
| Guide del sito (dizionario, protezione internazionale, ricongiungimento, decreto flussi…) | HTML del sito | solo nel chatbot gratuito (`build-chatbot-kb.js`) | **assenti nel PRO** |
| Giurisprudenza | punto 4 | `pro.sentenza` | da fare |

**Preparare la KB (prima della pipeline)**
- Manifesto unico `app/kb/manifest.json`: per ogni fonte, file d'origine, generatore,
  destinazione, data e hash dell'ultima generazione.
- Un solo convertitore HTML → testo condiviso fra sito e app (oggi due copie "con le stesse regole"
  in `build-chatbot-kb.js` e `generate-permits-kb.js`: prima o poi divergono).
- Aggiungere al PRO le guide del sito, con uno strumento `leggi_guida` (una per chiamata, come
  `scheda_permesso`, così la KB non entra intera nel prompt).
- Ogni documento della KB porta `source_url`, `aggiornato_al` e hash del contenuto: il chatbot
  cita la pagina del sito e la sua data.
- Uscita deterministica (niente timestamp, ordinamento per slug) per non invalidare la cache del prompt.
- **Set di prova**: 40-50 domande reali da CAF e sindacati con le fonti attese; si rilancia dopo
  ogni aggiornamento della KB e segnala risposte peggiorate o fonti sparite.

**Pipeline di allineamento**
1. Comando unico `npm run kb:sync` nell'app: rigenera schede, contenuti PRO e guide da
   `../Sito_Nuovo`, aggiorna il manifesto e stampa un rapporto delle differenze (permessi
   cambiati, documenti aggiunti o tolti dalle checklist, guide nuove).
2. Automatico (consigliato): GitHub Action nel repo del sito, su push a `main` che tocca
   `_cache/permits-*.json`, le pagine guida o `pro-content.json` → `repository_dispatch` al repo
   dell'app → Action che fa checkout di entrambi, lancia `kb:sync` e il set di prova e **apre una PR**
   "KB: aggiornamento dal sito <sha>" con il rapporto. Alberto la unisce: nessun push automatico
   in produzione.
3. Rete di sicurezza: `kb:check` confronta gli hash del manifesto con le fonti; lo lancia il build
   del sito in locale e avvisa se il chatbot PRO è indietro.
4. Circolari e sentenze: job settimanale (scraper → SQLite → export → import in Neon `dev`, poi
   produzione dopo il via libera di Alberto); le nuove entrano anche negli avvisi email.
5. Prerequisito: `pro-content-shared/` oggi non è in nessun repo git; va spostato nel repo del
   sito (o in un repo suo) perché la pipeline possa vederlo.

## Da decidere / aperto
- Fonti della giurisprudenza (punto 4), chi valida le massime, regole di anonimizzazione.
- Pipeline KB: GitHub Action con PR (consigliato) o solo `kb:sync` + `kb:check` in locale.
- **Originali delle circolari**: le due fonti (immigrazione.biz, permessidisoggiorno.info) hanno
  ripubblicato solo il testo; nel DB solo 6 documenti su 2160 hanno un `pdf_url`. Per un
  prodotto PRO va aggiunto un passaggio che cerca il PDF ufficiale (Ministero dell'Interno,
  INPS, Ministero del Lavoro) per numero e data, almeno per le circolari recenti e per quelle
  collegate ai permessi (367). Mostrare sempre "testo da fonte secondaria" finché manca.
- Prezzo e passaggio a Stripe: vedi `PRO-PREMIUM-PIANO.md`.
- Cosa resta gratis (primi 100 iscritti, 1 pratica gratis?).

## Chi fa cosa
- Codice, import, test locali: Claude nel repo app.
- Alberto: variabili su Netlify, via libera a migrazione in produzione, `git push` (mai senza permesso).
