import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
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
    <html lang={locale} dir={dir} className={fontClass}>
      <body className="antialiased">
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
