/**
 * Regole dell'accesso PRO e dell'eliminazione dell'account con l'account unico
 * (src/lib/pro-entitlement.ts), su un Postgres in memoria (PGlite): nessun
 * database reale, nessuna chiamata a Stripe (fetch simulata).
 *
 *   npm test
 */
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';

import { PGlite } from '@electric-sql/pglite';

import {
  DeleteBlockedError,
  MSG_ABBONAMENTO_VIVO,
  cancelLiveSubscriptions,
  deleteSubscriptionRows,
  getEntitlement,
  makeProAccessCheck,
  readSubscription,
  type Env,
  type Query,
} from '../src/lib/pro-entitlement';

let db: PGlite;
const query: Query = async (text, params) => (await db.query<Record<string, unknown>>(text, params)).rows;

const LANCIO: Env = {}; // PRO_ACCESSO_LIBERO non impostata
const PAGAMENTO: Env = { PRO_ACCESSO_LIBERO: '0' };

/** Tabella del plugin @better-auth/stripe, come la crea la migrazione di SOS Flussi. */
async function creaTabella() {
  await db.exec(`
    CREATE TABLE auth.subscription (
      id text PRIMARY KEY,
      plan text NOT NULL,
      "referenceId" text NOT NULL,
      "stripeCustomerId" text,
      "stripeSubscriptionId" text,
      status text NOT NULL DEFAULT 'incomplete',
      "periodStart" timestamptz,
      "periodEnd" timestamptz,
      "trialStart" timestamptz,
      "trialEnd" timestamptz,
      "cancelAtPeriodEnd" boolean DEFAULT false,
      "cancelAt" timestamptz,
      "canceledAt" timestamptz,
      "endedAt" timestamptz,
      seats integer,
      "billingInterval" text,
      "stripeScheduleId" text
    )`);
}

