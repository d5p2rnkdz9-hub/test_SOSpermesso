# 4 — Testo troncato in `leggi_circolare`

Stato: analisi e piano, nessuna modifica al codice. Misure del 16/11/2026 su `app/.cache/circolari-pro.json` (export importato in Neon, generato il 16/11 alle 10:26, quindi già con `pick_body()` che preferisce `testo_pdf`) e sul SQLite `Sito_Nuovo/data-pipeline/data/circolari.db` aperto in sola lettura.

## 1. Il problema, misurato

### Codice attuale
- `src/lib/chat-pro.ts:47` `TOOL_TEXT_CAP = 10_000` (caratteri).
- `src/lib/chat-pro.ts:174-195` `leggi_circolare`: unisce `doc.testo` (array di paragrafi) e, se supera il tetto, taglia a 10.000 caratteri esatti (anche a metà parola) e aggiunge `[testo troncato: il documento continua]`. Lo strumento non ha parametri oltre `id`, quindi il resto è irraggiungibile: il modello può solo rileggere gli stessi 10.000 caratteri.
- `src/lib/chat-pro.ts:104-117` descrizione dello strumento: promette "il testo integrale", nessuna menzione di tetto o lettura a pezzi.
- Il prompt (`chat-pro.ts:55-71`) non dice nulla sul caso troncato: il modello riferisce all'utente il limite tecnico ("lo strumento mi ha restituito il testo troncato").

### Distribuzione delle lunghezze (1.929 documenti nel corpus PRO)

| Soglia | Documenti oltre | Quota |
|---|---|---|
| > 5.000 car. | 529 | 27% |
| **> 10.000 car. (tetto attuale)** | **280** | **14,5%** |
| > 20.000 | 117 | 6,1% |
| > 30.000 | 65 | 3,4% |
| > 50.000 | 21 | 1,1% |
| > 100.000 | 2 | 0,1% |

Mediana 1.785 car., media 5.277, p90 13.242, p95 22.909, p99 50.288. Massimi: biz-813 (Fondazione Studi Consulenti del Lavoro, 166.132 car.), biz-1231 (Meccanismo nazionale di Referral, 123.602). Nei 280 documenti lunghi ci sono 3,74 milioni di caratteri oltre il tetto: oggi il bot non può leggerli.

### La Circolare n. 5969/2023 (biz-1227)
- Min. Interno, 27/10/2023, DPCM flussi 2023-2025. **52.048 caratteri, 65 paragrafi**: il bot ne vede il 19%.
- Fonte: `testo_plain` dello scraping (55.522 car. nel SQLite); non ha `testo_pdf`. Il troncamento qui non dipende dal cambio del 16/11.
- **La sezione "2.6. Conversione di permessi di soggiorno (art. 6, commi 5 e 6)" comincia al carattere 16.308** (paragrafi 23-28, car. 15.971-19.811), cioè 6.300 caratteri dopo il taglio. Altri passaggi sulle conversioni: car. 21.608-22.172 (start-up, par. 30-31), 34.084-34.558 (studio/formazione → lavoro fuori quota, par. 43), 41.432, 44.731 (parere ITL, par. 57), 47.408-48.004 (modelli VB, LS, LS1, LS2, par. 60).
- Nessuna menzione di "convers" nei primi 10.000 caratteri tranne un link MIT sulla conversione delle patenti (car. 3.648): il bot non poteva trovarla.

### Il testo è "sporco"? No, è lungo davvero
- Nessuna intestazione di pagina ripetuta ("Pagina x di y": 0 occorrenze nei 280 lunghi); righe ripetute ≥3 volte: un solo documento, 2.150 caratteri in tutto.
- Residui minori: 248 sequenze di puntini (indici, tabelle), 6 trattini morbidi (U+00AD, es. "conversione\xad patente" in biz-1227), 314 rimandi ad allegati, 165 URL. Ripulirli non cambierebbe l'ordine di grandezza.
- Effetto del 16/11: dei 280 documenti lunghi, 127 vengono da `testo_pdf`. Per questi il testo PDF è in mediana **4,6 volte** lo scraping (es. biz-42: 3.858 → 62.200; biz-813: 24.393 → 166.132): lo scraping aveva solo un riassunto, il PDF ha la circolare intera con gli allegati. Il cambio ha quindi aumentato i casi troncati e, insieme, il valore di leggerli per intero.
- Molti dei più lunghi sono fuori tema o quasi (Agenzia Entrate, MIUR iscrizioni, INPS pensioni): pesano poco nel traffico reale, ma restano possibili.

