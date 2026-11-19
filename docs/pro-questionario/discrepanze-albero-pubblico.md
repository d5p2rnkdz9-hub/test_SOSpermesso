# Discrepanze tra le ricerche PRO e l'albero pubblico "Conversione"

Generato da `scripts/pro-questionario/report-discrepanze.py` dai file in
`docs/pro-questionario/ricerca/conversione/`. Da validare con un avvocato prima di
correggere l'albero pubblico (`src/lib/conversione-tree.ts`, ramo `main`).

## A - Lavoro subordinato e autonomo, lavoro stagionale, attesa occupazione, permesso scaduto (A-lavoro.json)

### lavoro_subordinato → attesa_occupazione

- Nodo: `c_end_att_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'albero dice 'possibile' senza condizioni e aggiunge che si puo' chiedere 'anche senza precedente esperienza lavorativa': per chi parte da un permesso per lavoro subordinato la base e' proprio la perdita di un lavoro (art. 22 c. 11 TU), con DID al Centro per l'impiego. Inoltre non e' una conversione in senso tecnico: con il permesso ancora valido la perdita del lavoro non ne comporta la revoca; l'attesa occupazione si ottiene alla scadenza come rinnovo. La frase sull'assenza di esperienza lavorativa vale per altri permessi di partenza (es. minore eta', studio), non per questa coppia.

### lavoro_autonomo → attesa_occupazione

- Nodo: `c_end_att_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- L'albero usa lo stesso nodo (c_vorresti_lav) per subordinato e autonomo e da' 'POSSIBILE' anche all'autonomo. L'art. 22 c. 11 TU riguarda solo il titolare di permesso per lavoro subordinato; la stessa amministrazione ritiene l'estensione all'autonomo 'una forzatura' (posizione riferita in Cons. Stato 6070/2014). La tutela dell'autonomo che resta senza reddito passa per altre vie: valutazione ragionevole delle carenze temporanee di reddito al rinnovo, passaggio al lavoro subordinato (art. 14 c. 1 lett. b d.P.R. 394/1999), coesione familiare.

### lavoro_subordinato → studio

- Nodo: `c_end_stu_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **incerto**
- L'albero dice 'possibile, puoi fare da solo' con kit postale. Nessuna norma del TU o del d.P.R. 394/1999 disciplina la conversione da lavoro a studio (l'art. 14 d.P.R. 394/1999 regola solo la direzione inversa, studio -> lavoro), e il Consiglio di Stato afferma la tipicita' delle conversioni (Cons. Stato 476/2018). D'altra parte la conversione spesso non serve: chi ha un permesso per lavoro puo' gia' iscriversi all'universita' a parita' con gli italiani (art. 39 c. 5 TU). L'esito andrebbe riformulato in 'di solito non serve convertire; se il lavoro cessa, la conversione non ha base normativa espressa e dipende dalla questura'.

### lavoro_autonomo → studio

- Nodo: `c_end_stu_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **incerto**
- L'albero dice 'possibile, puoi fare da solo' con kit postale. Nessuna norma del TU o del d.P.R. 394/1999 disciplina la conversione da lavoro a studio (l'art. 14 d.P.R. 394/1999 regola solo la direzione inversa, studio -> lavoro), e il Consiglio di Stato afferma la tipicita' delle conversioni (Cons. Stato 476/2018). D'altra parte la conversione spesso non serve: chi ha un permesso per lavoro puo' gia' iscriversi all'universita' a parita' con gli italiani (art. 39 c. 5 TU). L'esito andrebbe riformulato in 'di solito non serve convertire; se il lavoro cessa, la conversione non ha base normativa espressa e dipende dalla questura'.

### lavoro_subordinato / lavoro_autonomo → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Sostanzialmente corretto, ma l'albero riduce i requisiti al legame di parentela: servono i requisiti per il ricongiungimento in capo al familiare (reddito ex art. 29 c. 3 lett. b e alloggio) e il soggiorno regolare; il termine di un anno dalla scadenza vale per la coesione ex art. 30 c. 1 lett. c). Le controversie sono del giudice ordinario, non del TAR.

### lavoro_subordinato / lavoro_autonomo → ue_lungo_periodo

