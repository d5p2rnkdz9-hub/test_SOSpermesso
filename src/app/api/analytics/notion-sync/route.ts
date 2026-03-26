import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import type { TreeSessionPayload } from '@/lib/analytics';

const NOTION_DB_ID = '32f7355e7f7f80389649f072fdec08e1';

function getNotionClient() {
  if (!process.env.NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY is not set');
  }
  return new Client({ auth: process.env.NOTION_API_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const body: TreeSessionPayload = await request.json();

    if (!body.sessionToken || !body.outcomeId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const notion = getNotionClient();

    const durationMin = body.durationMs
      ? Math.round(body.durationMs / 60000)
      : null;

    await notion.pages.create({
      parent: { database_id: NOTION_DB_ID },
      properties: {
        // Title property (required by Notion)
        Name: {
          title: [
            {
              text: {
                content: `${body.treeType} — ${body.outcomeSlug}`,
              },
            },
          ],
        },
        'Tree Type': {
          select: { name: body.treeType },
        },
        'Outcome ID': {
          rich_text: [{ text: { content: body.outcomeId } }],
        },
        'Outcome Slug': {
          rich_text: [{ text: { content: body.outcomeSlug } }],
        },
        Steps: {
          number: body.stepsCount,
        },
        Locale: {
          select: { name: body.locale },
        },
        'Duration (min)': {
          number: durationMin,
        },
        'User Name': {
          rich_text: [{ text: { content: body.userName ?? '' } }],
        },
        Date: {
          date: { start: body.sessionStartedAt },
        },
        Answers: {
          rich_text: [
            {
              text: {
                // Notion rich_text max 2000 chars
                content: JSON.stringify(body.answers).slice(0, 2000),
              },
            },
          ],
        },
        Path: {
          rich_text: [
            {
              text: {
                content: body.path.join(' → ').slice(0, 2000),
              },
            },
          ],
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[analytics] Failed to sync to Notion:', error);
    return NextResponse.json({ ok: false });
  }
}
