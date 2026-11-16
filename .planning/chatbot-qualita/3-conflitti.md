# Chatbot PRO — conflitti tra norme e circolari

Stato: analisi e piano, nessuna modifica al codice o al DB. 16/11/2026.
Caso di partenza: "Conversione da studio a lavoro subordinato fuori quota: cosa serve?". Il bot ha risposto che la conversione rientra nelle procedure del DPCM flussi 2023, ha citato la Circ. Min. Interno 5969 del 27/10/2023 (`biz-1227`) e ha lasciato il fuori quota "da verificare".

Le citazioni tra virgolette vengono da testi letti in questa sessione: Normattiva (tramite `apri_norma`, anche a date di vigenza passate), KB `immigrazbot-norme` (`norme/dlgs286/vigente.md`, `norme/dpr-1999-394/testo.md`) e il testo delle circolari nel SQLite `Sito_Nuovo/data-pipeline/data/circolari.db`.

---

## 1. La risposta corretta

### 1.1 Art. 6, c. 1, d.lgs. 286/1998: testo vigente

Secondo periodo, testo vigente (Normattiva, "in vigore dal 23-6-2023"):

> "Quello rilasciato per motivi di studio e formazione può essere convertito, al di fuori delle quote di cui all'articolo 3, comma 4, comunque prima della sua scadenza, e previa stipula del contratto di soggiorno per lavoro ovvero previo rilascio della certificazione attestante la sussistenza dei requisiti previsti dall'articolo 26, in permesso di soggiorno per motivi di lavoro."

Nella KB il comma termina con "...." e Normattiva mostra "((...))": è il segno della soppressione descritta più sotto. La KB non dà né la data della modifica né l'atto che l'ha fatta.

### 1.2 Com'era prima (testo vigente al 1/1/2023, Normattiva)

> "Quello rilasciato per motivi di studio e formazione può essere convertito, comunque prima della sua scadenza, e previa stipula del contratto di soggiorno per lavoro ovvero previo rilascio della certificazione attestante la sussistenza dei requisiti previsti dall'articolo 26, in permesso di soggiorno per motivi di lavoro nell'ambito delle quote stabilite a norma dell'articolo 3, comma 4, secondo le modalità previste dal regolamento di attuazione."

### 1.3 Le due norme che l'hanno cambiato

1. **Art. 3, c. 2, d.l. 10 marzo 2023, n. 20** (conv. l. 5 maggio 2023, n. 50). Testo: "All'articolo 6, comma 1, secondo periodo, [...] dopo le parole: «può essere convertito,» sono aggiunte le seguenti: «al di fuori delle quote di cui all'articolo 3, comma 4,»". Su Normattiva la versione dell'art. 6 con l'inciso è "in vigore dal 11-3-2023". Per tre mesi il comma è rimasto contraddittorio: diceva "al di fuori delle quote" all'inizio e "nell'ambito delle quote" alla fine.
2. **Art. 24, c. 5, d.l. 22 giugno 2023, n. 75** (conv. l. n. 112/2023, estremi della legge di conversione presi dalla circolare 5969, non verificati su Normattiva). Testo: "All'articolo 6, comma 1, secondo periodo, del decreto legislativo 25 luglio 1998, n. 286 [...] le parole: «nell'ambito delle quote stabilite a norma dell'articolo 3, comma 4, secondo le modalità previste dal regolamento di attuazione» sono soppresse." Il testo vigente dell'art. 6 decorre dal 23-6-2023.

**Conclusione.** La conversione studio/formazione → lavoro è fuori quota dall'11/3/2023, e dal 23/6/2023 la contraddizione nel comma è eliminata. I requisiti scritti nella norma sono tre:
- domanda prima della scadenza del permesso per studio;
- contratto di soggiorno, per il lavoro subordinato;
- certificazione dei requisiti dell'art. 26, per il lavoro autonomo.

### 1.4 Il regolamento non è stato aggiornato: art. 14 d.P.R. 394/1999

Testo vigente (Normattiva, "in vigore dal 28-12-2022", identico nella KB al 29/10/2026). Il regolamento parla ancora di quote.

