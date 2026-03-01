import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { OUTCOME_SLUGS } from '@/lib/outcome-slugs';
import OutcomeContent from '../OutcomeContent';

export function generateStaticParams() {
  return Object.keys(OUTCOME_SLUGS).map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function OutcomePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const nodeId = OUTCOME_SLUGS[slug];
  if (!nodeId) notFound();

  return <OutcomeContent nodeId={nodeId} />;
}
