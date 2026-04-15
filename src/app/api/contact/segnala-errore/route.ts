import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import {
  segnalaErroreSchema,
  TIPO_ERRORE_LABEL,
} from '@/lib/contact-schemas';

const NOTION_DB_ID = '2f47355e7f7f8072aedcf43229874199';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const body = await request.json();
    const parsed = segnalaErroreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const now = new Date();

    const properties: Record<string, unknown> = {
      Name: {
        title: [
          { text: { content: `Segnalazione — ${now.toISOString().slice(0, 10)}` } },
        ],
      },
      'Tipo errore': {
        select: { name: TIPO_ERRORE_LABEL[data.tipoErrore] },
      },
      'Dove trovato': {
        rich_text: [{ text: { content: data.doveTrovato.slice(0, 2000) } }],
      },
      Descrizione: {
        rich_text: [{ text: { content: data.descrizione.slice(0, 2000) } }],
      },
      Data: { date: { start: now.toISOString() } },
    };

    if (data.tipoErrore === 'traduzione' && data.lingua) {
      properties.Lingua = { select: { name: data.lingua } };
    }
    if (data.email) {
      properties.Email = { email: data.email };
    }

    await notion.pages.create({
      parent: { database_id: NOTION_DB_ID },
      properties: properties as never,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[contact:segnala-errore] failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