- Nodo: `c_end_carta_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Corretto nella sostanza. Due precisazioni: il permesso UE non e' una conversione ma un titolo autonomo che si chiede con il permesso attuale ancora valido; i periodi computabili non sono tutti (esclusi studio, stagionale e permessi di breve durata; assenze oltre i limiti dell'art. 9 c. 6), e il reddito puo' essere anche familiare (CGUE C-302/18).

### lavoro_subordinato → lavoro_autonomo

- Nodo: `None`, esito nell'albero: non presente nell'albero
- Esito secondo la ricerca: **possibile**
- Coppia assente dall'albero. Serve una domanda nel questionario PRO perche' il passaggio non e' una conversione tradizionale: durante la validita' il permesso per lavoro subordinato non stagionale consente gia' il lavoro autonomo; al rinnovo si rilascia il permesso per l'attivita' effettivamente svolta.

### lavoro_autonomo → lavoro_subordinato

- Nodo: `None`, esito nell'albero: non presente nell'albero
- Esito secondo la ricerca: **possibile**
- Coppia assente dall'albero; come per il verso opposto, si tratta di uso del permesso per altra attivita' e di rinnovo per l'attivita' svolta, non di conversione con nulla osta. Una sola domanda del questionario PRO puo' coprire entrambi i versi.

### lavoro_stagionale → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Corretto che si passi prima dallo Sportello unico (nulla osta alla conversione). Mancano le condizioni decisive: almeno tre mesi di regolare lavoro stagionale, offerta di contratto subordinato (TD o TI), divieto di svolgere lavoro non stagionale prima della conversione. La durata indicata ('normalmente due anni; tre se a tempo indeterminato') non corrisponde all'art. 5 c. 3-bis TU: il primo permesso per lavoro subordinato dura fino a un anno (TD) o due anni (TI); i rinnovi del TI fino a tre anni.

### lavoro_stagionale → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- L'albero da' 'POSSIBILE'. Nessuna norma prevede la conversione dello stagionale in lavoro autonomo: l'art. 24 c. 10 TU prevede solo la conversione in lavoro subordinato; l'art. 14 c. 1 lett. a) d.P.R. 394/1999 consente il lavoro autonomo solo al titolare di permesso per lavoro subordinato 'non stagionale'; l'unica conversione in autonomo espressamente regolata e' da studio/formazione (art. 39 c. 9 d.P.R. 394/1999). La via praticabile e' in due tempi: stagionale -> subordinato (art. 24 c. 10), poi subordinato -> autonomo (art. 14 c. 1 lett. a e c. 3).

### lavoro_stagionale → attesa_occupazione

- Nodo: `c_end_att_incerta`, esito nell'albero: INCERTA
- Esito secondo la ricerca: **non_possibile**
- L'albero dice 'incerta' e invita a tentare. Per il titolare di permesso stagionale la legge esclude l'attesa occupazione: l'art. 24 c. 1 TU applica l'art. 22 'ad eccezione dei commi 5, secondo periodo, e 11', e lo stesso art. 22 c. 11 esclude lo stagionale dal periodo minimo di un anno. L'unica apertura giurisprudenziale riguarda chi e' entrato con visto per lavoro e non e' mai stato assunto per indisponibilita' del datore (TAR Campania 119/2024, circ. 20.8.2007), ma il Consiglio di Stato la esclude proprio per lo stagionale (2403/2025). L'esito andrebbe portato a 'non possibile, salvo casi particolari da valutare con un avvocato'.

### lavoro_stagionale → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Sostanzialmente corretto: l'art. 24 c. 8 TU e l'art. 14 par. 1 dir. 2014/36 fanno salvo il permesso per motivi diversi dallo stagionale, e l'art. 30 c. 1 lett. c) non esclude lo stagionale. Mancano i requisiti (reddito e alloggio del familiare) e manca l'avvertenza che lo stagionale come sponsor non puo' chiedere il ricongiungimento (qui pero' la coppia riguarda lo stagionale come familiare).

### attesa_occupazione → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **possibile**
- Esito corretto, procedura sbagliata: il nodo condiviso dice 'devi prima richiedere il nulla osta presso lo Sportello Unico'. Chi ha l'attesa occupazione e' gia' titolare di un permesso che consente il lavoro: viene assunto con comunicazione obbligatoria del datore e chiede in Questura (kit postale) il rinnovo/aggiornamento per lavoro subordinato; non serve nulla osta ne' quota. Anche la durata va corretta secondo l'art. 5 c. 3-bis TU.

### attesa_occupazione → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'esito e' plausibile ma la procedura indicata (nulla osta dello Sportello unico) e' quella della conversione da studio (art. 39 c. 9 d.P.R. 394/1999), non di questo caso. Mancano i requisiti dell'art. 26 TU, che sono il vero filtro.

### attesa_occupazione → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Corretto nella sostanza; valgono le stesse integrazioni della coppia lavoro -> famiglia (requisiti di reddito e alloggio del familiare, termine di un anno, competenza del giudice ordinario). E' spesso la via migliore quando l'attesa occupazione sta per scadere senza lavoro.

### attesa_occupazione → ue_lungo_periodo

- Nodo: `c_end_complicata`, esito nell'albero: Situazione complicata
- Esito secondo la ricerca: **condizionato**
- L'albero manda a 'situazione complicata', ma l'attesa occupazione non e' tra i permessi esclusi dall'art. 9 c. 3 TU e il periodo si computa. Il punto critico e' solo il reddito (assegno sociale), che la giurisprudenza consente di valutare in prognosi e anche con redditi familiari. L'esito corretto e' 'possibile se ha 5 anni di soggiorno e reddito sufficiente, anche familiare'.

### permesso_scaduto (da meno di un anno; qualsiasi titolo di partenza) → lavoro_subordinato / lavoro_autonomo / studio / attesa_occupazione

- Nodo: `c_end_scaduto_soft`, esito nell'albero: Conversione teoricamente possibile
- Esito secondo la ricerca: **condizionato**
- Il nodo e' condiviso da tutti i permessi di partenza e da tutti gli arrivi, ma la regola cambia: (a) per il RINNOVO dello stesso titolo il ritardo non e' ostativo (termine ordinatorio: Cons. Stato 7156/2022; Cass. SU 7892/2003); (b) per la conversione dello stagionale in subordinato la giurisprudenza la ammette anche dopo la scadenza (Cons. Stato 5604/2023); (c) per lo studio -> lavoro la legge richiede espressamente la domanda 'prima della scadenza' (art. 6 c. 1 TU), con sola apertura per ritardi minimi (Cons. Stato 7525/2021); (d) per le altre conversioni non c'e' regola espressa. Il questionario PRO deve chiedere il titolo di partenza e la data esatta di scadenza invece di usare solo la soglia di un anno.

### permesso_scaduto (da meno di un anno) → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- La soglia di un anno usata dall'albero per tutti i permessi scaduti ha base normativa SOLO qui: art. 30 c. 1 lett. c) TU. Corretto rinviare a c_end_fam_ok; il nodo c_end_fam_anno (scaduto oltre un anno) esiste ma non e' collegato da alcun arco: oggi chi ha il permesso scaduto da piu' di un anno finisce in 'situazione complicata' senza indicazione specifica sulla famiglia (dove restano aperte la lett. d e l'art. 19 c. 2 lett. c TU).

### permesso_scaduto → ue_lungo_periodo

- Nodo: `c_end_scaduto_soft`, esito nell'albero: Conversione teoricamente possibile
- Esito secondo la ricerca: **non_possibile**
- L'albero da' 'teoricamente possibile'. L'art. 9 c. 1 TU richiede il possesso da almeno cinque anni di un permesso 'in corso di validita'': con il permesso scaduto la domanda di permesso UE non e' accoglibile finche' non si ottiene il rinnovo del titolo. Il percorso corretto e' prima il rinnovo tardivo (esaminabile nel merito: Cons. Stato 7156/2022), poi la domanda di permesso UE; il ritardo puo' anche creare un 'buco' nel quinquennio.

### permesso_scaduto (da piu' di un anno) → qualsiasi

- Nodo: `c_end_complicata`, esito nell'albero: Situazione complicata
- Esito secondo la ricerca: **incerto**
- La soglia 'meno/piu' di un anno' non ha base normativa generale: l'unico termine di un anno e' quello dell'art. 30 c. 1 lett. c) TU per la coesione familiare. Le soglie normative sono altre: 60 giorni (art. 13 c. 2 lett. b, espulsione se non e' stato chiesto il rinnovo) e il termine (ordinatorio) di 90 giorni prima della scadenza per il rinnovo (art. 5 c. 4). Oltre un anno il rinnovo non e' giuridicamente precluso (Cons. Stato 7156/2022), ma la lunga permanenza senza titolo pesa come indice di irregolarita' e rende probabile l'espulsione (Cass. SU 7892/2003). L'esito 'complicata' e' prudente e accettabile per il pubblico; nel PRO va sostituito da domande sul titolo di partenza, sui requisiti attuali e su un eventuale decreto di espulsione.

**Punti da validare**

- Art. 24 c. 10 TU: la soppressione dell'inciso 'nei limiti delle quote' (d.l. 145/2024) rende la conversione dello stagionale fuori quota dal 2025; verificare il DPCM flussi 2026-2028 definitivo (la KB ha solo lo schema del 2.7.2025) e le circolari attuative, e come gli Sportelli trattano le domande presentate prima del 2025.
- Requisito dei 'tre mesi' di lavoro stagionale: computo in mesi di calendario o in giornate (39 giornate agricole nella prassi citata da TAR Marche 688/2019 e Cons. Stato 9770/2022; TAR Toscana 1380/2023 solo cautelare). La circolare 5.1.2022 e' citata in sentenza ma non letta: estremi da verificare.
- Lavoro (subordinato/autonomo) -> studio: nessuna norma espressa e nessuna giurisprudenza trovata; la tenuta della richiesta ex art. 5 c. 9 TU contro il principio di tipicita' (Cons. Stato 476/2018) va valutata da un avvocato, cosi' come la prassi delle questure.
- Lavoro autonomo -> attesa occupazione: esclusa dal testo dell'art. 22 c. 11 e dalla posizione dell'amministrazione riferita in Cons. Stato 6070/2014; verificare se esistono pronunce recenti che estendono l'istituto all'autonomo o al titolare che ha svolto anche lavoro dipendente.
- Attesa occupazione -> lavoro autonomo: che il permesso per attesa occupazione equivalga a 'lavoro subordinato non stagionale' ai fini dell'art. 14 c. 1 lett. a) d.P.R. 394/1999 e che non servano quote ne' certificazione dello Sportello unico e' interpretazione non verificata in giurisprudenza.
- Stagionale -> attesa occupazione: contrasto fra TAR Campania 119/2024 (ammessa per indisponibilita' sopravvenuta del datore) e Cons. Stato 2403/2025 (esclusa per lo stagionale); la norma (art. 24 c. 1) esclude l'art. 22 c. 11. Verificare se vi sono pronunce successive del Consiglio di Stato.
- Art. 37 d.P.R. 394/1999: natura del termine di 40 giorni per presentarsi al Centro per l'impiego e coordinamento con l'art. 22 c. 11 TU (un anno; DID ex d.lgs. 150/2015).
- Art. 5 c. 4 TU: il passaggio del termine per chiedere il rinnovo da 60 a 90 giorni prima della scadenza (d.lgs. 83/2026, dal 22.5.2026) e' stato letto su Normattiva; la giurisprudenza sul carattere ordinatorio (Cons. Stato 7156/2022) riguarda il vecchio termine ma il principio non dipende dalla durata.
- Durata del permesso dopo la conversione stagionale -> subordinato e dopo attesa occupazione -> subordinato (primo rilascio ex art. 5 c. 3-bis o rinnovo fino a tre anni): prassi delle questure da verificare.
- Computo nel quinquennio UE dei periodi anteriori alla conversione dello stagionale e del permesso stagionale pluriennale (art. 5 c. 3-ter): nessuna decisione trovata.
- Scaduto -> permesso UE: se la questura possa trattare la domanda di permesso UE come domanda di rinnovo (art. 5 c. 9 TU) e se il periodo di scopertura interrompa il quinquennio.
- Le date di alcune decisioni sono quelle delle schede KB (Cons. Stato 4448/2020 indicata solo come 2020; Cons. Stato 6070/2014 con data della decisione): ricontrollare sugli originali prima di citarle in atti.

## B - Studio, ricerca scientifica (art. 27-ter), attivita' sportiva e lavoro artistico (art. 27, c. 1, lett. m-p), motivi religiosi (art. 5, c. 2) (B-studio.json)

### studio → lavoro_subordinato

- Nodo: `c_vorresti_studio -> c_lav_tipo_studio -> c_end_lav_nullaosta | c_lav_corso_finito -> c_end_lav_formazione_attesa`, esito nell'albero: POSSIBILE (formazione/tirocinio: solo dopo la fine del corso)
- Esito secondo la ricerca: **possibile**
- Nessuna sostanziale. Due precisazioni: (a) il discrimine 'formazione/tirocinio' va legato alla dicitura del permesso ('studente' / 'tirocinante' / 'alunno', art. 39-bis, c. 1-quater) e all'art. 39-bis, c. 1, lett. b), non alla percezione del migrante; (b) il nodo dice che la domanda va fatta prima della scadenza, ma la giurisprudenza del Consiglio di Stato considera il termine acceleratorio: il ramo 'scaduto' (c_scaduto_quanto -> c_end_scaduto_soft) e' piu' pessimista del dovuto per scadenze recenti.

### studio → lavoro_autonomo

- Nodo: `c_lav_tipo_studio -> c_end_lav_nullaosta (l'albero non distingue subordinato e autonomo)`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'albero tratta l'autonomo come il subordinato ('i requisiti per lavorare in proprio'). In realta' servono i requisiti sostanziali dell'art. 26 TU, accertati dallo Sportello Unico, che rendono la conversione piu' selettiva; inoltre per l'autonomo il modulo del permesso e' raccolto dallo Sportello Unico e trasmesso alla Questura (art. 39, c. 9, d.P.R. 394/1999), non tramite kit postale.

### studio → attesa_occupazione (permesso per ricerca lavoro o imprenditorialita' degli studenti, art. 39-bis.1 TU)

- Nodo: `c_att_titolo_ita -> c_end_att_ok | c_end_att_studio_no`, esito nell'albero: POSSIBILE solo con laurea, master universitario, dottorato, diploma AFAM o ITS ottenuti in Italia; altrimenti NON POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Tre punti. (1) Il permesso non e' 'attesa occupazione' (art. 22, c. 11, TU) ma 'ricerca lavoro o imprenditorialita'' (art. 39-bis.1), con requisiti propri (reddito ex art. 29, c. 3, lett. b; assicurazione sanitaria; DID): il nodo c_end_att_ok, condiviso, dice che basta chiederlo e non menziona questi requisiti. (2) L'esito NON POSSIBILE per chi non ha uno dei titoli elencati e' contraddetto da TAR Piemonte 562/2025 (e dai precedenti TAR Piemonte 1020/2023 e TAR Lombardia 135/2023 da esso citati), che estende la norma ai corsi di formazione superiore non universitari: meglio 'incerto/contestato'. (3) La norma vale per i permessi ex artt. 39 e 39-bis, c. 1, lett. a): i permessi per formazione professionale e tirocinio (lett. b) restano fuori.

### studio → famiglia

- Nodo: `c_vorresti_studio -> c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Il brief indicava 'oggi NON POSSIBILE', ma l'albero porta a c_end_fam_ok (POSSIBILE): l'albero e' corretto. Il nodo pero' semplifica i requisiti: la conversione dipende dai requisiti del ricongiungimento in capo al familiare di riferimento (reddito e alloggio ex art. 29 per lo straniero; d.lgs. 30/2007 se il familiare e' cittadino UE). Va segnalato il termine di un anno dalla scadenza del permesso per studio.

### studio → ue_lungo_periodo

- Nodo: `c_vorresti_studio -> c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- L'esito diretto e' corretto (art. 9, c. 3, lett. a, TU), ma il nodo omette l'informazione utile per il professionista: gli anni con permesso per studio si computano interamente nel quinquennio dopo il passaggio a un titolo idoneo (art. 9, c. 5, TU non recepisce il dimezzamento facoltativo dell'art. 4, par. 2, dir. 2003/109; TAR Emilia-Romagna 834/2022). La strada e' quindi studio -> lavoro/famiglia e domanda di permesso UE subito dopo, se maturati i cinque anni.

