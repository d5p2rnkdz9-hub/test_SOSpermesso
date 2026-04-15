import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import {
  problemaLegaleSchema,
  SITUAZIONE_LABEL,
} from '@/lib/contact-schemas';

const NOTION_DB_ID = '30d7355e7f7f800cbee7c653dce65f1d';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const body = await request.json();
    const parsed = problemaLegaleSchema.safeParse(body);
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
          { text: { content: `Quesito — ${now.toISOString().slice(0, 10)}` } },
        ],
      },
      Situazione: {
        select: { name: SITUAZIONE_LABEL[data.situazione] },
      },
      Descrizione: {
        rich_text: [{ text: { content: data.descrizione.slice(0, 2000) } }],
      },
      Email: { email: data.email },
      'Consenso dati': { checkbox: data.consenso },
      Data: { date: { start: now.toISOString() } },
    };

    if (data.qualePermesso) {
      properties['Quale permesso'] = {
        rich_text: [{ text: { content: data.qualePermesso.slice(0, 2000) } }],
      };
    }
    if (data.tempoItalia) {
      properties['Tempo in Italia'] = {
        rich_text: [{ text: { content: data.tempoItalia.slice(0, 500) } }],
      };
    }

    await notion.pages.create({
      parent: { database_id: NOTION_DB_ID },
      properties: properties as never,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[contact:problema-legale] failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
