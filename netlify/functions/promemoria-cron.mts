// Netlify scheduled function: ogni giorno alle 06:30 UTC (07:30/08:30 in Italia)
// chiama la route Next.js che manda i promemoria di scadenza dello scadenziario PRO.
// Il lavoro vero sta in src/lib/promemoria.ts: qui solo il trigger, così la logica
// resta nel bundle Next (DB, email) e non va duplicata nel runtime delle functions.
//
// Env richieste su Netlify: CRON_SECRET (la stessa letta dalla route), URL (automatica).

export default async () => {
  const base = process.env.URL || 'https://app.sospermesso.it';
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[promemoria-cron] CRON_SECRET non impostata');
    return;
  }
  const res = await fetch(`${base}/api/cron/promemoria`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log(`[promemoria-cron] ${res.status} ${body}`);
};

export const config = {
  schedule: '30 6 * * *',
};
