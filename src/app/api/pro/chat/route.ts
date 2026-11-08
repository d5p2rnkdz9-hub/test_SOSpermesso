import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

import {
  type ChatEvent,
  ConversazioneOccupata,
  MAX_TURNS,
  MAX_USER_CHARS,
  listConversazioni,
  quotaSuperata,
  quotaUsata,
  runChatTurn,
} from '@/lib/chat-pro';
import { getSQL } from '@/lib/neon';
import { getProAccess } from '@/lib/pro-access';
import { sameOrigin } from '@/lib/request-guard';

export const maxDuration = 60;

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const UUID_RE = /^[0-9a-f-]{36}$/i;

/** GET: elenco conversazioni dell'utente. */
export async function GET(request: Request) {
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const conversazioni = await listConversazioni(access.session.user.id);
  return NextResponse.json({ conversazioni }, { headers: NO_STORE });
}

/**
 * POST { conversazioneId?: string, messaggio: string } → stream NDJSON di ChatEvent.
 * Una riga per evento: meta (id conversazione), tool (ricerca in corso),
 * text (delta), done (fonti), error.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') return NextResponse.json({ error: 'login_required' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (process.env.CHATBOT_PRO_DISABLED === '1') return NextResponse.json({ error: 'disabled' }, { status: 503 });

  let body: { conversazioneId?: unknown; messaggio?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const messaggio = typeof body.messaggio === 'string' ? body.messaggio.trim() : '';
  if (!messaggio) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  if (messaggio.length > MAX_USER_CHARS) return NextResponse.json({ error: 'too_long' }, { status: 400 });
  const conversazioneId =
    typeof body.conversazioneId === 'string' && UUID_RE.test(body.conversazioneId) ? body.conversazioneId : null;

  const userId = access.session.user.id;
  if (conversazioneId) {
    const sql = getSQL();
    const rows = (await sql.query(
      `SELECT count(m.id) FILTER (WHERE m.ruolo = 'user' AND m.testo IS NOT NULL)::int AS turni
       FROM pro.chat_conversazione c LEFT JOIN pro.chat_messaggio m ON m.conversazione_id = c.id
       WHERE c.id = $1 AND c.user_id = $2 GROUP BY c.id`,
      [conversazioneId, userId],
    )) as { turni: number }[];
    if (rows.length === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (rows[0].turni >= MAX_TURNS) return NextResponse.json({ error: 'too_many_turns' }, { status: 409 });
  }
  if (quotaSuperata(await quotaUsata(userId))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Se l'utente chiude la scheda lo stream si chiude: il turno continua lo stesso
      // sul server, così la conversazione resta completa e coerente.
      let closed = false;
      const emit = (e: ChatEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
        } catch {
          closed = true;
        }
      };
      try {
        await runChatTurn({ userId, conversazioneId, messaggio, emit });
      } catch (err) {
        let m = 'Si è verificato un errore. Riprova più tardi.';
        if (err instanceof ConversazioneOccupata) m = 'Sto ancora rispondendo al messaggio precedente in questa conversazione: aspetta qualche secondo.';
        else if (err instanceof Anthropic.RateLimitError) m = 'Il servizio è molto richiesto in questo momento. Riprova tra qualche minuto.';
        else if (err instanceof Anthropic.APIError) m = `Errore del servizio (${err.status}). Riprova più tardi.`;
        console.error('[pro/chat]', err);
        emit({ t: 'error', m });
      } finally {
        if (!closed) {
          try {
            controller.close();
          } catch {
            /* già chiuso */
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', ...NO_STORE, 'X-Accel-Buffering': 'no' },
  });
}
