import 'server-only';

import { getSQL } from './neon';
import { TIPI_PROFILO, type Profilo, type ProfiloInput, type TipoProfilo } from './profilo-shared';

export { TIPI_PROFILO };
export type { Profilo, ProfiloInput, TipoProfilo };

/**
 * Profilo professionale (pro.profilo, scripts/sql/005_pro_profilo.sql).
 * Senza profilo l'account non è "completo": /account manda a /account/benvenuto.
 */

const LIMITS = { nome: 120, organizzazione: 120, citta: 80 } as const;

export async function getProfilo(userId: string): Promise<Profilo | null> {
  const sql = getSQL();
  const rows = (await sql.query('SELECT tipo, organizzazione, citta FROM pro.profilo WHERE user_id = $1', [
    userId,
  ])) as Profilo[];
  return rows[0] ?? null;
}

export async function saveProfilo(userId: string, p: Omit<ProfiloInput, 'nome'>): Promise<void> {
  const sql = getSQL();
  await sql.query(
    `INSERT INTO pro.profilo (user_id, tipo, organizzazione, citta) VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET tipo = $2, organizzazione = $3, citta = $4, updated_at = now()`,
    [userId, p.tipo, p.organizzazione, p.citta],
  );
}

export async function setNome(userId: string, nome: string): Promise<void> {
  const sql = getSQL();
  await sql.query('UPDATE auth."user" SET name = $2, "updatedAt" = now() WHERE id = $1', [userId, nome]);
}

export function validateProfilo(
  raw: unknown,
): { ok: true; value: ProfiloInput } | { ok: false; errors: Partial<Record<keyof ProfiloInput, string>> } {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');
  const errors: Partial<Record<keyof ProfiloInput, string>> = {};

  const nome = str(o.nome);
  if (!nome) errors.nome = 'Scrivi come ti chiami.';
  else if (nome.length > LIMITS.nome) errors.nome = `Massimo ${LIMITS.nome} caratteri.`;

  const tipo = str(o.tipo) as TipoProfilo;
  if (!TIPI_PROFILO.some((t) => t.value === tipo)) errors.tipo = 'Scegli dove lavori.';

  const organizzazione = str(o.organizzazione);
  if (organizzazione.length > LIMITS.organizzazione) errors.organizzazione = `Massimo ${LIMITS.organizzazione} caratteri.`;

  const citta = str(o.citta);
  if (citta.length > LIMITS.citta) errors.citta = `Massimo ${LIMITS.citta} caratteri.`;

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { nome, tipo, organizzazione: organizzazione || null, citta: citta || null } };
}