### Struttura utile per leggere a pezzi
- 30.328 paragrafi in tutto, mediana 230 car., p90 746, solo 24 sopra 3.000 (max 10.037). Il paragrafo è già un'unità naturale (in Neon `pro.circolare.testo` è l'array dei paragrafi).
- Titoli di sezione riconoscibili con una regex (numerazione "2.6.", "Art. n", maiuscoletto) in 148 dei 280 documenti lunghi: utile per un indice, non affidabile per tutti.

## 2. Costi di riferimento

- Modello `claude-opus-5-5`, prezzi come in `chat-pro.ts:312`: input 4 $/M, output 20 $/M, scrittura cache 5 $/M, lettura cache 0,4 $/M.
- Prompt caching **già attivo** su due livelli: `cache_control` sul system prompt (`chat-pro.ts:488-494`) e `cache_control` di primo livello sulla richiesta (`chat-pro.ts:501`), che mette in cache anche la storia. Quindi un risultato di strumento si paga 5 $/M una volta (scrittura) e 0,4 $/M a ogni giro successivo dello stesso turno; ai turni successivi lo si rilegge a 0,4 $/M se passano meno di 5 minuti, altrimenti si riscrive a 5 $/M. **I risultati degli strumenti restano nella storia per tutta la conversazione** (fino a `MAX_TURNS = 15`): un testo grosso letto al turno 1 si ripaga a ogni turno.
- Stima: ~3,5 caratteri per token in italiano (da verificare con `usage` reale; non ho potuto leggere `pro.chat_messaggio`, vedi nota in fondo).
- Vincoli: `MAX_TOOL_ROUNDS = 5` (`:34`), `MAX_TOOLS_PER_ROUND = 4` (`:49`), `TOOL_DEADLINE_MS = 35_000` (`:36`, limite Netlify 60 s), tetti di spesa 3 $/utente e 40 $/giorno (`:45-46`).

| Testo restituito | Token (stima) | Prima scrittura | Ogni giro/turno successivo (cache viva) | Turno dopo 5 min (cache scaduta) |
|---|---|---|---|---|
| 10.000 car. (oggi) | ~2.900 | 0,014 $ | 0,001 $ | 0,014 $ |
| 8.000 car. di passaggi (opz. b) | ~2.300 | 0,011 $ | 0,001 $ | 0,011 $ |
| 52.048 car. (biz-1227 intera) | ~14.900 | 0,074 $ | 0,006 $ | 0,074 $ |
| 166.132 car. (biz-813) | ~47.500 | 0,24 $ | 0,019 $ | 0,24 $ |
| 4 letture × 52.000 car. in un giro | ~60.000 | 0,30 $ | 0,024 $ | 0,30 $ |

## 3. Opzioni

### (a) Lettura a pezzi: `da_paragrafo` (o `da_carattere`)
Parametro opzionale; lo strumento restituisce ~10.000 car. a partire da lì, tagliando su confini di paragrafo.
- Pro: banale da implementare (nessuna query nuova), deterministica, permette di leggere tutto.
- Contro: lettura alla cieca. Per arrivare alla sezione 2.6 di biz-1227 servono 2 chiamate (§1-22, poi §23-…); per la parte finale (modelli VB/LS, car. 47.000) 5 chiamate, cioè tutti i `MAX_TOOL_ROUNDS` e buona parte dei 35 s. Ogni pezzo resta in storia.
- Costo: ~0,014 $ a pezzo; per leggere biz-1227 intera ~0,07 $ più i giri di modello (latenza 3-6 s ciascuno).
- Meglio `da_paragrafo` di `da_carattere`: niente tagli a metà frase, numerazione stabile che si può citare nei risultati di (b) ("§24-28").