### studio → carta_blu_ue (oggi 'Altro tipo di permesso')

- Nodo: `c_vorresti_studio -> c_end_altro_wip`, esito nell'albero: IN COSTRUZIONE
- Esito secondo la ricerca: **condizionato**
- L'albero non offre la Carta blu, che per i laureati e' un'alternativa fuori quota con vantaggi (mobilita' UE, ricongiungimento agevolato).

### ricerca_scientifica (art. 27-ter TU) → lavoro_subordinato / lavoro_autonomo

- Nodo: `c_vorresti_ricerca -> c_end_lav_sub_ok | c_end_lav_aut_ok`, esito nell'albero: POSSIBILE (con nulla osta dello Sportello Unico e kit postale)
- Esito secondo la ricerca: **incerto**
- Nessuna norma prevede la conversione diretta del permesso 'ricercatore' in lavoro: l'art. 6, c. 1-bis, TU non lo elenca e l'art. 27-ter prevede la conversione in lavoro solo dopo il permesso per ricerca lavoro (c. 9-bis). L'esito 'POSSIBILE' senza condizioni e' quindi eccessivo. Inoltre il nodo condiviso c_end_lav_sub_ok indica una durata errata (tre anni per il tempo indeterminato: il primo permesso dura al massimo due anni, art. 5, c. 3-bis, TU).

### ricerca_scientifica → attesa_occupazione (permesso per ricerca lavoro, art. 27-ter, c. 9-bis)

- Nodo: `c_vorresti_ricerca -> c_end_att_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **possibile**
- Corretto nell'esito, ma il permesso e' quello dell'art. 27-ter, c. 9-bis (ricerca lavoro, 9-12 mesi, dopo il completamento della ricerca), non l'attesa occupazione dell'art. 22, c. 11. Il nodo non menziona la conferma di completamento e la DID.

### ricerca_scientifica → studio

- Nodo: `c_vorresti_ricerca -> c_end_complicata`, esito nell'albero: SITUAZIONE COMPLICATA
- Esito secondo la ricerca: **condizionato**
- Coerente. Si puo' precisare l'unica via espressa: art. 39, cc. 5 e 5-bis, TU per chi soggiorna regolarmente da almeno un anno con diploma di scuola secondaria superiore conseguito in Italia (i ricercatori non sono tra le categorie di permesso elencate).

### ricerca_scientifica → ue_lungo_periodo

- Nodo: `c_vorresti_ricerca -> c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'esito NON POSSIBILE non trova riscontro normativo: l'art. 9, c. 3, TU non esclude i ricercatori (esclude studio/formazione, protezioni temporanee, richiedenti asilo, permessi di breve durata, diplomatici) e nemmeno l'art. 3, par. 2, dir. 2003/109. Con cinque anni di permesso, reddito e lingua, il ricercatore puo' chiedere il permesso UE.

### attivita_sportiva / lavoro_artistico (art. 27, c. 1, lett. m-p, TU) → lavoro_subordinato / lavoro_autonomo

- Nodo: `c_vorresti_sport_art -> c_end_lav_sub_ok | c_end_lav_aut_ok`, esito nell'albero: POSSIBILE (nulla osta dello Sportello Unico e kit postale)
- Esito secondo la ricerca: **condizionato**
- L'albero non distingue sport professionistico e dilettantistico: per l'art. 6, c. 1-bis, lett. e), TU e' convertibile solo il permesso per sport professionistico (art. 27, c. 1, lett. p); il permesso per sport dilettantistico non lo e' (TAR Sardegna 817/2026; TAR Emilia-Romagna ord. 317/2026). Per il lavoro artistico la conversione vale per le lett. m), n), o). Inoltre la durata indicata nel nodo condiviso (tre anni se a tempo indeterminato) e' errata per il primo permesso (art. 5, c. 3-bis, TU).

### attivita_sportiva / lavoro_artistico → attesa_occupazione

- Nodo: `c_vorresti_sport_art -> c_end_att_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **incerto**
- Nessuna norma prevede la conversione diretta in attesa occupazione: l'art. 22, c. 11, TU riguarda chi ha un permesso per lavoro subordinato e perde il lavoro; l'art. 40, c. 23, d.P.R. 394/1999 estende l'art. 22, c. 11, solo alle lett. d), e) e r-bis) dell'art. 27, non a sport e spettacolo. L'esito POSSIBILE non e' supportato.

### attivita_sportiva / lavoro_artistico → famiglia

- Nodo: `c_vorresti_sport_art -> c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Coerente. Da segnalare il possibile contrasto con il divieto dell'art. 40, c. 23, d.P.R. 394/1999 ('non possono essere convertiti'), superabile perche' l'art. 30, c. 1, lett. c), TU (fonte primaria) riguarda il 'familiare straniero regolarmente soggiornante' senza distinguere il titolo.

### attivita_sportiva / lavoro_artistico → ue_lungo_periodo

- Nodo: `c_vorresti_sport_art -> c_end_carta_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'esito e' in linea con l'art. 9 TU (nessuna esclusione espressa), ma va condizionato: i permessi per spettacolo di breve durata (es. art. 40, c. 15, d.P.R. 394/1999, meno di 90 giorni) e quelli della lett. n), non rinnovabili, rischiano la qualificazione di 'breve durata' (art. 9, c. 3, lett. d, e c. 5) o di titolo 'formalmente limitato' (art. 3, par. 2, lett. e, dir. 2003/109).

### motivi_religiosi (art. 5, c. 2, TU) → lavoro_subordinato / lavoro_autonomo

- Nodo: `c_vorresti_religiosi -> c_end_lav_sub_ok | c_end_lav_aut_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **possibile**
- Esito corretto per le domande presentate dal 22.10.2020 (art. 6, c. 1-bis, lett. g, TU). Va segnalato che TAR Lazio 1001/2025 ha ancora negato la convertibilita' richiamando Cons. Stato 476/2018 senza menzionare la nuova norma, e che le Questure possono opporre l'orientamento previgente. La procedura indicata nel nodo condiviso (nulla osta dello Sportello Unico) e la durata (tre anni per il tempo indeterminato) non sono verificate o sono errate.

### motivi_religiosi → attesa_occupazione

- Nodo: `c_vorresti_religiosi -> c_end_att_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **incerto**
- Nessuna norma prevede la conversione diretta del permesso religioso in attesa occupazione: l'art. 6, c. 1-bis, lett. g) parla di 'permesso di soggiorno per motivi di lavoro' e l'art. 22, c. 11, presuppone un permesso per lavoro subordinato perso. L'esito POSSIBILE non e' supportato.

### motivi_religiosi → studio

- Nodo: `c_vorresti_religiosi -> c_end_stu_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **possibile**
- Esito corretto, ma la base non e' una 'conversione' in senso proprio: e' il rilascio del permesso per studio da parte del questore ai titolari di permesso per motivi religiosi iscritti a corsi di formazione superiore (art. 39, cc. 5 e 5-bis, TU). Il nodo non menziona l'iscrizione al corso e i mezzi di sostentamento.

### motivi_religiosi → ue_lungo_periodo

- Nodo: `c_vorresti_religiosi -> c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Esito errato: il permesso per motivi religiosi non e' escluso dall'art. 9, c. 3, TU, e la giurisprudenza amministrativa impone alla Questura di valutare il permesso UE per chi soggiorna da oltre cinque anni con permesso religioso (Cons. Stato 4317/2018, 3868/2020 in ottemperanza; TAR Lazio 3501/2020, che richiama Cons. Stato 2261/2018).

**Punti da validare**

- Origine del fuori quota studio-lavoro: la circolare Min. Lavoro 1077/2023 e TAR Lombardia 4084/2025 indicano l'art. 3, c. 2, d.l. 20/2023; TAR Lombardia 4084/2025 aggiunge l'art. 24, c. 5, d.l. 75/2023 (che avrebbe eliminato il residuo riferimento alle quote). Il testo dell'art. 14, c. 6, e dell'art. 39, c. 9, d.P.R. 394/1999 menziona ancora le quote: verificare se Questure e Sportelli Unici le applichino ancora in qualche caso.
- Tolleranza della domanda di conversione studio-lavoro dopo la scadenza: Cons. Stato 7525/2021 (2 giorni), 7318/2022 (circa 2 mesi e mezzo, termine acceleratorio), 8588/2021 (anni, forza maggiore). Orientamento favorevole ma con compensazione delle spese per 'oscillazioni giurisprudenziali': non va presentato come diritto acquisito.
- Estensione dell'art. 39-bis.1 TU a titoli non elencati (TAR Piemonte 562/2025 e precedenti piemontesi e milanesi da esso citati): l'albero pubblico (c_end_att_studio_no) segue la lettura restrittiva delle Questure; decidere come rappresentare il contrasto.
- Religiosi -> lavoro: TAR Lazio 1001/2025 nega la convertibilita' senza citare l'art. 6, c. 1-bis, lett. g), TU; non e' chiaro se l'istanza fosse anteriore al 22.10.2020. Verificare se esistano pronunce post-2020 che applicano la lett. g) (nessuna trovata con le ricerche svolte).
- Procedura delle conversioni ex art. 6, c. 1-bis (sport, arte, religiosi): la norma non dice se si passa dallo Sportello Unico (contratto di soggiorno) ne' se si e' fuori quota; nei casi letti l'istanza e' presentata in Questura. Il nodo condiviso c_end_lav_sub_ok indica 'nulla osta presso lo Sportello Unico': da verificare con circolari del Ministero dell'Interno successive al d.l. 130/2020 (non trovate nella KB).
- Durata del permesso nel nodo condiviso c_end_lav_sub_ok ('tre anni se a tempo indeterminato'): l'art. 5, c. 3-bis, TU fissa per il primo permesso un massimo di due anni a tempo indeterminato e un anno a tempo determinato, con rinnovi fino a tre anni. Da correggere anche fuori da questo gruppo.
- Ricercatore -> lavoro: nessuna norma di conversione diretta; da validare se le Questure la ammettano in prassi (eventualmente ex art. 27-ter, c. 11-nonies, o art. 5, c. 9, TU).
- Ricercatore e religioso -> permesso UE di lungo periodo: l'albero dice NON POSSIBILE, ma l'art. 9, c. 3, TU non li esclude; per il religioso la giurisprudenza (Cons. Stato 4317/2018, TAR Lazio 3501/2020) impone di valutarlo. Resta aperto il requisito del reddito per il religioso mantenuto dall'ente.
- Computo integrale degli anni di studio nel quinquennio dell'art. 9 TU: affermato da TAR Emilia-Romagna 834/2022 (obiter) e coerente con l'art. 9, c. 5, TU; verificare la prassi delle Questure, che potrebbero applicare il dimezzamento facoltativo dell'art. 4, par. 2, dir. 2003/109 non recepito.
- Sport -> lavoro: la distinzione professionismo/dilettantismo dopo il d.lgs. 36/2021 (che ha abrogato la l. 91/1981 richiamata dall'art. 27, c. 1, lett. p) e la conversione di allenatori e preparatori atletici non sono state affrontate dalle pronunce trovate.
- Sport/arte/religiosi -> attesa occupazione: l'albero dice POSSIBILE, ma non c'e' base normativa per la conversione diretta; da confermare con un avvocato prima di cambiare l'esito.
- Studente minorenne (art. 39-bis, c. 1, lett. c-d) -> lavoro: nessun precedente trovato sulle modalita' al compimento della maggiore eta'.

## C - Famiglia (da e verso), residenza elettiva, acquisto cittadinanza/apolidia, 'ho un altro permesso' (C-famiglia.json)

### famiglia → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Esito corretto in astratto, ma la procedura indicata dal nodo condiviso (nulla osta dello Sportello Unico, poi kit postale) e' quella pensata per altri permessi: per il permesso familiare il lavoro e' gia' consentito senza conversione (art. 30 c. 2 TU, art. 6 c. 1 TU, art. 14 c. 1 lett. c d.P.R. 394/1999) e il cambio di titolo avviene al rinnovo (art. 14 c. 3 d.P.R. 394/1999) o per gli eventi dell'art. 30 c. 5. Nessuna norma richiede nulla osta o quote per questa conversione. Inoltre l'albero non distingue fra le varie basi del permesso familiare.

### famiglia → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Come per il lavoro subordinato: il nodo condiviso indica nulla osta SUI e kit postale, mentre il permesso familiare consente gia' il lavoro autonomo (art. 30 c. 2 TU) e la conversione segue l'art. 30 c. 5 TU o il rinnovo per l'attivita' svolta (art. 14 c. 3 d.P.R. 394/1999); la certificazione dell'art. 26 TU richiesta per la conversione da studio (art. 6 c. 1) non e' prevista per il familiare.

### famiglia → studio

- Nodo: `c_end_stu_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'albero dice POSSIBILE senza condizioni: la conversione in studio e' prevista dall'art. 30 c. 5 TU solo per morte del familiare, separazione legale, scioglimento del matrimonio o 18 anni del figlio. Se il legame familiare persiste la conversione e' superflua (e sfavorevole: il permesso per studio limita il lavoro a 20 ore settimanali, art. 14 c. 4 d.P.R. 394/1999, e non conta per il permesso UE, art. 9 c. 3 lett. a TU).

