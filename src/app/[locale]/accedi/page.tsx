import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { accountUnicoOn } from '@/lib/pro-entitlement';

import { atkinson, disp, poppins } from '../abbonati/fonts';

import { AccediForm } from './AccediForm';
import { C, INK } from './stile';

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

/* Solo il modulo: la presentazione di PRO sta in /abbonati, l'unica pagina PRO.
 * Qui arriva chi entra con la password, chi ha un link scaduto e chi imposta la password dall'email.
 * Stile di /abbonati (design «Adesivo»): Poppins per titoli, etichette e bottoni, Atkinson per il testo. */
const poppinsOvunque =
  '[&_button]:[font-family:var(--font-poppins),system-ui,sans-serif] [&_h1]:[font-family:var(--font-poppins),system-ui,sans-serif] [&_h2]:[font-family:var(--font-poppins),system-ui,sans-serif] [&_label]:[font-family:var(--font-poppins),system-ui,sans-serif] [&_summary]:[font-family:var(--font-poppins),system-ui,sans-serif]';

export default async function AccediPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { da, errore, token, error } = await searchParams;
  const ritorno = safeReturnPath(da, locale);

  return (
    <div
      style={{ color: INK, background: C.accentTint }}
      className={`${poppins.variable} ${atkinson.variable} min-h-[calc(100vh-80px)] text-[17px] leading-[1.6] [font-family:var(--font-atkinson),system-ui,sans-serif] ${poppinsOvunque}`}
    >
      <main id="contenuto" className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-4 pb-16 pt-10">
        <h1 className={`text-[clamp(30px,4vw,40px)] font-extrabold leading-[1.1] tracking-[-0.02em] ${disp}`}>
          Accedi a SOS Permesso PRO
        </h1>
        <AccediForm
          callbackURL={ritorno}
          locale={locale}
          token={token ?? ''}
          linkScaduto={!token && Boolean(errore || error)}
          accountUnico={accountUnicoOn()}
        />
        <p className="text-center text-base">
          Non hai un account?{' '}
          <a
            href={`/${locale}/abbonati?da=${encodeURIComponent(ritorno)}`}
            className="font-bold underline underline-offset-2"
          >
            Chiedi un link di prova gratuita
          </a>
        </p>
      </main>
    </div>
  );
}
