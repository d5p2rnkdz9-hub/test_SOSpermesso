// No 'server-only' here: the Better Auth CLI (npx auth migrate) loads this
// file outside Next.js and can't resolve it. `pg` keeps it server-side anyway.
import { createHash } from 'node:crypto';

import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { captcha, magicLink } from 'better-auth/plugins';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { ENDPOINT_CON_VERIFICA, indirizzoSospetto, turnstileAttivo } from './antibot';
import { notifyAdmin, sendEmail } from './email';
import {
  DeleteBlockedError,
  accountUnicoOn,
  cancelLiveSubscriptions,
  deleteSubscriptionRows,
  type Query,
} from './pro-entitlement';
import { PROD_HOSTS, SITE_URL } from './site-url';

/**
 * Accounts for the PRO premium area (docs/PRO-PREMIUM-PIANO.md).
 *
 * - Magic link by email (also creates the account), or email + password for
 *   accounts that have one. As on sosflussi.it, nobody signs up with a password:
 *   it is set (or reset) only through the reset link sent by email.
 * - Tables live in the Postgres schema "auth" of the Neon database that
 *   already holds the analytics tables (public schema), so the two never
 *   collide. The Prisma schema (legacy quiz) is not involved.
 * - Who may read premium content is decided in pro-access.ts, not here.
 * - Account unico con SOS Flussi: stesso schema "auth"; abbonamenti nella
 *   tabella auth.subscription, scritta solo da sosflussi.it (plugin Stripe e
 *   webhook stanno là). better-auth è fissata alla stessa versione nelle due app.
 */

const MAGIC_LINK_MINUTES = 10;
const RESET_MINUTES = 60;
const BASE_URL = process.env.BETTER_AUTH_URL ?? SITE_URL;
const PROD = process.env.NODE_ENV === 'production';
/**
 * Anteprima Netlify (next.config.ts): l'accesso deve funzionare sull'indirizzo del
 * deploy, non sui domini di produzione, e il cookie non può valere su .sospermesso.it.
 * Vuoto in produzione e in locale.
 */
const ANTEPRIMA = /^https:\/\/[a-z0-9-]+--testsospermesso\.netlify\.app$/.test(process.env.ANTEPRIMA_URL ?? '')
  ? (process.env.ANTEPRIMA_URL as string)
  : '';

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL, max: 3 });
const query: Query = async (text, params) => (await pool.query(text, params)).rows;

/** Riga dell'email del link con ACCOUNT_UNICO=1 (pro-entitlement.ts). */
const RIGA_ACCOUNT_UNICO = accountUnicoOn()
  ? ['', 'Lo stesso account e lo stesso abbonamento valgono anche su SOS Flussi PRO (sosflussi.it).']
  : [];

/** Link di accesso per lo stesso indirizzo: al massimo 3 in 10 minuti, 10 in 24 ore. */
const MAX_INVII_BREVE = 3;
const MAX_INVII_GIORNO = 10;

/**
 * Tetto per destinatario (scripts/sql/006). Conta solo i link davvero
 * spediti: i tentativi respinti non allungano il blocco. Se la tabella manca
 * o il database non risponde si lascia passare: meglio un login senza tetto
 * che nessun login.
 */
async function entroIlTettoInvii(email: string): Promise<boolean> {
  const hash = createHash('sha256').update(email).digest('hex');
  try {
    const { rows } = await pool.query(
      `SELECT count(*) FILTER (WHERE inviato_il > now() - interval '${MAGIC_LINK_MINUTES} minutes')::int AS breve,
              count(*)::int AS giorno
         FROM pro.accesso_invio
        WHERE email_hash = $1 AND inviato_il > now() - interval '24 hours'`,
      [hash],
    );
    if (rows[0].breve >= MAX_INVII_BREVE || rows[0].giorno >= MAX_INVII_GIORNO) return false;
    await pool.query('INSERT INTO pro.accesso_invio (email_hash) VALUES ($1)', [hash]);
    await pool.query(`DELETE FROM pro.accesso_invio WHERE inviato_il < now() - interval '2 days'`);
  } catch (err) {
    console.error('[auth] tetto invii per email non applicato:', err);
  }
  return true;
}