- **C. 6**: il permesso per studio "può essere convertito, prima della scadenza, in permesso di soggiorno per motivo di lavoro, nei limiti delle quote fissate a norma dell'articolo 3 del testo unico, e previa stipula del contratto di soggiorno per lavoro presso lo Sportello unico [...]". Lo stesso comma dice anche che per i corsi di formazione e i tirocini "la conversione è possibile soltanto dopo la conclusione del corso di formazione frequentato o del tirocinio svolto".
- **C. 5**: le quote dell'anno successivo "sono decurtate in misura pari al numero dei permessi di soggiorno per motivi di studio o formazione, convertiti [...]".

Su "nei limiti delle quote" il regolamento contrasta con la legge successiva. Per gerarchia delle fonti e per successione nel tempo prevale l'art. 6 TU. Le parti del c. 6 che non contrastano con la legge si possono ancora citare come prassi procedurale: Sportello unico, conversione solo dopo la fine del corso o del tirocinio. È una valutazione interpretativa e la risposta del bot deve presentarla come tale.

**Questo è il punto di progetto più importante.** Anche con uno strumento `leggi_norma`, un bot che legge l'art. 14 del DPR 394 senza una regola sulla gerarchia delle fonti darebbe ancora la risposta sbagliata.

### 1.5 La prassi ministeriale è allineata (ed era già nell'archivio)

- **Circ. Min. Interno 5969 del 27/10/2023 (`biz-1227`)**, cioè la stessa circolare citata dal bot. Al paragrafo 4 dice che la conversione dei permessi per studio e formazione (modelli VA e Z), "a seguito della novella normativa introdotta dapprima dal decreto legge n. 20/2023, [...] e poi dall'art. 24, comma 5 del decreto legge n. 75/2023, [...] non è più soggetta alla disponibilità di quote nell'ambito del decreto flussi e quindi al click day". Al paragrafo 2.6 aggiunge: "ipotesi non più soggetta al click day". Resta il parere dell'ITL (art. 30-bis d.P.R. 394/1999) "per tutte le ipotesi di conversione".
- **Circ. Min. Lavoro / Interno 9032 del 24/10/2024 (`biz-1242`)**: "Le richieste di conversione in studio /lavoro, fuori quota, per le quali non è previsto il click-day, non necessitano di una fase autonoma di precompilazione."