### famiglia → ue_lungo_periodo

- Nodo: `c_end_carta_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Esito corretto ma da qualificare: il permesso UE non e' una 'conversione' ma un rilascio subordinato ai requisiti dell'art. 9 TU; per i familiari di cittadini UE il titolo stabile e' la carta di soggiorno permanente del d.lgs. 30/2007 (art. 17), non il permesso UE (punto non verificato sul testo dell'art. 17 in questa ricerca).

### famiglia → residenza_elettiva

- Nodo: `c_end_altro_wip`, esito nell'albero: ALTRO (in lavorazione)
- Esito secondo la ricerca: **possibile**
- Coppia non presente nell'albero (finisce in 'Altro tipo di permesso'): la conversione e' espressamente prevista dall'art. 14 c. 1 lett. d) d.P.R. 394/1999.

### qualunque_permesso_valido → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Il nodo unico dice 'puoi fare da solo' e 'vale anche se il familiare e' cittadino italiano o UE', con kit postale e documentazione del legame. Mancano: i requisiti di reddito e alloggio dell'art. 29 c. 3 (richiamati dall'art. 30 c. 1 lett. c), il possibile requisito biennale dell'art. 28 c. 1-bis per lo sponsor straniero, il limite di un anno dalla scadenza, la distinzione fra art. 30 TU, carta di soggiorno UE (d.lgs. 30/2007) e FAMIT (art. 23 c. 1-bis), la verifica del matrimonio fittizio (art. 30 c. 1-bis). Inoltre 'figlio maggiorenne disabile' e 'genitore a carico' vanno precisati con le condizioni dell'art. 29 c. 1 lett. c) e d).

### richiesta_asilo → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'esito positivo e' sostenuto dalla Cassazione, ma il nodo non avverte che: (1) dopo il d.l. 100/2026 il richiedente riceve un documento e non piu' un 'permesso per richiesta asilo' (art. 4 d.lgs. 142/2015 vigente), quindi la domanda va impostata come rilascio per coesione da regolarmente soggiornante (Cass. 20020/2025) piu' che come conversione di un permesso; (2) il soggiorno regolare dura finche' c'e' diritto di rimanere (art. 7 d.lgs. 25/2008, art. 10 reg. 2024/1348), che puo' mancare nelle procedure accelerate o di frontiera; (3) per il richiedente sposato in Italia vale la lett. b) solo dopo un anno di soggiorno regolare; (4) se lo sponsor e' a sua volta richiedente asilo la disciplina del ricongiungimento non si applica (art. 29 c. 10 lett. a); (5) dopo la coesione non e' possibile la conversione in lavoro del successivo permesso per acquisto cittadinanza/apolidia (art. 6 c. 1-bis lett. d, eccezione per ex richiedenti asilo).

### protezione_internazionale (asilo o sussidiaria) → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Il nodo presenta la conversione come semplice e vantaggiosa. Per il titolare di status di rifugiato o di protezione sussidiaria la conversione in famiglia e' giuridicamente possibile (art. 30 c. 1 lett. c) ma di regola sconsigliabile: si perderebbero i diritti connessi allo status (es. ricongiungimento senza reddito ex art. 29-bis). Il PRO deve avvertire e chiedere perche' si vuole cambiare titolo.

### protezione_speciale / cure_mediche / calamita' / altri permessi non convertibili in lavoro → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Esito coerente, ma il nodo non spiega perche' qui la via familiare e' strategica: dopo il d.l. 20/2023 questi permessi non sono piu' convertibili in lavoro (lett. a, b, h-bis dell'art. 6 c. 1-bis abrogate), mentre la coesione ex art. 30 c. 1 lett. c) resta aperta a chi e' regolarmente soggiornante con qualsiasi titolo. Valgono i requisiti di reddito e alloggio non menzionati dal nodo.

### permesso_scaduto_oltre_un_anno o nessun titolo → famiglia

- Nodo: `c_end_complicata`, esito nell'albero: Situazione complicata
- Esito secondo la ricerca: **condizionato**
- L'albero manda tutti i permessi scaduti da oltre un anno a 'Situazione complicata', anche per la famiglia (il nodo c_end_fam_anno esiste ma non e' collegato). Esistono invece vie familiari che prescindono dal titolo valido: genitore di minore italiano (art. 30 c. 1 lett. d), convivenza con coniuge o parente italiano entro il secondo grado (art. 19 c. 2 lett. c TU e art. 28 c. 1 lett. b d.P.R. 394/1999), familiare di rifugiato (art. 30 c. 1 lett. c, ultimo periodo), familiare di cittadino UE (d.lgs. 30/2007) e, secondo la Cassazione piu' recente, straniero inespellibile per legami familiari.

### qualunque_permesso → famiglia_di_cittadino_ue_o_italiano

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Il nodo assimila al permesso ex art. 30 TU i titoli per familiari di cittadini italiani e UE, che hanno base, durata, requisiti e costi diversi (carta di soggiorno ex art. 10 d.lgs. 30/2007; permesso FAMIT ex art. 23 c. 1-bis; permesso ex art. 28 lett. b d.P.R. 394/1999). Servono domande in piu'.

### residenza_elettiva → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **possibile**
- Esito corretto: la conversione e' prevista dall'art. 6 c. 1-bis lett. c) TU (introdotto dal d.l. 130/2020). L'ipotesi di partenza della ricerca ('non convertibilita' in lavoro') non corrisponde al testo vigente. Da verificare la procedura indicata dal nodo (nulla osta SUI): la norma non menziona quote ne' nulla osta, ma il permesso per lavoro presuppone il contratto di soggiorno (art. 5 c. 3-bis TU).

### residenza_elettiva → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **possibile**
- Esito corretto (art. 6 c. 1-bis lett. c TU parla di 'motivi di lavoro' senza distinguere); procedura e requisiti dell'art. 26 TU da validare.

### residenza_elettiva → attesa_occupazione

- Nodo: `c_end_att_incerta`, esito nell'albero: INCERTA
- Esito secondo la ricerca: **non_possibile**
- L'albero dice INCERTA, ma manca qualsiasi base normativa: l'attesa occupazione (art. 22 c. 11 TU) presuppone un permesso per lavoro subordinato e la perdita del posto; il titolare di residenza elettiva per definizione non lavora come subordinato. Il percorso corretto e' prima la conversione in lavoro (art. 6 c. 1-bis lett. c).

### residenza_elettiva → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Esito coerente; valgono le stesse integrazioni della coppia generale verso famiglia (requisiti di reddito e alloggio del familiare, distinzione delle basi normative).

### acquisto_cittadinanza_o_apolidia → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'albero dice POSSIBILE senza eccezioni: l'art. 6 c. 1-bis lett. d) TU esclude la conversione quando lo straniero era in precedenza titolare di un permesso per richiesta di asilo. Serve la domanda in piu'.

### acquisto_cittadinanza_o_apolidia → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Stessa eccezione per gli ex richiedenti asilo (art. 6 c. 1-bis lett. d TU), non segnalata dall'albero.

### acquisto_cittadinanza_o_apolidia → attesa_occupazione

- Nodo: `c_end_att_incerta`, esito nell'albero: INCERTA
- Esito secondo la ricerca: **non_possibile**
- Nessuna base normativa per la conversione diretta: l'art. 6 c. 1-bis lett. d) prevede la conversione in lavoro, l'art. 22 c. 11 l'attesa occupazione per chi ha un permesso per lavoro subordinato. Meglio indicarla come non prevista e suggerire la conversione in lavoro.

### acquisto_cittadinanza_o_apolidia → ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **incerto**
- L'albero esclude il permesso UE, ma l'art. 9 c. 3 TU non elenca il permesso per acquisto cittadinanza/apolidia tra le esclusioni. Se la persona ha cinque anni di permessi validi (compreso quello precedente, che e' presupposto dell'art. 11 c. 1 lett. c d.P.R. 394/1999) e i requisiti, il permesso UE non appare precluso; resta il dubbio se il titolo sia considerato 'di breve durata' (art. 9 c. 3 lett. d).

### altro_permesso_generico → lavoro

- Nodo: `c_end_lav_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **incerto**
- Un 'no' generico e' troppo netto: per alcuni titoli non elencati nell'albero la conversione e' prevista da norme speciali (non riverificate qui), per altri e' esclusa. Il PRO deve chiedere il titolo esatto invece di dare un esito unico.

