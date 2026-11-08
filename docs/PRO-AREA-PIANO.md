# Area PRO — piano (scadenziario, circolari complete, chatbot PRO)

> Concordato il 2026-11-07. Si appoggia a `PRO-PREMIUM-PIANO.md` (account e pagamenti).
> Target: CAF, consulenti del lavoro, sindacati; avvocati in futuro (giurisprudenza).

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
- Avvocati, dopo: strumento `cerca_sentenze` quando esisterà una base dati nel progetto.

## Da decidere / aperto
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
