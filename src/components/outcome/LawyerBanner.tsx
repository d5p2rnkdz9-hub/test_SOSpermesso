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
      <div className="flex items-center gap-3 rounded-[0.75rem] bg-green-100 px-4 py-3 text-green-900">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <span className="font-semibold">{t('lawyerSelf')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-[0.75rem] bg-orange-100 px-4 py-3 text-orange-900">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <span className="font-semibold">{t('lawyerRecommended')}</span>
    </div>
  );
}