/**
 * Un link nuovo annulla quelli chiesti prima per lo stesso indirizzo: resta
 * valida solo la riga più recente. Il valore è il JSON scritto dal plugin
 * ({"type":"magic-link","email":…}); si cerca il frammento senza cast, perché
 * nella tabella ci sono anche righe di altro tipo.
 */
async function annullaLinkPrecedenti(email: string): Promise<void> {
  await pool.query(
    `DELETE FROM auth.verification
      WHERE identifier LIKE 'magic-link:%'
        AND strpos(lower(value), $1) > 0
        AND id <> (
          SELECT id FROM auth.verification
           WHERE identifier LIKE 'magic-link:%' AND strpos(lower(value), $1) > 0
           ORDER BY "createdAt" DESC LIMIT 1
        )`,
    [`"email":${JSON.stringify(email)}`],
  );
}

/** Come per i link di accesso: resta valido solo l'ultimo link per la password. */
async function annullaResetPrecedenti(userId: string): Promise<void> {
  await pool.query(
    `DELETE FROM auth.verification
      WHERE identifier LIKE 'reset-password:%' AND value = $1
        AND id <> (
          SELECT id FROM auth.verification
           WHERE identifier LIKE 'reset-password:%' AND value = $1
           ORDER BY "createdAt" DESC LIMIT 1
        )`,
    [userId],
  );
}

/**
 * Due nomi per lo stesso deploy: app.sospermesso.it (test gratuiti) e
 * pro.sospermesso.it (area PRO). In produzione il base URL segue l'host della
 * richiesta, così il link magico rimanda allo stesso sottodominio da cui si è
 * partiti, e il cookie di sessione vale su .sospermesso.it: un solo login.
 */
/**
 * Avviso a chi gestisce il sito quando nasce un account (cioè quando qualcuno apre davvero il
 * link). Fino a novembre 2026 partiva già alla richiesta del link: i bot che usano il modulo per
 * mandare email a indirizzi altrui facevano arrivare un avviso a ogni tentativo.
 * Gemello di sosflussi.it (netlify/lib/auth.mjs).
 */
async function avvisaNuovoAccount(email: string): Promise<void> {
  await notifyAdmin({
    subject: 'Nuovo account',
    text: [
      'Un nuovo utente ha aperto il link e ha creato un account SOS Permesso PRO.',
      '',
      `Email: ${email}`,
      `Quando: ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}`,
    ].join('\n'),
    replyTo: email,
  });
}

