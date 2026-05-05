import type { TreeNode } from '@/types/tree';
import { SITE_URL, SITE_NAME } from '@/lib/site-url';

interface OutcomeJsonLdProps {
  node: TreeNode;
  locale: string;
  slug: string;
  basePath: string;
}

export function OutcomeJsonLd({ node, locale, slug, basePath }: OutcomeJsonLdProps) {
  const url = `${SITE_URL}/${locale}${basePath}/${slug}`;
  const title = node.title ?? 'Risultato';
  const description = (node.introText ?? '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

  const sections = node.sections ?? [];
  const faqEntities = sections.map((s) => ({
    '@type': 'Question',
    name: s.heading,
    acceptedAnswer: {
      '@type': 'Answer',
      text: s.content.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim(),
    },
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        description,
        inLanguage: locale,
        url,
        mainEntityOfPage: url,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: 'https://www.sospermesso.it',
        },
        about: {
          '@type': 'LegalService',
          name: title,
          serviceType: 'Immigration permit guidance',
        },
      },
      ...(faqEntities.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              mainEntity: faqEntities,
            },
          ]
        : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
