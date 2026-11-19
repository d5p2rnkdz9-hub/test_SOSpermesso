import "server-only";

import { sendEmail } from "./email";
import { getSQL } from "./neon";
import { makeProAccessCheck } from "./pro-entitlement";
import { ACCORDO_VERSIONE } from "./accordo";
import { REMINDER_DAYS, daysUntil, todayInItaly } from "./pratiche";
import { PRO_URL } from "./site-url";
import { sleep } from "./request-guard";

/**
 * Invio giornaliero dei promemoria di scadenza (chiamato da
 * /api/cron/promemoria, a sua volta schedulato da netlify/functions/promemoria-cron.mts).
 *
 * Per ogni pratica attiva: le soglie REMINDER_DAYS non ancora registrate e
 * già raggiunte (giorni residui <= soglia) sono "dovute". Parte UNA email,
 * per la soglia più vicina; le altre dovute vengono segnate come saltate
 * (es. pratica inserita a 45 giorni dalla scadenza: email "45 giorni",
 * 60 = inviato, 90 = saltato). Idempotente: rilanciare non rimanda nulla.
 */

interface DueRow {
  id: string;
  user_id: string;
  email: string;
  nome: string | null;
  scadenza: string;
  registrate: number[] | null;
}

export interface PromemoriaReport {
  today: string;
  esaminate: number;
  inviati: number;
  saltati: number;
  errori: number;
}

function formatDateIt(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Testo del promemoria. Per l'accordo art. 28 (Allegato 1) l'email non porta
 * dati della pratica: niente riferimento né tipo di permesso, che rivelerebbe
 * dati particolari (salute, religione, tratta...). Solo la data e il link allo
 * scadenziario, dove l'utente vede il resto dopo l'accesso.
 */
export function buildEmail(row: Pick<DueRow, "nome" | "scadenza">, giorni: number) {
  const quando =
    giorni > 1
      ? `tra ${giorni} giorni`
      : giorni === 1
        ? "domani"
        : giorni === 0
          ? "oggi"
          : `da ${-giorni} giorni`;
  const verbo = giorni >= 0 ? "scade" : "è scaduto";
  const subject = `Scadenziario: un permesso ${verbo} ${quando}`;
  const text = [
    `Ciao${row.nome ? ` ${row.nome}` : ""},`,
    "",
    `nel tuo scadenziario c'è un permesso di soggiorno che ${verbo} ${quando}, il ${formatDateIt(row.scadenza)}.`,
    "",
    "Apri lo scadenziario per vedere la pratica e la lista dei documenti per il rinnovo:",
    `${PRO_URL}/it/account/pratiche`,
    "",
    "Ricevi questa email perché hai inserito la pratica nello scadenziario di SOS Permesso PRO.",
    "Per non ricevere più avvisi su questa pratica, archiviala o eliminala dallo scadenziario.",
    "",
    "SOS Permesso — sospermesso.it",
  ].join("\n");
  return { subject, text };
}

export async function runPromemoria(): Promise<PromemoriaReport> {
  const sql = getSQL();
  const haAccessoPro = makeProAccessCheck(
    (text, params) => sql.query(text, params) as Promise<Record<string, unknown>[]>,
  );
  const today = todayInItaly();
  const maxDays = Math.max(...REMINDER_DAYS);

  const rows = (await sql.query(
    `SELECT p.id, p.user_id, u.email, u.name AS nome,
            to_char(p.scadenza, 'YYYY-MM-DD') AS scadenza,
            (SELECT array_agg(giorni) FROM pro.pratica_promemoria m WHERE m.pratica_id = p.id
               AND (m.esito IN ('inviato', 'saltato') OR (m.esito = 'in_corso' AND m.created_at > now() - interval '1 hour'))) AS registrate
     FROM pro.pratica p
     JOIN auth."user" u ON u.id = p.user_id
     WHERE NOT p.archiviata
       AND p.scadenza <= ($1::date + ($2::int || ' days')::interval)
       AND p.scadenza >= ($1::date - interval '30 days')
       -- Solo chi ha accettato la versione corrente dell'accordo art. 28.
       AND EXISTS (SELECT 1 FROM pro.accordo_accettazione a
                    WHERE a.user_id = p.user_id AND a.versione = $3)
     ORDER BY p.scadenza`,
    [today, maxDays, ACCORDO_VERSIONE],
  )) as DueRow[];

  const report: PromemoriaReport = {
    today,
    esaminate: rows.length,
    inviati: 0,
    saltati: 0,
    errori: 0,
  };

  for (const row of rows) {
    const registrate = new Set(row.registrate ?? []);
    const giorniResidui = daysUntil(row.scadenza, today);
    const dovute = REMINDER_DAYS.filter(
      (t) => !registrate.has(t) && giorniResidui <= t,
    );
    if (dovute.length === 0) continue;
    // Lancio gratuito spento: solo chi ha ancora l'accesso PRO (le pratiche restano salvate).
    if (!(await haAccessoPro(row.user_id))) continue;

    const daInviare = Math.min(...dovute);
    const daSaltare = dovute.filter((t) => t !== daInviare);

    for (const t of daSaltare) {
      await sql.query(
        `INSERT INTO pro.pratica_promemoria (pratica_id, giorni, esito, dettaglio)
         VALUES ($1, $2, 'saltato', $3) ON CONFLICT DO NOTHING`,
        [row.id, t, `superata: ${giorniResidui} giorni residui il ${today}`],
      );
      report.saltati++;
    }

    // Prenotazione prima dell'invio: una seconda esecuzione parallela non la ottiene.
    // Si riprendono solo righe in errore o prenotazioni abbandonate da più di un'ora.
    const claimed = (await sql.query(
      `INSERT INTO pro.pratica_promemoria (pratica_id, giorni, esito, dettaglio)
       VALUES ($1, $2, 'in_corso', NULL)
       ON CONFLICT (pratica_id, giorni) DO UPDATE SET esito = 'in_corso', created_at = now()
         WHERE pro.pratica_promemoria.esito = 'errore'
            OR (pro.pratica_promemoria.esito = 'in_corso' AND pro.pratica_promemoria.created_at < now() - interval '1 hour')
       RETURNING pratica_id`,
      [row.id, daInviare],
    )) as unknown[];
    if (claimed.length === 0) continue;

    const { subject, text } = buildEmail(row, giorniResidui);
    await sleep(600); // Resend: max 2 email al secondo
    try {
      await sendEmail({ to: row.email, subject, text });
      await sql.query(
        `INSERT INTO pro.pratica_promemoria (pratica_id, giorni, esito, dettaglio)
         VALUES ($1, $2, 'inviato', $3) ON CONFLICT (pratica_id, giorni) DO UPDATE
           SET esito = 'inviato', dettaglio = EXCLUDED.dettaglio, created_at = now()`,
        [row.id, daInviare, `${giorniResidui} giorni residui, a ${row.email}`],
      );
      report.inviati++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[promemoria] pratica ${row.id}: ${msg}`);
      // Registrato come errore: il prossimo giro riprova (esito != 'inviato' non blocca).
      await sql.query(
        `INSERT INTO pro.pratica_promemoria (pratica_id, giorni, esito, dettaglio)
         VALUES ($1, $2, 'errore', $3) ON CONFLICT (pratica_id, giorni) DO UPDATE
           SET esito = 'errore', dettaglio = EXCLUDED.dettaglio, created_at = now()`,
        [row.id, daInviare, msg.slice(0, 500)],
      );
      report.errori++;
    }
  }

  return report;
}