**Risposta attesa dal bot, in sintesi.** La conversione è fuori quota per legge (art. 6, c. 1, TU come modificato dal d.l. 20/2023 e dal d.l. 75/2023), senza click day, con i modelli VA (subordinato) o Z (autonomo) allo Sportello unico. Servono la domanda prima della scadenza, il contratto di soggiorno (o la certificazione ex art. 26 per l'autonomo) e il parere ITL. Per formazione e tirocinio la domanda va fatta dopo la fine del corso. Va segnalato che l'art. 14, cc. 5-6, d.P.R. 394/1999 e le circolari anteriori al 2023 (es. `biz-171` del 1999) parlano ancora di quote e su questo punto sono superati.

---

## 2. Perché il bot non ci è arrivato

In ordine di peso. Non ho potuto leggere la conversazione reale in `pro.chat_messaggio`: la lettura del DB Neon è stata negata in questa sessione. Le cause 1-3 sono quindi ricostruite dal codice e dai testi. Si possono confermare guardando i `tool_result` di quel turno.

### Causa 1 (principale): ha letto la circolare giusta, ma solo l'inizio

`leggi_circolare` tronca il testo a `TOOL_TEXT_CAP = 10_000` caratteri (`src/lib/chat-pro.ts:47`, `:182-190`). Nel SQLite `biz-1227` è lunga 55.522 caratteri. Il passaggio decisivo ("non è più soggetta [...] al click day") sta intorno al carattere 34.900, il paragrafo 2.6 intorno al 16.800. Gli offset in Neon possono essere un po' diversi, perché lì l'intestazione del sito è ripulita, ma restano ben oltre i 10.000.

Nei primi 10.000 caratteri il bot ha trovato la premessa: il DPCM "introduce [...] criteri specifici per i flussi di ingresso nell'ambito delle quote (art. 3) ed al di fuori delle quote (art. 4)". Lo snippet `ts_headline` (2 frammenti da 22 parole) prende facilmente il paragrafo 2.6 ("nell'ambito delle quote massime [...] la conversione"). Da qui la risposta: conversioni dentro il DPCM, fuori quota "da verificare".

Nell'archivio 370 documenti su 1.740 superano i 10.000 caratteri e 71 superano i 30.000. Questa parte va coordinata con la sessione parallela sul testo troncato (bot-troncato). Per questo piano basta una regola: un avviso di superamento non deve mai finire nella parte tagliata (vedi §3.3).

### Causa 2: nessuna norma

Il bot non ha strumenti per leggere le norme. Il primo comma dell'art. 6 TU risolve il caso in una riga. Ma, come detto al §1.4, lo strumento `leggi_norma` (sessione parallela) non basta senza la regola sulla gerarchia: l'art. 14 del DPR 394 dice ancora "nei limiti delle quote".

### Causa 3: il ranking di `cerca_circolari` premia le circolari vecchie

`src/lib/circolari.ts:140-142`:

```sql
ORDER BY ts_rank_cd(c.testo_tsv, websearch_to_tsquery('italian', $q)) DESC, c.data DESC NULLS LAST
```

- **Solo rilevanza.** La data conta solo a parità esatta di rank. `ts_rank_cd` senza flag di normalizzazione (default 0) non corregge per la lunghezza: i documenti lunghi con molte occorrenze vincono. Pesi: titolo A, oggetto B, testo C.
- **I documenti vecchi sono la maggioranza.** Nel corpus 47 documenti contengono insieme "conversion*", "studio" e "quot*". Quelli che dicono "fuori quota" sono 2 (`biz-1227`, `biz-1242`), e in entrambi la frase è sepolta oltre i 30.000 caratteri. Gli altri sono circolari flussi 2005-2022 sulle quote assegnate alle conversioni da studio ("2.579 quote per la conversione del permesso di soggiorno per studio/tirocinio...", `biz-265` del 2008; "Modello VA conversioni..." in `biz-746`, `biz-838`, `biz-896`, `biz-969`). Una query come "conversione studio lavoro quote" restituisce soprattutto queste.
- **La data arriva al modello** (`tipo — ente — data — n.`), ma il modello non sa che cosa significa quella data rispetto alle norme.
- **I filtri non aiutano.** `fuori_ambito` non è filtrato: 929 dei 1.739 documenti classificati sono fuori ambito ma possono comparire. `biz-1227` è classificata sui permessi flussi (`lavoro-subordinato-dopo-ingresso-con-visto-per-flussi`, ecc.), non su studio: se il modello filtra per lo slug del permesso per studio, non la trova.

### Causa 4: nessuna informazione su che cosa è superato

`pro.circolare` (`scripts/sql/002_pro_circolari.sql`) non ha campi su norme interpretate, stato o superamento. Il bot cita `biz-171` (23/12/1999: l'art. 14 "regolamenta la conversione [...] nei limiti delle quote di ingresso") come "superata" solo per l'età. Non può sapere da che cosa è superata, né che la circolare che la supera è proprio quella che ha già in mano.

### Causa 5: il prompt non dà una gerarchia delle fonti

`SYSTEM_PROMPT`, punto 4: "Le circolari possono essere superate da norme successive: indica sempre la data [...] (in particolare prima del Patto UE [...])". È un avviso generico, legato al Patto, senza regola operativa. Il punto 3 ("se gli strumenti non trovano una fonte, dillo") spinge verso "da verificare" invece che verso un'altra ricerca mirata. Si aggiungono `effort: "low"` e `MAX_TOOL_ROUNDS = 5`: poca spinta a cercare "fuori quota" come frase esatta, che avrebbe trovato `biz-1242`.

---

## 3. La soluzione

Quattro livelli, dal più rapido al più costoso. (a) e (c) parziale si possono fare subito. (b) è il lavoro vero.

### 3.1 (a) Regole di prompt: gerarchia delle fonti

Da sostituire al punto 4 attuale. Il testo è da limare con la sessione sulla forma delle risposte (bot-forma):

```
GERARCHIA DELLE FONTI (vincolante)
1. Ordine: regolamenti UE e norme UE direttamente applicabili > legge e atti con forza di legge (T.U. 286/1998, d.lgs., d.l. convertiti) > regolamento (d.P.R. 394/1999) > decreti ministeriali e DPCM > circolari, note, messaggi. Una circolare interpreta o applica la norma, non la modifica.
2. Per ogni domanda su requisiti, quote, durata, convertibilità o procedure: leggi PRIMA la norma vigente (`leggi_norma`) e POI le circolari. Se norma e circolare dicono cose diverse, prevale la norma vigente: dillo esplicitamente ("la circolare X del [data] è superata su questo punto da [norma], in vigore dal [data]").
3. Se il regolamento (d.P.R. 394/1999) contrasta con una norma di legge successiva, prevale la legge: segnala il contrasto, non usarlo come fonte di un requisito.
4. Una circolare anteriore all'ultima modifica dell'articolo che interpreta è POTENZIALMENTE superata: usala solo dopo aver controllato che la modifica non tocchi il punto, e dillo.
5. Rispetta l'avviso "Stato" restituito dagli strumenti (superata, parzialmente superata, efficacia esaurita, da verificare) e riportalo all'utente.
6. Fra due circolari sullo stesso punto, la più recente prevale salvo che dica il contrario.
7. "Da verificare" è una risposta ammessa solo dopo aver letto la norma vigente e cercato con almeno due formulazioni diverse (es. frase esatta tra virgolette: "fuori quota").
```

Il prompt resta in cache, quindi il costo è trascurabile. Le regole 2 e 3 dipendono da `leggi_norma`. Senza quello strumento, la regola 2 va scritta come "cerca la circolare più recente che citi la modifica normativa".

### 3.2 (b) Metadati sul superamento

**Dove.** Non in `pro.circolare`, che `import-circolari.mjs` riscrive a ogni import. Il modello da seguire è `classificazione.json`: un file versionato `Sito_Nuovo/data-pipeline/data/circolari-stato.json`, importato in Neon. Così la revisione umana sopravvive ai reimport e resta in git, nella stessa pipeline SQLite → cache → Neon.

**Schema Neon (nuovo script `scripts/sql/00N_pro_circolari_stato.sql`):**

```sql
-- Versioni degli articoli (da Normattiva multivigenza): quando è cambiato cosa.
CREATE TABLE pro.norma_articolo_versione (
  atto            text NOT NULL,      -- 'dlgs286' | 'dpr-1999-394' | 'dlgs25' ... (stessi id della KB immigrazbot-norme)
  articolo        text NOT NULL,      -- '6', '4-bis'
  comma           text,               -- NULL = intero articolo; '1', '1-bis' se il dato è per comma
  in_vigore_dal   date NOT NULL,
  in_vigore_al    date,               -- NULL = vigente
  atto_modificante text,              -- 'art. 24, c. 5, d.l. 75/2023' (testo libero, verificato)
  url             text,
  PRIMARY KEY (atto, articolo, coalesce(comma,''), in_vigore_dal)
);

-- Norme citate o interpretate da ciascuna circolare.
CREATE TABLE pro.circolare_norma (
  circolare_id  text NOT NULL REFERENCES pro.circolare(id) ON DELETE CASCADE,
  atto          text NOT NULL,
  articolo      text NOT NULL,
  comma         text,
  ruolo         text NOT NULL DEFAULT 'citata',   -- 'interpretata' (oggetto della circolare) | 'citata'
  metodo        text NOT NULL,                    -- 'regex' | 'llm' | 'umano'
  contesto      text,                             -- frase in cui compare (max 300 car.)
  PRIMARY KEY (circolare_id, atto, articolo, coalesce(comma,''))
);

-- Stato della circolare.
CREATE TYPE pro.stato_circolare AS ENUM
  ('vigente', 'da_verificare', 'parzialmente_superata', 'superata', 'efficacia_esaurita');

CREATE TABLE pro.circolare_stato (
  circolare_id  text PRIMARY KEY REFERENCES pro.circolare(id) ON DELETE CASCADE,
  stato         pro.stato_circolare NOT NULL,
  punti         jsonb NOT NULL DEFAULT '[]',
    -- [{ "punto": "conversione studio→lavoro entro le quote",
    --    "superato_da": [{"tipo":"norma","rif":"art. 6 c. 1 TU (art. 24 c. 5 d.l. 75/2023)","dal":"2023-06-23"},
    --                    {"tipo":"circolare","rif":"biz-1227"}] }]
  nota          text,                 -- una riga, mostrata al modello
  metodo        text NOT NULL,        -- 'auto-data' | 'llm' | 'umano'
  verificato_da text,                 -- NULL finché non c'è revisione umana
  verificato_at timestamptz
);
```

`efficacia_esaurita` serve per gli atti a efficacia temporale: ripartizioni annuali delle quote, click day di un anno, emersioni chiuse. Non sono "superati" da una norma, sono finiti. Tra i documenti in ambito sono il gruppo più numeroso tra quelli datati (vedi §4).

**Come popolarli: pipeline in 5 passi.**

1. **Versioni degli articoli (automatico, una tantum più aggiornamento).** Uno script legge da Normattiva la multivigenza degli articoli di TU 286 e DPR 394, e poi di d.lgs. 25/2008, 142/2015, 251/2007, 30/2007: circa 300 articoli. La KB `immigrazbot-norme` ha già `storico.md` scaricato dalla multivigenza Normattiva, ma solo per pochi commi (15 righe `storico` nell'`INDICE`). Conviene estendere quell'export (pipeline IMMIGRAZBOT `src/export_norme.py`) invece di scriverne uno nuovo, così la KB e il bot usano lo stesso dato. `apri_norma` restituisce già `in_vigore_dal` per articolo (art. 6 TU: 23-6-2023; art. 14 DPR 394: 28-12-2022): basta come prima approssimazione. Il dettaglio per comma e l'atto modificante si ricavano dalle parti `(( ))` e dal confronto tra versioni.
2. **Estrazione delle norme citate (regex, automatico).** Si cercano pattern `art./articolo N [comma M] ... d.lgs. 286/1998 | T.U. | testo unico | d.P.R. 394/1999 | regolamento di attuazione | d.lgs. 25/2008 ...`. Una prova grezza in questa sessione trova coppie (atto, articolo) in 404 documenti. 992 documenti contengono almeno "art. N", 373 citano "286". La regex sbaglia su "art. 3 co. 4 del T.U." spezzato su più paragrafi (cfr. `normalize-report.md`: il 28,8% dei paragrafi finiva con un'abbreviazione troncata), quindi va eseguita sul `testo_piano` già normalizzato.
3. **Passaggio LLM (automatico, in batch).** Per ogni documento in ambito il modello estrae:
   - le norme *interpretate*, cioè l'oggetto della circolare, distinte da quelle solo citate;
   - i rinvii impliciti ("il regolamento", "la norma in esame");
   - 1-5 "punti" normativi in una riga (es. "conversione studio→lavoro: entro le quote");
   - le dichiarazioni di superamento presenti nel testo ("non è più soggetta", "abrogato", "la circolare n. X è superata").

   Si riusa lo schema di lavoro già usato per `circolari-meta/PROMPT.md` e `classify/`: batch JSON in, JSON out, revisione a campione.
4. **Regola automatica sulla data (deterministica).** Se una norma *interpretata* ha una versione con `in_vigore_dal` posteriore alla data della circolare, lo stato è `da_verificare`, con la nota "l'art. X è stato modificato il [data] da [atto]". Un secondo passaggio LLM confronta il punto della circolare con il testo dell'articolo prima e dopo la modifica, e propone `vigente`, `parzialmente_superata` o `superata`, con il riferimento. Le circolari che dichiarano di superarne altre (passo 3) generano il collegamento inverso `superato_da: {tipo: circolare}`.
5. **Revisione umana (Alberto o un collaboratore).** Prima i documenti più usati dal bot (conteggio dei `leggi_circolare` e `cerca_circolari` nei log `pro.chat_messaggio`), poi quelli sugli articoli più usati (art. 5, 6, 9, 22, 27, 32 TU; artt. 14, 30-bis DPR 394). La revisione parte dalla proposta LLM già compilata e si limita a conferma o correzione: `metodo='umano'`, `verificato_da`. Solo lo stato `superata` *verificato* abbassa il ranking. Gli stati automatici producono solo un avviso.

### 3.3 (c) Gli strumenti restituiscono l'avviso

- **`cerca_circolari`**: sotto ogni risultato una riga `Stato: ⚠ parzialmente superata — conversione studio→lavoro entro le quote: superato da art. 6 c. 1 TU (d.l. 75/2023, dal 23/6/2023); vedi biz-1227`. Per `da_verificare`: `Stato: da verificare — cita art. 6 TU, modificato dopo questa circolare (23/6/2023)`.
- **`leggi_circolare`**: l'avviso va in testa, prima del testo, così non finisce mai nella parte tagliata. Inoltre: "Documenti che la superano: biz-1227 (27/10/2023)".
- **Ranking**:
  - normalizzare il rank per lunghezza (`ts_rank_cd(..., 32)` oppure flag 1|32);
  - moltiplicare per un fattore di recenza dolce (es. `1 / (1 + anni_dalla_data / 10)`);
  - abbassare `superata` ed `efficacia_esaurita` verificate (×0,3, non escluse);
  - escludere `fuori_ambito` dalla ricerca del bot salvo richiesta esplicita.

  Pesi da tarare sul test del §3.4.
- **Nuovo parametro facoltativo `dal_anno`** in `cerca_circolari`. Il prompt lo suggerisce per le domande su "oggi".
- **Lato `leggi_norma` (sessione parallela)**: restituire `in vigore dal` e l'atto modificante dell'ultima versione, più l'elenco delle circolari in archivio che interpretano quell'articolo, con il loro stato. Così il modello vede il conflitto da tutte e due le parti.

### 3.4 (d) Test di regressione

Script `scripts/eval-chat-pro.ts`. Esegue `runChatTurn` contro il branch Neon dev su un file `scripts/eval/conflitti.json`. Per ogni caso controlla in modo deterministico le fonti citate e le parole obbligatorie o vietate. Un giudice LLM con rubrica (prevale la norma? segnala la circolare superata?) valuta il resto. Si esegue a ogni modifica di prompt, strumenti o ranking. Costo: un turno per caso.

| # | Domanda | Fonte datata nell'archivio | Atteso |
|---|---|---|---|
| 1 | Conversione da studio a lavoro subordinato fuori quota: cosa serve? | `biz-171` (1999), `biz-265` (2008), DPR 394 art. 14 cc. 5-6 | Fuori quota (art. 6 c. 1 TU; d.l. 20/2023 e d.l. 75/2023); niente click day; cita `biz-1227` o `biz-1242`; **vietato** "da verificare" sul fuori quota; segnala il contrasto con il DPR |
| 2 | Per convertire da studio a lavoro autonomo serve il click day (modello Z)? | `biz-746`, `biz-838`, `biz-896`, `biz-969` (2012-2016) | No; cita `biz-1227`; le circolari 2012-2016 sono "efficacia esaurita" |
| 3 | Le conversioni da studio vengono scalate dalle quote dell'anno dopo? | `biz-42` (2005), DPR 394 art. 14 c. 5 | Segnala che l'art. 14 c. 5 contrasta con l'art. 6 c. 1 vigente; prevale la legge; tono prudente |
| 4 | Il permesso per protezione speciale si converte in lavoro? | `biz-1173` (30/10/2020: "potranno essere convertiti [...] i permessi per protezione speciale, per calamità [...]") | Lett. a) dell'art. 6 c. 1-bis abrogata dal d.l. 20/2023 (Normattiva, versione dal 6-5-2023); regime transitorio da leggere (art. 7 d.l. 20/2023, **non letto in questa sessione**) |
| 5 | Il permesso per calamità è convertibile in lavoro? | `biz-1173` | Lett. b) abrogata dal d.l. 20/2023 |
| 6 | Il permesso per cure mediche art. 19 c. 2 lett. d-bis si converte in lavoro? | `biz-1173` | Lett. h-bis) abrogata dal d.l. 20/2023 |
| 7 | (controllo) Per la conversione studio/lavoro serve la precompilazione? | — | No, secondo `biz-1242` (2024); **nessun** falso avviso "superata" su `biz-1242` |
| 8 | (controllo) Quante ore può lavorare chi ha un permesso per studio? | — | Art. 14 c. 4 DPR 394 ("20 ore settimanali [...] 1.040 ore"): il DPR va citato normalmente dove non c'è conflitto |

Casi candidati, da confermare con Alberto prima di inserirli:
- durata dei rinnovi del permesso per lavoro a tempo indeterminato, autonomo e famiglia: l'art. 4 d.l. 20/2023, letto, aggiunge "Ciascun rinnovo non può superare la durata di tre anni" all'art. 5, cc. 3-bis lett. c), 3-quater e 3-sexies TU. Le circolari anteriori sul rinnovo non sono state cercate;
- un caso pre/post Patto (12/6/2026) dalla sessione bot-norme.

