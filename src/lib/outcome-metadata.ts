import type { Metadata } from 'next';
import type { TreeNode } from '@/types/tree';
import { SITE_URL, SITE_NAME, SUPPORTED_OG_LOCALES, ogLocale } from './site-url';

interface BuildMetadataParams {
  locale: string;
  slug: string;
  node: TreeNode;
  basePath: string;
}

export function buildOutcomeMetadata({
  locale,
  slug,
  node,
  basePath,
}: BuildMetadataParams): Metadata {
  const rawTitle = node.title ?? node.question ?? 'Risultato';
  const title = `${rawTitle} — ${SITE_NAME}`;

  const description = (node.introText ?? node.description ?? '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const canonicalUrl = `${SITE_URL}/${locale}${basePath}/${slug}`;

  const languages = Object.fromEntries(
    SUPPORTED_OG_LOCALES.map((l) => [l, `${SITE_URL}/${l}${basePath}/${slug}`]),
  );

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      locale: ogLocale(locale),
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