### altro_permesso_generico → studio

- Nodo: `c_end_stu_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **incerto**
- Esito netto non verificabile senza conoscere il titolo.

### altro_permesso_generico → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Coerente: la coesione ex art. 30 c. 1 lett. c) non limita i titoli di partenza (basta il soggiorno regolare: Cass. 20020/2025). Valgono le integrazioni della coppia generale.

### altro_permesso_generico → ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **incerto**
- L'art. 9 c. 3 TU esclude solo titoli determinati: per i permessi non esclusi il permesso UE e' possibile con cinque anni e i requisiti. Il PRO deve confrontare il titolo con l'elenco dell'art. 9 c. 3.

**Punti da validare**

- Procedura famiglia -> lavoro: nessuna norma richiede nulla osta SUI o quote (art. 30 c. 2 e c. 5 TU; art. 14 cc. 1 e 3 d.P.R. 394/1999), ma TAR Brescia 768/2026 ha richiesto in motivazione la prova di nulla osta, quota e contratto di soggiorno. Va verificato se il nodo c_end_lav_sub_ok/lav_aut_ok possa restare condiviso o serva un nodo dedicato per i permessi familiari.
- Separazione di fatto e art. 30 c. 5 TU: contrasto fra TAR Brescia 768/2026 (serve separazione legale gia' intervenuta) e TAR Bologna 606/2025 (la Questura deve valutare comunque i requisiti del permesso per lavoro).
- Termine di 60 giorni per il rinnovo/conversione: TAR Brescia 768/2026 lo ritiene perentorio; la tesi contraria non e' stata ricercata in questa sessione.
- Rinnovo del permesso familiare come permesso per lavoro quando il legame familiare persiste (art. 14 c. 3 d.P.R. 394/1999 vs. lettera dell'art. 30 c. 5 TU): prassi delle Questure da verificare.
- Art. 28 c. 1-bis TU (due anni di soggiorno legale dello sponsor): data e fonte della novella (Normattiva: testo in vigore dall'11/12/2024; Trib. Firenze 10116/2025: d.l. 145/2024 conv. l. 187/2024) e applicabilita' alla coesione ex art. 30 (esclusa solo da Trib. Firenze 10116/2025; nessuna pronuncia contraria trovata).
- Cass. civ. sez. I n. 6535/2026 (dep. 19/3/2026) e n. 8306/2026 (dep. 3/4/2026): testi non ancora leggibili su SentenzeWeb ('in fase di oscuramento'); il principio e' riportato solo tramite la scheda KB di App. Torino 1656/2025. Rileggere prima di citarle.
- Cass. 17989/2020: la scheda KB indica come numero il R.G. 17989/2020 e il file come 28201/2021; SentenzeWeb non trova 28201/2021. Estremi da verificare sul PDF. Anche l'esito nel caso concreto non e' chiaro dalla scheda (ricorrente il Ministero).
- Richiedenti asilo dopo il Patto: il previgente 'permesso per richiesta asilo' e' sostituito da documenti (art. 4 d.lgs. 142/2015 novellato dal d.l. 100/2026); le pronunce Cass. 23316/2018 e 13104/2019 si fondano sulla disciplina previgente (art. 7 e 35 c. 6 d.lgs. 25/2008). Verificare le norme transitorie (art. 17 d.l. 100/2026) e l'applicazione della coesione a chi ha solo il documento.
- Coesione: modalita' di presentazione (kit postale o procedura telematica SUI richiamata dalla circolare 4.4.2008 nella mappa KB) e prassi locali; per FAMIT e carta UE la domanda diretta in Questura e' ricavata solo dalla lista di una Questura.
- FAMIT ex art. 23 c. 1-bis d.lgs. 30/2007: contrasto nel Tribunale di Torino fra R.G. 1935/2024 e 16357/2024 (applicazione della nozione di familiare del d.lgs. 30/2007, nessun requisito di reddito) e R.G. 15629/2024 (inapplicabilita' del d.lgs. 30/2007 agli statici); la lista della Questura chiede ancora attestazioni di reddito.
- Residenza elettiva e cittadinanza/apolidia -> lavoro (art. 6 c. 1-bis lett. c e d TU): la norma non dice se la conversione e' fuori quota ne' quale ufficio la riceve; non e' stata trovata una circolare ministeriale: non indicarne nel questionario finche' non e' verificata.
- Residenza elettiva: requisito della 'pensione percepita in Italia' (art. 11 c. 1 lett. c-quater d.P.R. 394/1999) rispetto al d.i. 850/2011 (risorse anche estere; TAR Brescia 146/2026 e, secondo scheda KB, TAR Sicilia 236/2020). Contrasto sull'obbligo del visto per chi e' gia' regolarmente soggiornante: TAR Milano 3130/2023 e TAR Napoli ord. 149/2022 (non serve) contro TAR Brescia 146/2026 (serve visto o conversione da lavoro/famiglia, ma in un caso di titolo scaduto).
- Acquisto cittadinanza/apolidia -> permesso UE: l'albero dice NON POSSIBILE, ma l'art. 9 c. 3 TU non lo esclude; rischio di qualificazione come titolo di breve durata. Nessun precedente trovato.
- Titolo spettante all'apolide riconosciuto e sua convertibilita': non verificati (fuori dalla KB norme consultata).
- Titolari di protezione internazionale che chiedono il permesso familiare: effetti sulla permanenza dello status non verificati; il questionario dovrebbe sconsigliare e rinviare a un avvocato.
- Familiari di cittadini UE e permesso UE di lungo periodo: rapporto con il soggiorno permanente (artt. 14 e 17 d.lgs. 30/2007) non riletto in questa ricerca.
- Regime normativo della KB: il d.lgs. 286/1998 della KB e' aggiornato al 4/6/2026; gli artt. 6, 28 e 30 sono stati riscontrati su Normattiva il 19/11/2026, gli altri articoli citati (5, 9, 19, 22, 29, 29-bis) no.

## D - Protezione e permessi umanitari (asilo, sussidiaria, protezione speciale, richiesta asilo, calamità, cure mediche) (D-protezione.json)

### protezione_speciale → lavoro_subordinato_autonomo

- Nodo: `c_data_5mag_2023 → c_end_lav_sub_ok (ante) / c_end_complicata (post)`, esito nell'albero: POSSIBILE se la domanda del permesso attuale è prima del 5/5/2023; altrimenti 'situazione complicata'
- Esito secondo la ricerca: **condizionato**
- Sostanzialmente coerente, ma: (a) la data rilevante secondo il Cons. Stato è 'prima del 6.5.2023' (domanda presentata fino al 5.5.2023 incluso), mentre la circolare 1.6.2023 usava il 4.5.2023 e l'albero dice 'prima del 5 maggio'; (b) la domanda va riferita alla domanda ORIGINARIA di protezione, non al rinnovo né alla richiesta di conversione: chi ha un rinnovo chiesto dopo il 5.5.2023 di un permesso nato da domanda anteriore risponderebbe 'dopo' e finirebbe erroneamente in 'complicata'; (c) per le domande successive l'esito corretto è 'non possibile' (salvo art. 7 c. 3), non 'complicata'; (d) il nodo c_end_lav_sub_ok parla di nulla osta allo Sportello Unico, non previsto per questa conversione (v. procedura); (e) i nodi c_end_lav_speciale e c_end_lav_cure risultano orfani (nessun arco).

### protezione_speciale → studio

- Nodo: `c_end_stu_speciale`, esito nell'albero: SITUAZIONE COMPLICATA: possibile se la domanda è prima del 5/5/2023
- Esito secondo la ricerca: **condizionato**
- Il riferimento al 5.5.2023 non ha base: il d.l. 20/2023 ha abrogato solo la convertibilità in LAVORO. Per lo studio la base è l'art. 39 cc. 5 e 5-bis TU, che nomina espressamente il permesso ex art. 32 c. 3 d.lgs. 25/2008 e prevede il rilascio da parte del questore del permesso 'studente', indipendentemente dalla data. Limite: vale solo per ITS, formazione superiore (università) e scuole di specializzazione.

### protezione_speciale → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Coerente nell'esito; va precisato che servono i requisiti del ricongiungimento (salvo familiare italiano/UE) e che il d.l. 20/2023 non ha inciso su questa via.

### protezione_speciale → ue_lungo_periodo

- Nodo: `c_end_carta_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- DISCREPANZA RILEVANTE: l'art. 9 c. 3 lett. b) TU esclude espressamente i titolari del permesso ex art. 32 c. 3 d.lgs. 25/2008 (e chi ne ha chiesto il rilascio), in linea con l'art. 3 par. 2 lett. c) dir. 2003/109/CE. Il nodo dovrebbe portare a 'non possibile direttamente; gli anni con protezione speciale contano dopo il passaggio a un titolo idoneo'.

### asilo_rifugiato → lavoro

- Nodo: `c_end_lav_no`, esito nell'albero: NON POSSIBILE (il permesso non consente la conversione)
- Esito secondo la ricerca: **non_possibile**
- Esito corretto ma motivazione fuorviante: la conversione non è prevista perché NON SERVE. Il rifugiato lavora già (subordinato, autonomo, pubblico impiego come cittadini UE) con il permesso per asilo. Il testo andrebbe riformulato in 'non necessaria' (sul modello di c_end_att_asilo) e dovrebbe avvertire di non rinunciare allo status.