---

## 4. Stima del lavoro per (b)

**Il corpus.** Il SQLite ha 2.161 righe, di cui 1.740 incluse nel corpus (Neon dichiara "oltre 1.900": il conteggio esatto va verificato in Neon). Su 1.739 documenti classificati, 929 sono `fuori_ambito`: restano **circa 810 documenti in ambito**. 1.672 su 1.740 sono anteriori all'11/3/2023. Per decennio: 2000-2009 673, 2010-2019 856, 2020- 162, prima del 2000 40. Il testo complessivo è di 13,6 milioni di caratteri (circa 3,5 milioni di token), con una media di 7.800 caratteri per documento.

| Passo | Automatico / a mano | Lavoro di sviluppo | Note |
|---|---|---|---|
| 1. Versioni articoli TU, DPR 394, d.lgs. 25/142/251/30 | automatico | 1-1,5 g | Si estende l'export multivigenza IMMIGRAZBOT; controllo a campione su 20 articoli |
| 2. Regex sulle norme citate | automatico | 0,5 g | Tutti i 1.740; buon richiamo su "art. N d.lgs. 286", debole su "T.U." e sui rinvii impliciti |
| 3. Passaggio LLM: norme interpretate, punti, auto-superamento | automatico | 1 g più l'esecuzione batch | Solo gli 810 in ambito, circa 1,6 milioni di token in input; costo da calcolare sul listino in vigore (Batch API) |
| 4a. Regola sulla data → `da_verificare` | automatico | 0,5 g | Previsione: la maggior parte dei documenti in ambito anteriori al 2023 sarà marcata, perché gli articoli più citati (5, 6, 22, 27) sono stati modificati nel 2023-2026. Per questo la regola produce solo un avviso, non un declassamento |
| 4b. Confronto LLM punto ↔ testo prima/dopo → proposta di stato | automatico | 1 g | Riduce il segnale a quello utile; la precisione si misura su 50 documenti rivisti a mano |
| 4c. `efficacia_esaurita` per gli atti annuali (quote, click day, emersioni) | semi-automatico | 0,5 g | Temi "quote/flussi" ≈ 142 documenti, emersioni ≈ 80; si marcano in blocco per tema e anno, con conferma a campione |
| 5. Revisione umana | **a mano** | — | Alberto, partendo dalle proposte precompilate: circa 2-4 minuti a documento. I primi 150 (più usati dal bot più articoli caldi) ≈ 5-10 ore. Tutti gli 810 in ambito ≈ 30-50 ore: non necessario, si procede per priorità |
| Import in Neon, avvisi negli strumenti, ranking | automatico | 1 g | §3.3 |
| Test di regressione §3.4 | automatico | 0,5-1 g | Sul branch dev |

