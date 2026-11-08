import "server-only";

import { SEGUI_TUTTI, toUrlId } from "./circolari";
import { sendEmail } from "./email";
import { getSQL } from "./neon";
import { permitsBySlug } from "./permits-list.generated";
import { sleep } from "./request-guard";
import { PRO_URL } from "./site-url";

/**
 * Digest giornaliero delle nuove circolari per chi segue uno o più permessi
 * (pro.segue_permesso). "Nuova" = importata in pro.circolare dopo che l'utente
 * ha iniziato a seguire qualcosa, e non ancora segnalata a quell'utente
 * (pro.circolare_avviso). Una sola email per utente e per giro, al massimo
 * MAX_PER_EMAIL documenti. Lanciato da /api/cron/promemoria.
 */

const MAX_PER_EMAIL = 20;
const FINESTRA_GIORNI = 30;

interface Follower {
  user_id: string;
  email: string;
  nome: string | null;
  slugs: string[];
}

interface NuovaRow {
  id: string;
  titolo: string;
  ente: string | null;
  data: string | null;
  permessi: string[];
}

export interface AvvisiReport {
  utenti: number;
  email: number;
  documenti: number;
  errori: number;
}

function formatDateIt(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function runAvvisiCircolari(): Promise<AvvisiReport> {
  const sql = getSQL();
  const report: AvvisiReport = { utenti: 0, email: 0, documenti: 0, errori: 0 };

  const followers = (await sql.query(
    `SELECT s.user_id, u.email, u.name AS nome, array_agg(s.permesso_slug) AS slugs
     FROM pro.segue_permesso s JOIN auth."user" u ON u.id = s.user_id
     GROUP BY s.user_id, u.email, u.name`,
  )) as Follower[];
  report.utenti = followers.length;

  for (const f of followers) {
    const tutti = f.slugs.includes(SEGUI_TUTTI);
    const nuove = (await sql.query(
      `SELECT c.id, c.titolo, c.ente, to_char(c.data, 'YYYY-MM-DD') AS data, c.permessi
       FROM pro.circolare c
       WHERE c.importata_at > (SELECT min(created_at) FROM pro.segue_permesso WHERE user_id = $1)
         AND c.importata_at > now() - ($3::int || ' days')::interval
         AND NOT c.fuori_ambito
         AND NOT EXISTS (SELECT 1 FROM pro.circolare_avviso a WHERE a.user_id = $1 AND a.circolare_id = c.id)
         AND ($4::boolean OR c.permessi && $2::text[])
       ORDER BY c.data DESC NULLS LAST, c.importata_at DESC
       LIMIT $5`,
      [f.user_id, f.slugs, FINESTRA_GIORNI, tutti, MAX_PER_EMAIL],
    )) as NuovaRow[];
    if (nuove.length === 0) continue;

    const righe = nuove.map((c) => {
      const perm = c.permessi
        .filter((s) => permitsBySlug[s])
        .map((s) => permitsBySlug[s].titolo)
        .join(", ");
      return [
        `• ${c.titolo}`,
        `  ${[c.ente, formatDateIt(c.data)].filter(Boolean).join(", ")}${perm ? ` — ${perm}` : ""}`,
        `  ${PRO_URL}/it/pro/circolari/${toUrlId(c.id)}`,
      ].join("\n");
    });
    const n = nuove.length;
    const subject =
      n === 1
        ? "Una nuova circolare per te su SOS Permesso PRO"
        : `${n} nuove circolari per te su SOS Permesso PRO`;
    const text = [
      `Ciao${f.nome ? ` ${f.nome}` : ""},`,
      "",
      tutti
        ? "queste circolari sono entrate nell’archivio di SOS Permesso PRO:"
        : "queste circolari riguardano i permessi che segui:",
      "",
      righe.join("\n\n"),
      "",
      `Cerca nell’archivio: ${PRO_URL}/it/pro/circolari`,
      "Per cambiare i permessi che segui o smettere di ricevere avvisi, apri la stessa pagina.",
      "",
      "SOS Permesso — sospermesso.it",
    ].join("\n");

    // Prenotazione prima dell'invio (idempotenza): si spedisce solo ciò che questa
    // esecuzione è riuscita a registrare; in caso di errore le righe si tolgono.
    const prenotate = new Set(
      (
        (await sql.query(
          `INSERT INTO pro.circolare_avviso (user_id, circolare_id)
         SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING RETURNING circolare_id`,
          [f.user_id, nuove.map((c) => c.id)],
        )) as { circolare_id: string }[]
      ).map((r) => r.circolare_id),
    );
    if (prenotate.size === 0) continue;
    await sleep(600); // Resend: max 2 email al secondo
    try {
      await sendEmail({ to: f.email, subject, text });
      report.email++;
      report.documenti += n;
    } catch (err) {
      console.error(
        `[avvisi-circolari] utente ${f.user_id}: ${err instanceof Error ? err.message : err}`,
      );
      await sql.query(
        "DELETE FROM pro.circolare_avviso WHERE user_id = $1 AND circolare_id = ANY($2::text[])",
        [f.user_id, [...prenotate]],
      );
      report.errori++;
    }
  }
  return report;
}
