# Versione PRO (ex "Modalità Sportello") — Design & Piano

> **REVISIONE 2026-07-26** — feedback utente: (1) lo switch si chiama **"Versione
> PRO"** e si estende a TUTTO sospermesso.it, non solo all'app; (2) sul sito la
> pagina resta identica, cambia solo la palette con smooth transition; (3) i
> contenuti aggiuntivi (sintesi professionale, norme, sentenze con teaser →
> paywall, circolari) compaiono su ENTRAMBE le proprietà; (4) contenuti demo
> ricercati online per 3 permessi (protezione speciale, lavoro subordinato
> flussi, lungo periodo UE).
>
> Implementazione cross-proprietà: valore condiviso `pro` in
> `localStorage['sos-mode']` + cookie `sos_mode` su `.sospermesso.it`;
> `data-mode="pro"` su `<html>` applicato pre-paint da script inline in entrambi
> i layout. Contenuti canonici in `../pro-content-shared/pro-content.json`
> (sibling dei due repo): il sito li legge da `_data/proContent.js` (con
> snapshot committato in `_cache/pro-content.json` per Netlify), l'app li
> bundla via `scripts/generate-pro-content.js` → `src/lib/pro-content.generated.ts`
> (componente `ProCard` sugli esiti in modalità PRO, al posto dell'intro
> colloquiale). Lato sito: `src/styles/pro.css` (tema navy + `.pro-only` +
> scheda PRO), toggle in `header.liquid`, logica in `app.js`, sezione `#pro`
> in `permits.liquid`, chip PRO in `database.html`.
>
> Il resto di questo documento descrive il design originale (fase A) — ancora
> valido per l'architettura dell'app, con "sportello" da leggersi come "PRO".

> Obiettivo: rendere l'app utile agli utenti intermedi (CAF, patronati, sportelli
> gratuiti) con uno **switch di modalità** device-persistent. La modalità è gratis;
> l'account (futuro) sblocca contenuti premium dentro la modalità.

## Principio architetturale

Un solo insieme di route e componenti. `mode: 'persona' | 'sportello'` è uno stato
di device che agisce su tre livelli:

1. **Token CSS** — `data-mode="sportello"` su `<html>` attiva un blocco di override
   in `globals.css` (tema navy/oro, radius più stretto). Stessa struttura brutalista.
2. **Varianti di comportamento** — i componenti leggono `useUiStore()` (Zustand) e
   adattano densità, transizioni, flussi.
3. **Campi contenuto aggiuntivi** — sugli esiti: `legalRefs` (free), `caseLaw` (premium),
   authored in Notion → file generato (pattern `rinnovo-notion-data.generated.ts`).

**Il premium non è la modalità.** Modalità = gratis e anonima. Account = sblocca
contenuti (sentenze, PDF brandizzato, casi salvati, alert).

## Lo switch

- Stato in `localStorage` (`sos-mode`), applicato pre-paint da script inline nel
  layout (pattern next-themes, niente FOUC, layout resta statico).
- Store Zustand `src/store/ui-store.ts`, hook di sync montato nel ModeToggle.
- Toggle in `StickyHeader` accanto al LanguageSelector; acceso → badge navy.
- Cookie parallelo su `.sospermesso.it` → in futuro il sito 11ty può mostrare
  blocchi operatore senza login.
- Privacy: si persiste SOLO il flag modalità (coerente con la rimozione deliberata
  della persistenza sessione, commit 85a2fd94). I casi salvati saranno server-side
  dietro auth (fase D).

## Tema sportello (subtle ma riconoscibile)

```css
html[data-mode="sportello"] {
  --background: 210 25% 96%;          /* off-white freddo */
  --primary: 215 55% 22%;             /* navy: CTA blu notte */
  --primary-foreground: 48 100% 60%;  /* testo oro sul navy */
  --accent: 45 100% 51%;              /* giallo taxi da protagonista ad accento */
  --radius: 0.5rem;                   /* più "strumento" */
}
```

