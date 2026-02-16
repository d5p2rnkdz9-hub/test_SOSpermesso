'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTreeStore } from '@/store/tree-store';

/**
 * Back button for the sticky header.
 *
 * Renders only when the user has navigation history (not at the first question).
 * Arrow mirrors automatically for RTL via rtl:rotate-180.
 */
export function BackButton() {
  const t = useTranslations('common');
  const history = useTreeStore((s) => s.history);
  const goBack = useTreeStore((s) => s.goBack);

  if (history.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t('back')}
      className="flex items-center gap-1 text-sm font-medium text-foreground"
    >
      <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
      <span className="hidden sm:inline">{t('back')}</span>
    </button>
  );
}
