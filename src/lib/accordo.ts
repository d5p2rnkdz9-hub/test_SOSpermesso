import "server-only";

import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { ACCORDO_TESTO } from "./accordo-testo";
import { getSQL } from "./neon";

/**
 * Accordo art. 28 GDPR che sblocca lo scadenziario (tabella
 * pro.accordo_accettazione, scripts/sql/008_pro_accordo.sql).
 * Senza accettazione della versione corrente: niente pratiche né promemoria.
 */

/** Cambia a OGNI modifica di ACCORDO_TESTO: forza una nuova accettazione. */
export const ACCORDO_VERSIONE = "1.1";

export const ACCORDO_SHA256 = createHash("sha256").update(ACCORDO_TESTO, "utf8").digest("hex");

export async function haAccettatoAccordo(userId: string): Promise<boolean> {
  const rows = (await getSQL().query(
    "SELECT 1 FROM pro.accordo_accettazione WHERE user_id = $1 AND versione = $2",
    [userId, ACCORDO_VERSIONE],
  )) as unknown[];
  return rows.length > 0;
}

interface Accettazione {
  userId: string;
  email: string;
  ip: string | null;
  userAgent: string | null;
}

/** Registra l'accettazione (idempotente). Nessuna email: l'accordo resta su /account/pratiche/accordo. */
export async function registraAccettazione(a: Accettazione): Promise<void> {
  await getSQL().query(
    `INSERT INTO pro.accordo_accettazione
       (user_id, versione, testo_sha256, email, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, versione) DO NOTHING`,
    [a.userId, ACCORDO_VERSIONE, ACCORDO_SHA256, a.email, a.ip, a.userAgent?.slice(0, 300) ?? null],
  );
}

/** IP del client come lo passa Netlify, con ripiego sullo standard. */
export function clientIp(headers: Headers): string | null {
  return (
    headers.get("x-nf-client-connection-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

/** Risposta delle API dello scadenziario a chi non ha ancora accettato l'accordo. */
export function accordoRichiesto() {
  return NextResponse.json({ error: "accordo_richiesto" }, { status: 403 });
}
