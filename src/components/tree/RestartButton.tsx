'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { useTreeStore } from '@/store/tree-store';

export function RestartButton() {
  const t = useTranslations('header');
  const router = useRouter();

  const history = useTreeStore((s) => s.history);
  const outcomeId = useTreeStore((s) => s.outcomeId);
  const sessionStartedAt = useTreeStore((s) => s.sessionStartedAt);
  const reset = useTreeStore((s) => s.reset);

  const hasActiveSession =
    history.length > 0 || outcomeId !== null || sessionStartedAt !== null;

  if (!hasActiveSession) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        reset();
        router.push('/');
      }}
      className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground transition-colors"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {t('restart')}
    </button>
  );
}
