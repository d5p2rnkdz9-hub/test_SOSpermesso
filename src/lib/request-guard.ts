import 'server-only';

import { timingSafeEqual } from 'node:crypto';

import { PROD_HOSTS } from './site-url';

/**
 * Difese comuni delle API PRO.
 *
 * sameOrigin: il cookie di sessione vale su tutto .sospermesso.it, quindi una
 * richiesta che modifica dati deve arrivare da una pagina dell'app stessa.
 * I browser mandano sempre l'header Origin su POST/PUT/PATCH/DELETE da fetch:
 * senza Origin, o con un'origine estranea, si rifiuta.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (process.env.NODE_ENV !== 'production') {
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.localhost')) return true;
  }
  if (url.protocol !== 'https:') return false;
  if ((PROD_HOSTS as readonly string[]).includes(url.hostname)) return true;
  // Anteprime di deploy Netlify dello stesso progetto.
  return /^[a-z0-9-]+--testsospermesso\.netlify\.app$/.test(url.hostname) || url.hostname === 'testsospermesso.netlify.app';
}

/** Confronto a tempo costante di un segreto (header Authorization: Bearer …). */
export function bearerMatches(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const header = request.headers.get('authorization') ?? '';
  const expected = Buffer.from(`Bearer ${secret}`);
  const got = Buffer.from(header);
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
