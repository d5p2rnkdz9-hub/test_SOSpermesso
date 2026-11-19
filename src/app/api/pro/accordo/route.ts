import { NextResponse } from 'next/server';

import { ACCORDO_VERSIONE, clientIp, registraAccettazione } from '@/lib/accordo';
import { PRATICHE_ATTIVE } from '@/lib/pratiche';
import { getProAccess, proDenied } from '@/lib/pro-access';
import { sameOrigin } from '@/lib/request-guard';

/**
 * POST { accetto: true, versione } — l'utente autenticato accetta l'accordo
 * art. 28 dalla finestra in cui ha scorso il testo fino in fondo, e lo
 * scadenziario si attiva. La versione deve essere quella corrente: chi ha la
 * pagina aperta da prima di una modifica del testo deve ricaricarla.
 */
export async function POST(request: Request) {
  if (!PRATICHE_ATTIVE) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') return proDenied(access);

  let body: { accetto?: unknown; versione?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  if (body.accetto !== true) {
    return NextResponse.json({ error: 'accettazione_incompleta' }, { status: 422 });
  }
  if (body.versione !== ACCORDO_VERSIONE) {
    return NextResponse.json({ error: 'versione_superata' }, { status: 409 });
  }

  const { user } = access.session;
  await registraAccettazione({
    userId: user.id,
    email: user.email,
    nome: user.name || null,
    ip: clientIp(request.headers),
    userAgent: request.headers.get('user-agent'),
  });
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
