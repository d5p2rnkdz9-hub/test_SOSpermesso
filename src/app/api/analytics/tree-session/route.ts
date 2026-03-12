import { NextRequest, NextResponse } from 'next/server';
import { getSQL } from '@/lib/neon';
import type { TreeSessionPayload } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body: TreeSessionPayload = await request.json();

    if (!body.sessionToken || !body.outcomeId || !body.path?.length) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const sql = getSQL();

    await sql`
      INSERT INTO tree_sessions (
        session_token, outcome_id, outcome_slug, path, answers,
        steps_count, locale, user_agent, duration_ms, session_started_at
      ) VALUES (
        ${body.sessionToken},
        ${body.outcomeId},
        ${body.outcomeSlug},
        ${JSON.stringify(body.path)},
        ${JSON.stringify(body.answers)},
        ${body.stepsCount},
        ${body.locale},
        ${body.userAgent},
        ${body.durationMs},
        ${body.sessionStartedAt}
      )
      ON CONFLICT (session_token) DO NOTHING
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[analytics] Failed to record tree session:', error);
    return NextResponse.json({ ok: false });
  }
}
