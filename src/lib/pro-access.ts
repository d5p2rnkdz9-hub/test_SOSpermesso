import 'server-only';

import { auth, type AuthSession } from './auth';

/**
 * The single place that decides who may read premium content.
 * Every protected route and page goes through getProAccess().
 *
 * PRO_ACCESS_MODE=free (launch period): any signed-in user.
 * Step 2 (Stripe, docs/PRO-PREMIUM-PIANO.md) adds the subscription check
 * here — callers don't change.
 */

export type ProAccess =
  | { status: 'anonymous' }
  | { status: 'active'; session: AuthSession; reason: 'free-launch' };

export async function getProAccess(headers: Headers): Promise<ProAccess> {
  const session = await auth.api.getSession({ headers });
  if (!session) return { status: 'anonymous' };
  return { status: 'active', session, reason: 'free-launch' };
}
