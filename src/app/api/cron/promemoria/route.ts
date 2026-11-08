import { NextResponse } from 'next/server';

import { runAvvisiCircolari } from '@/lib/avvisi-circolari';
import { runPromemoria } from '@/lib/promemoria';
import { bearerMatches } from '@/lib/request-guard';

/**
 * Daily run: deadline reminders (scadenziario) + new-circolari digest. Called by the Netlify scheduled function
 * netlify/functions/promemoria-cron.mts with `Authorization: Bearer $CRON_SECRET`;
 * can also be hit by hand (curl) with the same header to re-run — idempotent.
 */
export const maxDuration = 60;


async function handle(request: Request) {
  if (!bearerMatches(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const promemoria = await runPromemoria();
  const circolari = await runAvvisiCircolari();
  const report = { promemoria, circolari };
  console.log('[cron/promemoria]', JSON.stringify(report));
  return NextResponse.json(report, { headers: { 'Cache-Control': 'no-store' } });
}

export const GET = handle;
export const POST = handle;