async function abbonamento(r: {
  id: string;
  user: string;
  plan?: string;
  status: string;
  periodEnd?: string;
  trialEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeId?: string | null;
}) {
  await db.query(
    `INSERT INTO auth.subscription (id, plan, "referenceId", "stripeSubscriptionId", status, "periodEnd", "trialEnd", "cancelAtPeriodEnd")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      r.id,
      r.plan ?? 'pro',
      r.user,
      r.stripeId === undefined ? `sub_${r.id}` : r.stripeId,
      r.status,
      r.periodEnd ?? null,
      r.trialEnd ?? null,
      r.cancelAtPeriodEnd ?? false,
    ],
  );
}

before(async () => {
  db = new PGlite();
  await db.exec('CREATE SCHEMA auth');
});
after(async () => {
  await db.close();
});

describe('tabella subscription assente (SOS Flussi non ha ancora migrato)', () => {
  beforeEach(async () => {
    await db.exec('DROP TABLE IF EXISTS auth.subscription');
  });

  test('nessun abbonamento, nessun errore', async () => {
    assert.equal(await readSubscription(query, 'u1'), null);
  });

  test('PRO_ACCESSO_LIBERO non impostata: lancio gratuito', async () => {
    assert.deepEqual(await getEntitlement(query, 'u1', LANCIO), { reason: 'free-launch', subscription: null });
  });

  test('PRO_ACCESSO_LIBERO=0: nessun accesso', async () => {
    assert.deepEqual(await getEntitlement(query, 'u1', PAGAMENTO), { reason: null, subscription: null });
  });

  test('PRO_ACCESSO_LIBERO=1 o altri valori: lancio gratuito', async () => {
    for (const v of ['1', 'true', '']) {
      const e = await getEntitlement(query, 'u1', { PRO_ACCESSO_LIBERO: v });
      assert.equal(e.reason, 'free-launch', `valore ${JSON.stringify(v)}`);
    }
  });

  test('eliminazione: niente da annullare, anche senza chiave Stripe', async () => {
    assert.equal(await cancelLiveSubscriptions(query, 'u1', undefined), 0);
    await deleteSubscriptionRows(query, 'u1');
  });

  test('un errore diverso dalla tabella assente non viene nascosto', async () => {
    const rotto: Query = async () => {
      throw Object.assign(new Error('connection refused'), { code: 'ECONNREFUSED' });
    };
    await assert.rejects(readSubscription(rotto, 'u1'), /connection refused/);
  });
});

describe('tabella subscription presente', () => {
  beforeEach(async () => {
    await db.exec('DROP TABLE IF EXISTS auth.subscription');
    await creaTabella();
  });

  test('abbonamento pro attivo: PRO anche con PRO_ACCESSO_LIBERO=0, con i dati per la pagina', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'active', periodEnd: '2026-12-17T10:00:00Z' });
    const e = await getEntitlement(query, 'u1', PAGAMENTO);
    assert.deepEqual(e, {
      reason: 'subscription',
      subscription: { status: 'active', periodEnd: '2026-12-17', cancelAtPeriodEnd: false },
    });
    // Durante il lancio il motivo resta l'abbonamento.
    assert.equal((await getEntitlement(query, 'u1', LANCIO)).reason, 'subscription');
    // Un altro utente non ne beneficia.
    assert.equal((await getEntitlement(query, 'u2', PAGAMENTO)).reason, null);
  });

  test('fine periodo in ora italiana (23:30 UTC = giorno dopo a Roma)', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'active', periodEnd: '2026-12-17T23:30:00Z' });
    assert.equal((await readSubscription(query, 'u1'))?.periodEnd, '2026-12-18');
  });

  test('in prova: motivo trial, fine = fine della prova', async () => {
    await abbonamento({
      id: 'a',
      user: 'u1',
      status: 'trialing',
      trialEnd: '2026-11-22T12:00:00Z',
      periodEnd: '2026-11-22T12:00:00Z',
    });
    const e = await getEntitlement(query, 'u1', PAGAMENTO);
    assert.equal(e.reason, 'trial');
    assert.equal(e.subscription?.periodEnd, '2026-11-22');
  });

  test('annullato a fine periodo: ancora PRO, segnalato', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'active', periodEnd: '2026-12-01T00:00:00Z', cancelAtPeriodEnd: true });
    const e = await getEntitlement(query, 'u1', PAGAMENTO);
    assert.equal(e.reason, 'subscription');
    assert.equal(e.subscription?.cancelAtPeriodEnd, true);
  });

  test('nome del piano senza distinzione di maiuscole («Pro»)', async () => {
    await abbonamento({ id: 'a', user: 'u1', plan: 'Pro', status: 'active' });
    assert.equal((await getEntitlement(query, 'u1', PAGAMENTO)).reason, 'subscription');
  });

  test('piano con un altro nome: non dà il PRO e non viene mostrato', async () => {
    await abbonamento({ id: 'a', user: 'u1', plan: 'flussi-base', status: 'active' });
    assert.deepEqual(await getEntitlement(query, 'u1', PAGAMENTO), { reason: null, subscription: null });
    assert.equal((await getEntitlement(query, 'u1', LANCIO)).reason, 'free-launch');
  });

  test('abbonamento scaduto o non pagato: nessun accesso con PRO_ACCESSO_LIBERO=0', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'canceled', periodEnd: '2026-10-01T00:00:00Z' });
    await abbonamento({ id: 'b', user: 'u2', status: 'past_due', periodEnd: '2026-11-01T00:00:00Z' });
    const e1 = await getEntitlement(query, 'u1', PAGAMENTO);
    assert.equal(e1.reason, null);
    assert.equal(e1.subscription?.status, 'canceled');
    assert.equal((await getEntitlement(query, 'u2', PAGAMENTO)).reason, null);
  });

  test('più righe: vince quella attiva', async () => {
    await abbonamento({ id: 'vecchio', user: 'u1', status: 'canceled', periodEnd: '2027-06-01T00:00:00Z' });
    await abbonamento({ id: 'nuovo', user: 'u1', status: 'active', periodEnd: '2026-12-01T00:00:00Z' });
    const e = await getEntitlement(query, 'u1', PAGAMENTO);
    assert.equal(e.reason, 'subscription');
    assert.equal(e.subscription?.periodEnd, '2026-12-01');
  });

  test('controllo dei cron: lancio acceso senza query, poi per utente', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'active' });
    const nessunaQuery: Query = async () => {
      throw new Error('non doveva interrogare il database');
    };
    assert.equal(await makeProAccessCheck(nessunaQuery, LANCIO)('u2'), true);
    const check = makeProAccessCheck(query, PAGAMENTO);
    assert.equal(await check('u1'), true);
    assert.equal(await check('u2'), false);
  });
});

describe('eliminazione dell’account con abbonamento', () => {
  beforeEach(async () => {
    await db.exec('DROP TABLE IF EXISTS auth.subscription');
    await creaTabella();
  });

  test('abbonamento vivo senza STRIPE_SECRET_KEY: eliminazione rifiutata', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'active' });
    await assert.rejects(cancelLiveSubscriptions(query, 'u1', undefined), (err: unknown) => {
      assert.ok(err instanceof DeleteBlockedError);
      assert.equal(err.code, 'SUBSCRIPTION_ACTIVE');
      assert.equal(err.message, MSG_ABBONAMENTO_VIVO);
      return true;
    });
  });

  test('anche past_due, unpaid, incomplete, paused contano come vivi; canceled no', async () => {
    for (const status of ['past_due', 'unpaid', 'incomplete', 'paused', 'trialing']) {
      await db.exec('DELETE FROM auth.subscription');
      await abbonamento({ id: 'a', user: 'u1', status });
      await assert.rejects(cancelLiveSubscriptions(query, 'u1', ''), DeleteBlockedError, status);
    }
    await db.exec('DELETE FROM auth.subscription');
    await abbonamento({ id: 'a', user: 'u1', status: 'canceled' });
    await abbonamento({ id: 'b', user: 'u1', status: 'active', stripeId: null }); // mai arrivato a Stripe
    assert.equal(await cancelLiveSubscriptions(query, 'u1', undefined), 0);
  });

  test('con la chiave: annulla su Stripe (DELETE /v1/subscriptions/:id)', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'active' });
    await abbonamento({ id: 'b', user: 'u1', status: 'trialing', plan: 'altro' });
    await abbonamento({ id: 'c', user: 'u2', status: 'active' });
    const chiamate: { url: string; method?: string; auth?: string }[] = [];
    const finta = (async (url: string, init?: RequestInit) => {
      chiamate.push({ url, method: init?.method, auth: (init?.headers as Record<string, string>).Authorization });
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    assert.equal(await cancelLiveSubscriptions(query, 'u1', 'sk_test_x', finta), 2);
    assert.deepEqual(
      chiamate.map((c) => [c.method, c.url, c.auth]).sort(),
      [
        ['DELETE', 'https://api.stripe.com/v1/subscriptions/sub_a', 'Bearer sk_test_x'],
        ['DELETE', 'https://api.stripe.com/v1/subscriptions/sub_b', 'Bearer sk_test_x'],
      ],
    );
  });

  test('già annullato o inesistente su Stripe: va bene', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'active' });
    for (const error of [
      { code: 'resource_missing', message: 'No such subscription' },
      { message: 'A canceled subscription can only update its cancellation_details and metadata.' },
    ]) {
      const finta = (async () => Response.json({ error }, { status: 400 })) as unknown as typeof fetch;
      assert.equal(await cancelLiveSubscriptions(query, 'u1', 'sk_test_x', finta), 1);
    }
  });

  test('Stripe in errore: eliminazione rifiutata', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'active' });
    const errore500 = (async () =>
      Response.json({ error: { message: 'boom' } }, { status: 500 })) as unknown as typeof fetch;
    const rete = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    for (const finta of [errore500, rete]) {
      await assert.rejects(
        cancelLiveSubscriptions(query, 'u1', 'sk_test_x', finta),
        (err: unknown) => err instanceof DeleteBlockedError && err.code === 'SUBSCRIPTION_CANCEL_FAILED',
      );
    }
  });

  test('dopo l’eliminazione: tolte solo le righe dell’utente', async () => {
    await abbonamento({ id: 'a', user: 'u1', status: 'canceled' });
    await abbonamento({ id: 'b', user: 'u2', status: 'active' });
    await deleteSubscriptionRows(query, 'u1');
    const { rows } = await db.query<{ id: string }>('SELECT id FROM auth.subscription ORDER BY id');
    assert.deepEqual(rows.map((r) => r.id), ['b']);
  });
});
