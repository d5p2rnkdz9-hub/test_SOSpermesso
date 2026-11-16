# Chatbot PRO — 2. Testo delle norme vigenti

Data: 16/11/2026. Solo analisi e piano: nessuna modifica al codice, nessuna scrittura su DB.

Caso di partenza: "Conversione da studio a lavoro subordinato fuori quota: cosa serve?". Il bot ha risposto "conviene verificare il testo vigente dell'art. 6, c. 1, d.lgs. 286/1998 e dell'art. 14 DPR 394/1999", cioè ha chiesto all'utente di fare un controllo che toccava a lui.

---

## 1. Causa: il bot non ha accesso al testo delle norme

Confermato leggendo il codice.

- **`src/lib/chat-pro.ts`** espone tre strumenti: `cerca_circolari`, `leggi_circolare`, `scheda_permesso`. Nessuno legge una norma. Il prompt (regola 3) dice: "Puoi indicare quale norma o fonte andrebbe verificata". Il bot ha seguito questa istruzione alla lettera.
- **`pro-content.generated.ts`** (schede PRO, `aggiornato_al: 2026-07`, `draft: true`) copre **solo 3 permessi**: lavoro subordinato da flussi, protezione speciale, UE soggiornanti di lungo periodo. Le sue `norme` sono 41 voci del tipo `{fonte, estremi, oggetto, url}` (es. "art. 6, co. 1-bis, lett. a)"). Sono **solo riferimenti**: niente testo degli articoli. `base_giuridica` e `convertibilita` sono riassunti scritti da noi. Nella scheda flussi si legge ancora che la conversione da studio avviene "generalmente nei limiti delle quote flussi, salvo le eccezioni… per chi ha conseguito un titolo di laurea in Italia". È la regola **anteriore** al d.l. 20/2023. Il bot rischia quindi di ripetere un errore che sta nella nostra stessa scheda.
- **`permits-kb.generated.ts`** (38 schede pubbliche del sito, scritte in linguaggio semplice) contiene 4 citazioni di articoli in tutto e nessun testo normativo. La scheda `studio-dopo-ingresso-con-visto` dice solo "puoi chiedere solo la conversione in permesso per lavoro, con il nulla osta" e non parla di quote.
- **`pro.circolare`** (Neon) contiene circolari, prassi e qualche decreto, ma non i testi coordinati delle leggi.

Conclusione: per un requisito di legge il bot può citare solo circolari, che a volte sono superate, oppure le nostre sintesi. La norma non la legge mai.

---

## 2. Cosa c'è nella KB immigrazbot-norme

Percorso: `~/.claude/plugins/marketplaces/immigrazbot-kb/plugins/immigrazbot-norme/`. Plugin versione `2026.1102.0`, file sincronizzati il 16/11/2026. È generata dalla pipeline IMMIGRAZBOT (`src/export_norme.py`) a partire da SOS Patto, Normattiva ed EUR-Lex. Il README avverte: "non modificare i file".

### Formato

| Elemento | Contenuto |
|---|---|
| `norme/<atto>/` | 101 atti, 14 MB in totale. Per i d.lgs. toccati dal Patto (`dlgs286`, `dlgs25`, `dlgs142`, `dlgs251`): `vigente.md` + `previgente.md` (+ `storico.md` per `dlgs286` e `dlgs25`). Per tutti gli altri atti: `testo.md`. |
| `_atto.md` | frontmatter (`atto`, `titolo`, `fonte`, `testo_base_al`, `coordinato_con`, `versioni`, `n_articoli`), legenda, avvertenze, indice degli articoli con le righe di inizio e fine |
| Articolo | sezione `## Art. N — rubrica` con metadati in elenco: `partizione`, `stato` (modificato o no dal d.l. 100), `url_sospatto`/`url_normattiva`/`url_eurlex`, `rinvii` (✓ = verificato), `rinviato da`, `AVVERTENZA` |
| Riga | ogni comma o lettera su una riga con il suo tag: `[dlgs286 art.6 c.1]`, `[dpr-1999-394 art.14 c.1 lett.c-bis]`, `[dlgs286 art.6 c.1 PREVIGENTE]`, `[dlgs286 art.19 c.1.1 VIG:2020-12-20..2023-03-10]` |
| `INDICE-norme.tsv` | 4.545 righe, una per articolo e versione: `atto, art, rubrica, versione, file, url, n_rinvii_out, n_rinvii_in, riga_inizio, riga_fine` |
| `RINVII.tsv` | 17.780 rinvii già risolti verso il file di destinazione, con il contesto |
| `concordanze/` | tavole ufficiali di corrispondenza fra vecchi e nuovi atti UE (2013/32→1348 ecc.) |

