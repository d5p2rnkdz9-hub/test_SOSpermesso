import { NextResponse } from 'next/server';

import { listFollows, setFollows } from '@/lib/circolari';
import { getProAccess } from '@/lib/pro-access';
import { sameOrigin } from '@/lib/request-guard';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/** Permessi seguiti per gli avvisi email sulle nuove circolari ('*' = tutte). */
export async function GET(request: Request) {
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') {
    return NextResponse.json({ error: 'login_required' }, { status: 401 });
  }
  const slugs = await listFollows(access.session.user.id);
  return NextResponse.json({ slugs }, { headers: NO_STORE });
}

/** PUT { slugs: string[] } — sostituisce l'elenco. Lista vuota = nessun avviso. */
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') {
    return NextResponse.json({ error: 'login_required' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const raw = (body as { slugs?: unknown })?.slugs;
  if (!Array.isArray(raw) || raw.some((s) => typeof s !== 'string') || raw.length > 100) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const slugs = await setFollows(access.session.user.id, raw as string[]);
  return NextResponse.json({ slugs }, { headers: NO_STORE });
}
