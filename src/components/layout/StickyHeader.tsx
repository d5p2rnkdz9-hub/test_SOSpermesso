import { Atkinson_Hyperlegible } from 'next/font/google';
import { getLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { PRATICHE_ATTIVE } from '@/lib/pratiche';

import { HeaderAccount } from './HeaderAccount';
import { HeaderBack } from './HeaderBack';
import { LanguageSelector } from './LanguageSelector';

/* La stessa testata di sospermesso.it (_includes/components/header.liquid + nav.js):
 * logo a sinistra, pill bianche con bordo e ombra d'inchiostro, tendina «SOS Permesso PRO», lingua.
 * Così sito e app sembrano un sito solo, con l'area PRO riservata. */
const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const SITO = 'https://www.sospermesso.it';
/* Lingue con una versione propria del sito (cartelle /en/, /fr/... di Sito_Nuovo). */
const LINGUE_SITO = new Set(['en', 'fr', 'es', 'tr', 'bn', 'ru', 'ar', 'ur', 'fa', 'zh']);

const TESTI: Record<string, { database: string; leggi?: string; contatti: string; menu: string }> = {
  it: { database: 'Database di permessi', leggi: 'Leggi e circolari', contatti: 'Contattaci', menu: 'Menu' },
  en: { database: 'Permit database', contatti: 'Contact us', menu: 'Menu' },
  fr: { database: 'Base des permis', contatti: 'Contactez-nous', menu: 'Menu' },
  es: { database: 'Base de permisos', contatti: 'Contáctanos', menu: 'Menú' },
};

/** Pill del menu, come .nav-link.nav-cta--outline del sito. */
export const pill =
  'inline-flex min-h-[44px] items-center gap-1 whitespace-nowrap rounded-full border-2 border-[#141414] bg-white px-3.5 py-2 text-base font-bold text-[#141414] no-underline shadow-[2.5px_2.5px_0_#141414] transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3.5px_3.5px_0_#141414]';

export async function StickyHeader() {
  const locale = await getLocale();
  const t = TESTI[locale] ?? TESTI.en;
  const base = LINGUE_SITO.has(locale) ? `${SITO}/${locale}` : SITO;

  const voci = (
    <>
      <a href={`${base}/database.html`} className={pill}>
        {t.database}
      </a>
      {t.leggi && (
        <a href={`${SITO}/normativa.html`} className={pill}>
          {t.leggi}
        </a>
      )}
      <Link href="/contattaci" className={pill}>
        {t.contatti}
      </Link>
    </>
  );

  return (
    <header
      className={`${atkinson.className} sticky top-0 z-50 w-full border-b border-black/[.08] bg-white`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2 sm:px-6">
        <HeaderBack />
        <a href={`${base}/`} className="shrink-0" aria-label="SOS Permesso, vai al sito">
          <img src="/logo-full.png" alt="SOS Permesso" className="h-16 w-auto lg:h-[100px]" />
        </a>

        <nav aria-label="Menu principale" className="ms-auto flex items-center gap-2.5">
          <div className="hidden items-center gap-2.5 lg:flex">{voci}</div>
          <div className="hidden items-center gap-2.5 sm:flex">
            <HeaderAccount className={pill} pratiche={PRATICHE_ATTIVE} />
            <LanguageSelector />
          </div>
          {/* Da telefono le voci stanno in una tendina, come il ☰ del sito (sotto 640px anche account e lingua). */}
          <details className="relative lg:hidden">
            <summary className={`${pill} cursor-pointer list-none [&::-webkit-details-marker]:hidden`} aria-label={t.menu}>
              ☰
            </summary>
            <div className="absolute end-0 top-[calc(100%+8px)] flex min-w-[220px] flex-col gap-2 rounded-[18px] border-2 border-[#141414] bg-white p-3 shadow-[5px_5px_0_#141414]">
              {voci}
              <div className="flex flex-col gap-2 sm:hidden">
                <HeaderAccount className={`${pill} w-full`} inline pratiche={PRATICHE_ATTIVE} />
                <LanguageSelector />
              </div>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