**Versioni.** Il nome `previgente` inganna. Indica il testo **prima del d.l. 100/2026**, non una data qualsiasi, e c'è solo per gli articoli che quel decreto ha toccato. La multivigenza vera (`storico.md`, ricavata da Normattiva il 1/11/2026) copre soltanto art. 5 c. 6 e art. 19 cc. 1-1.2 del TUI e art. 32 del d.lgs. 25. Per le altre date bisogna usare il link Normattiva `!vig=AAAA-MM-GG`.

**Rinvii.** Sono risolti. Esempio: TUI art. 6 risulta "rinviato da … dpr-1999-394 art.14 …", e art. 14 DPR 394 rinvia a "dlgs286 art.6 c.1". Questo legame serve proprio al caso in esame.

**Come la interroga la skill `ricerca-norme`** (SKILL.md, 22 KB):
- trova la riga dell'articolo con `awk` su `INDICE-norme.tsv` e la legge con `sed -n` (mai l'atto intero);
- per un tema cerca con `grep` la parola nuda, poi i rinvii, e conta i risultati per articolo;
- cita solo dal tag della riga;
- chiede all'utente il regime pre o post Patto.

L'app non può riusare la skill così com'è, perché usa la shell. Può però riusarne la struttura: indice, tag di riga, rinvii.

**Provenienza e licenza.** I testi di legge italiani vengono da Normattiva e sono atti ufficiali dello Stato, esclusi dal diritto d'autore (art. 5 l. 633/1941). I testi coordinati con il d.l. 100/2026 sono di SOS Patto, progetto dello Studio. Gli atti UE vengono da EUR-Lex (riuso libero citando la fonte, dec. 2011/833/UE). Per Ginevra e CEDU si usano traduzioni UNHCR, RS svizzera e Corte EDU, da attribuire. Tutti i testi italiani sono **non ufficiali**: fa fede la GU, e il bot deve dirlo.

### Aggiornamento degli atti utili al PRO

| Atto (cartella) | Testo al | Note |
|---|---|---|
| d.lgs. 286/1998 (`dlgs286`) | **4/6/2026** (Normattiva) + art. 12 d.l. 100/2026 + art. 8 d.lgs. 115/2026 | tutti gli articoli 1-49 con bis/ter (79); vigente + previgente + storico |
| d.P.R. 394/1999 (`dpr-1999-394`) | **29/10/2026** (Normattiva) | 75 articoli, versione unica |
| d.lgs. 25/2008 (`dlgs25`) | 25/4/2026 + art. 11 d.l. 100 + d.lgs. 115 | vigente + previgente + storico (art. 32) |
| d.lgs. 142/2015 (`dlgs142`) | **24/5/2025** + art. 10 d.l. 100 + d.lgs. 115 | base vecchia: le modifiche fra 5/2025 e 6/2026 estranee al d.l. 100 potrebbero mancare. Da verificare |
| d.lgs. 251/2007 (`dlgs251`) | **5/5/2023** | "non modificato dal d.l. 100". Da verificare che non ci siano modifiche successive |
| d.lgs. 30/2007, l. 47/2017, d.lgs. 24/2014, d.lgs. 150/2011, l. 241/1990, d.P.R. 21/2015 | 29/10/2026 | Normattiva |
| d.l. 100/2026, d.l. 168/2026, d.lgs. 115/2026 | testo originario con note sulle modifiche successive | d.l. 168 ancora in corso di conversione al momento dell'export |
| dir. 2024/1233, 2016/801, 2021/1883, 2003/86, 2003/109 | EUR-Lex consolidato | |

