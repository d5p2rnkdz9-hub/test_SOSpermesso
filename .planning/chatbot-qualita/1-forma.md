# Chatbot PRO — 1. Forma delle risposte (schede in background, fonti giuridiche inline)

Data: 16/11/2026. Solo analisi e piano: nessuna modifica al codice, nessun commit.
Caso segnalato: «Conversione da studio a lavoro subordinato fuori quota: cosa serve?» (è anche il 2° suggerimento della schermata vuota, `src/app/[locale]/pro/assistente/ChatPro.tsx:37`, quindi è la prima risposta che molti utenti vedranno). La risposta diceva «La scheda lo indica tra i documenti: …» e metteva «([scheda](https://www.sospermesso.it/permesso-…html))» dopo quasi ogni elenco.

Obiettivo (Alberto): le schede sono conoscenza di base, non si nominano nel testo; i loro link vanno solo in fondo, in «Per approfondire». Norme e circolari si citano inline con link. Niente meta-commenti sugli strumenti.

---

## 1. Cause trovate

### Nel prompt di sistema (`src/lib/chat-pro.ts`)

| Dove | Testo | Effetto |
|---|---|---|
| `chat-pro.ts:59` (regola 2) | «Ogni affermazione di merito ha la sua fonte. Cita la circolare **o la scheda** da cui la ricavi, con un link markdown … per le schede https://www.sospermesso.it/permesso-{slug}.html» | **Causa principale.** Mette la scheda sullo stesso piano di una circolare (fonte da citare) e chiede un link *per ogni affermazione*: da qui «([scheda](…))» dopo ogni elenco e «la scheda indica …» come attribuzione. |
| `chat-pro.ts:58` (regola 1) | «usa gli strumenti: `scheda_permesso` per i **contenuti delle schede** SOS Permesso» | Presenta il materiale come documento esterno («le schede»), non come conoscenza propria. |
| `chat-pro.ts:60` (regola 3) | «Se gli strumenti non trovano una fonte, dillo esplicitamente ("**Nell'archivio non trovo** una circolare su questo punto")» | Legittima e dà il modello di frase per i meta-commenti sulla ricerca («nell'archivio», «non trovo», «dalle fonti che ho consultato»). |
| `chat-pro.ts:66` (STILE) | «prima la risposta, poi le fonti» | Ambiguo: insieme alla regola 2 il modello ripete le fonti dopo ogni blocco invece di raccoglierle. Non dice dove vanno le schede. |

### Nell'etichettatura dei risultati degli strumenti

| Dove | Testo | Effetto |
|---|---|---|
| `chat-pro.ts:121` (descrizione di `scheda_permesso`) | «Restituisce **la scheda SOS Permesso** di un permesso … e … **la scheda PRO** con norme e massime» | Il modello riceve un oggetto chiamato «scheda» e lo nomina. |
| `scripts/generate-permits-kb.js:42` → `src/lib/permits-kb.generated.ts` | Prima riga di ogni risultato: `# {tipo}` / `Categoria: …` / **`Scheda pubblica: https://www.sospermesso.it/permesso-{slug}.html`** | URL con l'etichetta «Scheda» **in testa** al risultato: è il link che il modello incolla come «[scheda](…)». |
| `scripts/generate-permits-kb.js:51` | Intestazioni `## Documenti per la prima richiesta (modalità: KIT)` / `## Documenti per il rinnovo` | Il modello ripete la struttura: «la scheda lo indica tra i documenti». |
| `chat-pro.ts:210` | `# Scheda PRO ({aggiornato_al}, bozza in validazione legale)` | Altra etichetta «Scheda PRO» + la nota «bozza», che spinge a prendere le distanze («secondo la scheda PRO, ancora in bozza…»). |
| contenuto delle schede (`permits-kb.generated.ts`) | Scritte per il pubblico, in seconda persona («Puoi…», «Devi…») | Il modello, dovendo passare a un registro professionale, attribuisce invece di riformulare («la scheda indica che…»). |

### Fattori minori

- `chat-pro.ts:498` `effort: "low"`: con poco ragionamento il modello segue soprattutto la forma letterale delle regole e gli esempi. Le regole nuove devono essere esplicite e avere esempi.
- La storia della conversazione resta (`chat-pro.ts:413-423`): le conversazioni già aperte contengono risposte nel vecchio stile, e il modello tende a imitarle nei turni successivi. Il nuovo prompt vale pienamente solo per le conversazioni nuove.
- Interfaccia: il riquadro «Documenti consultati» (`ChatPro.tsx:252-262`) elenca solo le circolari, perché `fonti` si riempie solo in `cerca_circolari`/`leggi_circolare` (`chat-pro.ts:161, 180`). Le schede quindi non compaiono da nessuna parte fuori dal testo, e la sezione «Per approfondire» scritta dal modello è l'unico posto per loro. Va bene così: non serve toccare la UI.
- Testi dell'interfaccia «L'assistente cerca nell'archivio e nelle schede e cita le fonti» (`ChatPro.tsx:213-215`, `pro/assistente/page.tsx:29`, `account/page.tsx:321`): non influiscono sul modello e sono veri. Nessuna modifica necessaria.

---

## 2. Chatbot base del sito

- File: `Sito_Nuovo/netlify/functions/chat.mjs` (prompt alle righe 35-51, base di conoscenza in `chat-kb.mjs`, generata da `scripts/build-chatbot-kb.js`). **Prompt separato**: non condivide nulla con `chat-pro.ts`.
- Architettura diversa: niente strumenti, tutta la base di conoscenza nel prompt di sistema.
- Il problema qui è minore: la regola 4 dice «Quando è utile, includi il link alla pagina del sito», non per ogni affermazione, e non chiama le pagine «scheda». Ogni permesso nella base di conoscenza ha però la riga `Pagina: https://…` in testa, e le regole 1-2 parlano di «base di conoscenza». Il rischio è «nella base di conoscenza non trovo…». Il modello di frase della regola 2 («Mi dispiace, non ho informazioni su questo») lo limita già.
- Per il pubblico, inoltre, il link alla pagina dentro il testo è utile (chi legge deve aprire la pagina e la checklist dei documenti).
- **Proposta:** nessuna modifica urgente. Se si vuole uniformare, aggiungere alla regola 4: «Non scrivere "base di conoscenza" o "secondo le informazioni che ho": rispondi direttamente. Metti il link alla pagina una volta sola, alla fine.» Poi far girare lo stesso controllo regex (§4) su 3-4 risposte del sito.

---

## 3. Testo proposto per il prompt (pronto da incollare)

Sostituisce in `SYSTEM_PROMPT` le regole 1, 2 e 3 di «COME LAVORI» e la seconda riga di «STILE». Le regole 4 e 5 restano come sono. **Coordinamento:** le sessioni «norme vigenti», «conflitti legge/circolari» e «testo troncato» probabilmente toccano le regole 3-4 dello stesso prompt. Il blocco «FONTI E CITAZIONI» è autonomo apposta: chi unisce le modifiche lo tiene intero e ci affianca le loro regole. Se una di loro aggiunge uno strumento per le norme (es. `leggi_norma`), rientra nella lettera B senza modifiche.

```text
COME LAVORI
1. Prima cerchi, poi rispondi. Per ogni domanda su procedure, requisiti, documenti, costi, prassi delle Questure o novità normative consulta gli strumenti: `scheda_permesso` ti dà la conoscenza di base su un permesso (requisiti, procedura, documenti, costi, durata, conversione, norme di riferimento); `cerca_circolari` e `leggi_circolare` ti danno circolari, note, messaggi, decreti e sentenze dell'archivio (oltre 1.900 documenti dal 1961 a oggi). Fai più ricerche con formulazioni diverse se la prima non trova nulla di utile.
2. Cita le fonti come indicato in FONTI E CITAZIONI.
3. Se su un punto non c'è una circolare o una norma che lo regoli, dillo in modo diretto ("Non risulta una circolare specifica su questo punto") e non colmare il vuoto con conoscenze generali presentate come certe. Puoi indicare quale norma o fonte andrebbe verificata.
4. [invariata]
5. [invariata]

FONTI E CITAZIONI
Hai due tipi di materiale e li usi in modo diverso.
A. Conoscenza di base (risultati di `scheda_permesso`). È il tuo sapere sul permesso, come un manuale che conosci a memoria: usalo per dire cosa serve, come si fa, quanto costa. Non nominarlo mai nel testo: niente "la scheda indica", "secondo la scheda", "sulla scheda", "la scheda PRO", e nessun link alla scheda dentro o dopo i paragrafi. È scritta per il pubblico, in seconda persona: riformulala in registro professionale.
B. Fonti giuridiche (norme, circolari, note, messaggi, decreti, sentenze). Si citano inline, nella frase in cui le usi, con estremi e data, e con link markdown quando c'è: per i documenti dell'archivio l'URL restituito dallo strumento (es. [Circolare Min. Interno n. 7438/2013](/it/pro/circolari/biz-123)); per le norme gli estremi (es. art. 14, c. 1, d.P.R. 394/1999) e il link se ti è stato fornito. Ogni requisito o passaggio che deriva da una norma o da una circolare porta la sua citazione; ciò che viene solo dalla conoscenza di base resta senza citazione.
C. Se hai usato la conoscenza di base su uno o più permessi, chiudi la risposta con questa sezione, e solo con questa:
### Per approfondire
- [Nome del permesso](https://www.sospermesso.it/permesso-{slug}.html)
Un link per ogni permesso usato, senza commenti. È l'unico punto della risposta in cui compaiono questi link. Non ripetere qui le circolari già citate.
D. Non parlare del tuo lavoro di ricerca: niente "lo strumento ha restituito", "dalle fonti che ho consultato", "nei documenti che ho trovato", "dalla ricerca nell'archivio risulta". Afferma il contenuto e cita la fonte giuridica; se manca, dillo come alla regola 3.

Esempio di forma (i contenuti tra parentesi angolari sono segnaposto, non fonti):
SBAGLIATO:
"La scheda lo indica tra i documenti: <documento 1>, <documento 2> ([scheda](https://www.sospermesso.it/permesso-lavoro-subordinato-conversione-da-altro-permesso.html)). Dalle fonti che ho consultato risulta che la domanda si presenta allo Sportello Unico ([scheda](https://www.sospermesso.it/permesso-lavoro-subordinato-conversione-da-altro-permesso.html))."
GIUSTO:
"La domanda si presenta allo Sportello Unico per l'immigrazione (<art. X d.lgs. 286/1998>), con le modalità indicate dalla [<Circolare Min. Interno n. X/AAAA>](/it/pro/circolari/biz-N).
Documenti:
- <documento 1>
- <documento 2>
### Per approfondire
- [Lavoro subordinato (conversione da altro permesso)](https://www.sospermesso.it/permesso-lavoro-subordinato-conversione-da-altro-permesso.html)"

Secondo esempio, quando manca una fonte specifica:
SBAGLIATO:
"Lo strumento cerca_circolari non ha restituito risultati. Nella scheda PRO è indicato che <regola>."
GIUSTO:
"Non risulta una circolare specifica sul punto. La regola è nell'<art. X d.lgs. 286/1998>: <regola>.
### Per approfondire
- [<Nome del permesso>](https://www.sospermesso.it/permesso-<slug>.html)"

STILE
- [prima riga invariata]
- Risposte brevi e strutturate: prima la risposta, con le fonti giuridiche inline; in fondo, se serve, "Per approfondire". Elenchi puntati per passaggi e documenti.
- [righe successive invariate]
```

Nota sugli esempi: uso segnaposto (`<…>`) e non contenuti reali, perché con `effort: low` il modello tende a copiare dagli esempi anche i fatti (estremi di circolari, articoli). Gli esempi devono insegnare solo la forma.

### Ritocchi ai risultati degli strumenti (consigliati, stessa modifica)

Senza questi il prompt combatte contro l'etichetta che il modello legge a ogni chiamata.

1. **Descrizione di `scheda_permesso`** (`chat-pro.ts:120-121`):
   ```text
   Restituisce la conoscenza di base su un permesso (cos'è, chi può chiederlo, come si chiede, durata, rinnovo, conversione, documenti e costi) e, se disponibile, l'approfondimento giuridico con norme e massime. Usala come conoscenza tua: non nominarla nel testo; il suo link va solo in fondo, in "Per approfondire".
   ```
2. **Intestazione del risultato** (`scripts/generate-permits-kb.js:42`, poi rigenerare `permits-kb.generated.ts`): togliere `Scheda pubblica: URL` dalla testa e metterlo in coda come
   `Link per "Per approfondire" (solo in fondo alla risposta): [{tipo}]({url})`.
   Il link pronto, con il titolo giusto, riduce anche gli slug sbagliati.
3. **Sezione PRO** (`chat-pro.ts:210`): `# Scheda PRO (…)` → `# Approfondimento giuridico (aggiornato al {aggiornato_al})`. Resta da decidere cosa fare di «bozza in validazione legale»: se resta, il modello deve sapere che le norme vanno citate dalla fonte, non dalla sintesi. È una questione di merito più che di forma, da coordinare con la sessione «norme vigenti».
4. In alternativa al punto 2, `runTool` (`chat-pro.ts:196-235`) può premettere al risultato la riga `[Conoscenza di base: non citarla nel testo; link solo in "Per approfondire"]` senza toccare il generatore. Va bene come prima mossa, perché non serve rigenerare.

Non toccare `toolLabel` (`chat-pro.ts:355-356`, «Apro la scheda …»): è lo stato mostrato all'utente nell'interfaccia, il modello non lo vede.

---

## 4. Piano di verifica

### 4a. Controllo regex (gratis, locale)

Proposta: `scripts/check-chat-forma.mjs` (bozza già scritta e provata: `.planning/chatbot-qualita/check-forma.bozza.mjs`, casi di prova in `check-forma.esempi.json`; `node .planning/chatbot-qualita/check-forma.bozza.mjs .planning/chatbot-qualita/check-forma.esempi.json`). Riceve un JSON `[{id, testo}]` e segnala:

| Regola | Livello | Pattern (sintesi) |
|---|---|---|
| `scheda-nominata` | errore | `(la\|nella\|sulla\|dalla\|questa\|della\|secondo la\|come da\|vedi) scheda`, `scheda (PRO\|SOS Permesso)`, `schede` |
| `link-etichetta-scheda` | errore | `[scheda…](` |
| `strumento` | errore | `strumento/i`, `scheda_permesso`, `cerca_circolari`, `leggi_circolare` |
| `meta-ricerca` | errore | `fonti/documenti/risultati (che ho) consultati/trovati/restituiti`, `ho consultato/cercato/trovato in…`, `dalla ricerca`, `(mi) ha restituito`, `base di conoscenza` |
| `meta-archivio` | avviso | `nell'archivio`, `dall'archivio` |
| `link-scheda-nel-corpo` | errore | URL `sospermesso.it/(xx/)?permesso-*.html` prima di `### Per approfondire` |
| `manca-per-approfondire` | errore | link a schede presenti ma sezione finale assente |
| `circolare-in-approfondire` | avviso | `/pro/circolari/` ripetuto nella sezione finale |
| `testo-dopo-approfondire` | avviso | righe non a elenco dopo la sezione finale |

Provato sui due esempi del prompt e su due risposte corrette: le sbagliate danno KO con 5 e 3 errori, le giuste OK, nessun falso positivo. Possibile falso positivo, raro: «schede» in senso diverso (es. «schede anagrafiche»).

**Da aggiungere nell'harness (4b), dove si conoscono gli strumenti usati:** se il turno ha chiamato `cerca_circolari`/`leggi_circolare` e la risposta non contiene nessun link `/pro/circolari/`, dare un avviso «nessuna citazione inline». Serve a evitare che la correzione tolga anche le citazioni buone.

**Controllo a costo zero sullo storico:** far girare lo stesso script sulle risposte già salvate in `pro.chat_messaggio` (ruolo `assistant`, `testo IS NOT NULL`) per avere il dato «prima»:
```sql
SELECT id, testo FROM pro.chat_messaggio WHERE ruolo = 'assistant' AND testo IS NOT NULL ORDER BY id;
```
(Non l'ho eseguito: la lettura delle chat degli utenti dal database è stata bloccata dai permessi. Va lanciato da Alberto o con il suo via libera esplicito.)

### 4b. Harness con chiamate reali (pochi centesimi a domanda)

Prerequisito, unica modifica al codice: `export` su `runTool` in `chat-pro.ts:139`. Script proposto `scripts/eval-chat-forma.ts`:
- importa `SYSTEM_PROMPT`, `TOOLS`, `CHAT_MODEL`, `runTool` da `src/lib/chat-pro.ts`;
- ripete il ciclo di `runChatTurn` **senza scrivere nel database**: stessi parametri (`effort: low`, `fallbacks`, cache), al massimo 5 giri, `tool_choice: none` all'ultimo;
- le ricerche nelle circolari leggono Neon (solo `SELECT`), quindi serve `NEON_DATABASE_URL` (branch dev);
- salva in `.planning/chatbot-qualita/eval/forma-AAAAMMGG.json` domanda, strumenti chiamati, testo e costo stimato (da `usage`, prezzi in `chat-pro.ts:312`), poi lancia il controllo 4a;
- parametri: `--solo 1,4,6` per scegliere le domande e `--prompt vecchio|nuovo` per il confronto prima/dopo (il prompt vecchio va tenuto in un file a parte solo per il test).

Comando (la chiave vecchia esportata da `~/.zshrc` vince su `.env.local`, va tolta; `--conditions=react-server` serve a superare `import "server-only"`):
```bash
cd ~/TECH/SOSpermesso/app && env -u ANTHROPIC_API_KEY npx tsx --conditions=react-server --env-file=.env.local scripts/eval-chat-forma.ts --solo 1,4,6
```
Al primo lancio va verificato che `tsx` passi a Node sia `--conditions` sia `--env-file`. In caso contrario: `node --conditions=react-server --env-file=.env.local --import tsx scripts/eval-chat-forma.ts`.

### 4c. Domande di prova

| # | Domanda | Cosa verifica |
|---|---|---|
| 1 | Conversione da studio a lavoro subordinato fuori quota: cosa serve? | Il caso segnalato: 2 permessi in «Per approfondire», circolari inline, nessun «la scheda» |
| 2 | Attesa occupazione: quante volte si può rinnovare e con quali requisiti? | Conoscenza di base + circolari insieme |
| 3 | Protezione speciale: la Questura può negare il rinnovo per assenza di integrazione? | Molte citazioni giuridiche inline; le schede restano in coda |
| 4 | Documenti e costi per il primo rilascio del permesso per cure mediche in gravidanza | Solo conoscenza di base: zero meta-commenti, elenco pulito, un link in fondo |
| 5 | Carta di soggiorno per familiare di cittadino UE: serve un requisito di reddito? | Norma (d.lgs. 30/2007) inline + permesso in coda |
| 6 | Esiste una circolare sul rinnovo del permesso per attività sportiva senza dichiarazione del CONI? | Probabile assenza di circolari: la regola 3 senza «strumento» o «archivio» |
| 7 | Coesione familiare o ricongiungimento per un coniuge già in Italia: differenze operative? | Due permessi confrontati, due link in coda, nessuna ripetizione |
| 8 | (secondo turno dopo la 4) E per il rinnovo cosa cambia? | Tenuta su più turni; serve il supporto multi-turno nell'harness, facoltativo |

**Budget:** per la prima verifica bastano le domande **1, 4, 6** (più la 3 se serve), lanciate solo col prompt nuovo; il «prima» si ricava gratis dallo storico (4a). Stima indicativa: 0,15-0,40 $ a domanda, dato che le schede e le circolari lette pesano 3-10 mila token per giro. Le altre domande si fanno girare solo se le prime passano.

**Criteri di accettazione:** 0 errori regex su tutte le domande lanciate; almeno una citazione inline `/pro/circolari/` quando il turno ha letto circolari; «Per approfondire» presente quando è stata letta una scheda. Una lettura a occhio da parte di Alberto per il registro professionale.

---

## 5. Ordine consigliato

1. Unire il blocco «FONTI E CITAZIONI» con le modifiche delle altre sessioni allo stesso `SYSTEM_PROMPT`: un solo commit, dal coordinatore.
2. Applicare i ritocchi 1 e 4 dei risultati degli strumenti (nessuna rigenerazione); il 2 e il 3 in un secondo momento.
3. Aggiungere `scripts/check-chat-forma.mjs` ed esportare `runTool`; scrivere `scripts/eval-chat-forma.ts`.
4. Lanciare 4a sullo storico (prima) e 4b sulle domande 1, 4, 6 (dopo).
5. Facoltativo: la frase per il chatbot del sito (§2).

## Riassunto

1. La causa principale è la regola 2 (`chat-pro.ts:59`): mette la scheda tra le fonti da citare e chiede un link per ogni affermazione. La regola 3 (`:60`) fornisce il modello di frase per i meta-commenti.
2. Le etichette rinforzano il problema: «Scheda pubblica: URL» in testa a ogni risultato (`generate-permits-kb.js:42`), «Scheda PRO» (`chat-pro.ts:210`) e la descrizione dello strumento (`:121`).
3. Il chatbot del sito (`Sito_Nuovo/netlify/functions/chat.mjs`) ha un prompt separato e il problema è minore; una riga facoltativa basta a uniformarlo.
4. Il blocco «FONTI E CITAZIONI» è pronto da incollare (§3): conoscenza di base senza menzioni, «### Per approfondire» in coda, norme e circolari inline, niente meta-commenti, con 2 esempi a segnaposto.
5. Verifica: il controllo regex è scritto e provato (gratis, anche sullo storico); l'harness con chiamate reali richiede di esportare `runTool` e bastano 3 domande (1, 4, 6), con `env -u ANTHROPIC_API_KEY`.
