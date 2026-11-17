// No 'server-only' here: auth.ts (loaded by the Better Auth CLI outside Next.js)
// and the tests import this file. It only talks to the database through the
// query function it is given.

/**
 * Abbonamenti PRO e account unico con SOS Flussi (docs/PRO-PREMIUM-PIANO.md).
 *
 * L'abbonamento si fa su sosflussi.it (plugin @better-auth/stripe e webhook
 * Stripe stanno solo lì) e finisce nella tabella comune `auth.subscription`,
 * creata dalla migrazione di SOS Flussi (`strumenti/pro/migra.mjs`). Qui la si
 * legge soltanto: finché la migrazione non c'è stata la tabella non esiste e
 * vale «nessun abbonamento» (errore Postgres 42P01).
 *
 * Variabili:
 * - PRO_ACCESSO_LIBERO: lancio gratuito, PRO chiunque abbia un account.
 *   **Qui è ACCESO se la variabile non è impostata** e si spegne solo con
 *   `PRO_ACCESSO_LIBERO=0` (così il deploy non toglie l'accesso a nessuno).
 *   Su SOS Flussi è il contrario: acceso solo con `=1`.
 * - ACCOUNT_UNICO=1: mostra i testi dell'account unico (email del link,
 *   pagina account). Spenta per default.
 * - STRIPE_SECRET_KEY (facoltativa): serve solo ad annullare l'abbonamento
 *   quando l'account viene eliminato da qui.
 */

/** Variabili d'ambiente (process.env, o un oggetto nei test). */
export type Env = Record<string, string | undefined>;

export type Query = (text: string, params: unknown[]) => Promise<Record<string, unknown>[]>;

/** Stessa regola di SOS Flussi (netlify/lib/accesso.mjs): solo il piano `pro`. */
export const PRO_PLANS = ['pro'];
const ACTIVE_STATUSES = new Set(['active', 'trialing']);
/** Abbonamenti che Stripe può ancora addebitare: da annullare prima di eliminare l'account. */
export const LIVE_STATUSES = ['active', 'trialing', 'past_due', 'unpaid', 'incomplete', 'paused'];

export const SOSFLUSSI_ABBONAMENTO_URL = 'https://sosflussi.it/account/#abbonamento';

export function freeLaunchOn(env: Env = process.env): boolean {
  return env.PRO_ACCESSO_LIBERO?.trim() !== '0';
}

export function accountUnicoOn(env: Env = process.env): boolean {
  return env.ACCOUNT_UNICO?.trim() === '1';
}

/** Tabella (o schema) assente: la migrazione di SOS Flussi non è ancora stata fatta. */
export function isMissingTable(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  return e?.code === '42P01' || e?.code === '3F000' || /does not exist/.test(e?.message ?? '');
}

export interface SubscriptionInfo {
  /** Stato Stripe: active, trialing, past_due, canceled… */
  status: string;
  /** Fine del periodo pagato (o della prova), YYYY-MM-DD ora italiana; null se ignota. */
  periodEnd: string | null;
  /** Annullato: resta valido fino a periodEnd, poi non si rinnova. */
  cancelAtPeriodEnd: boolean;
}

export type ProReason = 'subscription' | 'trial' | 'free-launch';

export interface Entitlement {
  /** null = nessun accesso PRO (account senza abbonamento, lancio spento). */
  reason: ProReason | null;
  /** Ultimo abbonamento `pro` dell'utente (quello attivo per primo), anche scaduto. */
  subscription: SubscriptionInfo | null;
}

function dayInItaly(v: unknown): string | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
}

export async function readSubscription(query: Query, userId: string): Promise<SubscriptionInfo | null> {
  let rows: Record<string, unknown>[];
  try {
    rows = await query(
      `SELECT status, "periodEnd" AS period_end, "trialEnd" AS trial_end,
              "cancelAtPeriodEnd" AS cancel_at_period_end, "cancelAt" AS cancel_at
         FROM auth.subscription
        WHERE "referenceId" = $1 AND lower(plan) = ANY($2::text[])
        ORDER BY (status IN ('active', 'trialing')) DESC, "periodEnd" DESC NULLS LAST
        LIMIT 1`,
      [userId, PRO_PLANS],
    );
  } catch (err) {
    if (isMissingTable(err)) return null;
    throw err;
  }
  const r = rows[0];
  if (!r) return null;
  const status = String(r.status);
  return {
    status,
    periodEnd: dayInItaly(status === 'trialing' ? r.trial_end || r.period_end : r.period_end),
    cancelAtPeriodEnd: Boolean(r.cancel_at_period_end || r.cancel_at),
  };
}

