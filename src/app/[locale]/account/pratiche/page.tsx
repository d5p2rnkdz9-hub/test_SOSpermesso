import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { ProGate } from '@/components/pro/ProGate';
import { permitsList } from '@/lib/permits-list.generated';
import { PRATICHE_ATTIVE, listPratiche } from '@/lib/pratiche';
import { getProAccess } from '@/lib/pro-access';

import { PraticheManager } from './PraticheManager';

export const metadata: Metadata = {
  title: 'Scadenziario — SOS Permesso PRO',
  robots: { index: false },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PratichePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!PRATICHE_ATTIVE) redirect(`/${locale}/account`);

  const access = await getProAccess(await headers());
  if (access.status === 'anonymous') {
    redirect(`/${locale}/accedi?da=${encodeURIComponent(`/${locale}/account/pratiche`)}`);
  }
  if (access.status !== 'active') {
    return (
      <ContentColumn>
        <h1 className="text-3xl font-extrabold leading-tight text-foreground">Scadenziario</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Le pratiche che segui, con i promemoria prima della scadenza del permesso.
        </p>
        <ProGate
          titolo="Non perdere più una scadenza"
          descrizione="Inserisci le pratiche che segui: ti scriviamo prima che il permesso scada, con il link alla checklist di rinnovo. Le pratiche già salvate restano nel tuo account."
          da={`/${locale}/account/pratiche`}
          connesso
          punti={[
            'Promemoria email a 90, 60 e 30 giorni dalla scadenza',
            'Checklist di rinnovo per ogni permesso',
            'Archivio completo delle circolari, con avvisi sui permessi che segui',
          ]}
        />
      </ContentColumn>
    );
  }
  const pratiche = await listPratiche(access.session.user.id);

  return (
    <ContentColumn>
      <h1 className="text-3xl font-extrabold leading-tight text-foreground">Scadenziario</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Le persone che segui e la scadenza del loro permesso. Ti mandiamo un&apos;email a{' '}
        <strong>90, 60 e 30 giorni</strong> dalla scadenza, con il link alla lista dei documenti per il
        rinnovo.
      </p>
      <PraticheManager initial={pratiche} permits={permitsList} />
    </ContentColumn>
  );
}