**Totale sviluppo:** circa 7-8 giorni-sviluppatore, più 5-10 ore di revisione di Alberto per la prima tornata.

**Che cosa resta solo a mano:** il giudizio "superata / parzialmente superata" sui documenti che il bot usa davvero, e i casi in cui il superamento viene da giurisprudenza e non da una norma (non coperti da questo schema: `superato_da.tipo = 'sentenza'` è previsto, ma si popola solo a mano).

**Ordine consigliato:**
1. Subito: prompt (§3.1), avviso in testa a `leggi_circolare`, ranking normalizzato più recenza, test 1-3 e 7-8. Questo risolve già il caso segnalato insieme a `leggi_norma` e alla correzione del troncamento.
2. Poi: passi 1-4 della pipeline.
3. Infine: la revisione umana per priorità.

---

## Riassunto

1. La conversione studio → lavoro è fuori quota dall'11/3/2023 (art. 3, c. 2, d.l. 20/2023). Dal 23/6/2023 l'art. 24, c. 5, d.l. 75/2023 ha tolto il residuo "nell'ambito delle quote" dall'art. 6, c. 1, TU. L'art. 14, cc. 5-6, DPR 394 parla ancora di quote ma cede alla legge.
2. La circolare citata dal bot (`biz-1227`, 5969/2023) dice proprio questo, ma intorno al carattere 35.000, mentre `leggi_circolare` ne mostra solo 10.000. La causa principale è il troncamento, non la circolare.
3. Le altre cause: nessuno strumento per le norme; ranking solo per rilevanza, senza normalizzazione per lunghezza né peso alla data, quindi dominato dalle circolari flussi 2005-2022; nessun metadato di superamento; prompt senza gerarchia delle fonti.
4. La soluzione: regole di gerarchia nel prompt; tabelle `norma_articolo_versione`, `circolare_norma` e `circolare_stato` popolate da Normattiva, regex e LLM, con revisione umana mirata; avvisi in testa ai risultati degli strumenti e ranking corretto; 8 casi di test (6 di superamento, 2 di controllo).
5. Stima: circa 7-8 giorni di sviluppo, più 5-10 ore di revisione di Alberto sulle prime 150 circolari. Degli 810 documenti in ambito, la rilevazione si fa in automatico; il giudizio finale su quelli più usati resta umano.