### asilo_rifugiato → studio

- Nodo: `c_end_stu_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'albero presenta come normale una conversione che è giuridicamente prevista solo per ITS/università/specializzazioni (art. 39 cc. 5 e 5-bis TU) e che non è necessaria: il rifugiato studia già con il permesso per asilo. Rischio di indurre a lasciare un titolo più forte.

### asilo_rifugiato → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **incerto**
- L'albero dice 'possibile, puoi fare da solo': è giuridicamente dubbio (l'art. 30 c. 1 lett. c TU è generico, ma il permesso per asilo è legato allo status e non è previsto come convertibile: TAR Marche 784/2023) e comunque sconsigliabile. Il nodo andrebbe reso 'non necessario / da valutare con un legale'.

### asilo_rifugiato → ue_lungo_periodo

- Nodo: `c_end_carta_ok`, esito nell'albero: POSSIBILE (5 anni, reddito, test A2)
- Esito secondo la ricerca: **possibile**
- Esito corretto, requisiti imprecisi: per i titolari di protezione internazionale il test di italiano NON è richiesto (art. 9 c. 2-ter TU), non serve la documentazione di idoneità dell'alloggio (c. 1-ter) e il quinquennio decorre dalla data della domanda di protezione (c. 5-bis). Inoltre non è una 'conversione': lo status resta e viene annotato sul permesso UE.

### protezione_sussidiaria → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: POSSIBILE (nulla osta SUI + kit postale)
- Esito secondo la ricerca: **possibile**
- Esito corretto. La procedura indicata dall'albero (nulla osta dello Sportello Unico) non trova base per questa conversione: l'art. 23 c. 2 d.lgs. 251/2007 non la prevede e la prassi è la domanda alla Questura con kit postale (da verificare con la Questura di riferimento). Manca l'avvertenza sugli effetti della perdita dello status.

### protezione_sussidiaria → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: POSSIBILE (nulla osta SUI + kit postale)
- Esito secondo la ricerca: **possibile**
- Esito corretto. La procedura indicata dall'albero (nulla osta dello Sportello Unico) non trova base per questa conversione: l'art. 23 c. 2 d.lgs. 251/2007 non la prevede e la prassi è la domanda alla Questura con kit postale (da verificare con la Questura di riferimento). Manca l'avvertenza sugli effetti della perdita dello status.

### protezione_sussidiaria → studio

- Nodo: `c_end_stu_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Previsto solo per ITS/università/specializzazioni (art. 39 cc. 5-5-bis TU) e non necessario: il permesso per sussidiaria 'consente l'accesso al lavoro e allo studio' (art. 23 c. 2 d.lgs. 251/2007).

### protezione_sussidiaria → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **incerto**
- L'art. 23 c. 2 d.lgs. 251/2007 prevede la conversione solo 'per motivi di lavoro'; l'art. 30 c. 1 lett. c TU è generico. Esito 'possibile, puoi fare da solo' troppo netto: da valutare con un legale.

### protezione_sussidiaria → ue_lungo_periodo

- Nodo: `c_end_carta_ok`, esito nell'albero: POSSIBILE (5 anni, reddito, test A2)
- Esito secondo la ricerca: **possibile**
- Come per l'asilo: per la protezione internazionale niente test di italiano (art. 9 c. 2-ter), niente documentazione di idoneità dell'alloggio (c. 1-ter), quinquennio dalla domanda di protezione (c. 5-bis). Lo status resta annotato.

### richiesta_asilo → lavoro

- Nodo: `c_end_lav_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- Esito corretto; la spiegazione andrebbe articolata per regime: domande ante 12.6.2026 → divieto espresso (art. 22 c. 2 d.lgs. 142/2015 previgente); domande post-Patto → non esiste più un 'permesso' da convertire, ma un documento del richiedente. Eccezione MSNA (art. 14 c. 1-bis DPR 394/1999).

### richiesta_asilo → studio

- Nodo: `c_end_stu_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- Sostanzialmente coerente. Caso limite: l'art. 39 c. 5 TU ammette anche chi è 'regolarmente soggiornante da almeno un anno' con diploma di scuola secondaria superiore conseguito in Italia; resta incerto se il richiedente (soprattutto post-Patto) sia 'regolarmente soggiornante'.

### richiesta_asilo → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Esito plausibile per le domande ante 12.6.2026 (il divieto dell'art. 22 c. 2 previgente riguarda solo il lavoro); da precisare che per le domande post-Patto il richiedente non ha più un 'permesso' da convertire e la sua qualifica di 'regolarmente soggiornante' ex art. 30 c. 1 lett. c TU è incerta. Le vie dell'art. 30 c. 1 lett. d (genitore di minore italiano) e dell'art. 19 c. 2 lett. c (convivente con coniuge/parente italiano) prescindono dal titolo.

### richiesta_asilo → ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- Coerente. Da aggiungere: il periodo da richiedente conta se poi la protezione è riconosciuta (art. 9 c. 5-bis TU) o, secondo Cons. Stato VI 3222/2025, anche se si passa a un altro titolo.

### calamita → lavoro

- Nodo: `c_data_5mag_2023 → c_end_lav_sub_ok (ante) / c_end_complicata (post)`, esito nell'albero: POSSIBILE se domanda prima del 5/5/2023; altrimenti 'complicata'
- Esito secondo la ricerca: **condizionato**
- Per le domande dal 6.5.2023 l'esito corretto è 'non possibile' (divieto espresso nell'art. 20-bis c. 2 TU), non 'complicata'. Data: 'entro il 5 maggio 2023' (incluso), secondo il Cons. Stato.

### calamita → studio

- Nodo: `c_end_stu_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **condizionato**
- Coerente, ma va limitato a ITS/università/specializzazioni: base art. 39 cc. 5 e 5-bis TU, che cita l'art. 20-bis.

### cure_mediche → lavoro

- Nodo: `c_data_5mag_2023 → c_end_lav_sub_ok (ante) / c_end_complicata (post)`, esito nell'albero: POSSIBILE se domanda prima del 5/5/2023; altrimenti 'complicata'
- Esito secondo la ricerca: **condizionato**
- Coerente con l'orientamento del Cons. Stato, salvo: (a) soglia 'entro il 5.5.2023' incluso (prima del 6.5); (b) dopo quella data l'esito è 'non possibile', non 'complicata'; (c) il nodo orfano c_end_lav_cure cita un inesistente 'DL 50/2023' (si tratta della l. 50/2023 di conversione del d.l. 20/2023).

### cure_mediche → attesa_occupazione

- Nodo: `c_end_att_incerta`, esito nell'albero: INCERTA
- Esito secondo la ricerca: **non_possibile**
- L'albero invita a 'tentare'; manca una base normativa: l'attesa occupazione presuppone il permesso per lavoro subordinato (art. 22 c. 11 TU). Solo nel regime transitorio (domanda ≤ 5.5.2023) e con un precedente cautelare (TAR Toscana 232/2024) si può argomentare; esito più corretto 'non possibile, salvo regime transitorio da valutare con un legale'.

### cure_mediche → studio

- Nodo: `c_end_stu_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- Coerente: il permesso ex art. 19 c. 2 lett. d-bis non è nell'elenco dell'art. 39 c. 5 TU. Caso limite: seconda ipotesi del c. 5 (un anno di soggiorno regolare + diploma di scuola superiore italiano).

**Punti da validare**

- Data-soglia d.l. 20/2023: il Consiglio di Stato usa 'prima del 6.5.2023' (entrata in vigore della l. 50/2023); la circolare n. 50432/2023 usava il 4.5.2023; l'albero 'prima del 5 maggio'. Per la protezione speciale per vita privata (soppressa già dal d.l. originario, in vigore dall'11.3.2023) la data utile ai fini del riconoscimento è diversa da quella utile per la convertibilità: verificare caso per caso.
- Giurisdizione sui dinieghi di conversione protezione speciale/cure mediche → lavoro: il Cons. Stato decide nel merito (e in due casi il Tribunale di Firenze aveva declinato), mentre Cass. SU 9791/2023 (RG 16227/2022) e Trib. Firenze R.G. 12514/2023 affermano la giurisdizione ordinaria quando è in gioco la protezione speciale. Contrasto da segnalare nel questionario PRO.
- Cass. SU 12.4.2023: due schede KB (n. 9791/2023 e RG 16227/2022) con stessa data e organo; verosimilmente la stessa decisione: verificare sul PDF.
- Circolare del Ministero dell'Interno del 29.5.2024 (con parere dell'Avvocatura) e circolare n. 50432 dell'1.6.2023: conosciute solo attraverso le sentenze del Consiglio di Stato; estremi e testo da reperire.
- Procedura: l'albero indica per le conversioni in lavoro il nulla osta dello Sportello Unico; per art. 23 c. 2 d.lgs. 251/2007 e art. 7 d.l. 20/2023 non risulta base normativa del nulla osta e la prassi indicata nelle sentenze è la domanda alla Questura (kit postale). Verificare con le Questure e con eventuali circolari.
- Importi del contributo ex art. 5 c. 2-ter TU (DM vigente) non verificati in questa ricerca.
- Art. 39 cc. 5 e 5-bis TU come base per il passaggio protezione speciale/calamità/asilo/sussidiaria → studio: ricavato dal testo, nessuna giurisprudenza trovata; in particolare il 'ponte' studio → lavoro per aggirare il divieto dell'art. 6 c. 1-bis non è testato.
- Asilo e sussidiaria → famiglia: applicabilità dell'art. 30 c. 1 lett. c TU a permessi legati allo status non verificata in giurisprudenza; TAR Marche 784/2023 afferma in generale la non convertibilità del permesso per asilo.
- Richiedenti post-Patto (domande dal 12.6.2026): il documento ex art. 4 d.lgs. 142/2015 / art. 29 par. 4 reg. 2024/1348 non è un permesso di soggiorno; resta da verificare se il richiedente sia 'regolarmente soggiornante' ai fini dell'art. 30 c. 1 lett. c e dell'art. 39 c. 5 TU, e come si legga l'art. 14 c. 1-bis DPR 394/1999 (MSNA), che rinvia al permesso ex art. 4 previgente.
- Compatibilità dell'art. 23 c. 2 d.lgs. 251/2007 (conversione sussidiaria → lavoro) con il reg. 2024/1347 applicabile dal 1.7.2026: ritenuta compatibile (il regolamento non vieta titoli nazionali ulteriori), ma senza precedenti.
- Rinnovi ulteriori della protezione speciale concessi per art. 8 CEDU dopo il rinnovo annuale ex art. 7 c. 3 (Trib. Palermo R.G. 11018/2026): convertibilità in lavoro non decisa.
- Nodi orfani nell'albero: c_end_lav_speciale e c_end_lav_cure non hanno archi in ingresso; c_end_lav_cure cita un 'DL 50/2023' inesistente (è la l. 50/2023).
- Fonti non consultate: ITFPLUS (merito fuori KB) e ricerca Cassazione estesa (solo una query SentenzeWeb, senza risultati pertinenti sulla conversione richiesta asilo → famiglia).

