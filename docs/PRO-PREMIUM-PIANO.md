# PRO premium — piano (registrazione → pagamenti)

> Concordato il 2026-11-06. Passo 1 (registrazione, accesso gratuito nel periodo di
> lancio) in corso; passo 2 (pagamenti) da fare quando si decide di far pagare.

## Decisioni prese

- **Self-service**: chi visita la sezione premium si registra da solo. Niente organizzazioni
  create a mano, niente contatti commerciali.
- **Login senza password** con link via email (Better Auth `magicLink`, email via Resend).
  Google/Microsoft eventualmente dopo, come `socialProviders`.
- **Lancio gratuito**: primi giorni / primi ~100 utenti, basta essere registrati
  (`PRO_ACCESS_MODE=free`). `user.createdAt` permette di riconoscere i primi iscritti.
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

## Passo 2 — pagamenti

### Stripe
- Plugin `@better-auth/stripe`: `subscription.enabled`, un piano `pro` con
  `freeTrial: { days: 5 }` (il plugin concede **una sola prova per utente**).
  Webhook del plugin: `/api/auth/stripe/webhook` (eventi `checkout.session.completed`,
  `customer.subscription.created|updated|deleted`).
- Checkout ospitato da Stripe (nessun dato carta da noi), via `getCheckoutSessionParams`:
  `billing_address_collection: "required"`, `tax_id_collection` (P.IVA), campi personalizzati
  **Codice fiscale** e **Codice SDI o PEC**, prezzo **IVA inclusa**, `locale: "it"`.
- Disdetta, cambio carta, ricevute: Stripe Customer Portal (`authClient.subscription.billingPortal`).
- `getProAccess` diventa: registrato **e** abbonamento `active` o `trialing`
  (`auth.api.listActiveSubscriptions`). Decidere cosa fare dei primi 100 iscritti
  (gratis per sempre / sconto / coupon Stripe).
- Pagina `/[locale]/abbonamento`: stato (prova fino al…, attivo, scaduto), "Inizia la prova",
  "Gestisci".

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

### Variabili d'ambiente nuove
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_INVOICE_WEBHOOK_SECRET`,
`STRIPE_PRICE_ID_MONTHLY` (+ `_ANNUAL`), `FIC_ACCESS_TOKEN`, `FIC_COMPANY_ID`, `ALERT_EMAIL`.

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
