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
| `PRO_ACCESS_MODE` | `free` | periodo di lancio (vedi pro-access.ts) |
| `CHATBOT_PRO_DISABLED` | `1` solo per spegnere l'assistente | kill switch |

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

## 4. Dopo il lancio

- Quando si passa a pagamento: `getProAccess()` aggiunge il controllo abbonamento Stripe
  (piano in `PRO-PREMIUM-PIANO.md`), nessuna pagina cambia.
- Costi assistente: `claude-opus-5-5`, effort `low`, tetto `DAILY_LIMIT` messaggi/utente/giorno e
  `GLOBAL_DAILY_LIMIT` globale in `src/lib/chat-pro.ts`. Il modello è una costante (`CHAT_MODEL`).
- Il sito (11ty) non sa chi è loggato: le sezioni PRO del sito restano teaser + link all'app.

## Manutenzione dei file generati (committati)

| File | Comando | Quando |
|---|---|---|
| `src/lib/permits-list.generated.ts` | `node scripts/generate-permits-list.js` | nuovo permesso o rinnovo aggiunto su Notion |
| `src/lib/permits-kb.generated.ts` | `node scripts/generate-permits-kb.js` | schede permesso modificate (dopo `fetch-notion` nel sito) |
| `src/lib/pro-content*.generated.ts` | `node scripts/generate-pro-content.js` | `pro-content-shared/pro-content.json` modificato |
