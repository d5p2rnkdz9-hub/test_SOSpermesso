/**
 * Difese contro i bot che usano il modulo di accesso per mandare email a indirizzi altrui
 * («email bombing», novembre 2026). Gemello di sosflussi.it (netlify/lib/antibot.mjs):
 * stesso database degli utenti, stesse regole.
 *
 * - Turnstile (Cloudflare): attivo solo se ci sono entrambe le chiavi. Il segreto sta sul server
 *   (TURNSTILE_SECRET_KEY), la chiave pubblica nel browser (NEXT_PUBLIC_TURNSTILE_SITE_KEY).
 *   Una coppia sola vale per sospermesso.it e sosflussi.it.
 * - Indirizzi Gmail pieni di punti (o.giw.uram.4.69@gmail.com): Gmail ignora i punti, i bot li
 *   usano per far sembrare nuovo lo stesso indirizzo. Nessuno li scrive così a mano.
 */

/** Endpoint che mandano un'email: qui serve la verifica Turnstile. */
export const ENDPOINT_CON_VERIFICA = ['/sign-in/magic-link', '/request-password-reset'];

export function turnstileAttivo(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

const GMAIL = new Set(['gmail.com', 'googlemail.com']);

/** true = indirizzo da bot: il link non parte, la risposta resta quella normale. */
export function indirizzoSospetto(email: string): boolean {
  const [locale, dominio] = email.trim().toLowerCase().split('@');
  if (!locale || !dominio || !GMAIL.has(dominio)) return false;
  return (locale.match(/\./g)?.length ?? 0) >= 3;
}
