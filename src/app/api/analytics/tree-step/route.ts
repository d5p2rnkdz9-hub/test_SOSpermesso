import { NextRequest, NextResponse } from 'next/server';
import { getSQL } from '@/lib/neon';
import type { TreeStepPayload } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body: TreeStepPayload = await request.json();

    if (!body.sessionToken || !body.treeType || !body.currentNodeId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const sql = getSQL();

    await sql`
      INSERT INTO tree_sessions (
        session_token, tree_type, last_node_id, path, answers,
        steps_count, locale, user_name, session_started_at,
        completed, updated_at
      ) VALUES (
        ${body.sessionToken},
        ${body.treeType},
        ${body.currentNodeId},
        ${JSON.stringify(body.path)},
        ${JSON.stringify(body.answers)},
        ${body.stepsCount},
        ${body.locale},
        ${body.userName},
        ${body.sessionStartedAt},
        FALSE,
        now()
      )
      ON CONFLICT (session_token) DO UPDATE SET
        last_node_id = EXCLUDED.last_node_id,
        path = EXCLUDED.path,
        answers = EXCLUDED.answers,
        steps_count = EXCLUDED.steps_count,
        updated_at = now()
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[analytics] Failed to record tree step:', error);
    return NextResponse.json({ ok: false });
  }
}
