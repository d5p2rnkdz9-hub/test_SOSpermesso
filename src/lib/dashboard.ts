import 'server-only';

import { DAILY_LIMIT, listConversazioni, quotaUsata } from './chat-pro';
import type { ConversazioneSummary } from './chat-pro-types';
import { SEGUI_TUTTI, listFollows, toUrlId } from './circolari';
import { getSQL } from './neon';
import { checklistUrl, daysUntil, listPratiche, type Pratica } from './pratiche';

/**
 * Tutti i numeri della dashboard /account in una sola chiamata, in parallelo.
 * Niente tabelle nuove: legge scadenziario, circolari e chatbot esistenti.
 */

export interface ScadenzaView extends Pratica {
  giorni: number;
  checklist: string;
}

export interface NovitaCircolare {
  urlId: string;
  titolo: string;
  ente: string | null;
  tipo: string;
  data: string | null;
}

export interface DashboardData {
  pratiche: {
    attive: number;
    scadute: number;
    entro30: number;
    entro90: number;
    prossime: ScadenzaView[];
  };
  circolari: {
    /** Permessi seguiti (senza '*'); vuoto + tutti=false = nessun avviso attivo. */
    seguiti: string[];
    tutti: boolean;
    nuove30: number;
    ultime: NovitaCircolare[];
  };
  assistente: {
    usatiOggi: number;
    limite: number;
    recenti: ConversazioneSummary[];
  };
}

async function novitaCircolari(follows: string[]) {
  const sql = getSQL();
  const tutti = follows.includes(SEGUI_TUTTI) || follows.length === 0;
  const slugs = follows.filter((s) => s !== SEGUI_TUTTI);
  const filtro = tutti ? 'NOT c.fuori_ambito' : 'c.permessi && $1::text[]';
  const args = tutti ? [] : [slugs];
  type Riga = { id: string; titolo: string; ente: string | null; tipo: string; data: string | null };
  const [righe, contaRighe] = await Promise.all([
    sql.query(
      `SELECT c.id, c.titolo, c.ente, c.tipo, to_char(c.data, 'YYYY-MM-DD') AS data
       FROM pro.circolare c WHERE ${filtro} ORDER BY c.data DESC NULLS LAST, c.id LIMIT 5`,
      args,
    ),
    sql.query(
      `SELECT count(*)::int AS n FROM pro.circolare c
       WHERE ${filtro} AND c.data >= (now() AT TIME ZONE 'Europe/Rome')::date - 30`,
      args,
    ),
  ]);
  const ultime = righe as Riga[];
  const conta = contaRighe as { n: number }[];
  return {
    nuove30: conta[0]?.n ?? 0,
    ultime: ultime.map((r) => ({ urlId: toUrlId(r.id), titolo: r.titolo, ente: r.ente, tipo: r.tipo, data: r.data })),
  };
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const [pratiche, follows, conversazioni, quota] = await Promise.all([
    listPratiche(userId),
    listFollows(userId),
    listConversazioni(userId),
    quotaUsata(userId),
  ]);
  const circ = await novitaCircolari(follows);

  const attive = pratiche
    .filter((p) => !p.archiviata)
    .map((p) => ({ ...p, giorni: daysUntil(p.scadenza), checklist: checklistUrl(p.permessoSlug) }));

  return {
    pratiche: {
      attive: attive.length,
      scadute: attive.filter((p) => p.giorni < 0).length,
      entro30: attive.filter((p) => p.giorni >= 0 && p.giorni <= 30).length,
      entro90: attive.filter((p) => p.giorni >= 0 && p.giorni <= 90).length,
      // listPratiche ordina già per scadenza.
      prossime: attive.slice(0, 5),
    },
    circolari: {
      seguiti: follows.filter((s) => s !== SEGUI_TUTTI),
      tutti: follows.includes(SEGUI_TUTTI),
      ...circ,
    },
    assistente: { usatiOggi: quota.utente, limite: DAILY_LIMIT, recenti: conversazioni.slice(0, 3) },
  };
}
