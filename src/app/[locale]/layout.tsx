import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  Inter,
  IBM_Plex_Sans_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_SC,
} from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Providers } from './providers';
import { StickyHeader } from '@/components/layout/StickyHeader';

const inter = Inter({
  subsets: ['latin', 'cyrillic', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-bengali',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  weight: ['400', '500', '700'],
  variable: '--font-zh',
  display: 'swap',
});

const RTL_LOCALES = new Set(['ar', 'ur', 'fa']);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
  const fontClass = (() => {
    if (locale === 'ar' || locale === 'ur' || locale === 'fa') {
      return `${ibmPlexSansArabic.variable} ${ibmPlexSansArabic.className}`;
    }
    if (locale === 'bn') {
      return `${notoSansBengali.variable} ${notoSansBengali.className}`;
    }
    if (locale === 'zh') {
      return `${notoSansSC.variable} ${notoSansSC.className}`;
    }
    return `${inter.variable} ${inter.className}`;
  })();

  return (
    // suppressHydrationWarning: lo script inline sotto aggiunge data-mode
    // prima dell'idratazione (pattern next-themes) — il mismatch è voluto
    <html lang={locale} dir={dir} className={fontClass} suppressHydrationWarning>
      <body className="antialiased">
        {/* Pre-paint PRO-mode detection: synchronous script so the
            data-mode attribute (and its CSS token overrides) apply before
            first render — same pattern as dark-mode toggles, no FOUC.
            Falls back to the sos_mode cookie set by sospermesso.it, so the
            mode follows the operator across the two properties. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var m=localStorage.getItem('sos-mode');if(!m){var c=document.cookie.match(/(?:^|; )sos_mode=([^;]*)/);m=c&&c[1]}if(m==='pro')document.documentElement.setAttribute('data-mode','pro')}catch(e){}",
          }}
        />
        <Providers dir={dir}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <StickyHeader />
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
