import { NextResponse } from 'next/server';

import { PRATICHE_ATTIVE, LIMITS, countPratiche, createPratica, listPratiche, validatePratica } from '@/lib/pratiche';
import { accordoRichiesto, haAccettatoAccordo } from '@/lib/accordo';
import { getProAccess, proDenied } from '@/lib/pro-access';
import { sameOrigin } from '@/lib/request-guard';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function GET(request: Request) {
  if (!PRATICHE_ATTIVE) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') return proDenied(access);
  if (!(await haAccettatoAccordo(access.session.user.id))) return accordoRichiesto();
  const pratiche = await listPratiche(access.session.user.id);
  return NextResponse.json({ pratiche }, { headers: NO_STORE });
}

export async function POST(request: Request) {
  if (!PRATICHE_ATTIVE) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') return proDenied(access);
  if (!(await haAccettatoAccordo(access.session.user.id))) return accordoRichiesto();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const parsed = validatePratica(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'validation', errors: parsed.errors }, { status: 422 });
  }
  const userId = access.session.user.id;
  if ((await countPratiche(userId)) >= LIMITS.perUser) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 409 });
  }
  const pratica = await createPratica(userId, parsed.value);
  return NextResponse.json({ pratica }, { status: 201, headers: NO_STORE });
}
