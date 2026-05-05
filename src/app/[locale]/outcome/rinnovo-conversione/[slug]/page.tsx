import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { RC_OUTCOME_SLUGS } from '@/lib/rinnovo-conversione-outcome-slugs';
import { rinnovoConversioneTree } from '@/lib/rinnovo-conversione-tree';
import { getNode } from '@/lib/tree-engine';
import { buildOutcomeMetadata } from '@/lib/outcome-metadata';
import { OutcomeJsonLd } from '@/components/outcome/OutcomeJsonLd';
import RCOutcomeContent from './RCOutcomeContent';

export function generateStaticParams() {
  return Object.keys(RC_OUTCOME_SLUGS).map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const nodeId = RC_OUTCOME_SLUGS[slug];
  if (!nodeId) return {};

  const node = getNode(rinnovoConversioneTree, nodeId);
  if (!node) return {};

  return buildOutcomeMetadata({
    locale,
    slug,
    node,
    basePath: '/outcome/rinnovo-conversione',
  });
}

export default async function RCOutcomePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const nodeId = RC_OUTCOME_SLUGS[slug];
  if (!nodeId) notFound();

  const node = getNode(rinnovoConversioneTree, nodeId);

  return (
    <>
      {node && (
        <OutcomeJsonLd
          node={node}
          locale={locale}
          slug={slug}
          basePath="/outcome/rinnovo-conversione"
        />
      )}
      <RCOutcomeContent nodeId={nodeId} />
    </>
  );
}
