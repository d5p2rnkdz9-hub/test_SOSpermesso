import { NextResponse } from 'next/server';

import { deletePratica, setArchiviata, updatePratica, validatePratica } from '@/lib/pratiche';
import { getProAccess } from '@/lib/pro-access';
import { sameOrigin } from '@/lib/request-guard';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const UUID_RE = /^[0-9a-f-]{36}$/i;

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH body: either { archiviata: boolean } or a full PraticaInput.
 * A changed deadline resets the reminder cycle (see updatePratica).
 */
export async function PATCH(request: Request, { params }: Ctx) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') {
    return NextResponse.json({ error: 'login_required' }, { status: 401 });
  }
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const userId = access.session.user.id;

  if (body && typeof body === 'object' && 'archiviata' in body && Object.keys(body).length === 1) {
    const pratica = await setArchiviata(userId, id, Boolean((body as { archiviata: unknown }).archiviata));
    if (!pratica) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ pratica }, { headers: NO_STORE });
  }

  const parsed = validatePratica(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'validation', errors: parsed.errors }, { status: 422 });
  }
  const pratica = await updatePratica(userId, id, parsed.value);
  if (!pratica) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ pratica }, { headers: NO_STORE });
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') {
    return NextResponse.json({ error: 'login_required' }, { status: 401 });
  }
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const ok = await deletePratica(access.session.user.id, id);
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
