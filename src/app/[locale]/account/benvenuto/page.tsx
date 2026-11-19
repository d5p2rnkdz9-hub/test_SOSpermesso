import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { clientIp, registraAccettazione } from '@/lib/accordo';
import { PRATICHE_ATTIVE } from '@/lib/pratiche';
import { getProAccess } from '@/lib/pro-access';
import { getProfilo } from '@/lib/profilo';
import { TIPI_PROFILO } from '@/lib/profilo-shared';

import { BenvenutoForm } from './BenvenutoForm';

export const metadata: Metadata = {
  title: 'Crea il tuo account — SOS Permesso PRO',
  robots: { index: false },
};

type Props = {
  params: Promise<{ locale: string }>;
  /**
   * tipo: scelto nel modulo di prova di /abbonati, arriva già selezionato.
   * accordo=1: la spunta del modulo di iscrizione (/abbonati o /accedi) ha accettato anche l'accordo art. 28.
   */
  searchParams: Promise<{ da?: string; tipo?: string; accordo?: string }>;
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
  const { da, tipo, accordo } = await searchParams;
  const tipoScelto = TIPI_PROFILO.find((t) => t.value === tipo)?.value ?? null;

  const h = await headers();
  const access = await getProAccess(h);
  if (access.status === 'anonymous') {
    redirect(`/${locale}/abbonati?da=${encodeURIComponent(`/${locale}/account/benvenuto`)}`);
  }
  const { user } = access.session;
  // Accordo accettato con la spunta della prova: si registra all'arrivo (idempotente, versione corrente).
  // Se non riesce, lo scadenziario mostrerà comunque la finestra dell'accordo.
  if (accordo === '1' && access.status === 'active' && PRATICHE_ATTIVE) {
    try {
      await registraAccettazione({
        userId: user.id,
        email: user.email,
        ip: clientIp(h),
        userAgent: h.get('user-agent'),
      });
    } catch (err) {
      console.error(`[accordo] registrazione all'iscrizione non riuscita: ${err instanceof Error ? err.message : err}`);
    }
  }
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
          tipo: profilo?.tipo ?? tipoScelto,
          organizzazione: profilo?.organizzazione ?? '',
          citta: profilo?.citta ?? '',
        }}
      />
    </main>
  );
}
