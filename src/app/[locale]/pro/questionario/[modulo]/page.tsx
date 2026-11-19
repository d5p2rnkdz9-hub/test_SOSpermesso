import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { ProGate } from '@/components/pro/ProGate';
import { ProQuestionario } from '@/components/pro/questionario/ProQuestionario';
import { Link } from '@/i18n/navigation';
import { getProAccess } from '@/lib/pro-access';
import { getProTree } from '@/lib/pro-questionario';

type Props = { params: Promise<{ locale: string; modulo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modulo } = await params;
  const tree = getProTree(modulo);
  return { title: `${tree?.titolo ?? 'Questionario'} — SOS Permesso PRO`, robots: { index: false } };
}

function dataIt(d: string) {
  const [y, m, g] = d.split('-');
  return g ? `${g}/${m}/${y}` : d;
}

export default async function ModuloProPage({ params }: Props) {
  const { locale, modulo } = await params;
  setRequestLocale(locale);
  const tree = getProTree(modulo);
  if (!tree) notFound();

  const access = await getProAccess(await headers());

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-6 sm:py-8">
      <Link href="/pro/questionario" className="text-sm font-semibold underline underline-offset-4 print:hidden">
        ← Questionario PRO
      </Link>
      <div className="mt-3 mb-5 flex flex-wrap items-center gap-2">
        <h1 className="me-auto text-3xl font-extrabold leading-tight text-foreground">{tree.titolo}</h1>
        {tree.bozza && (
          <span
            className="rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
            title="Contenuto in attesa di validazione legale"
          >
            Bozza
          </span>
        )}
      </div>
      <p className="-mt-3 mb-5 text-xs text-muted-foreground">
        {tree.regime} · aggiornato al {dataIt(tree.aggiornatoAl)}
      </p>

      {access.status !== 'active' ? (
        <ProGate
          titolo={tree.titolo}
          descrizione={tree.descrizione}
          da={`/${locale}/pro/questionario/${tree.id}`}
          connesso={access.status === 'no-plan'}
          punti={[
            'Esiti distinti per ogni coppia di permessi, con il loro fondamento',
            'Norme vigenti e regime transitorio, giurisprudenza e prassi',
            'Casi limite e domande in più dove la risposta dipende dai dettagli',
          ]}
        />
      ) : (
        <Suspense>
          <ProQuestionario tree={tree} />
        </Suspense>
      )}

      <p className="mt-8 text-xs text-muted-foreground">
        Strumento di supporto per operatori: non sostituisce la verifica del caso concreto. Le norme italiane sono
        riportate in testo coordinato non ufficiale; fa fede la Gazzetta Ufficiale.
      </p>
    </main>
  );
}
