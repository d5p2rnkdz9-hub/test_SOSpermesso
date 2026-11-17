import 'server-only';

import { NextResponse } from 'next/server';

import { auth, type AuthSession } from './auth';
import { getSQL } from './neon';
import { getEntitlement, type ProReason, type Query, type SubscriptionInfo } from './pro-entitlement';

/**
 * The single place that decides who may read premium content.
 * Every protected route and page goes through getProAccess().
 *
 * PRO = abbonamento `pro` attivo o in prova nella tabella comune
 * auth.subscription (fatto su sosflussi.it: account e abbonamento sono unici
 * fra i due siti), OPPURE lancio gratuito. Regole e variabili in
 * pro-entitlement.ts: il lancio gratuito qui resta acceso finché non si imposta
 * PRO_ACCESSO_LIBERO=0 (su SOS Flussi il default è l'opposto).
 *
 * - 'anonymous': nessuna sessione → login.
 * - 'no-plan': ha un account ma non l'accesso PRO → messaggio con il link per
 *   abbonarsi (non un errore). La pagina account resta usabile.
 * - 'active': accesso PRO, con il motivo.
 *
 * The PRO assistant is off unless CHATBOT_PRO_ENABLED=1 (see assistente-pro.ts).
 */

export type ProAccess =
  | { status: 'anonymous' }
  | { status: 'no-plan'; session: AuthSession; subscription: SubscriptionInfo | null }
  | { status: 'active'; session: AuthSession; reason: ProReason; subscription: SubscriptionInfo | null };

const query: Query = (text, params) => getSQL().query(text, params) as Promise<Record<string, unknown>[]>;

export async function getProAccess(headers: Headers): Promise<ProAccess> {
  const session = await auth.api.getSession({ headers });
  if (!session) return { status: 'anonymous' };
  const { reason, subscription } = await getEntitlement(query, session.user.id);
  if (!reason) return { status: 'no-plan', session, subscription };
  return { status: 'active', session, reason, subscription };
}

/** Risposta delle API PRO a chi non ha accesso: 401 senza sessione, 403 senza abbonamento. */
export function proDenied(access: Exclude<ProAccess, { status: 'active' }>) {
  return access.status === 'anonymous'
    ? NextResponse.json({ error: 'login_required' }, { status: 401 })
    : NextResponse.json({ error: 'subscription_required' }, { status: 403 });
}
