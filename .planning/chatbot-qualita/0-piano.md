# Chatbot PRO — piano di correzione (sintesi dei punti 1-4)

16/11/2026. **Assistente PRO sospeso lo stesso giorno**: questo piano è la TODO per riaccenderlo (riassunta in `docs/PRO-AREA-PIANO.md` §3). Dettagli in `1-forma.md`, `2-norme.md`, `3-conflitti.md`, `4-troncato.md`.
Caso: «Conversione da studio a lavoro subordinato fuori quota: cosa serve?» (è anche il 2° suggerimento della schermata vuota, `ChatPro.tsx:37`).

## Cosa è successo davvero

1. **Forma.** La regola 2 del prompt (`chat-pro.ts:59`) mette la scheda tra le fonti da citare «per ogni affermazione». Ogni risultato di `scheda_permesso` comincia con `Scheda pubblica: URL` (`generate-permits-kb.js:42`). La regola 3 suggerisce la frase «nell'archivio non trovo». Il bot obbedisce.
2. **Norme.** Il bot non ha nessuno strumento per leggere le norme. La regola 3 gli dice di «indicare quale norma andrebbe verificata». La KB immigrazbot-norme ha i testi giusti: art. 6 c. 1 TUI e art. 14 DPR 394 coincidono con Normattiva di oggi. Il bot però non la vede.
3. **Conflitti.** La circolare citata, la 5969/2023 (`biz-1227`), **non è sbagliata**: al § 4 dice che la conversione studio→lavoro «non è più soggetta alla disponibilità di quote» (d.l. 20/2023 + art. 24 c. 5 d.l. 75/2023). Il bot non ci è arrivato perché:
   - lo strumento gli ha mostrato solo i primi 10.000 caratteri su 52.000, e il passaggio sta intorno al carattere 34.000;
   - il ranking (`circolari.ts:141`) premia le circolari flussi 2005-2022, che dicono «quote»;
   - nessun dato dice quale circolare è superata e da cosa;
   - il prompt non dà una gerarchia delle fonti.

   **Trappola che resta anche con le norme:** l'art. 14 cc. 5-6 DPR 394 dice ancora «nei limiti delle quote», perché il regolamento non è stato adeguato. Anche la **nostra scheda PRO flussi** (`pro-content-shared/pro-content.json`) riporta la regola anteriore al 2023.
4. **Troncamento.** `TOOL_TEXT_CAP = 10_000` (`chat-pro.ts:47`) taglia senza offrire un modo per leggere il resto. 280 documenti su 1.929 (14,5%) superano il limite. Dal 16/11 il testo dei PDF li ha resi più lunghi, in mediana 4,6 volte lo scraping. Il testo non è sporco: è proprio lungo.

## Piano in 3 fasi

### Fase 1: risolve il caso segnalato (circa 2 giorni, tutto in `app/`)
Una sola sessione, perché quasi tutto tocca `chat-pro.ts`.
- **Prompt** (`SYSTEM_PROMPT`):
  - blocco «FONTI E CITAZIONI» di `1-forma.md` §3: schede come conoscenza propria, link solo in «### Per approfondire», norme e circolari inline, niente meta-commenti;
  - «GERARCHIA DELLE FONTI» di `3-conflitti.md` §3.1;
  - regola «mai scaricare la verifica sull'utente» di `2-norme.md` §7;
  - regola sui documenti lunghi di `4-troncato.md` §5;
  - va tolta la regola 3 attuale.
- **`leggi_circolare`**:
  - parametri `cerca` (paragrafi pertinenti, FTS italiano su `jsonb_array_elements_text`, tetto 8.000 caratteri) e `da_paragrafo`;
  - taglio su confine di paragrafo;
  - messaggio di fine blocco che dice come proseguire;
  - l'avviso di stato va in testa, mai nella parte tagliata.
- **`scheda_permesso`**: etichette neutre. «Scheda PRO» diventa «Approfondimento giuridico», e il link va in coda come «per Per approfondire».
- **Ranking circolari**: `ts_rank_cd(..., 32)` più un fattore di recenza dolce; esclusi i documenti `fuori_ambito`.
- **Contenuto**: correggere la conversione da studio nella scheda PRO flussi. Va validato da Alberto.
- **Verifica**:
  - esportare `runTool`;
  - `scripts/check-chat-forma.mjs` (regex, bozza già pronta);
  - `scripts/eval-chat-pro.ts` su Neon dev con i casi 1, 2, 7, 8 di `3-conflitti.md`, i casi 1, 4, 6 di `1-forma.md` e le 3 domande di fine circolare di `4-troncato.md`;
  - con `env -u ANTHROPIC_API_KEY`, circa 3-4 $ in tutto.

