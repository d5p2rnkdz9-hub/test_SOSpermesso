import 'server-only';

import { auth, type AuthSession } from './auth';

/**
 * The single place that decides who may read premium content.
 * Every protected route and page goes through getProAccess().
 *
 * Launch period: any signed-in user is active. There is no switch for this
 * (the old PRO_ACCESS_MODE variable was never read and has been dropped):
 * to turn the assistant off use CHATBOT_PRO_DISABLED=1.
 * Step 2 (Stripe, docs/PRO-PREMIUM-PIANO.md) adds the per-product entitlement
 * check here — callers don't change.
 */

export type ProAccess =
  | { status: 'anonymous' }
  | { status: 'active'; session: AuthSession; reason: 'free-launch' };

export async function getProAccess(headers: Headers): Promise<ProAccess> {
  const session = await auth.api.getSession({ headers });
  if (!session) return { status: 'anonymous' };
  return { status: 'active', session, reason: 'free-launch' };
}