## E - Minori e casi speciali (minore età, assistenza minori art. 31 c. 3, protezione sociale art. 18, sfruttamento lavorativo art. 18-ter ex art. 22 c. 12-quater, violenza domestica art. 18-bis) (E-minori.json)

### minore_eta → lavoro_subordinato_o_autonomo

- Nodo: `c_end_lav_minore`, esito nell'albero: situazione delicata
- Esito secondo la ricerca: **condizionato**
- Il nodo presenta come requisiti generali, alternativi fra loro, '3 anni + 2 di progettò oppure 'parere positivo basato su almeno 6 mesì: in realtà (a) per i figli conviventi ex art. 31 c. 1 e per gli affidati non MSNA vale l'art. 32 c. 1 senza parere; (b) il parere positivo riguarda i MSNA affidati o sotto tutela, il canale 3+2 anni i MSNA in progetto di ente iscritto (c. 1-bis e 1-ter); (c) i '6 mesì vengono dalle Linee guida ministeriali 2017 come durata preferibile, non dalla norma (art. 14-bis c. 3 d.P.R. 394/1999 parla solo di durata della permanenza). I 'Tempì sono imprecisi: la richiesta di parere va presentata da 90 giorni prima dei 18 anni fino a 60 giorni dalla scadenza del permesso (art. 14-bis c. 2), non '60 giorni primà. Manca che il permesso dura al massimo un anno (c. 1-bis dal 6.5.2023). Corretto il riferimento alla verifica del contratto dal 6.10.2023 (c. 1-bis.1), che però vale solo per il canale c. 1-bis.

### minore_eta → attesa_occupazione

- Nodo: `c_end_att_minore`, esito nell'albero: situazione particolare
- Esito secondo la ricerca: **condizionato**
- Stesse imprecisioni del nodo c_end_lav_minore sui canali (c. 1 / c. 1-bis / c. 1-ter), sui '6 mesì (Linee guida, non norma) e sui tempi (90 giorni prima - 60 giorni dalla scadenza, art. 14-bis c. 2). Va chiarito che il titolo di arrivo è il permesso 'per accesso al lavorò dell'art. 32, che prescinde dai requisiti dell'art. 23, e che dura al massimo un anno per il canale c. 1-bis. La verifica del contratto (c. 1-bis.1) non si applica a questo titolo.

### minore_eta → studio

- Nodo: `c_end_stu_minore`, esito nell'albero: situazione particolare
- Esito secondo la ricerca: **condizionato**
- Stesse imprecisioni sui canali, sui '6 mesì e sui tempi rilevate per c_end_lav_minore. Andrebbe aggiunto che serve l'iscrizione effettiva a un corso (requisiti del permesso per studio) e che, per il canale c. 1-bis, il permesso dura al massimo un anno.

### minore_eta → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **condizionato**
- Il nodo generico 'possibilè e i requisiti indicati (coniuge, figlio minore, figlio maggiorenne disabile, genitore a carico) non tengono conto che il titolare del permesso per minore età è di regola un MSNA senza familiari regolari in Italia, e che dopo i 18 anni il figlio maggiorenne rientra solo se totalmente invalido (art. 29 c. 1 lett. c). Esito realistico: condizionato.

### minore_eta → esigenze_sanitarie_o_di_cura

- Nodo: `c_end_altro_wip`, esito nell'albero: altro tipo di permesso (in costruzione)
- Esito secondo la ricerca: **condizionato**
- Coppia non coperta dall'albero (finisce in 'Altrò): andrebbe aggiunta per il questionario PRO.

### minore_eta → integrazione_prosieguo_amministrativo

- Nodo: `c_end_altro_wip`, esito nell'albero: altro tipo di permesso (in costruzione)
- Esito secondo la ricerca: **condizionato**
- Coppia non coperta dall'albero: il prosieguo amministrativo e il permesso 'per integrazionè sono lo strumento tipico per i MSNA vicini ai 18 anni che non hanno ancora i requisiti dell'art. 32.

### assistenza_minori → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **possibile**
- Esito corretto, ma il nodo condiviso dice 'Devi prima richiedere il nulla osta presso lo Sportello Unicò: per la conversione di un permesso già posseduto non serve il nulla osta al lavoro dell'art. 22 (procedura per chi è all'estero); da verificare con la prassi delle Questure. Non menziona la tensione con l'art. 29 c. 6, utile al professionista per prevenire dinieghi.

### assistenza_minori → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **possibile**
- Come per il lavoro subordinato: il riferimento al nulla osta dello Sportello unico non si attaglia alla conversione; per il lavoro autonomo servono i requisiti dell'art. 26 T.U. (titoli abilitativi, risorse, iscrizioni).

### assistenza_minori → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **condizionato**
- Esito 'possibilè troppo netto: la conversione ex art. 30 c. 1 lett. c) richiede i requisiti del ricongiungimento con un familiare regolarmente soggiornante, italiano o UE.

### protezione_sociale_art18 → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **possibile**
- Esito corretto; il riferimento al nulla osta dello Sportello unico non è pertinente (art. 27 c. 3-bis d.P.R. 394/1999: conversione 'secondo le modalità stabilitè per il permesso per lavoro, con decurtazione delle quote dell'anno successivo, non quota disponibile).

### protezione_sociale_art18 → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **condizionato**
- L'art. 18 c. 5 menziona solo il lavoro subordinato (diversamente dagli artt. 18-bis e 18-ter, che citano anche l'autonomo); l'art. 27 c. 3-bis d.P.R. 394/1999 parla genericamente di 'permesso di soggiorno per lavorò. L'esito 'possibile, puoi fare da solò è troppo netto.

### protezione_sociale_art18 → studio

- Nodo: `c_end_stu_no`, esito nell'albero: non possibile
- Esito secondo la ricerca: **possibile**
- DISCREPANZA: l'albero dice 'non possibilè, ma l'art. 18 c. 5, ultimo periodo, T.U. prevede espressamente la conversione in permesso per studio se il titolare è iscritto a un corso regolare di studi (periodo presente già nel testo vigente al 1.10.2024 e confermato dopo il d.lgs. 115/2026).

### protezione_sociale_art18 → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **condizionato**
- Esito 'possibilè troppo netto: servono i requisiti del ricongiungimento con un familiare regolare, italiano o UE (art. 30 c. 1 lett. c).

### sfruttamento_lavorativo_art18ter → lavoro_subordinato

- Nodo: `c_end_lav_sub_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **possibile**
- Esito corretto. L'etichetta dell'albero 'Sfruttamento lavorativo (Art. 22 co. 12quater)' è superata: la norma vigente è l'art. 18-ter T.U. Il riferimento al nulla osta dello Sportello unico non è pertinente: la conversione avviene 'al di fuori delle quotè.

### sfruttamento_lavorativo_art18ter → lavoro_autonomo

- Nodo: `c_end_lav_aut_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **possibile**
- Esito corretto; etichetta normativa superata (art. 18-ter, non art. 22 c. 12-quater); nulla osta non pertinente.

### sfruttamento_lavorativo_art18ter → attesa_occupazione