**Mancano** atti che servono a un operatore PRO: d.l. 20/2023 (le sue disposizioni non novellistiche), d.l. 145/2024 e 146/2025 (stessa cosa), d.lgs. 83/2026 (permesso unico, applicabile dal 22/5/2026, già recepito nel testo del TUI), d.P.C.M. flussi 2/10/2025, l. 91/1992 (cittadinanza), d.P.R. 179/2011 (accordo di integrazione), d.m. 4/6/2010 (test A2), l. 184/1983.

### Controllo sul caso: art. 6 c. 1 TUI e art. 14 DPR 394

Ho confrontato il testo della KB con Normattiva interrogata oggi (strumento `apri_norma`) e con la cache Normattiva in `~/.claude/plugins/data/ricerca-ga-inline/cache/norme`, che contiene 38 articoli, fra cui 5 versioni dell'art. 6.

- **Art. 6 c. 1 TUI: la KB è aggiornata.** Normattiva lo dà in vigore dal **23/6/2023** e senza modifiche successive. Il testo della KB coincide: "Quello rilasciato per motivi di studio e formazione puo' essere convertito, al di fuori delle quote di cui all'articolo 3, comma 4, comunque prima della sua scadenza, e previa stipula del contratto di soggiorno per lavoro ovvero previo rilascio della certificazione attestante la sussistenza dei requisiti previsti dall'articolo 26, in permesso di soggiorno per motivi di lavoro ....". Le versioni intermedie confermano i passaggi: dall'11/3/2023 (d.l. 20/2023) viene inserito "al di fuori delle quote"; dal 23/6/2023 viene soppressa la coda "nell'ambito delle quote… secondo le modalità previste dal regolamento di attuazione". Il `....` finale è la soppressione che Normattiva indica con `((...))`: non è un testo troncato. Lo stesso vale per il c. 1-bis (lett. a, b e h-bis abrogate dal d.l. 20/2023).
- **Art. 14 DPR 394: la KB è aggiornata.** Normattiva lo dà in vigore dal **28/12/2022** e il testo della KB al 29/10/2026 coincide. Il punto decisivo è che **il c. 6 dice ancora "nei limiti delle quote fissate a norma dell'articolo 3 del testo unico"**. Il regolamento non è stato adeguato alla legge del 2023. Un bot che legge solo il regolamento sbaglia; uno che legge entrambi deve segnalare il disallineamento. La prevalenza della legge, fonte superiore e successiva, va validata da Alberto prima di scriverla nel prompt.
- Ho controllato anche TUI art. 5, 22 e 32: KB e Normattiva coincidono. Art. 5 e 22 sono in vigore dal 4/6/2026, art. 32 dal 5/12/2023. Sono recepite le modifiche del d.lgs. 83/2026, per esempio i "novanta giorni" dell'art. 5 c. 4.
- I refusi "ann o" e "idenlita'" (art. 6 cc. 3-4) sono già in Normattiva.

**Difetti della KB da correggere prima di passare i testi al modello:**
1. `....` e `...` (soppressioni) sembrano un testo troncato: il modello può pensare che manchi qualcosa e rimandare alla verifica. Nell'import vanno sostituiti con `[parole soppresse dal legislatore]`.
2. Errore nella divisione delle righe: in DPR 394 art. 14 c. 1 la lett. c-bis è spezzata, e la sua seconda metà ha un tag falso `[dpr-1999-394 art.14 c.1 lett.a]` (il testo "a) e a-bis), consentono…" viene letto come nuova lettera a). Nel DPR ci sono 34 righe `lett.a` da controllare. Va corretto in `export_norme.py` (la KB è generata e non si modifica a mano). Nell'import serve un controllo: se una lettera torna indietro nell'ordine dentro lo stesso comma, la riga si unisce alla precedente e si registra un avviso.
3. Per le modifiche estranee al Patto la KB non dice da quale norma vengono: per l'art. 6 manca "modificato dal d.l. 20/2023". La data `vigente_dal` di ogni articolo si può aggiungere con la sincronizzazione (§5).

