import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ContentColumn } from '@/components/layout/ContentColumn';

import { AccediForm } from './AccediForm';

export const metadata: Metadata = {
  title: 'Accedi — SOS Permesso PRO',
  robots: { index: false },
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ da?: string; errore?: string }>;
};

/** Only same-site paths: "/it/outcome/x", never "//evil.com" or "https://…". */
function safeReturnPath(raw: string | undefined, locale: string): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) {
    return raw;
  }
  return `/${locale}/account`;
}

export default async function AccediPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { da, errore } = await searchParams;

  return (
    <ContentColumn>
      <h1 className="text-3xl font-extrabold leading-tight text-foreground">
        Accedi a SOS Permesso PRO
      </h1>
      {errore && (
        <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
          Il link è scaduto o è già stato usato. Chiedine uno nuovo qui sotto.
        </p>
      )}
      <p className="mt-3 mb-6 text-sm text-muted-foreground">
        Niente password: inserisci la tua email e ti mandiamo un link per entrare. Se non hai
        ancora un account, lo creiamo con lo stesso link. Durante il periodo di lancio l&apos;accesso
        PRO è gratuito.
      </p>
      <AccediForm callbackURL={safeReturnPath(da, locale)} locale={locale} />
    </ContentColumn>
  );
}
