import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { accountUnicoOn, freeLaunchOn } from '@/lib/pro-entitlement';

import { AccediForm } from './AccediForm';
import { C, INK, card } from './stile';

export const metadata: Metadata = {
  title: 'Accedi — SOS Permesso PRO',
  description: 'Accedi a SOS Permesso PRO con un link via email o con la tua password.',
  robots: { index: false },
};

type Props = {
  params: Promise<{ locale: string }>;
  /**
   * da      dove tornare dopo l'accesso (solo percorsi del sito)
   * errore  il magic link è scaduto o già usato (errorCallbackURL)
   * token   arriva dall'email per la password: «Imposta una nuova password»
   * error   Better Auth: link per la password non valido
   */
  searchParams: Promise<{ da?: string; errore?: string; token?: string; error?: string }>;
};

/** Only same-site paths: "/it/outcome/x", never "//evil.com" or "https://…". */
function safeReturnPath(raw: string | undefined, locale: string): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) {
    return raw;
  }
  return `/${locale}/account`;
}

/** Stessa pagina di sosflussi.it/accedi/ (hero giallo SOS Permesso, schede a adesivo). */
export default async function AccediPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { da, errore, token, error } = await searchParams;
  const unico = accountUnicoOn();
  const gratis = freeLaunchOn();

  return (
    <div style={{ color: INK }}>
      <header className="border-b-[2.5px] border-[#141414]" style={{ background: C.accentTint }}>
        <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:py-10">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#141414] bg-white px-3 py-1 text-sm font-extrabold">
            SOS Permesso
            <span
              className="rounded-full border-2 border-[#141414] px-2 text-xs font-extrabold uppercase leading-5 tracking-wide"
              style={{ background: C.accent }}
            >
              pro
            </span>
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Accedi a SOS Permesso PRO</h1>
          <p className="mt-3 max-w-[620px] text-base">
            L&apos;area riservata a chi segue le pratiche di permesso di soggiorno: CAF, patronati, sindacati,
            consulenti del lavoro, associazioni e studi legali.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pb-16 pt-8" id="contenuto">
        <AccediForm
          callbackURL={safeReturnPath(da, locale)}
          locale={locale}
          token={token ?? ''}
          linkScaduto={!token && Boolean(errore || error)}
          accountUnico={unico}
        />

        <section className={card} style={{ background: C.accentTint }} aria-labelledby="include-titolo">
          <h2 id="include-titolo" className="text-2xl font-extrabold">
            Cosa trovi in SOS Permesso PRO
          </h2>
          <ul className="mt-3 grid gap-2 text-base">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="font-extrabold">✓</span>
              <span>
                <strong>Tutte le circolari</strong>: l&apos;archivio completo, non solo le ultime, con gli avvisi sui
                permessi che segui.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="font-extrabold">✓</span>
              <span>
                <strong>La tua dashboard</strong>: le ultime circolari e le novità sui permessi che segui.
              </span>
            </li>
          </ul>
          {gratis ? (
            <p className="mt-4 text-base">Durante il periodo di lancio l&apos;accesso PRO è gratuito.</p>
          ) : unico ? (
            <p className="mt-4 text-base">
              Non sei ancora abbonato?{' '}
              <a href="https://sosflussi.it/abbonati/" className="font-bold underline underline-offset-2">
                Vedi cosa include PRO
              </a>
              : l&apos;abbonamento vale anche per SOS Flussi PRO.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