/** Chi è PRO: abbonamento `pro` attivo o in prova, oppure lancio gratuito. */
export async function getEntitlement(
  query: Query,
  userId: string,
  env: Env = process.env,
): Promise<Entitlement> {
  const subscription = await readSubscription(query, userId);
  let reason: ProReason | null = null;
  if (subscription && ACTIVE_STATUSES.has(subscription.status)) {
    reason = subscription.status === 'trialing' ? 'trial' : 'subscription';
  } else if (freeLaunchOn(env)) {
    reason = 'free-launch';
  }
  return { reason, subscription };
}

/** Errore che blocca l'eliminazione dell'account; auth.ts lo trasforma in APIError. */
export class DeleteBlockedError extends Error {
  constructor(
    message: string,
    readonly code: 'SUBSCRIPTION_ACTIVE' | 'SUBSCRIPTION_CANCEL_FAILED',
  ) {
    super(message);
  }
}

export const MSG_ABBONAMENTO_VIVO =
  'Hai un abbonamento attivo: annullalo prima da sosflussi.it/account/, poi elimina l’account.';
export const MSG_ANNULLAMENTO_FALLITO =
  'Non siamo riusciti ad annullare l’abbonamento: l’account non è stato eliminato. Riprova più tardi.';

/**
 * Prima di eliminare l'account (copia di annullaAbbonamentiStripe di SOS Flussi):
 * annulla subito su Stripe gli abbonamenti che possono ancora addebitare. Senza
 * STRIPE_SECRET_KEY non si può: se ce n'è uno vivo l'eliminazione è rifiutata,
 * altrimenti l'abbonamento continuerebbe ad addebitare su un account sparito.
 */
export async function cancelLiveSubscriptions(
  query: Query,
  userId: string,
  stripeKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<number> {
  let rows: Record<string, unknown>[] = [];
  try {
    rows = await query(
      `SELECT "stripeSubscriptionId" AS id FROM auth.subscription
        WHERE "referenceId" = $1 AND "stripeSubscriptionId" IS NOT NULL
          AND status = ANY($2::text[])`,
      [userId, LIVE_STATUSES],
    );
  } catch (err) {
    // Tabella assente = nessun abbonamento mai creato.
    if (!isMissingTable(err)) throw err;
  }
  if (rows.length === 0) return 0;
  if (!stripeKey) throw new DeleteBlockedError(MSG_ABBONAMENTO_VIVO, 'SUBSCRIPTION_ACTIVE');

  for (const row of rows) {
    const id = String(row.id);
    let res: Response;
    try {
      res = await fetchImpl(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${stripeKey}` },
        signal: AbortSignal.timeout(20_000),
      });
    } catch (err) {
      console.error(`[auth] annullamento abbonamento ${id} fallito:`, err);
      throw new DeleteBlockedError(MSG_ANNULLAMENTO_FALLITO, 'SUBSCRIPTION_CANCEL_FAILED');
    }
    if (res.ok) continue;
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    // Già annullato o inesistente su Stripe: va bene.
    if (body?.error?.code === 'resource_missing' || /cancel/i.test(body?.error?.message ?? '')) continue;
    console.error(`[auth] annullamento abbonamento ${id} fallito: HTTP ${res.status}`, body?.error?.message);
    throw new DeleteBlockedError(MSG_ANNULLAMENTO_FALLITO, 'SUBSCRIPTION_CANCEL_FAILED');
  }
  return rows.length;
}

/** Dopo l'eliminazione: le righe `subscription` non hanno una chiave verso `user`. */
export async function deleteSubscriptionRows(query: Query, userId: string): Promise<void> {
  try {
    await query('DELETE FROM auth.subscription WHERE "referenceId" = $1', [userId]);
  } catch (err) {
    if (!isMissingTable(err)) throw err;
  }
}

/**
 * Per i cron (promemoria e avvisi delle circolari): stessa regola delle pagine.
 * Con il lancio gratuito acceso non interroga il database; altrimenti una
 * lettura per utente, ricordata per tutto il giro.
 */
export function makeProAccessCheck(query: Query, env: Env = process.env) {
  const cache = new Map<string, Promise<boolean>>();
  return (userId: string): Promise<boolean> => {
    if (freeLaunchOn(env)) return Promise.resolve(true);
    let p = cache.get(userId);
    if (!p) {
      p = getEntitlement(query, userId, env).then((e) => e.reason !== null);
      cache.set(userId, p);
    }
    return p;
  };
}
