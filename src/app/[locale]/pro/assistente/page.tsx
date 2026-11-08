import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { ProGate } from '@/components/pro/ProGate';
import { DAILY_LIMIT, MAX_TURNS, listConversazioni, quotaUsata } from '@/lib/chat-pro';
import { getProAccess } from '@/lib/pro-access';

import { ChatPro } from './ChatPro';

export const metadata: Metadata = {
  title: 'Assistente — SOS Permesso PRO',
  robots: { index: false },
};

type Props = { params: Promise<{ locale: string }> };

export default async function AssistentePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const access = await getProAccess(await headers());
  if (access.status !== 'active') {
    return (
      <ContentColumn>
        <h1 className="text-3xl font-extrabold leading-tight text-foreground">Assistente PRO</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Descrivi il caso, l&apos;assistente cerca nelle circolari e nelle schede e risponde con le fonti.
        </p>
        <ProGate
          titolo="Un assistente che cita le fonti"
          descrizione="Non risponde a memoria: per ogni domanda cerca nell’archivio di oltre 1.900 circolari e nelle schede dei permessi, e linka il documento da cui ricava la risposta."
          da={`/${locale}/pro/assistente`}
          punti={[
            'Ricerca automatica nelle circolari e nelle schede permesso',
            'Ogni risposta con il link alla fonte, da verificare',
            'Registro professionale, pensato per chi segue pratiche',
            'Conversazioni salvate nel tuo account',
          ]}
        />
      </ContentColumn>
    );
  }

  const userId = access.session.user.id;
  const [conversazioni, quota] = await Promise.all([listConversazioni(userId), quotaUsata(userId)]);

  return (
    <ContentColumn>
      <h1 className="text-3xl font-extrabold leading-tight text-foreground">Assistente PRO</h1>
      <p className="mt-2 mb-5 text-sm text-muted-foreground">
        Descrivi il caso o fai una domanda: l&apos;assistente cerca nell&apos;archivio circolari e nelle schede
        e risponde citando i documenti.
      </p>
      <ChatPro conversazioni={conversazioni} dailyLimit={DAILY_LIMIT} maxTurns={MAX_TURNS} usatiOggi={quota.utente} />
    </ContentColumn>
  );
}
