import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getProAccess } from '@/lib/pro-access';
import { getProfilo } from '@/lib/profilo';

import { BenvenutoForm } from './BenvenutoForm';

export const metadata: Metadata = {
  title: 'Crea il tuo account — SOS Permesso PRO',
  robots: { index: false },
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ da?: string }>;
};

function safeReturnPath(raw: string | undefined, locale: string): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) return raw;
  return `/${locale}/account`;
}

/**
 * Primo accesso: il link magico ha già creato l'utente, qui si completa
 * l'account (nome, tipo di struttura). Raggiungibile anche dopo, come
 * "Modifica profilo".
 */
export default async function BenvenutoPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { da } = await searchParams;

  const access = await getProAccess(await headers());
  if (access.status !== 'active') {
    redirect(`/${locale}/accedi?da=${encodeURIComponent(`/${locale}/account/benvenuto`)}`);
  }
  const { user } = access.session;
  const profilo = await getProfilo(user.id);
  const nuovo = !profilo;

  return (
    <main className="mx-auto w-full max-w-[560px] px-4 py-8">
      <div className="relative overflow-hidden rounded-2xl border-[2.5px] border-[#141414] bg-[#FFD400] p-6 shadow-[5px_5px_0_#141414]">
        <span className="inline-block rotate-[-3deg] rounded-md bg-[#141414] px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
          {nuovo ? 'Passo 2 di 2' : 'Profilo'}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#141414]">
          {nuovo ? 'Crea il tuo account PRO' : 'Modifica il profilo'}
        </h1>
        <p className="mt-2 text-sm text-[#141414]">
          {nuovo ? (
            <>
              Email confermata: <strong>{user.email}</strong>. Ancora un minuto e sei dentro.
            </>
          ) : (
            <>Account: <strong>{user.email}</strong></>
          )}
        </p>
      </div>

      <BenvenutoForm
        nuovo={nuovo}
        destinazione={safeReturnPath(da, locale)}
        iniziale={{
          nome: user.name ?? '',
          tipo: profilo?.tipo ?? null,
          organizzazione: profilo?.organizzazione ?? '',
          citta: profilo?.citta ?? '',
        }}
      />
    </main>
  );
}
