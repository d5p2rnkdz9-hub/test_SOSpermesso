import { BackButton } from '@/components/tree/BackButton';
import { RestartButton } from '@/components/tree/RestartButton';

import { LanguageSelector } from './LanguageSelector';

export function StickyHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BackButton />
          <span className="text-lg font-bold text-foreground">
            SOSpermesso
          </span>
        </div>
        <div className="flex items-center gap-3">
          <RestartButton />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
