import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CONVERSIONE_OUTCOME_SLUGS } from '@/lib/conversione-outcome-slugs';
import ConversioneOutcomeContent from './ConversioneOutcomeContent';

export function generateStaticParams() {
  return Object.keys(CONVERSIONE_OUTCOME_SLUGS).map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ConversioneOutcomePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const nodeId = CONVERSIONE_OUTCOME_SLUGS[slug];
  if (!nodeId) notFound();

  return <ConversioneOutcomeContent nodeId={nodeId} />;
}
