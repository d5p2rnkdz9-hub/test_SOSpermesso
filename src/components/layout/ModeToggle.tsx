'use client';

import { useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useUiStore } from '@/store/ui-store';

/**
 * Header toggle for the sportello (operator) mode.
 *
 * Renders inactive on the server; syncs from the pre-paint data-mode
 * attribute on mount, so the theme is never wrong (applied by the inline
 * script) and only this label can briefly render in its default state.
 */
export function ModeToggle() {
  const t = useTranslations('sportello');
  const mode = useUiStore((s) => s.mode);
  const toggleMode = useUiStore((s) => s.toggleMode);
  const initFromDevice = useUiStore((s) => s.initFromDevice);

  useEffect(() => {
    initFromDevice();
  }, [initFromDevice]);

  const active = mode === 'sportello';

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-pressed={active}
      aria-label={t('ariaToggle')}
      title={t('ariaToggle')}
      className={`flex h-9 items-center gap-1.5 rounded-full border-2 border-foreground px-3 text-xs font-bold uppercase tracking-wide transition-all duration-150 ease-in-out ${
        active
          ? 'bg-primary text-primary-foreground shadow-[2px_2px_0_hsl(var(--foreground))]'
          : 'bg-card text-foreground hover:bg-secondary'
      }`}
    >
      <Briefcase className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">{active ? t('badgeActive') : t('toggle')}</span>
    </button>
  );
}
