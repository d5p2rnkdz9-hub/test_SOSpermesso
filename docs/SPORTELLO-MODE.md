# Modalità Sportello — Design & Piano

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

### Fase A — checklist file

- [ ] `globals.css`: blocco `html[data-mode="sportello"]`, `--primary-foreground`
      → `0 0% 10%`, `--accent` → `45 100% 51%` (vero #FFC107), token `--link`,
      focus outline via `var(--ring)`.
- [ ] Migrazione hex→token nei componenti (NON `globals.css`, NON `outcome-og.tsx`
      che genera immagini OG e non vede i CSS custom properties).
- [ ] `src/store/ui-store.ts` (nuovo): mode + setMode, sync localStorage/cookie/attr.
- [ ] `src/components/layout/ModeToggle.tsx` (nuovo) + inserimento in StickyHeader.
- [ ] `[locale]/layout.tsx`: script inline anti-FOUC a inizio body.
- [ ] `TreePlayer`/`SlideTransition`: no delay/transizioni in sportello.
- [ ] `AnswerCard`/`QuestionScreen`: variante compatta in sportello.
- [ ] `WelcomeContent`: sottotitolo, consenso persistente, doppia CTA.
- [ ] `messages/*.json` (11 locale): namespace `sportello`.

## Decisioni aperte

1. Riferimenti normativi free o premium → **free** (fiducia); paga per
   sentenze/PDF/casi salvati/alert.
2. Badge sportello sulla stampa consegnata alla persona → sì, con data e
   disclaimer "informazione, non consulenza legale".
