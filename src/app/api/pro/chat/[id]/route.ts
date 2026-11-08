import { NextResponse } from 'next/server';

import { deleteConversazione, getMessaggi } from '@/lib/chat-pro';
import { getProAccess } from '@/lib/pro-access';
import { sameOrigin } from '@/lib/request-guard';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const UUID_RE = /^[0-9a-f-]{36}$/i;
type Ctx = { params: Promise<{ id: string }> };

/** GET: messaggi visibili di una conversazione. */
export async function GET(request: Request, { params }: Ctx) {
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const messaggi = await getMessaggi(access.session.user.id, id);
  if (!messaggi) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ messaggi }, { headers: NO_STORE });
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const ok = await deleteConversazione(access.session.user.id, id);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