---

## 3. Schema dei dati: Neon `pro.norma_*`

**Scelta: tabelle Neon nello schema `pro`, non JSON nel pacchetto dell'app.** Motivi:
- la ricerca full-text in italiano esiste già per le circolari (`websearch_to_tsquery('italian')`, `ts_headline`) e si riusa;
- i testi si aggiornano senza ripubblicare l'app;
- il pacchetto della funzione Netlify non si appesantisce: il corpus di base pesa circa 2,3 MB di testo.

Lo svantaggio è che ogni lettura costa una query, ma le circolari funzionano già così. La KB sta sul Mac di Alberto e non nel repo, quindi l'import parte da lì come per le circolari.

```sql
-- scripts/sql/007_pro_norme.sql
CREATE TABLE IF NOT EXISTS pro.norma_atto (
  atto            text PRIMARY KEY,        -- id KB: 'dlgs286', 'dpr-1999-394', 'dir-2024-1233'
  titolo          text NOT NULL,           -- 'Decreto legislativo 25 luglio 1998, n. 286 (T.U. immigrazione)'
  sigla           text NOT NULL,           -- 'TUI' / 'd.lgs. 286/1998' (per il modello e le citazioni)
  alias           text[] NOT NULL DEFAULT '{}', -- 'tui','286/1998','dlgs 286','testo unico immigrazione'
  fonte_url       text,
  testo_base_al   date,                    -- frontmatter testo_base_al
  coordinato_con  text,                    -- 'art. 12 d.l. 100/2026; art. 8 d.lgs. 115/2026'
  versioni        text[] NOT NULL,         -- {'vigente','previgente','storico'} | {'unica'}
  avvertenze      text,                    -- sezione Avvertenze di _atto.md
  ufficiale       boolean NOT NULL DEFAULT false,
  kb_versione     text NOT NULL,           -- '2026.1102.0'
  importato_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pro.norma_articolo (
  atto            text NOT NULL REFERENCES pro.norma_atto(atto) ON DELETE CASCADE,
  art             text NOT NULL,           -- '6', '14', '39-bis.1', '5-bis'
  versione        text NOT NULL,           -- 'vigente' | 'previgente' | 'unica' | 'storico:2020-10-22..'
  vig_dal         date,                    -- solo storico (o da sync Normattiva, §5)
  vig_al          date,
  ordine          int NOT NULL,            -- posizione nell'atto (per "articolo successivo")
  rubrica         text,
  partizione      text,
  stato           text,                    -- 'non modificato dal d.l. 100/2026…' / 'modificato' / 'inserito'
  url             text,                    -- url_normattiva | url_sospatto | url_eurlex
  avvertenza      text,
  rinvii          text[] NOT NULL DEFAULT '{}',   -- 'dlgs286 art.3 c.4', già nella grammatica dei tag
  rinviato_da     text[] NOT NULL DEFAULT '{}',
  righe           jsonb NOT NULL,          -- [{tag:'dlgs286 art.6 c.1', c:'1', lett:null, testo:'…'}]
  testo_piano     text NOT NULL,           -- righe unite, soppressioni rese esplicite
  testo_tsv       tsvector GENERATED ALWAYS AS (
                    setweight(to_tsvector('italian', coalesce(rubrica,'')), 'A') ||
                    setweight(to_tsvector('italian', testo_piano), 'C')) STORED,
  normattiva_vigente_dal date,             -- da sync (§5): data dell'ultima modifica secondo Normattiva
  normattiva_controllo_at timestamptz,     -- ultimo confronto riuscito
  normattiva_diverso boolean,              -- true = il testo Normattiva di oggi differisce: AVVISO al modello
  PRIMARY KEY (atto, art, versione)
);
CREATE INDEX IF NOT EXISTS norma_articolo_tsv_idx ON pro.norma_articolo USING gin (testo_tsv);
```

