import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { AccordoTesto } from '@/components/pro/AccordoTesto';
import { ACCORDO_SHA256, ACCORDO_VERSIONE } from '@/lib/accordo';

export const metadata: Metadata = {
  title: 'Accordo sul trattamento dei dati — SOS Permesso PRO',
  robots: { index: false },
};

type Props = {
  params: Promise<{ locale: string }>;
};

/** Testo pubblico dell'accordo art. 28, leggibile anche prima dell'accesso. */
export default async function AccordoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ContentColumn>
      <p className="text-xs text-muted-foreground">
        Versione {ACCORDO_VERSIONE} · impronta SHA-256 <span className="break-all font-mono">{ACCORDO_SHA256}</span>
      </p>
      <AccordoTesto />
    </ContentColumn>
  );
}