Nota: senza `leggi_norma` la fase 1 dà già la risposta giusta, ricavandola da `biz-1227`/`biz-1242`, ma non cita l'art. 6 TUI dal testo.

### Fase 2: le norme nel bot (circa 2 giorni)
- `scripts/sql/007_pro_norme.sql` (`pro.norma_atto`, `pro.norma_articolo`) e `scripts/import-norme.mjs` dalla KB:
  - primo lotto di 19 atti, circa 10 MB in Neon;
  - pulizia delle soppressioni `....` e del falso tag `lett.a`.
- Strumenti `leggi_norma(atto, articolo, comma?, versione?, data?)` e `cerca_norme(query, atti?)`, che restituiscono «testo vigente al …», i rinvii, «richiamato da» e l'avvertenza «fa fede la GU».
- Elenco ATTI NORMATIVI nel prompt (in cache).
- **Sentinella Normattiva** mensile, in locale, che segnala gli articoli cambiati.
- **A monte, nella pipeline IMMIGRAZBOT** (`export_norme.py`, altra repo):
  - correggere i due difetti di parsing;
  - aggiungere `vigente_dal` e l'atto modificante;
  - aggiungere gli atti mancanti: d.l. 20/2023, 145/2024, 146/2025, d.lgs. 83/2026, l. 91/1992, d.P.R. 179/2011, DPCM flussi 2025.

### Fase 3: circolari superate (circa 5-6 giorni, più 5-10 ore di revisione di Alberto)
- Tabelle `pro.norma_articolo_versione`, `pro.circolare_norma` e `pro.circolare_stato`. Sono alimentate da un file versionato `Sito_Nuovo/data-pipeline/data/circolari-stato.json`, così sopravvivono ai reimport.
- Pipeline:
  - multivigenza da Normattiva;
  - regex sulle norme citate;
  - passaggio LLM in batch sugli 810 documenti in ambito;
  - regola automatica sulle date (circolare anteriore all'ultima modifica = `da_verificare`);
  - `efficacia_esaurita` in blocco per quote annuali, click day ed emersioni.
- Revisione umana sui 150 documenti più usati.
- Gli strumenti mostrano lo stato. Solo lo stato «superata» verificato abbassa il ranking.

## Sessioni per l'esecuzione (divise per file)
| Sessione | File | Fase |
|---|---|---|
| A: prompt e strumenti | `src/lib/chat-pro.ts`, `src/lib/circolari.ts`, `scripts/eval-*`, `scripts/check-chat-forma.mjs`, `scripts/generate-permits-kb.js` | 1 |
| B: correzione della scheda PRO flussi | `pro-content-shared/pro-content.json` | 1 (testo da validare) |
| C: dati delle norme | `scripts/sql/007_*`, `scripts/import-norme.mjs`, `src/lib/norme.ts` (A poi collega gli strumenti) | 2 |
| D: export delle norme | repo IMMIGRAZBOT `src/export_norme.py` | 2 |
| E: stato delle circolari | `Sito_Nuovo/data-pipeline/`, `scripts/sql/00N_*` | 3 |

Commit solo dal coordinatore, push solo su «push».

## Da decidere o fornire (Alberto)
1. **Testo giuridico da validare:**
   - la regola «la legge prevale sul regolamento non adeguato; la circolare anteriore all'ultima modifica è potenzialmente superata»;
   - la correzione della scheda PRO flussi.
2. **Lettura di `pro.chat_messaggio`** (sola lettura, Neon prod). Tutte e quattro le sessioni sono state bloccate. Serve per:
   - vedere la traccia reale di quel turno;
   - contare le letture troncate;
   - avere il «prima» della regex sulla forma.

   Si può lanciare da terminale o autorizzarla esplicitamente.
3. Da verificare: gli estremi della legge di conversione del d.l. 75/2023 (l. 112/2023), presi dalla circolare e non da Normattiva.
