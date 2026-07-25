'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { LawyerLevel } from '@/lib/lawyer-level';

interface LawyerBannerProps {
  level: LawyerLevel;
}

export function LawyerBanner({ level }: LawyerBannerProps) {
  const t = useTranslations('outcome');

  if (level === 'self') {
    return (
      <div className="flex items-center gap-3 rounded-lg border-2 border-green-800 bg-green-100 px-4 py-3 text-green-900 shadow-[2px_2px_0_hsl(var(--foreground))]">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <span className="font-semibold">{t('lawyerSelf')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-foreground bg-white px-4 py-3 text-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
      {/* fill-accent, not fill-primary: warning yellow is semantic and must
          survive the sportello theme (where primary turns navy) */}
      <AlertTriangle className="h-5 w-5 shrink-0 fill-accent text-foreground" />
      <span className="font-semibold">{t('lawyerRecommended')}</span>
    </div>
  );
}