Prerequisito: migrare i colori hardcoded (`#FFD700`, `#1A1A1A`, `#FFC107`,
`#1565C0`) ai token in tutti i componenti, così lo switch li raggiunge.
`--primary-foreground` in `:root` allineato a `0 0% 10%` (#1A1A1A) = look attuale
invariato in modalità persona.

## Comportamento per schermo

### Welcome
- Sottotitolo modalità operatore; consenso policy memorizzato una volta per device;
  due CTA di pari livello: "Posso avere un permesso?" e "Rinnovo o conversione".

### Tree (vale per tutti e tre gli alberi: condividono TreePlayer)
- Densità: card risposta compatte, niente delay 200ms, niente slide transition.
- Tastiera: `1–9` seleziona, `Backspace` indietro (fase B).
- Pannello percorso laterale cliccabile — riusa `history`/`answers`/`goBackTo`
  già nello store (fase B). ContentColumn si allarga in sportello.
- Sottotitolo italiano fisso sotto la domanda tradotta (operatore segue in IT,
  la persona legge nella sua lingua) — fase B.

### Outcome (fase B/C)
- FAQ tutte espanse, intro calda nascosta, riepilogo tecnico.
- Blocco "Riferimenti normativi" (free, da Notion).
- Print stylesheet + stampa riepilogo (free); PDF brandizzato (premium).
- Card "Giurisprudenza" visibile ma bloccata per i free (paywall UX).

### Analytics
- Campo `mode` su TreeStepPayload/TreeSessionPayload → misura adozione (fase B).

## Layer premium (fase D)

- Auth.js magic link + adapter Prisma su Neon (già nel progetto).
- Modelli: User, Organization, Membership, Entitlement.
- Download sentenze: DB Notion "Giurisprudenza" → generatore → object storage,
  URL firmati da route protette.
- Billing: attivazione manuale (fattura) prima, Stripe poi.

## Fasi

| Fase | Contenuto | Stima |
|------|-----------|-------|
| A | Migrazione token + switch + tema navy + densità/no-delay + welcome sportello | 2–3 gg |
| B | Pannello percorso + tastiera + outcome espanso + print + `mode` in analytics | 3–4 gg |
| C | Notion "Riferimenti normativi" → blocco free sugli esiti | 1–2 gg + contenuto |
| D | Auth + entitlements + sentenze premium + PDF brandizzato | 1–2 settimane |

### Fase A — checklist file (✅ completata, commit 17fe130)

- [x] `globals.css`: blocco `html[data-mode="sportello"]`, `--primary-foreground`
      → `0 0% 10%`, `--accent` → `45 100% 51%` (vero #FFC107), token `--link`,
      focus outline via `var(--ring)`.
- [x] Migrazione hex→token nei componenti (NON `globals.css`, NON `outcome-og.tsx`
      che genera immagini OG e non vede i CSS custom properties).
- [x] `src/store/ui-store.ts` (nuovo): mode + setMode, sync localStorage/cookie/attr.
- [x] `src/components/layout/ModeToggle.tsx` (nuovo) + inserimento in StickyHeader.
- [x] `[locale]/layout.tsx`: script inline anti-FOUC a inizio body.
- [x] `TreePlayer`/`SlideTransition`: no delay/transizioni in sportello.
- [x] `AnswerCard`/`QuestionScreen`: variante compatta in sportello.
- [x] `WelcomeContent`: sottotitolo, consenso persistente, doppia CTA.
- [x] `messages/*.json` (11 locale): namespace `sportello`.

Verificato in browser (dev): toggle e persistenza pre-paint dopo reload, tema
navy/oro, consenso ricordato, avanzamento istantaneo, ritorno pulito a persona.
Nota semantica: warning `AlertTriangle` in LawyerBanner usa `fill-accent`
(giallo semantico in entrambi i temi), non `fill-primary`.

## Decisioni aperte

1. Riferimenti normativi free o premium → **free** (fiducia); paga per
   sentenze/PDF/casi salvati/alert.
2. Badge sportello sulla stampa consegnata alla persona → sì, con data e
   disclaimer "informazione, non consulenza legale".
