# PRO premium — piano (registrazione → pagamenti)

> Concordato il 2026-11-06. Passo 1 (registrazione, accesso gratuito nel periodo di
> lancio) in corso; passo 2 (pagamenti) da fare quando si decide di far pagare.
> **Aggiornato il 2026-11-17: account e abbonamento unici con SOS Flussi** (sezione sotto).
> Checkout, Customer Portal e webhook Stripe stanno su sosflussi.it; qui si legge soltanto.

## Decisioni prese

- **Self-service**: chi visita la sezione premium si registra da solo. Niente organizzazioni
  create a mano, niente contatti commerciali.
- **Login senza password** con link via email (Better Auth `magicLink`, email via Resend).
  Google/Microsoft eventualmente dopo, come `socialProviders`.
- **Lancio gratuito**: primi giorni / primi ~100 utenti, basta essere registrati. Interruttore
  `PRO_ACCESSO_LIBERO`: **qui il lancio è acceso se la variabile non è impostata** e si spegne solo con
  `PRO_ACCESSO_LIBERO=0` (su SOS Flussi è il contrario: acceso solo con `=1`). Scelto così per non
  togliere l'accesso a nessuno al momento del deploy. `user.createdAt` permette di riconoscere i primi iscritti.
- **Poi a pagamento**: prova di **5 giorni con carta** richiesta subito, addebito automatico al
  giorno 6 salvo disdetta (Stripe).
- **Fatture automatiche**: Stripe + **Fatture in Cloud** via API, fattura elettronica allo SDI
  per ogni pagamento. Venditore: soggetto con P.IVA già attivo.
- **DB**: Neon `eu-central-1`, schema Postgres `auth` separato dalle analytics. Lo schema Prisma
  (quiz `corso-ai`) non si usa.

## Passo 1 — registrazione (in corso)

- `src/lib/auth.ts` (Better Auth + `magicLink`), `src/app/api/auth/[...all]/route.ts`
- `src/lib/pro-access.ts` → `getProAccess(headers)`: **unico punto** che decide chi vede il premium
- Paywall vero: le massime integrali stanno solo in `pro-content-premium.generated.ts`
  (`server-only`), servite da `GET /api/pro/sentenze/[slug]`
- Pagine `/[locale]/accedi` e `/[locale]/account`, link nell'header

## Account unico con SOS Flussi (dal 2026-11-17)

Un account e un abbonamento per sospermesso.it e sosflussi.it (contratto completo nel `PRO.md` del
repo SOS Flussi, sezione «Account unico con SOS Permesso»).

- **Schema `auth` condiviso**: SOS Flussi (con `ACCOUNT_UNICO=1`) usa le stesse tabelle Better Auth e
  vi aggiunge, con la sua migrazione (`SOSflussi/strumenti/pro/migra.mjs`), la colonna
  `user."stripeCustomerId"` e la tabella `auth.subscription` (plugin `@better-auth/stripe`). Qui il plugin
  **non** è installato: niente checkout, niente webhook. Le sessioni restano per dominio (cookie e
  `BETTER_AUTH_SECRET` diversi): si entra separatamente sui due siti con la stessa email.
- **Versioni fissate insieme**: `better-auth` `1.7.25` esatta nelle due app (tabelle identiche alla
  1.7.18 usata prima, nessuna migrazione). Dopo ogni aggiornamento: `migra.mjs` su SOS Flussi e
  `npx @better-auth/cli migrate` qui.
