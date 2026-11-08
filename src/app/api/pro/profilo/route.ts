import { NextResponse } from 'next/server';

import { getProAccess } from '@/lib/pro-access';
import { saveProfilo, setNome, validateProfilo } from '@/lib/profilo';
import { sameOrigin } from '@/lib/request-guard';

export async function POST(request: Request) {
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
  const parsed = validateProfilo(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'validation', errors: parsed.errors }, { status: 422 });
  }
  const userId = access.session.user.id;
  const { nome, ...profilo } = parsed.value;
  await Promise.all([setNome(userId, nome), saveProfilo(userId, profilo)]);
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
