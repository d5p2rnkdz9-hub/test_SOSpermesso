import "server-only";

import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { ACCORDO_TESTO } from "./accordo-testo";
import { sendEmail } from "./email";
import { getSQL } from "./neon";
import { PRO_URL } from "./site-url";

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
  nome: string | null;
  ip: string | null;
  userAgent: string | null;
  /** finestra: scorso il testo nello scadenziario; iscrizione: spunta del modulo di prova (/abbonati). */
  modo?: "finestra" | "iscrizione";
}

/**
 * Registra l'accettazione (idempotente) e manda all'utente la copia
 * dell'accordo con i dati dell'accettazione. L'email non blocca: se fallisce,
 * copia_inviata resta false e l'accettazione vale comunque.
 */
export async function registraAccettazione(a: Accettazione): Promise<void> {
  const sql = getSQL();
  const rows = (await sql.query(
    `INSERT INTO pro.accordo_accettazione
       (user_id, versione, testo_sha256, email, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, versione) DO NOTHING
     RETURNING to_char(accettato_il AT TIME ZONE 'Europe/Rome', 'DD/MM/YYYY HH24:MI') AS quando`,
    [a.userId, ACCORDO_VERSIONE, ACCORDO_SHA256, a.email, a.ip, a.userAgent?.slice(0, 300) ?? null],
  )) as { quando: string }[];
  if (rows.length === 0) return; // già accettato: nessuna nuova copia

  const text = [
    `Ciao${a.nome ? ` ${a.nome}` : ""},`,
    "",
    `il ${rows[0].quando} (ora italiana) hai accettato, con l'account ${a.email} e ${a.modo === "iscrizione" ? "con la spunta del modulo di richiesta della prova gratuita, insieme all'informativa privacy" : "dopo averne scorso il testo fino in fondo"}, l'Accordo sul trattamento dei dati personali degli scadenziari dell'area PRO, versione ${ACCORDO_VERSIONE}.`,
    "",
    `Impronta SHA-256 del testo accettato: ${ACCORDO_SHA256}`,
    `Lo trovi anche qui: ${PRO_URL}/it/account/pratiche/accordo`,
    "",
    "Conserva questa email: è la tua copia dell'accordo. Il testo completo segue qui sotto.",
    "",
    "----------------------------------------",
    "",
    ACCORDO_TESTO.replace(/^#{2,3} /gm, ""),
  ].join("\n");

  try {
    await sendEmail({
      to: a.email,
      subject: `Accordo sul trattamento dei dati – scadenziari PRO (versione ${ACCORDO_VERSIONE})`,
      text,
    });
    await sql.query(
      "UPDATE pro.accordo_accettazione SET copia_inviata = true WHERE user_id = $1 AND versione = $2",
      [a.userId, ACCORDO_VERSIONE],
    );
  } catch (err) {
    console.error(`[accordo] copia non inviata a ${a.userId}: ${err instanceof Error ? err.message : err}`);
  }
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