- **Chi è PRO** (`src/lib/pro-entitlement.ts`, usata da `getProAccess`): riga in `auth.subscription` con
  `"referenceId" = user.id`, `lower(plan) = 'pro'`, `status IN ('active','trialing')` (stessa regola di
  SOS Flussi, da qualunque sito sia stato fatto l'abbonamento), **oppure** lancio gratuito
  (`PRO_ACCESSO_LIBERO`, vedi sopra). Un piano con un altro nome non apre il PRO qui. Se la tabella
  `subscription` non esiste ancora (SOS Flussi non ha migrato) vale «nessun abbonamento», senza errori.
  Gli omaggi di SOS Flussi (`flussi_pro.omaggio`) qui non valgono.
- `getProAccess` risponde `anonymous` (login), `no-plan` (account senza PRO: le pagine PRO mostrano il
  teaser con il link «Abbonati», le API rispondono 403 `subscription_required`; la pagina account, il
  profilo e l'eliminazione restano usabili) o `active` con il motivo (`subscription` / `trial` /
  `free-launch`) e i dati dell'abbonamento per la pagina account.
- **Abbonarsi / gestire l'abbonamento**: link a `https://sosflussi.it/account/#abbonamento`.
- **Eliminare l'account** elimina l'utente comune, quindi anche l'account di SOS Flussi, con le pratiche
  dei due siti (`ON DELETE CASCADE`). `user.deleteUser.beforeDelete` (`src/lib/auth.ts`) annulla subito su
  Stripe gli abbonamenti vivi (`active`, `trialing`, `past_due`, `unpaid`, `incomplete`, `paused`) se qui
  c'è `STRIPE_SECRET_KEY`; **senza la chiave, con un abbonamento vivo l'eliminazione è rifiutata**
  («Hai un abbonamento attivo: annullalo prima da sosflussi.it/account/, poi elimina l'account»), mai un
  abbonamento che continua ad addebitare su un account sparito. `afterDelete` toglie le righe
  `subscription` dell'utente.
- **Promemoria e avvisi delle circolari** (cron): con il lancio spento partono solo a chi ha l'accesso PRO;
  le pratiche degli altri restano salvate.
- **`ACCOUNT_UNICO=1`** (spenta per default, accenderla solo quando SOS Flussi PRO è online): riga
  «Lo stesso account e lo stesso abbonamento valgono anche su SOS Flussi PRO (sosflussi.it).» nell'email del
  link, frase e link «Abbonati» / «Gestisci abbonamento» nella pagina account, frase nella pagina accedi,
  avviso prima di eliminare l'account. Senza, nessun testo nomina SOS Flussi.
- Un link chiesto su un sito annulla quello non ancora usato dell'altro (tabella `verification` comune).
  Limiti per IP (`rateLimit`) condivisi.

## Passo 2 — pagamenti

> Con l'account unico il plugin Stripe, il checkout, il Customer Portal e **l'unico webhook** stanno su
> sosflussi.it (`https://sosflussi.it/api/auth/stripe/webhook`). Qui non si installa
> `@better-auth/stripe` e non si crea nessun endpoint webhook: due endpoint scriverebbero la stessa
> tabella con lo stesso evento. Il piano qui sotto resta come riferimento (è quello applicato su SOS
> Flussi); il webhook separato delle fatture segue la stessa regola: uno, su un sito solo.

### Stripe
- Plugin `@better-auth/stripe`: `subscription.enabled`, un piano `pro` con
  `freeTrial: { days: 5 }` (il plugin concede **una sola prova per utente**).
  Webhook del plugin: `/api/auth/stripe/webhook` (eventi `checkout.session.completed`,
  `customer.subscription.created|updated|deleted`).
- Checkout ospitato da Stripe (nessun dato carta da noi), via `getCheckoutSessionParams`:
  `billing_address_collection: "required"`, `tax_id_collection` (P.IVA), campi personalizzati
  **Codice fiscale** e **Codice SDI o PEC**, prezzo **IVA inclusa**, `locale: "it"`.
- Disdetta, cambio carta, ricevute: Stripe Customer Portal (`authClient.subscription.billingPortal`).
- `getProAccess`: fatto (lettura diretta di `auth.subscription`, vedi «Account unico»). Decidere cosa
  fare dei primi 100 iscritti (gratis per sempre / sconto / coupon Stripe).
- Stato dell'abbonamento: nella pagina `/[locale]/account` (lancio gratuito / attivo fino al… / in prova /
  nessun abbonamento), con il link a sosflussi.it per abbonarsi o gestire.

### Fatture automatiche
- Webhook **separato** `/api/stripe/fatture` (secret proprio), solo `invoice.paid` con
  `amount_paid > 0` → `POST /c/{company_id}/issued_documents` su Fatture in Cloud con
  `e_invoice: true` e dati cliente (`vat_number`, `tax_code`, `ei_code` o `certified_email`),
  poi invio allo SDI.
- Separato dal webhook di Better Auth: un errore di fatturazione fa riprovare Stripe
  (fino a 3 giorni) senza toccare lo stato dell'abbonamento.
- Idempotenza: tabella `auth.pro_invoice (stripe_invoice_id PK, fic_document_id, status, error,
  created_at)`. Errore → risposta 500 + email di allarme (Resend) ad `ALERT_EMAIL`.
- Alternativa senza codice, se serve un ripiego: Zapier "Stripe → Fatture in Cloud".
  Scartato Polar (merchant of record): commissioni più alte e fattura estera per i clienti italiani.

### Variabili d'ambiente
Qui: `ACCOUNT_UNICO`, `PRO_ACCESSO_LIBERO` (default: lancio acceso) e, facoltativa, `STRIPE_SECRET_KEY`
(solo per annullare l'abbonamento quando l'account viene eliminato da qui). Le altre
(`STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`/`_ANNUAL`, fatture) stanno su SOS Flussi.

### Da decidere prima del passo 2
- Prezzo (mensile / annuale).
- Col commercialista: regime fiscale del venditore (aliquota IVA o forfettario + bollo),
  termini di servizio, informativa privacy (Stripe, Fatture in Cloud tra i responsabili).

### Verifica passo 2
- Stripe in modalità test, carta `4242 4242 4242 4242`, **test clock** avanzato di 5 giorni →
  stato `active`, fattura in **bozza** su Fatture in Cloud con CF/P.IVA/SDI corretti.
- Stesso evento `invoice.paid` inviato due volte → nessuna fattura duplicata.
- Disdetta dal Portal → a fine periodo il premium torna bloccato.

## Fuori da entrambi i passi
Scadenziario pratiche · guida alla compilazione · PDF brandizzato · piani team per CAF ·
login anche sul sito 11ty · traduzioni dell'area account.
