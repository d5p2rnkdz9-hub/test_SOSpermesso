# Area PRO — piano (scadenziario, circolari complete, chatbot PRO)

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

### 3. Chatbot PRO (retrieval agentico)
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
