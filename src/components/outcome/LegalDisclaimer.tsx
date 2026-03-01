'use client';

import { useTranslations } from 'next-intl';

export function LegalDisclaimer() {
  const t = useTranslations('outcome');

  return (
    <div className="rounded-[0.75rem] bg-muted/50 px-4 py-3">
      <p className="text-sm text-muted-foreground">{t('disclaimer')}</p>
    </div>
  );
}
