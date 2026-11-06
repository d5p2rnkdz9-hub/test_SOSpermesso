// No 'server-only' here: the Better Auth CLI (npx auth migrate) loads this
// file outside Next.js and can't resolve it. `pg` keeps it server-side anyway.
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

import { sendEmail } from './email';
import { SITE_URL } from './site-url';

/**
 * Accounts for the PRO premium area (docs/PRO-PREMIUM-PIANO.md).
 *
 * - Passwordless: magic link by email only (no email+password).
 * - Tables live in the Postgres schema "auth" of the Neon database that
 *   already holds the analytics tables (public schema), so the two never
 *   collide. The Prisma schema (legacy quiz) is not involved.
 * - Who may read premium content is decided in pro-access.ts, not here.
 */

const MAGIC_LINK_MINUTES = 10;
const BASE_URL = process.env.BETTER_AUTH_URL ?? SITE_URL;

export const auth = betterAuth({
  appName: 'SOS Permesso',
  baseURL: BASE_URL,
  trustedOrigins: [
    'https://app.sospermesso.it',
    // Local dev server (any port), never in production builds.
    ...(process.env.NODE_ENV === 'production' ? [] : [BASE_URL]),
  ],
  database: {
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: process.env.NEON_DATABASE_URL, max: 3 }),
    }),
    type: 'postgres',
    schemaName: 'auth',
  },
  emailAndPassword: { enabled: false },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refreshed at most once a day while in use
  },
  user: {
    deleteUser: { enabled: true },
  },
  // Serverless functions don't share memory: keep rate-limit counters in the DB.
  rateLimit: { enabled: true, storage: 'database' },
  plugins: [
    magicLink({
      expiresIn: 60 * MAGIC_LINK_MINUTES,
      storeToken: 'hashed',
      async sendMagicLink({ email, url }) {
        await sendEmail({
          to: email,
          subject: 'Il tuo link per accedere a SOS Permesso PRO',
          text: [
            'Ciao,',
            '',
            'per accedere a SOS Permesso PRO apri questo link:',
            url,
            '',
            `Il link vale ${MAGIC_LINK_MINUTES} minuti e si può usare una sola volta.`,
            'Se non hai chiesto tu di accedere, ignora questa email.',
            '',
            'SOS Permesso — sospermesso.it',
          ].join('\n'),
        });
      },
    }),
    nextCookies(), // must stay last
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