### (b) `cerca` dentro la circolare → passaggi pertinenti con contesto
Parametro opzionale `cerca` (parole chiave). Lo strumento restituisce i paragrafi che contengono i termini, con il paragrafo prima e dopo, in ordine di documento, ciascun blocco con la sua posizione (`[§23-28 di 65]`), tetto ~8.000 car.
- Implementazione consigliata in Postgres, per riusare lo stemming italiano già usato da `cerca_circolari` ("conversione", "convertire", "conversioni" → stesso lessema): una query su `jsonb_array_elements_text(c.testo) WITH ORDINALITY` con `to_tsvector('italian', p) @@ q`, dove `q` è la tsquery in OR (`replace(plainto_tsquery('italian', $2)::text, '&', '|')::tsquery`), ordinata per `ts_rank_cd`. Un documento ha al massimo qualche centinaio di paragrafi: calcolo al volo, niente tabella nuova né reindicizzazione.
- Pro: una chiamata porta il modello al punto giusto (biz-1227 + `cerca: "conversione permesso"` → §23-28, §30-31, §43, §57, §60, circa 7.000 car.). Costa meno del tetto attuale. Funziona anche sui documenti più lunghi.
- Contro: dipende dalle parole scelte dal modello (sinonimi: "conversione" vs "trasformazione"); se non trova nulla serve un messaggio che suggerisca alternative o `da_paragrafo`.
- Costo: ~0,011 $ a chiamata; nessun costo di infrastruttura.

### (c) Passaggi indicizzati (`pro.circolare_passaggio`) usati da `cerca_circolari`
Tabella con i documenti spezzati in passaggi (~1.500 car., paragrafi accorpati: ~9.100 passaggi stimati), `tsvector` GIN o embeddings (pgvector), e `cerca_circolari` che restituisce per ogni documento il passaggio migliore con il suo §.
- Pro: la ricerca trova il punto giusto anche nei documenti lunghi già al primo strumento; migliora anche il ranking (oggi `ts_rank_cd` su tutto il testo senza normalizzazione per lunghezza tende a premiare i documenti lunghi, `circolari.ts:141`).
- Contro: migrazione SQL nuova, modifica di `import-circolari.mjs` (scrivere i passaggi) e di `searchCircolari`, reimport su dev e prod; con embeddings anche un fornitore esterno, una chiave, pgvector su Neon e il costo di indicizzazione (~3 M di token una tantum + ogni nuova circolare). Non risolve da sola il problema: il modello deve comunque poter leggere il passaggio per intero.
- Costo: 1-2 giorni di lavoro (full-text), di più con embeddings. Costo in token per risposta invariato.

### (d) Alzare il tetto
- 30.000 car. coprirebbe il 96,6% dei documenti (non biz-1227); 60.000 il 99% (biz-1227 sì, biz-813 no).
- Contro: costo per lettura ×5 (0,074 $ per biz-1227 a ogni scrittura in cache), il testo resta in storia per tutta la conversazione (ripagato a ogni turno dopo 5 minuti di pausa), quattro letture in parallelo possono portare un giro a ~60.000 token (0,30 $) e il tetto utente di 3 $/giorno si consuma in pochi messaggi. Più testo nel contesto = risposte più lente e attenzione più diluita sul passaggio che serve. Il problema resta per l'1% più lungo.
- Utile solo in piccolo: alzare a ~12.000 car. tagliando su confine di paragrafo non sposta molto.

## 4. Raccomandazione

**(b) + (a) subito, (c) solo se dopo i test la ricerca non trova i passaggi; (d) no.**

