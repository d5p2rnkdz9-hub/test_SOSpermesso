import { BackButton } from '@/components/tree/BackButton';

import { LanguageSelector } from './LanguageSelector';

export function StickyHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/8 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BackButton />
          <a
            href="https://www.sospermesso.it"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-[1.02]"
          >
            <img
              src="/logo-full.png"
              alt="SOSpermesso"
              className="h-[36px] w-auto"
            />
          </a>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
