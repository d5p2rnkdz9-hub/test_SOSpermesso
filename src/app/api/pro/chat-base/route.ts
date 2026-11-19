import { NextResponse } from 'next/server';

import { CHATBOT_BASE_ENDPOINT } from '@/lib/assistente-pro';
import { getProAccess, proDenied } from '@/lib/pro-access';
import { sameOrigin } from '@/lib/request-guard';

export const maxDuration = 60;

/**
 * POST { messages: {role, content}[] } → testo in streaming.
 * Chatbot «normale» per gli utenti PRO: inoltra la conversazione alla funzione Netlify
 * `chat` del sito con il segreto condiviso e l'id utente (il sito conta i limiti per utente).
 * Validazione dei messaggi, limiti e prompt restano tutti nella funzione del sito.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') return proDenied(access);
  const secret = process.env.CHATBOT_PROXY_SECRET;
  if (!secret) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const body = await request.text();
  if (body.length > 30_000) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  let upstream: Response;
  try {
    upstream = await fetch(CHATBOT_BASE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sos-Proxy-Secret': secret,
        'X-Sos-User': access.session.user.id,
      },
      body,
      signal: request.signal,
    });
  } catch {
    return NextResponse.json({ error: 'Errore di connessione con il chatbot. Riprova.' }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'text/plain; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