1. `leggi_circolare` con due parametri opzionali: `cerca` (passaggi pertinenti, tetto 8.000 car.) e `da_paragrafo` (lettura sequenziale da quel paragrafo, tetto 10.000 car.). Senza parametri si comporta come oggi ma taglia su confine di paragrafo e dice esattamente dove si è fermato e come proseguire.
2. Intestazione del risultato con lunghezza e paragrafi ("Documento lungo: 52.048 caratteri, 65 paragrafi"), così il modello sa subito che conviene usare `cerca`.
3. Regola nel prompt: per i documenti lunghi usare `cerca` con il tema della domanda; vietato dire all'utente che il testo era troncato o non leggibile prima di aver provato `cerca` o `da_paragrafo`.
4. (Facoltativo, fase 2) Indice dei titoli di sezione nell'intestazione, dove la regex li trova (148/280 lunghi). (c) con full-text, senza embeddings, se i test mostrano che `cerca_circolari` non porta ai documenti lunghi giusti.

Flusso atteso per la domanda di Alberto: `cerca_circolari("conversione permesso flussi 2023")` → `leggi_circolare({id: "biz-1227", cerca: "conversione"})` → risposta. Due giri su cinque, ~0,02 $ di strumenti invece di una risposta sbagliata.

## 5. Modifiche puntuali

**`src/lib/circolari.ts`** (dopo `getCircolare`, ~riga 189): nuova funzione
```ts
export async function cercaInCircolare(id: string, q: string, maxParagrafi = 12):
  Promise<{ n: number; righe: { ord: number; rank: number }[] } | null>
```
con la query:
```sql
WITH q AS (SELECT replace(plainto_tsquery('italian', $2)::text, '&', '|')::tsquery AS q)
SELECT p.ord::int, ts_rank_cd(to_tsvector('italian', p.t), q.q) AS rank,
       jsonb_array_length(c.testo) AS n
FROM pro.circolare c, q, jsonb_array_elements_text(c.testo) WITH ORDINALITY AS p(t, ord)
WHERE c.id = $1 AND to_tsvector('italian', p.t) @@ q.q
ORDER BY rank DESC LIMIT $3
```
(se `plainto_tsquery` è vuota, cioè solo stopword, restituire 0 righe). Il resto (vicini ±1, unione dei blocchi contigui, tetto) in TypeScript sul `doc.testo` già letto da `getCircolare`.

**`src/lib/chat-pro.ts`**
- `:47` sostituire `TOOL_TEXT_CAP` con `LEGGI_CAP = 10_000` e `CERCA_CAP = 8_000`.
- `:104-117` schema di `leggi_circolare`: aggiungere
  - `cerca` (string, opzionale): "Parole chiave del tema che cerchi dentro il documento (es. \"conversione lavoro subordinato\"). Restituisce i paragrafi pertinenti con il contesto. Da usare per i documenti lunghi."
  - `da_paragrafo` (integer ≥ 1, opzionale): "Legge il documento da questo paragrafo in poi (numeri § indicati nei risultati precedenti)."
  - descrizione: "Legge un documento dell'archivio dato il suo id. I documenti lunghi sono restituiti a blocchi: usa `cerca` per andare al passaggio che ti serve o `da_paragrafo` per proseguire."
- `:174-195` riscrivere il ramo `leggi_circolare`:
  - intestazione invariata + riga `Lunghezza: 52.048 caratteri, 65 paragrafi` quando il testo supera `LEGGI_CAP`;
  - con `cerca`: chiamare `cercaInCircolare`, comporre i blocchi `[§23-28 di 65]\n<paragrafi>` fino a `CERCA_CAP`; se nessun risultato: `Nessun paragrafo contiene "<cerca>". Prova sinonimi o termini più generici, oppure leggi a blocchi con da_paragrafo (il documento ha 65 paragrafi).`;
  - senza `cerca`: accumulare paragrafi da `da_paragrafo` (default 1) finché non si supera `LEGGI_CAP` (almeno un paragrafo anche se più lungo, troncato con nota);
  - messaggio di fine blocco, al posto di `[testo troncato: il documento continua]`:
    `[Mostrati i paragrafi §1-22 di 65 (caratteri 1-9.950 di 52.048). Il documento continua. Per il passaggio che ti serve chiama leggi_circolare con id="biz-1227" e cerca="<parole del tema>"; per proseguire in ordine, da_paragrafo=23.]`
  - con `da_paragrafo` oltre la fine: `Il documento ha solo 65 paragrafi.`