Accenti. Normattiva scrive `e'`, `liberta'`. Nell'import, `testo_piano` va normalizzato con le vocali accentate (`liberta'` → `libertà`), così la ricerca italiana trova le parole. In `righe` resta il testo originale, che è quello da citare.

**Dimensioni.** Corpus di base (19 atti, sotto): 2,26 M caratteri, 6.109 righe con tag, circa 1.000 articoli e versioni. In Neon, con jsonb, testo piano e tsvector, sono circa 8-10 MB. L'intera KB (101 atti) arriverebbe a circa 35 MB. Lo spazio Neon non è un problema.

---

## 4. Script di import: `scripts/import-norme.mjs`

Segue lo schema di `import-circolari.mjs`.

```
node --env-file=.env.local scripts/import-norme.mjs [--prod] [--kb <dir>] [--atti dlgs286,dpr-1999-394,…] [--dry-run]
```

1. **Trova la KB**: usa `--kb`, poi `NORME_KB_DIR`, poi il percorso standard del marketplace, poi una ricerca di `INDICE-norme.tsv` come al §0 della skill. Legge `kb_versione` da `.claude-plugin/plugin.json`.
2. **Per ogni atto**: legge il frontmatter e le avvertenze di `_atto.md`; dall'indice prende `riga_inizio` e `riga_fine` per ogni articolo e versione; estrae la sezione dal file e i metadati; analizza le righe con la regex del tag `^\[(\S+) art\.(\S+)(?: c\.(\S+))?(?: lett\.(\S+))?(?: n\.(\S+))?(?: (PREVIGENTE|VIG:\S+))?\] (.*)$`.
3. **Pulizia** (nella copia in DB, la KB non si tocca): `....`/`...` diventano `[parole soppresse dal legislatore]`; la lettera che torna indietro nell'ordine si unisce alla riga precedente, con avviso nel log; le note redazionali `⟨novella: …⟩` e `(comma soppresso: …)` restano ma segnate come tali; si toglie la normalizzazione degli accenti solo da `testo_piano`.
4. **Upsert** per `(atto, art, versione)` in batch da 100, dentro una transazione per atto. Gli articoli spariti dalla KB si cancellano solo per gli atti importati in quel giro.
5. **Report**: articoli per atto, avvisi di pulizia, differenze rispetto all'import precedente (articoli il cui `testo_piano` è cambiato). È il registro delle modifiche normative da mostrare ad Alberto.
6. Prima in dev, poi `--prod` solo dopo la sua approvazione.

**Primo lotto (19 atti, circa 2,3 MB).** TUI `dlgs286` (vigente + previgente + storico), `dpr-1999-394`, `dlgs25`, `dlgs251`, `dlgs142`, `dlgs30`, `dl100`, `dl168`, `dlgs115`, `dpr-2015-21`, `legge-2017-47` (MSNA), `dlgs24`, `dlgs150`, `legge-1990-241`, e le direttive del lavoro e della famiglia `dir-2024-1233`, `dir-2016-801`, `dir-2021-1883`, `dir-2003-86`, `dir-2003-109`.
**Secondo lotto:** atti del Patto 1346-1359 e 2280, Costituzione, CEDU, Carta UE, Ginevra. Servono meno agli sportelli e di più agli avvocati.
**Da aggiungere alla pipeline IMMIGRAZBOT** (non scrivere un secondo scraper nell'app): d.l. 20/2023, d.l. 145/2024, d.l. 146/2025, d.lgs. 83/2026, l. 91/1992, d.P.R. 179/2011, d.P.C.M. flussi 2/10/2025, d.m. 4/6/2010.

---

## 5. Come tenerla aggiornata

- **Fonte unica = KB immigrazbot-norme.** Quando il plugin cambia versione (`kb_versione`), si rilancia `import-norme.mjs --prod`. Il report di differenze (§4.5) dice quali articoli sono cambiati. È lo stesso flusso manuale delle circolari, e si può aggiungere alla checklist del deploy.
- **Sentinella Normattiva** (`scripts/sync-norme-normattiva.mjs`, mensile, eseguita in locale e non su Netlify): per ogni articolo degli atti italiani del primo lotto (circa 450 richieste, con pausa fra l'una e l'altra) scarica il vigente da Normattiva (`…~artN!vig=`, la stessa chiamata di `apri_norma`), confronta il testo normalizzato e scrive `normattiva_vigente_dal`, `normattiva_controllo_at`, `normattiva_diverso`. Se `normattiva_diverso = true`, lo strumento lo dice al modello e la segnalazione arriva ad Alberto, che aggiorna la KB a monte. **Non** si sovrascrive il testo da Normattiva: i testi coordinati con il d.l. 100 sono più avanti di Normattiva, perché le novelle del Patto non sono tutte consolidate.
- **Cosa riceve il modello**: in testa a ogni lettura una riga del tipo "Testo vigente al 4/6/2026 (Normattiva), coordinato con art. 12 d.l. 100/2026 e art. 8 d.lgs. 115/2026; ultimo controllo Normattiva: 2/11/2026, nessuna differenza. Testo non ufficiale: fa fede la GU." Così può dire all'utente "testo vigente al…" invece di "conviene verificare".

---

## 6. Gli strumenti

### `leggi_norma`

```ts
{
  name: "leggi_norma",
  description:
    "Legge il testo di un articolo di legge o regolamento in materia di immigrazione (testo vigente coordinato, con data di aggiornamento). Usalo SEMPRE prima di affermare un requisito, un termine o una procedura previsti da una norma. Restituisce le righe con il loro riferimento (es. [dlgs286 art.6 c.1]), i rinvii ad altre norme e gli articoli che lo richiamano.",
  input_schema: {
    type: "object",
    properties: {
      atto: { type: "string", description: "Id dell'atto dall'elenco ATTI NORMATIVI del prompt (es. \"dlgs286\", \"dpr-1999-394\"). Accetta anche \"TUI\", \"286/1998\", \"dpr 394/1999\"." },
      articolo: { type: "string", description: "Numero dell'articolo: \"6\", \"14\", \"39-bis.1\", \"5 bis\"." },
      comma: { type: "string", description: "Facoltativo: solo questo comma (\"1\", \"1-bis\"). Se manca, l'articolo intero." },
      versione: { type: "string", enum: ["vigente", "previgente"], description: "previgente = testo prima del d.l. 100/2026 (Patto UE), solo per gli articoli che il decreto ha modificato. Default vigente." },
      data: { type: "string", description: "Facoltativo, AAAA-MM-GG: testo in vigore a quella data, se disponibile in versione storica." }
    },
    required: ["atto", "articolo"]
  }
}
```

**Come risponde:**
- **Intestazione**: titolo dell'atto, art., rubrica, versione, "Testo vigente al …", coordinamento, esito della sentinella, link `url`, "Testo non ufficiale: fa fede la GU". Poi `AVVERTENZA` e `stato`, se ci sono.
- **Corpo**: le righe con il loro tag, `[dlgs286 art.6 c.1] Quello rilasciato…`. Se c'è `comma`, solo le righe di quel comma (prefisso del tag). Con TOOL_TEXT_CAP a 10.000 caratteri, l'articolo più lungo della KB (art. 5 TUI, 15-18 mila caratteri) **non va troncato a metà comma**: si restituiscono i commi interi fino al limite, poi "Commi successivi: 5-bis…9-bis: richiamali con comma=…". Va coordinato con la sessione sul testo troncato.
- **Collegamenti**: "Rinvia a: dlgs286 art.3 c.4; dlgs286 art.26…" e "Richiamato da: dpr-1999-394 art.14…". Così il modello va da solo dalla legge al regolamento e viceversa.
- **Data storica**: se c'è un blocco `storico` con `vig_dal <= data <= vig_al`, si restituisce quello. Altrimenti: "Versione al <data> non disponibile in archivio (testo storico solo per art. 5 c. 6 e 19 TUI, art. 32 d.lgs. 25). Testo a quella data su Normattiva: <url>!vig=<data>". Il link è quello preciso dell'articolo, non un invito generico a verificare.
- **Previgente** su un articolo non modificato: "L'articolo non è stato modificato dal d.l. 100/2026: il testo previgente coincide con il vigente" (lo dice il campo `stato`).
- Fonti: l'articolo entra in `fonti` (il pannello delle fonti della chat) con il link Normattiva o SOS Patto.
- Etichetta visibile all'utente: "Leggo art. 6 d.lgs. 286/1998".

### `cerca_norme`

```ts
{
  name: "cerca_norme",
  description:
    "Cerca negli articoli di legge (testo vigente) per parole chiave, quando non conosci il numero dell'articolo. Restituisce fino a 8 articoli con estratto: poi leggili con leggi_norma.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Parole chiave (max 200 caratteri); virgolette per la frase esatta." },
      atti: { type: "array", items: { type: "string" }, description: "Facoltativo: limita a questi atti (id)." }
    },
    required: ["query"]
  }
}
```

La ricerca usa FTS su `testo_tsv` (solo `vigente`/`unica`), ordina con `ts_rank_cd` e mostra `ts_headline` sulle 8 righe restituite, come per le circolari. Ogni risultato riporta `atto | art | rubrica | estratto | testo vigente al`.

### Nel prompt di sistema (parte in cache)

Un blocco `ATTI NORMATIVI (id: titolo — testo al)` generato dalla tabella `pro.norma_atto` al build, o da un file `norme-index.generated.ts` come per `permitIndex`. Per 19 atti sono circa 400 token, in cache.

---

## 7. Regole di prompt

Sostituire la regola 3 e aggiungerne una nuova in COME LAVORI:

> **Norme.** Per requisiti, termini, condizioni e procedure previsti dalla legge leggi SEMPRE il testo vigente con `leggi_norma` prima di rispondere, anche se lo trovi già in una scheda o in una circolare: le schede sono sintesi e le circolari possono essere superate. Se non conosci l'articolo usa `cerca_norme`. Leggi anche la norma collegata quando il testo la richiama (legge ↔ regolamento di attuazione). Cita l'articolo e il comma col link restituito e indica la data ("testo vigente al 4/6/2026"). Metti tra virgolette solo testo letto con lo strumento in questa conversazione.
>
> **Mai scaricare la verifica sull'utente.** Non scrivere "conviene verificare il testo vigente", "si consiglia di controllare la norma" o simili per una norma che `leggi_norma` può leggere: leggila tu. Se il testo non è disponibile (atto non in archivio, versione storica mancante, strumento in errore), dillo con precisione ("Il d.l. 20/2023 non è nell'archivio delle norme") e dai il link Normattiva restituito dallo strumento.
>
> **Gerarchia e date.** Se legge e regolamento di attuazione non coincidono (es. un regolamento non adeguato a una legge successiva), riportali entrambi e segnala il disallineamento: prevale la legge. Se una circolare è anteriore all'ultima modifica della norma che applica, dillo.

In più:
- la regola 3 attuale ("Puoi indicare quale norma o fonte andrebbe verificata") va **tolta**: è all'origine della risposta sbagliata;
- la frase sulla "gerarchia" va validata da Alberto, perché è contenuto giuridico;
- conviene un controllo automatico di regressione (eval): domande di prova la cui risposta non deve contenere `/verificar[e|si] (il )?testo vigente|conviene verificare/i` e deve contenere almeno un `leggi_norma` fra le chiamate. Il caso in esame è il primo test.

**Limiti del ciclo.** `MAX_TOOL_ROUNDS = 5` e `MAX_TOOLS_PER_ROUND = 4` bastano se il modello chiama gli strumenti in parallelo (giro 1: `scheda_permesso` + `leggi_norma(dlgs286,6)` + `leggi_norma(dpr-1999-394,14)` + `cerca_circolari`). Il prompt dovrebbe dirgli di farlo. `TOOL_DEADLINE_MS = 35 s`: una lettura da Neon richiede meno di 100 ms, quindi l'impatto è trascurabile.

---

## 8. Costi

- **Token**: un comma pesa 100-400 token; un articolo medio (art. 6 TUI, circa 5.000 caratteri) circa 1.500 token; art. 5 TUI intero, al limite di 10.000 caratteri, circa 3.000 token. Per domanda, 2-4 letture fanno +3-8 mila token di input, cioè **+0,01-0,03 USD** al prezzo Opus 5.5 di 4 USD/M, meno con la cache nei giri successivi. Le definizioni dei due strumenti e l'elenco degli atti aggiungono circa 1.000 token in cache. È poco rispetto al tetto di 3 USD al giorno per utente.
- **Neon**: circa 10 MB per il primo lotto, circa 35 MB per tutta la KB. Due query indicizzate per lettura.
- **Lavoro**: SQL e import circa ½ giornata; strumenti in `chat-pro.ts` circa ½ giornata; sentinella Normattiva circa ½ giornata; eval sul caso e su 10 domande tipo circa ½ giornata.

---

## 9. Rischi

1. **Testo non ufficiale o in ritardo.** La base del TUI è al 4/6/2026. Le modifiche estranee al Patto arrivate dopo, per esempio con la conversione del d.l. 168/2026 o con nuovi decreti flussi, entrano solo con un nuovo export. Mitigazione: la sentinella mensile, la data mostrata in ogni risposta, l'avvertenza GU.
2. **Errori di analisi nella KB** (tag `lett.a` falso, soppressioni con `....`) possono indurre citazioni sbagliate. Mitigazione: pulizia e avvisi nell'import; correzione a monte in `export_norme.py`; controllo a campione da parte di Alberto sui 20 articoli più usati.
3. **`previgente` frainteso** come "versione storica qualsiasi". Mitigazione: spiegarlo nella descrizione dello strumento e nell'intestazione della risposta.
4. **Multivigenza scarsa.** Per pratiche iniziate prima del 2023 (conversioni allora "nelle quote") lo strumento non ha il testo dell'epoca. Mitigazione: link Normattiva `!vig=` preciso. In seguito, la pipeline può estendere `storico.md` agli articoli più usati dagli sportelli (TUI 5, 6, 9, 22, 26, 29, 30, 32, 39-bis.1; DPR 394 art. 14).
5. **Il bot interpreta più del dovuto.** Avere il testo non garantisce leggerlo bene, per esempio la prevalenza della legge sul regolamento. La regola "riporta entrambi e segnala" limita il rischio. Restano gli eval.
6. **Le nostre schede contraddicono la norma.** La scheda PRO flussi descrive la conversione da studio con la regola anteriore al 2023. Va corretta in `pro-content-shared/pro-content.json`. È una correzione di contenuto separata, da far validare ad Alberto.
7. **Dipendenza da una cartella locale.** La KB sta nel marketplace dei plugin sul Mac di Alberto. Se il percorso cambia, l'import non la trova. Mitigazione: `--kb`/`NORME_KB_DIR` e la ricerca di riserva.

---

## Riassunto

1. Causa confermata: il bot ha solo `cerca_circolari`, `leggi_circolare` e `scheda_permesso`. Le schede PRO (3 permessi) hanno solo riferimenti, e la regola 3 del prompt lo invita a "indicare quale norma andrebbe verificata".
2. La KB immigrazbot-norme ha i testi giusti e aggiornati: TUI vigente al 4/6/2026 + d.l. 100, DPR 394 al 29/10/2026. Art. 6 c. 1 TUI ("al di fuori delle quote", vigente dal 23/6/2023) e art. 14 DPR 394 coincidono con Normattiva di oggi.
3. Trappola del caso: l'art. 14 c. 6 DPR 394 dice ancora "nei limiti delle quote" e la nostra scheda PRO flussi riporta la regola anteriore al 2023. Serve leggere legge e regolamento insieme.
4. Piano: tabelle Neon `pro.norma_atto`/`pro.norma_articolo` caricate da `scripts/import-norme.mjs` (19 atti, circa 10 MB), strumenti `leggi_norma` + `cerca_norme` con data "vigente al" e rinvii, sentinella Normattiva mensile.
5. Il prompt va cambiato: leggere sempre la norma vigente prima di rispondere e mai chiedere all'utente di verificarla. Costo +0,01-0,03 USD per domanda; da correggere a monte due difetti della KB (soppressioni `....`, tag `lett.a` falso).
