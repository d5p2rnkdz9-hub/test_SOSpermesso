import { NextResponse } from 'next/server';

import { getProAccess } from '@/lib/pro-access';
import type { ProSentenza } from '@/lib/pro-content';
import { proSentenze } from '@/lib/pro-content-premium.generated';

/**
 * Full case law for one permit (massima, rilevanza operativa, source link).
 * The public bundle only has teasers — see scripts/generate-pro-content.js.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const access = await getProAccess(request.headers);
  if (access.status !== 'active') {
    return NextResponse.json({ error: 'login_required' }, { status: 401 });
  }

  const { slug } = await params;
  const sentenze = (proSentenze as Record<string, readonly ProSentenza[] | undefined>)[slug];
  if (!sentenze) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(
    { sentenze },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
