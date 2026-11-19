import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { ProGate } from '@/components/pro/ProGate';
import { ASSISTENTE_PRO_ATTIVO, CHATBOT_BASE_MAX_CHARS, CHATBOT_BASE_MAX_TURNS } from '@/lib/assistente-pro';
import { DAILY_LIMIT, MAX_TURNS, listConversazioni, quotaUsata } from '@/lib/chat-pro';
import { getProAccess } from '@/lib/pro-access';

import { ChatBase } from './ChatBase';
import { ChatPro } from './ChatPro';

export const metadata: Metadata = {
  title: 'Assistente — SOS Permesso PRO',
  robots: { index: false },
};

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ c?: string }> };

export default async function AssistentePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const access = await getProAccess(await headers());
  if (access.status !== 'active') {
    return (
      <ContentColumn>
        <h1 className="text-3xl font-extrabold leading-tight text-foreground">Chatbot PRO</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Fai una domanda su un permesso di soggiorno: il chatbot risponde con le informazioni delle schede di SOS Permesso.
        </p>
        <ProGate
          titolo="Il chatbot di SOS Permesso"
          descrizione="Risponde alle domande sui permessi di soggiorno usando solo le schede di SOS Permesso: documenti, costi, procedure di primo rilascio e rinnovo."
          da={`/${locale}/pro/assistente`}
          connesso={access.status === 'no-plan'}
          punti={[
            'Risposte basate sulle schede dei permessi, non a memoria',
            'Documenti e costi di primo rilascio e rinnovo',
            'Pensato per chi segue le pratiche allo sportello',
          ]}
        />
      </ContentColumn>
    );
  }

  if (!ASSISTENTE_PRO_ATTIVO) {
    return (
      <ContentColumn>
        <h1 className="text-3xl font-extrabold leading-tight text-foreground">Chatbot PRO</h1>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">
          Fai una domanda su un permesso di soggiorno: il chatbot risponde con le informazioni delle schede di SOS Permesso.
        </p>
        <ChatBase maxTurns={CHATBOT_BASE_MAX_TURNS} maxChars={CHATBOT_BASE_MAX_CHARS} />
      </ContentColumn>
    );
  }

  const userId = access.session.user.id;
  const [conversazioni, quota] = await Promise.all([listConversazioni(userId), quotaUsata(userId)]);
  // ?c=<id> dalla dashboard: si apre solo se è davvero una conversazione dell'utente.
  const { c } = await searchParams;
  const iniziale = conversazioni.some((x) => x.id === c) ? c : undefined;

  return (
    <ContentColumn>
      <h1 className="text-3xl font-extrabold leading-tight text-foreground">Assistente PRO</h1>
      <p className="mt-2 mb-5 text-sm text-muted-foreground">
        Descrivi il caso o fai una domanda: l&apos;assistente cerca nell&apos;archivio circolari e nelle schede
        e risponde citando i documenti.
      </p>
      <ChatPro iniziale={iniziale} conversazioni={conversazioni} dailyLimit={DAILY_LIMIT} maxTurns={MAX_TURNS} usatiOggi={quota.utente} />
    </ContentColumn>
  );
}
