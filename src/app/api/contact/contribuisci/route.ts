import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import {
  contribuisciSchema,
  COME_CONTRIBUIRE_LABEL,
} from '@/lib/contact-schemas';

const NOTION_DB_ID = '2f47355e7f7f80a4bed8d867abec2271';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const body = await request.json();
    const parsed = contribuisciSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    await notion.pages.create({
      parent: { database_id: NOTION_DB_ID },
      properties: {
        Name: {
          title: [{ text: { content: data.nome.slice(0, 200) } }],
        },
        'Come contribuire': {
          select: { name: COME_CONTRIBUIRE_LABEL[data.comeContribuire] },
        },
        'Raccontaci di te': {
          rich_text: [{ text: { content: data.raccontaci.slice(0, 2000) } }],
        },
        Email: { email: data.email },
        Data: { date: { start: new Date().toISOString() } },
      } as never,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[contact:contribuisci] failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
