import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { OUTCOME_SLUGS } from '@/lib/outcome-slugs';
import { italianTree } from '@/lib/tree-data';
import { getNode } from '@/lib/tree-engine';
import { buildOutcomeMetadata } from '@/lib/outcome-metadata';
import { OutcomeJsonLd } from '@/components/outcome/OutcomeJsonLd';
import { translateTree } from '@/i18n/translateTree';
import { getTranslationMap } from '@/i18n/loadTranslations';
import OutcomeContent from '../OutcomeContent';

export function generateStaticParams() {
  return Object.keys(OUTCOME_SLUGS).map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const nodeId = OUTCOME_SLUGS[slug];
  if (!nodeId) return {};

  const tree = translateTree(italianTree, getTranslationMap(locale));
  const node = getNode(tree, nodeId);
  if (!node) return {};

  return buildOutcomeMetadata({
    locale,
    slug,
    node,
    basePath: '/outcome',
  });
}

export default async function OutcomePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const nodeId = OUTCOME_SLUGS[slug];
  if (!nodeId) notFound();

  const tree = translateTree(italianTree, getTranslationMap(locale));
  const node = getNode(tree, nodeId);

  return (
    <>
      {node && (
        <OutcomeJsonLd
          node={node}
          locale={locale}
          slug={slug}
          basePath="/outcome"
        />
      )}
      <OutcomeContent nodeId={nodeId} />
    </>
  );
}
