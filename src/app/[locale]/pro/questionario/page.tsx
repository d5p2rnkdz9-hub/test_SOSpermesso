import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { ProGate } from '@/components/pro/ProGate';
import { Link } from '@/i18n/navigation';
import { getProAccess } from '@/lib/pro-access';
import { ELENCO_MODULI } from '@/lib/pro-questionario';

export const metadata: Metadata = {
  title: 'Questionario PRO — SOS Permesso PRO',
  robots: { index: false },
};

type Props = { params: Promise<{ locale: string }> };

export default async function QuestionarioProHub({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const access = await getProAccess(await headers());

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-6 sm:py-8">
      <h1 className="text-3xl font-extrabold leading-tight text-foreground">Questionario PRO</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Il percorso del questionario di SOS Permesso, scritto per chi segue le pratiche: per ogni esito la base
        normativa, la procedura, la giurisprudenza e i casi limite.
      </p>

      {access.status !== 'active' ? (
        <ProGate
          titolo="Il questionario per gli operatori"
          descrizione="Lo stesso percorso del questionario pubblico, con spiegazioni tecniche e fonti verificate."
          da={`/${locale}/pro/questionario`}
          connesso={access.status === 'no-plan'}
          punti={[
            'Esiti distinti per ogni coppia di permessi, con il loro fondamento',
            'Norme vigenti e regime transitorio, giurisprudenza di TAR, Consiglio di Stato e Cassazione',
            'Casi limite e domande in più dove la risposta dipende dai dettagli',
          ]}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {ELENCO_MODULI.map((m) => (
            <li key={m.id}>
              {m.disponibile ? (
                <Link
                  href={`/pro/questionario/${m.id}`}
                  className="flex items-center gap-4 rounded-xl border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_hsl(var(--foreground))] transition-all hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0_hsl(var(--foreground))]"
                >
                  <span className="flex-1">
                    <span className="block text-lg font-extrabold text-foreground">{m.titolo}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{m.descrizione}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                </Link>
              ) : (
                <div className="flex items-center gap-4 rounded-xl border-2 border-dashed border-foreground/40 p-4">
                  <span className="flex-1">
                    <span className="block text-lg font-extrabold text-foreground/70">{m.titolo}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{m.descrizione}</span>
                  </span>
                  <span className="shrink-0 rounded-full border-2 border-foreground/40 px-2.5 py-0.5 text-xs font-bold uppercase text-foreground/60">
                    In arrivo
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
