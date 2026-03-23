import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { RC_OUTCOME_SLUGS } from '@/lib/rinnovo-conversione-outcome-slugs';
import RCOutcomeContent from './RCOutcomeContent';

export function generateStaticParams() {
  return Object.keys(RC_OUTCOME_SLUGS).map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function RCOutcomePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const nodeId = RC_OUTCOME_SLUGS[slug];
  if (!nodeId) notFound();

  return <RCOutcomeContent nodeId={nodeId} />;
}
