'use client';

import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ResultLink } from '@/types/tree';

interface LinksSummaryProps {
  links: ResultLink[];
}

/** Sort order for link types */
const TYPE_ORDER: Record<ResultLink['type'], number> = {
  guide: 0,
  legal_aid: 1,
  external: 2,
};

export function LinksSummary({ links }: LinksSummaryProps) {
  const t = useTranslations('outcome');

  // Skip if fewer than 3 links -- inline FAQ links are sufficient
  if (!links || links.length < 3) return null;

  const sorted = [...links].sort(
    (a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9),
  );

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{t('linksTitle')}</h2>
      <div className="flex flex-col gap-3">
        {sorted.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground underline underline-offset-4"
          >
            {link.label}
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