export const auth = betterAuth({
  appName: 'SOS Permesso',
  baseURL: ANTEPRIMA || (PROD ? { allowedHosts: [...PROD_HOSTS], protocol: 'https', fallback: BASE_URL } : BASE_URL),
  trustedOrigins: [
    ...PROD_HOSTS.map((h) => `https://${h}`),
    // Local dev server (any port), never in production builds.
    ...(PROD ? [] : [BASE_URL]),
    ...(ANTEPRIMA ? [ANTEPRIMA] : []),
  ],
  advanced: {
    ...(PROD && !ANTEPRIMA ? { crossSubDomainCookies: { enabled: true, domain: '.sospermesso.it' } } : {}),
    // Netlify: l'IP vero del visitatore (serve ai limiti per IP qui sotto e a Turnstile).
    ipAddress: { ipAddressHeaders: ['x-nf-client-connection-ip', 'x-forwarded-for'] },
  },
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          await avvisaNuovoAccount(user.email.trim().toLowerCase());
        },
      },
    },
  },
  database: {
    dialect: new PostgresDialect({
      pool,
    }),
    type: 'postgres',
    schemaName: 'auth',
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // stessa regola di sosflussi.it: la password si imposta solo dal link via email
    minPasswordLength: 10,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * RESET_MINUTES,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      const email = user.email.trim().toLowerCase();
      if (!(await entroIlTettoInvii(email))) {
        // Risposta identica a quella normale: non si rivela nulla, l'email non parte.
        console.warn('[auth] tetto invii reset password raggiunto');
        return;
      }
      await annullaResetPrecedenti(user.id);
      await sendEmail({
        to: user.email,
        subject: 'Imposta la password di SOS Permesso PRO',
        text: [
          `Ciao${user.name ? ` ${user.name}` : ''},`,
          '',
          'per impostare una nuova password di SOS Permesso PRO apri questo link:',
          url,
          '',
          `Il link vale ${RESET_MINUTES} minuti e si può usare una sola volta.`,
          'Se non hai chiesto tu di cambiare la password, ignora questa email: la password attuale resta valida.',
          ...RIGA_ACCOUNT_UNICO,
          '',
          'SOS Permesso — sospermesso.it',
        ].join('\n'),
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refreshed at most once a day while in use
  },
  user: {
    deleteUser: {
      enabled: true,
      /**
       * Account unico con SOS Flussi: l'utente eliminato qui sparisce anche là.
       * Prima si annulla su Stripe l'abbonamento che potrebbe ancora addebitare
       * (serve STRIPE_SECRET_KEY; senza, se ce n'è uno vivo, l'eliminazione è
       * rifiutata con un messaggio che la pagina account mostra).
       */
      async beforeDelete(user) {
        try {
          await cancelLiveSubscriptions(query, user.id, process.env.STRIPE_SECRET_KEY);
        } catch (err) {
          if (err instanceof DeleteBlockedError) {
            throw new APIError(err.code === 'SUBSCRIPTION_ACTIVE' ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR', {
              message: err.message,
              code: err.code,
            });
          }
          throw err;
        }
      },
      async afterDelete(user) {
        // Le pratiche e i dati PRO se ne vanno con ON DELETE CASCADE; le righe
        // subscription no (nessuna chiave verso user).
        try {
          await deleteSubscriptionRows(query, user.id);
        } catch (err) {
          console.error('[auth] righe subscription non tolte:', err);
        }
      },
    },
  },
  // Serverless functions don't share memory: keep rate-limit counters in the DB.
  // Limiti per IP, come sosflussi.it (oltre al tetto per indirizzo di entroIlTettoInvii).
  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 60,
    customRules: {
      '/sign-in/magic-link': { window: 600, max: 5 },
      '/sign-in/email': { window: 60, max: 5 },
      '/request-password-reset': { window: 600, max: 3 },
      '/reset-password': { window: 60, max: 5 },
      '/delete-user': { window: 60, max: 3 },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 60 * MAGIC_LINK_MINUTES,
      storeToken: 'hashed',
      async sendMagicLink({ email: indirizzo, url }) {
        const email = indirizzo.trim().toLowerCase();
        if (indirizzoSospetto(email)) {
          // Risposta identica a quella normale: il bot non capisce che il link non è partito.
          console.warn('[auth] link non inviato: indirizzo da bot');
          return;
        }
        if (!(await entroIlTettoInvii(email))) {
          throw new APIError('TOO_MANY_REQUESTS', { message: 'Too many sign-in links for this address' });
        }
        await annullaLinkPrecedenti(email);
        await sendEmail({
          to: indirizzo,
          subject: 'Il tuo link per accedere a SOS Permesso PRO',
          text: [
            'Ciao,',
            '',
            'per accedere a SOS Permesso PRO apri questo link:',
            url,
            '',
            `Il link vale ${MAGIC_LINK_MINUTES} minuti e si può usare una sola volta.`,
            'Se non hai chiesto tu di accedere, ignora questa email.',
            ...RIGA_ACCOUNT_UNICO,
            '',
            'SOS Permesso — sospermesso.it',
          ].join('\n'),
        });
      },
    }),
    // Turnstile sugli endpoint che mandano email (src/lib/antibot.ts). Spento finché mancano le chiavi.
    ...(turnstileAttivo()
      ? [
          captcha({
            provider: 'cloudflare-turnstile',
            secretKey: process.env.TURNSTILE_SECRET_KEY as string,
            endpoints: ENDPOINT_CON_VERIFICA,
          }),
        ]
      : []),
    nextCookies(), // must stay last
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