- `:353-354` `toolLabel`: "Cerco «conversione» nel documento biz-1227" / "Leggo il documento biz-1227 dal § 23".
- `:55-71` `SYSTEM_PROMPT`, sezione COME LAVORI, nuovo punto (dopo il 3):
  `Documenti lunghi: se leggi_circolare indica che il documento continua, prima di rispondere cerca il passaggio pertinente con il parametro cerca (o prosegui con da_paragrafo). Non dire all'utente che il testo era troncato, incompleto o illeggibile: se dopo aver cercato non trovi il punto, di' che nella circolare non hai trovato indicazioni su quel punto e dai il link al documento.`
  Attenzione: la sessione "bot-forma" lavora sullo stesso prompt; inserire questa riga coordinandosi per evitare conflitti.
- `:568` (facoltativo) messaggio di limite raggiunto: aggiungere "non attribuire all'utente limiti tecnici degli strumenti".

**Fuori da `chat-pro.ts`** (facoltativo, pipeline): rimuovere il trattino morbido U+00AD in `pick_body()`/`clean_body()` (`Sito_Nuovo/data-pipeline/export_circolari_site.py:334`); 6 occorrenze nei lunghi, rompono parole come "conversione" per lo stemming. Da fare nel SQLite secondo la regola della pipeline, non in Neon.

## 6. Test

Non esiste un framework di test nell'app (nessuno script `test` in `package.json`); `tsx` è installato.

1. **Funzione** (script `scripts/check-leggi-circolare.ts` con `tsx`, su Neon dev): esportare `runTool` da `chat-pro.ts` (o spostarlo in un modulo senza `server-only`) e verificare:
   - `leggi_circolare {id:"biz-1227"}` → finisce con il messaggio che nomina `cerca` e `da_paragrafo=23`, non taglia a metà parola, ≤ 10.000 car.;
   - `{id:"biz-1227", cerca:"conversione"}` → contiene "2.6. Conversione di permessi di soggiorno" e "modello VB", ≤ 8.000 car.;
   - `{id:"biz-1227", da_paragrafo:60}` → contiene "LS2";
   - `{id:"biz-813", cerca:"lavoro domestico"}` → risultato non vuoto, ≤ 8.000 car.;
   - `{id:"biz-1227", cerca:"zzzz"}` → messaggio "Nessun paragrafo contiene…".
2. **End-to-end** (dev, chat PRO nell'app locale), domande sulla parte finale di circolari lunghe:
   - "Secondo la circolare 5969/2023 del Ministero dell'Interno, come si chiede la conversione da stagionale a subordinato e quanti giorni di lavoro servono?" → attesi: modello VB, media di almeno 13 giorni mensili nei tre mesi (car. 17.886-19.246), link a biz-1227.
   - "Nella circolare 5969/2023, quali codici di modello si usano per le quote di conversione?" → attesi VB, LS, LS1, LS2 (car. 47.408-48.004, ultimo 10% del documento).
   - Una domanda su biz-1242 (Circolare n. 9032/2024, 59.697 car.) su un punto oltre il carattere 40.000.
   Criteri: la traccia strumenti mostra `leggi_circolare` con `cerca` o `da_paragrafo`; la risposta contiene il dato atteso; nessuna frase su testo "troncato", "incompleto" o "non ho potuto leggere"; ≤ 3 giri strumenti; costo del turno (da `usage`) sotto 0,10 $.
3. **Regressione**: una domanda su una circolare corta (< 5.000 car.) deve dare lo stesso flusso di oggi (una lettura, nessun parametro).

## Nota sui dati non misurati

Non ho letto `pro.chat_messaggio` (accesso a Neon negato in questa sessione): mancano il numero reale di letture troncate finora, il rapporto caratteri/token effettivo e i costi medi per turno. Query utile, da lanciare in sola lettura:
```sql
SELECT count(*) FILTER (WHERE blocchi::text LIKE '%testo troncato: il documento continua%') AS troncati,
       count(*) AS risultati_strumenti
FROM pro.chat_messaggio WHERE ruolo = 'user' AND testo IS NULL;
```