- Nodo: `c_end_att_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **incerto**
- DISCREPANZA: l'albero indica 'possibilè (e 'anche senza precedente esperienza lavorativà), ma l'art. 18-ter c. 4 prevede la conversione solo in lavoro subordinato, autonomo o studio. Incoerenza interna: per la protezione sociale art. 18 lo stesso target è 'incertà. Esito corretto: incerto.

### sfruttamento_lavorativo_art18ter → studio

- Nodo: `c_end_stu_no`, esito nell'albero: non possibile
- Esito secondo la ricerca: **possibile**
- DISCREPANZA: l'albero dice 'non possibilè, ma l'art. 18-ter c. 4 T.U. prevede la conversione in permesso per studio se il titolare è iscritto a un regolare corso di studi. Solo per i vecchi permessi ex art. 22 c. 12-quater (c. 12-sexies previgente) la conversione in studio non era prevista.

### sfruttamento_lavorativo_art18ter → famiglia

- Nodo: `c_end_fam_ok`, esito nell'albero: possibile
- Esito secondo la ricerca: **condizionato**
- Esito 'possibilè troppo netto: servono i requisiti del ricongiungimento (art. 30 c. 1 lett. c).

### sfruttamento_lavorativo_art18ter → permesso_ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: non possibile
- Esito secondo la ricerca: **incerto**
- L'esito 'non possibilè era corretto per il permesso ex art. 22 c. 12-quater, espressamente escluso dall'art. 9 c. 3 lett. b). L'art. 18-ter non è menzionato nell'art. 9 c. 3 lett. b) (né nell'art. 5 c. 2-ter): difetto di coordinamento del d.l. 145/2024. Con la giurisprudenza sulla tassatività delle esclusioni (CdS 9150/2014) l'esclusione del titolare 18-ter non è testuale: esito incerto.

### violenza_domestica_art18bis → lavoro_subordinato_o_autonomo

- Nodo: `None`, esito nell'albero: coppia non presente nell'albero
- Esito secondo la ricerca: **possibile**
- Permesso non presente fra i permessi di partenza dell'albero: va aggiunto.

### violenza_domestica_art18bis → studio

- Nodo: `None`, esito nell'albero: coppia non presente nell'albero
- Esito secondo la ricerca: **possibile**
- Permesso non presente fra i permessi di partenza dell'albero.

### violenza_domestica_art18bis → permesso_ue_lungo_periodo

- Nodo: `None`, esito nell'albero: coppia non presente nell'albero
- Esito secondo la ricerca: **non_possibile**
- Permesso non presente fra i permessi di partenza dell'albero.

**Punti da validare**

- CdS 7449/2024: la scheda KB riferisce che il parere negativo della DG vincola la Questura, in contrasto con CdS 3431/2020 e 2525/2021 (parere mai vincolante, anche se negativo). Verificare sul testo integrale prima di usarla.
- Effetti della sostituzione dell'art. 32 c. 1-bis (art. 4-bis d.l. 20/2023, dal 6.5.2023): venuto meno il silenzio-assenso, resta sostenibile la natura non vincolante del parere affermata dalla giurisprudenza formata sul testo previgente? Nessuna sentenza nella KB applica espressamente il testo nuovo.
- Durata massima di un anno del permesso ex art. 32 c. 1-bis: si applica anche alle conversioni ex c. 1 (figli ex art. 31 c. 1 e affidati non MSNA)? La lettera ('Il permesso di soggiorno di cui al comma 1 può essere rilasciato, per il periodo massimo di un anno ... ai minori stranieri non accompagnatì) sembra limitarla ai MSNA.
- Linee guida DG Immigrazione 24.2.2017 (esoneri dal parere, sei mesi preferibili): da verificare se ancora applicate o aggiornate dopo il d.l. 20/2023 e il d.P.R. 394/1999 come modificato (art. 14-bis).
- Assistenza minori -> lavoro: prevalenza dell'art. 6 c. 1-bis lett. h (d.l. 130/2020) sull'art. 29 c. 6 (divieto ancora nel testo). Nessuna sentenza trovata; verificare la prassi delle Questure e eventuali circolari.
- Nodi condivisi c_end_lav_sub_ok / c_end_lav_aut_ok: l'indicazione 'prima il nulla osta presso lo Sportello unicò non pare pertinente per le conversioni da assistenza minori, art. 18, 18-bis e 18-ter: da verificare.
- Art. 18 -> lavoro autonomo: la norma primaria (c. 5) cita solo il lavoro subordinato; l'art. 27 c. 3-bis d.P.R. 394/1999 parla di 'lavorò senza distinguere.
- Art. 18-ter e permesso UE / contributo: l'art. 18-ter non è citato né nell'art. 9 c. 3 lett. b) né nell'art. 5 c. 2-ter. Esclusione dal permesso UE ed esenzione dal contributo restano incerte.
- Norma transitoria del d.l. 145/2024 per i permessi già rilasciati ex art. 22 c. 12-quater (convertibilità in studio, durata): non verificata in questa ricerca.
- Computo, ai fini del permesso UE, degli anni trascorsi con permessi ex artt. 18, 18-bis e 18-ter dopo la conversione in lavoro (art. 9 c. 5 esclude solo le lett. d ed e).
- Giurisdizione sul diniego di conversione da permesso art. 18/18-bis/18-ter in lavoro: TAR (art. 6 c. 10) o giudice ordinario (diritto soggettivo, SU 32044/2018 sul rilascio)? Non verificato.
- Art. 32 c. 1 'esigenze sanitarie o di curà: applicabilità ai MSNA affidati ex art. 2 l. 184/1983 (il c. 1 fa salvo il c. 1-bis, che non prevede le cure).
- CdS 9150/2014: il numero indicato nella scheda KB potrebbe essere il R.G.; TAR Campania 'R.G. 4596/2015': numero di sentenza non indicato. Verificare gli estremi sul PDF.
- Modalità di presentazione (kit postale o Questura) e importi di contributo e bollettino: variano per tipologia e Questura; non verificati in questa ricerca.

## Permesso UE per soggiornanti di lungo periodo (F-ue-lungo-periodo.json)

### protezione_speciale → ue_lungo_periodo

- Nodo: `c_end_carta_ok`, esito nell'albero: POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- L'albero dice POSSIBILE, ma l'art. 9 c. 3 lett. b) TU esclude espressamente i titolari del permesso ex art. 32 c. 3 d.lgs. 25/2008 (protezione speciale), in linea con l'art. 3, par. 2, lett. c) dir. 2003/109. La domanda diretta va dichiarata non possibile; e' possibile dopo la conversione in lavoro (dove ancora ammessa) o il passaggio ad altro titolo.

### acquisto_cittadinanza_apolide → ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **incerto**
- L'albero dice NON POSSIBILE, ma nessuna norma letta esclude il titolare del permesso per acquisto della cittadinanza o dello stato di apolide (art. 11 c. 1 lett. c) d.P.R. 394/1999), che e' rilasciato a chi era gia' titolare di altro permesso e dura quanto il procedimento. L'esito andrebbe riformulato come incerto/condizionato.

### motivi_religiosi → ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **condizionato**
- L'albero dice NON POSSIBILE, ma il permesso per motivi religiosi (art. 5 c. 2 TU) non e' tra le esclusioni dell'art. 9 c. 3 TU; la CGUE (C-502/10, proprio su guide spirituali) esclude che sia automaticamente formalmente limitato, e il Consiglio di Stato (4317/2018) ha confermato l'obbligo della Questura di esaminare nel merito la domanda di permesso UE di una ex religiosa. L'esito va riformulato come condizionato (reddito).

### ricerca_scientifica → ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **possibile**
- L'albero dice NON POSSIBILE, ma il permesso per ricerca (art. 27-ter TU) non e' escluso dall'art. 9 c. 3 e l'art. 9 c. 2-bis prevede anzi l'esonero dal test di italiano per il permesso UE rilasciato a ricercatori di universita' ed enti vigilati dal MIUR. L'esclusione vale solo per il permesso per ricerca basato su borsa di addestramento alla ricerca, trattato come studio (art. 27-ter c. 7).

### sfruttamento_art22_c12quater → ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **non_possibile**
- Esito corretto, ma l'albero rinvia all'art. 22 c. 12-quater, abrogato dal d.l. 145/2024: il permesso per vittime di sfruttamento lavorativo e' ora disciplinato dall'art. 18-ter TU (dicitura casi speciali), che l'art. 9 c. 3 lett. b) non menziona. Aggiornare l'etichetta e segnalare il vuoto di coordinamento.

### altro_generico → ue_lungo_periodo

- Nodo: `c_end_carta_no`, esito nell'albero: NON POSSIBILE
- Esito secondo la ricerca: **incerto**
- L'esito NON POSSIBILE per qualsiasi altro permesso e' troppo generale: le esclusioni dell'art. 9 c. 3 sono tassative (Cons. Stato 1909/2015; TAR Lombardia 6461/2010) e un titolo non elencato e non di breve durata consente la domanda.

**Punti da validare**

- Computo degli anni di studio dopo la conversione: integrale secondo il testo dell'art. 9 c. 5 TU e TAR Bologna 834/2022 (in motivazione), oppure per meta' secondo l'art. 4, par. 2, dir. 2003/109; non e' stata trovata giurisprudenza specifica ne' prassi ministeriale letta.
- Computo dei periodi come titolare di permessi esclusi (cure mediche, calamita', art. 18, protezione speciale) dopo il passaggio a lavoro: orientamento favorevole dei TAR (Bologna 834/2022, Napoli 2911/2021, Latina 817/2026) e del Consiglio di Stato per la richiesta asilo (3222/2025), ma la direttiva esclude i soggiorni temporanei (art. 3, par. 2, lett. e) e la prassi di alcune Questure e' contraria (TRGA Bolzano 15/2024, riformata). Non risulta una pronuncia del Consiglio di Stato specifica su protezione speciale/umanitaria.
- Permesso ex art. 18-ter (sfruttamento, d.l. 145/2024): non citato dall'art. 9 c. 3 lett. b), che rinvia ancora all'abrogato art. 22 c. 12-quater; incerto se la domanda diretta sia esclusa.
- Permesso per acquisto cittadinanza/apolidia: l'albero lo esclude ma non e' stata trovata norma o pronuncia che lo escluda; da validare.
- Permesso per motivi religiosi: Cons. Stato 4317/2018 e CGUE C-502/10 indicano che il permesso UE e' ottenibile; l'albero lo esclude.
- Permesso per ricerca: l'albero lo esclude, ma l'art. 9 c. 2-bis presuppone il rilascio ai ricercatori (con esonero dal test); escluso solo se basato su borsa di addestramento (art. 27-ter c. 7).
- Regime Patto: art. 4, par. 3-bis dir. 2003/109 (introdotto dall'art. 40 reg. 2024/1347, recepimento entro 12.6.2026) non recepito nell'art. 9 TU; verificare se interventi normativi successivi al 19.11.2026 o circolari lo attuino. Verificare anche se la data di decorrenza del c. 5-bis (presentazione) vada letta come manifestazione di volonta' o formalizzazione dopo il d.l. 100/2026.
- Regime Patto per i richiedenti: dopo il d.l. 100/2026 il richiedente riceve un documento ex art. 4 c. 4 d.lgs. 142/2015 anziche' il permesso per richiesta asilo; la qualificazione di quel periodo ai fini del quinquennio (Cons. Stato 3222/2025 riguardava il vecchio permesso semestrale) va verificata.
- Familiari per cui il titolare chiede il permesso UE senza cinque anni propri (art. 9 c. 1): compatibilita' con CGUE C-469/13 (letta solo tramite il parere Cons. Stato 1707/2016).
- Importi correnti di contributo (art. 5 c. 2-ter TU) e assegno sociale 2026: non verificati in questa ricerca, da aggiornare dalle fonti ufficiali (decreto MEF-Interno vigente; circolare INPS annuale).
- La richiesta indicava il d.m. 4.6.2010: risulta abrogato e sostituito dal d.m. 7.12.2021 (G.U. 12.2.2022), letto dalla copia G.U. su lentepubblica.it; verificare eventuali modifiche successive.
- Le sentenze con fonte KB e letta_integrale false (Cons. Stato 6423/2022 e 1909/2015, CGUE C-302/18, C-432/20, C-624/20, TAR Piemonte 668/2022 e ord. 53/2026, TAR Veneto R.G. 564/2026, TAR Lazio 2935/2018, TAR Lombardia 6461/2010, TAR Campania 326/2020) sono riportate dalle schede: estremi e principio da confermare sul testo integrale prima dell'uso in atti.
