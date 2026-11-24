import 'server-only';

import { NextResponse } from 'next/server';

import { indirizzoSospetto, turnstileAttivo } from './antibot';
import { sameOrigin } from './request-guard';

/**
 * Difese dei moduli di contatto (/contattaci: segnala errore, quesito legale, contribuisci).
 * Da novembre 2026 i bot che fanno «email bombing» compilano anche questi moduli con stringhe a caso
 * e indirizzi altrui (stessi indirizzi usati sul login PRO): ogni invio diventava una pagina Notion
 * e una mail a info@. Stesse regole del login (src/lib/antibot.ts):
 * - richiesta dalla pagina dell'app stessa (Origin);
 * - campo trappola `sito_web` pieno → si finge successo, non si salva nulla;
 * - Gmail pieno di punti → idem;
 * - Turnstile: header `x-captcha-response`, verificato qui con Cloudflare.
 *
 * Restituisce la risposta da mandare subito, oppure null se l'invio è buono.
 */
export async function controllaModulo(request: Request, body: unknown): Promise<NextResponse | null> {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (typeof b.sito_web === 'string' && b.sito_web.trim()) return NextResponse.json({ ok: true });

  if (turnstileAttivo()) {
    const token = request.headers.get('x-captcha-response');
    if (!token || !(await verificaTurnstile(token, ipDi(request)))) {
      return NextResponse.json({ error: 'Verifica non riuscita' }, { status: 403 });
    }
  }

  if (typeof b.email === 'string' && indirizzoSospetto(b.email)) return NextResponse.json({ ok: true });
  return null;
}

function ipDi(request: Request): string | undefined {
  return (
    request.headers.get('x-nf-client-connection-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    undefined
  );
}

/** Chiede a Cloudflare se il token è valido. Se Cloudflare non risponde, l'invio non passa. */
async function verificaTurnstile(token: string, ip?: string): Promise<boolean> {
  const form = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY ?? '', response: token });
  if (ip) form.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(8000),
    });
    const esito = (await res.json()) as { success?: boolean };
    return esito.success === true;
  } catch (e) {
    console.error('[modulo-guard] siteverify non raggiungibile:', e);
    return false;
  }
}
