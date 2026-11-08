import "server-only";

import { getSQL } from "./neon";
import { permitsBySlug } from "./permits-list.generated";

/**
 * Scadenziario PRO: le pratiche (persona seguita + permesso + scadenza) di
 * un operatore. Tabelle pro.pratica / pro.pratica_promemoria
 * (scripts/sql/001_pro_pratiche.sql). Le email partono da promemoria.ts.
 */

/** Soglie dei promemoria, in giorni prima della scadenza (ordine decrescente). */
export const REMINDER_DAYS = [90, 60, 30] as const;

export const LIMITS = {
  riferimento: 80,
  note: 500,
  /** Max pratiche attive per account (guardia anti-abuso, non un piano). */
  perUser: 500,
} as const;

export interface Pratica {
  id: string;
  riferimento: string;
  permessoSlug: string;
  permessoTitolo: string;
  /** YYYY-MM-DD */
  scadenza: string;
  note: string | null;
  archiviata: boolean;
  createdAt: string;
  /** Soglie (giorni) per cui un promemoria è già stato inviato. */
  promemoriaInviati: number[];
}

export interface PraticaInput {
  riferimento: string;
  permessoSlug: string;
  scadenza: string;
  note?: string | null;
}

export type ValidationError = { field: keyof PraticaInput; message: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Oggi in Italia come YYYY-MM-DD (le scadenze sono date civili, non istanti). */
export function todayInItaly(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
}

/** Giorni interi fra oggi (Italia) e una data YYYY-MM-DD; negativo se passata. */
export function daysUntil(dateIso: string, today = todayInItaly()): number {
  const [y, m, d] = dateIso.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return Math.round(
    (Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86_400_000,
  );
}

function isRealDate(iso: string): boolean {
  if (!DATE_RE.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function validatePratica(
  raw: unknown,
):
  { ok: true; value: PraticaInput } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  const riferimento =
    typeof obj.riferimento === "string" ? obj.riferimento.trim() : "";
  if (!riferimento)
    errors.push({
      field: "riferimento",
      message: "Indica un nome o una sigla.",
    });
  else if (riferimento.length > LIMITS.riferimento)
    errors.push({
      field: "riferimento",
      message: `Massimo ${LIMITS.riferimento} caratteri.`,
    });

  const permessoSlug =
    typeof obj.permessoSlug === "string" ? obj.permessoSlug : "";
  if (!Object.hasOwn(permitsBySlug, permessoSlug))
    errors.push({ field: "permessoSlug", message: "Scegli un permesso." });

  const scadenza = typeof obj.scadenza === "string" ? obj.scadenza : "";
  if (!isRealDate(scadenza))
    errors.push({ field: "scadenza", message: "Data non valida." });
  else {
    const days = daysUntil(scadenza);
    if (days < -365 * 2)
      errors.push({
        field: "scadenza",
        message: "Scadenza troppo nel passato.",
      });
    if (days > 365 * 15)
      errors.push({ field: "scadenza", message: "Scadenza troppo lontana." });
  }

  let note: string | null = null;
  if (typeof obj.note === "string" && obj.note.trim()) {
    note = obj.note.trim();
    if (note.length > LIMITS.note)
      errors.push({
        field: "note",
        message: `Massimo ${LIMITS.note} caratteri.`,
      });
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { riferimento, permessoSlug, scadenza, note } };
}

interface Row {
  id: string;
  riferimento: string;
  permesso_slug: string;
  permesso_titolo: string;
  scadenza: string;
  note: string | null;
  archiviata: boolean;
  created_at: string;
  promemoria: number[] | null;
}

function toPratica(r: Row): Pratica {
  return {
    id: r.id,
    riferimento: r.riferimento,
    permessoSlug: r.permesso_slug,
    permessoTitolo: r.permesso_titolo,
    scadenza: r.scadenza,
    note: r.note,
    archiviata: r.archiviata,
    createdAt: r.created_at,
    promemoriaInviati: r.promemoria ?? [],
  };
}

const SELECT = `
  SELECT p.id, p.riferimento, p.permesso_slug, p.permesso_titolo,
         to_char(p.scadenza, 'YYYY-MM-DD') AS scadenza, p.note, p.archiviata,
         to_char(p.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at,
         (SELECT array_agg(giorni ORDER BY giorni DESC) FROM pro.pratica_promemoria m
           WHERE m.pratica_id = p.id AND m.esito = 'inviato') AS promemoria
  FROM pro.pratica p`;

export async function listPratiche(userId: string): Promise<Pratica[]> {
  const sql = getSQL();
  const rows = (await sql.query(
    `${SELECT} WHERE p.user_id = $1 ORDER BY p.archiviata, p.scadenza, p.riferimento`,
    [userId],
  )) as Row[];
  return rows.map(toPratica);
}

export async function getPratica(
  userId: string,
  id: string,
): Promise<Pratica | null> {
  const sql = getSQL();
  const rows = (await sql.query(
    `${SELECT} WHERE p.user_id = $1 AND p.id = $2`,
    [userId, id],
  )) as Row[];
  return rows[0] ? toPratica(rows[0]) : null;
}

export async function countPratiche(userId: string): Promise<number> {
  const sql = getSQL();
  const rows = (await sql.query(
    "SELECT count(*)::int AS n FROM pro.pratica WHERE user_id = $1",
    [userId],
  )) as {
    n: number;
  }[];
  return rows[0]?.n ?? 0;
}

export async function createPratica(
  userId: string,
  input: PraticaInput,
): Promise<Pratica> {
  const sql = getSQL();
  const permit = permitsBySlug[input.permessoSlug];
  const rows = (await sql.query(
    `INSERT INTO pro.pratica (user_id, riferimento, permesso_slug, permesso_titolo, scadenza, note)
     VALUES ($1, $2, $3, $4, $5::date, $6) RETURNING id`,
    [
      userId,
      input.riferimento,
      input.permessoSlug,
      permit.titolo,
      input.scadenza,
      input.note ?? null,
    ],
  )) as { id: string }[];
  return (await getPratica(userId, rows[0].id))!;
}

export async function updatePratica(
  userId: string,
  id: string,
  input: PraticaInput,
): Promise<Pratica | null> {
  const sql = getSQL();
  const permit = permitsBySlug[input.permessoSlug];
  const rows = (await sql.query(
    `WITH prima AS (SELECT scadenza FROM pro.pratica WHERE user_id = $1 AND id = $2)
     UPDATE pro.pratica SET riferimento = $3, permesso_slug = $4, permesso_titolo = $5,
       scadenza = $6::date, note = $7, updated_at = now()
     WHERE user_id = $1 AND id = $2
     RETURNING id, (SELECT scadenza FROM prima) IS DISTINCT FROM $6::date AS cambiata`,
    [
      userId,
      id,
      input.riferimento,
      input.permessoSlug,
      permit.titolo,
      input.scadenza,
      input.note ?? null,
    ],
  )) as { id: string; cambiata: boolean }[];
  if (!rows[0]) return null;
  // Nuova scadenza = nuovo ciclo di promemoria (una modifica alle sole note non li rimanda).
  if (rows[0].cambiata)
    await sql.query(
      "DELETE FROM pro.pratica_promemoria WHERE pratica_id = $1",
      [id],
    );
  return getPratica(userId, id);
}

export async function setArchiviata(
  userId: string,
  id: string,
  archiviata: boolean,
): Promise<Pratica | null> {
  const sql = getSQL();
  await sql.query(
    "UPDATE pro.pratica SET archiviata = $3, updated_at = now() WHERE user_id = $1 AND id = $2",
    [userId, id, archiviata],
  );
  return getPratica(userId, id);
}

export async function deletePratica(
  userId: string,
  id: string,
): Promise<boolean> {
  const sql = getSQL();
  const rows = (await sql.query(
    "DELETE FROM pro.pratica WHERE user_id = $1 AND id = $2 RETURNING id",
    [userId, id],
  )) as { id: string }[];
  return rows.length > 0;
}

/** Link alla checklist di rinnovo (o alla scheda) su sospermesso.it. */
export function checklistUrl(slug: string): string {
  const permit = permitsBySlug[slug];
  const anchor = permit?.rinnovo ? "#rinnovo" : "#cose";
  return `https://www.sospermesso.it/permesso-${slug}.html${anchor}`;
}
