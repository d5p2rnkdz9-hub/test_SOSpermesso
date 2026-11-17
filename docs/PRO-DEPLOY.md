# Area PRO — messa in produzione

> Scritto il 2026-11-07. Lo sviluppo gira sul branch Neon `dev`; niente di questo è ancora
> stato fatto sul branch di produzione né su Netlify. Ordine: 1 → 2 → 3 → 4.

## Cosa comprende l'area PRO (tutto nell'app, dietro `getProAccess()`)

| Funzione | Pagine | Dati |
|---|---|---|
| Account (magic link) | `/[locale]/accedi`, `/account` | schema `auth` (Better Auth) |
| Scadenziario pratiche | `/account/pratiche` | `pro.pratica`, `pro.pratica_promemoria` |
| Archivio circolari completo | `/pro/circolari`, `/pro/circolari/[id]` | `pro.circolare` (1905 documenti), `pro.segue_permesso`, `pro.circolare_avviso` |
| Assistente (chatbot con strumenti) | `/pro/assistente` | `pro.chat_conversazione`, `pro.chat_messaggio` |
| Cron giornaliero (promemoria + digest circolari) | `/api/cron/promemoria` | trigger `netlify/functions/promemoria-cron.mts`, 06:30 UTC |

Le pagine PRO mostrano un teaser con il link al login a chi non è registrato (`ProGate`);
lo scadenziario reindirizza al login.

## 1. Database di produzione (Neon, branch principale)

Da locale, con `NEON_DATABASE_URL_PROD` in `.env.local`:

```bash
# Tabelle Better Auth (schema auth): usa src/lib/auth.ts e NEON_DATABASE_URL
NEON_DATABASE_URL="$NEON_DATABASE_URL_PROD" npx @better-auth/cli migrate
```

```bash
# Tabelle PRO (schema pro): scripts/sql/*.sql, idempotente
node --env-file=.env.local scripts/db-migrate.mjs --prod
```

```bash
# Corpus circolari: export dal SQLite del sito, poi import (circa 2 minuti)
cd ../Sito_Nuovo && python3 data-pipeline/export_circolari_pro.py && cd ../app && node --env-file=.env.local scripts/import-circolari.mjs --prod
```

Rifare l'export + import ogni volta che la pipeline Python aggiorna `data/circolari.db`: i
documenti nuovi prendono `importata_at = now()` ed entrano nel digest email di chi segue il
permesso.

## 1-bis. Dominio pro.sospermesso.it (alias dello stesso deploy)

Netlify → progetto dell'app → **Domain management** → *Add a domain alias* → `pro.sospermesso.it`.
Se il DNS di sospermesso.it è su Netlify DNS il record viene creato da solo; altrimenti al
provider DNS va aggiunto un CNAME `pro` → `<nome-progetto>.netlify.app`. Il certificato HTTPS lo
rinnova Netlify. Lato codice è già previsto (`PROD_HOSTS` in `src/lib/site-url.ts`):
sessione valida su entrambi gli host (cookie su `.sospermesso.it`), link magico sullo stesso
host da cui si parte, home di pro. → `/it/account`, link delle email PRO su pro.

## 2. Variabili d'ambiente su Netlify (progetto dell'app: app. e pro.sospermesso.it)

