// Controllo di forma sulle risposte del chatbot PRO. Uso: node check-forma.mjs risposte.json
// risposte.json = [{ "id": "...", "testo": "..." }, ...]
import fs from 'node:fs';

const SCHEDA_URL = /https:\/\/www\.sospermesso\.it\/(?:[a-z]{2}\/)?permesso-[a-z0-9-]+\.html/g;

export const REGOLE = [
  // Errori: meta-commenti sulle schede e sugli strumenti
  { id: 'scheda-nominata', livello: 'errore', re: /\b(?:la|nella|sulla|dalla|questa|della|secondo la|come da|vedi|vedi la) scheda\b|\bscheda (?:pro|sos permesso)\b|\bschede\b/i },
  { id: 'link-etichetta-scheda', livello: 'errore', re: /\[\s*scheda[^\]]*\]\(/i },
  { id: 'strumento', livello: 'errore', re: /\bstrument[oi]\b|\bscheda_permesso\b|\bcerca_circolari\b|\bleggi_circolare\b/i },
  { id: 'meta-ricerca', livello: 'errore', re: /\b(?:fonti|documenti|risultati) (?:che ho |da me )?(?:consultat|trovat|restituit)|\bho (?:consultato|cercato|trovato|verificato) (?:nell|nelle|negli|in|tra)\b|\bdalla (?:mia )?ricerca\b|\b(?:mi )?(?:ha|hanno) restituito\b|\bbase di conoscenza\b/i },
  { id: 'meta-archivio', livello: 'avviso', re: /\bnell'archivio\b|\bdall'archivio\b/i },
];

export function controlla(testo) {
  const out = [];
  for (const r of REGOLE) {
    const m = testo.match(r.re);
    if (m) {
      const i = m.index ?? 0;
      out.push({ regola: r.id, livello: r.livello, estratto: testo.slice(Math.max(0, i - 40), i + 60).replace(/\n/g, ' ') });
    }
  }
  // Link alle schede: ammessi solo sotto "### Per approfondire" (in fondo)
  const idx = testo.search(/^#{2,3}\s*Per approfondire\s*$/im);
  const corpo = idx >= 0 ? testo.slice(0, idx) : testo;
  const nelCorpo = corpo.match(SCHEDA_URL) ?? [];
  if (nelCorpo.length) out.push({ regola: 'link-scheda-nel-corpo', livello: 'errore', estratto: `${nelCorpo.length} link a schede prima di "Per approfondire"` });
  if (idx >= 0) {
    const coda = testo.slice(idx).split('\n').slice(1).join('\n');
    if (/\/pro\/circolari\//.test(coda)) out.push({ regola: 'circolare-in-approfondire', livello: 'avviso', estratto: 'circolare ripetuta in "Per approfondire"' });
    if (coda.split('\n').some((l) => l.trim() && !/^\s*-\s/.test(l))) out.push({ regola: 'testo-dopo-approfondire', livello: 'avviso', estratto: 'testo dopo la lista finale' });
  }
  const tuttiLink = testo.match(SCHEDA_URL) ?? [];
  if (tuttiLink.length && idx < 0) out.push({ regola: 'manca-per-approfondire', livello: 'errore', estratto: 'link a schede senza sezione finale' });
  return out;
}

if (process.argv[2]) {
  const risposte = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  let errori = 0;
  for (const r of risposte) {
    const f = controlla(r.testo);
    errori += f.filter((x) => x.livello === 'errore').length;
    console.log(`${f.some((x) => x.livello === 'errore') ? 'KO' : 'OK'}  ${r.id}`);
    for (const x of f) console.log(`    [${x.livello}] ${x.regola}: …${x.estratto}…`);
  }
  process.exit(errori ? 1 : 0);
}