| Variabile | Valore | Note |
|---|---|---|
| `NEON_DATABASE_URL` | connection string del branch di produzione | già usata dalle analytics |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | diverso da quello locale |
| `BETTER_AUTH_URL` | `https://app.sospermesso.it` | fallback: in produzione il base URL segue l'host della richiesta |
| `NEXT_PUBLIC_PRO_URL` | `https://pro.sospermesso.it` | facoltativa, è già il default in produzione |
| `RESEND_API_KEY` | stessa del sito | link di accesso, promemoria, digest |
| `RESEND_FROM` | `SOS Permesso <accesso@sospermesso.it>` | facoltativa, dominio verificato su Resend |
| `ANTHROPIC_API_KEY` | stessa del sito | assistente PRO |
| `CRON_SECRET` | `openssl rand -hex 24` | letta dalla route e dalla scheduled function |
| `CHATBOT_PRO_ENABLED` | non impostarla | assistente PRO sospeso dal 16/11/2026: si accende solo con `1` (test in locale) |
| `ACCOUNT_UNICO` | `1` solo quando SOS Flussi PRO è online con l'account unico | testi dell'account unico (email, accedi, account, avviso prima di eliminare); spenta per default |
| `PRO_ACCESSO_LIBERO` | **non impostarla** finché il PRO è gratis; `0` quando si fa pagare | **qui il lancio gratuito è acceso se manca**, si spegne solo con `0` (su SOS Flussi il default è l'opposto) |
| `STRIPE_SECRET_KEY` | facoltativa, stessa di SOS Flussi | solo per annullare l'abbonamento quando l'account si elimina da qui; senza, chi ha un abbonamento vivo non può eliminare l'account da qui (messaggio che rimanda a sosflussi.it) |

Le variabili sono lette anche da pagine generate in build (es. `/accedi`): dopo averle cambiate su Netlify
rifare il deploy. Non servono qui: `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_*` (checkout e webhook stanno su
sosflussi.it).

`URL` la mette Netlify da sola (usata dalla scheduled function per chiamare la route).

## 3. Deploy e verifica

1. `git push` (solo con il permesso esplicito di Alberto) → build Netlify.
2. Registrazione con una mail vera: il link arriva da Resend.
3. `/it/account/pratiche`: inserire una pratica con scadenza entro 90 giorni.
4. Lanciare il cron a mano e controllare il JSON di risposta:

```bash
curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://app.sospermesso.it/api/cron/promemoria
```

5. `/it/pro/assistente`: una domanda di prova → la risposta deve citare almeno una circolare con link.
   **Prerequisito:** credito sul conto Anthropic. Il 7/11/2026 l'API rispondeva
   `Your credit balance is too low`: fino alla ricarica l'assistente (e il chatbot del sito)
   rispondono con un errore.

## 3-bis. Account unico con SOS Flussi (ramo `account-unico`)

Piano in `PRO-PREMIUM-PIANO.md`, «Account unico». Ordine:

1. **Neon, branch di produzione → backup** (branch Neon, es. `prima-account-unico`).
2. **Migrazione da SOS Flussi** (`SOSflussi/strumenti/pro/migra.mjs`, prima `--controllo`): aggiunge allo
   schema `auth` la colonna `user."stripeCustomerId"` e la tabella `subscription` (crea tutto se `auth`
   non esistesse ancora). Lo stesso sul branch dev. Qui non serve nessuna migrazione: `better-auth`
   1.7.25 ha le stesse tabelle della 1.7.18.
3. **Deploy di questo ramo** (merge in `main`, solo col permesso di Alberto). Senza variabili nuove non
   cambia niente per gli utenti: il lancio gratuito resta acceso, nessun testo nomina SOS Flussi. Il
   codice tollera la tabella `subscription` assente, quindi l'ordine 2 → 3 è prudente ma non obbligato.
4. Quando SOS Flussi PRO è online con `ACCOUNT_UNICO=1`: qui `ACCOUNT_UNICO=1` (+ `STRIPE_SECRET_KEY` se si
   vuole che l'eliminazione da qui annulli l'abbonamento) → deploy.
5. **Solo quando si vuole far pagare**: `PRO_ACCESSO_LIBERO=0` → deploy. Da quel momento chi non ha un
   abbonamento `pro` attivo o in prova vede i teaser con «Abbonati» (link a sosflussi.it), non riceve
   promemoria e avvisi, ma conserva account e pratiche salvate.

Verifica: stessa email sui due siti → stesso utente (`auth."user"`); abbonamento di prova fatto su
sosflussi.it → qui il piano risulta «in prova fino al…»; con `PRO_ACCESSO_LIBERO=0` un account senza
abbonamento vede il teaser su `/pro/circolari` e `/account/pratiche`; eliminazione da qui con
abbonamento vivo e senza `STRIPE_SECRET_KEY` → rifiutata con il messaggio. Test automatici della regola
(Postgres in memoria): `npm test`.

## 4. Dopo il lancio

- Passaggio a pagamento: `PRO_ACCESSO_LIBERO=0` (sezione 3-bis); `getProAccess()` controlla già
  l'abbonamento nella tabella comune, nessuna pagina cambia.
- Costi assistente: `claude-opus-5-5`, effort `low`, tetto `DAILY_LIMIT` messaggi/utente/giorno e
  `GLOBAL_DAILY_LIMIT` globale in `src/lib/chat-pro.ts`. Il modello è una costante (`CHAT_MODEL`).
- Il sito (11ty) non sa chi è loggato: le sezioni PRO del sito restano teaser + link all'app.

## Manutenzione dei file generati (committati)

| File | Comando | Quando |
|---|---|---|
| `src/lib/permits-list.generated.ts` | `node scripts/generate-permits-list.js` | nuovo permesso o rinnovo aggiunto su Notion |
| `src/lib/permits-kb.generated.ts` | `node scripts/generate-permits-kb.js` | schede permesso modificate (dopo `fetch-notion` nel sito) |
| `src/lib/pro-content*.generated.ts` | `node scripts/generate-pro-content.js` | `pro-content-shared/pro-content.json` modificato |
